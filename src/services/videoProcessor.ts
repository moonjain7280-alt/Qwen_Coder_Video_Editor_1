import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;

export type ProcessingStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'uploading'
  | 'analyzing'
  | 'applying-filters'
  | 'encoding'
  | 'finalizing'
  | 'completed'
  | 'error';

export interface ProcessingProgress {
  status: ProcessingStatus;
  message: string;
  percent: number;
}

export interface VideoProcessingOptions {
  brightness: number;    // 50-150 (percentage, 100 = no change)
  contrast: number;      // 50-150
  saturation: number;    // 0-200
  sharpness: number;     // 0-100
  volume: number;        // 0-200
  trimStart: number;     // seconds
  trimEnd: number;       // seconds (0 = no trim)
  aspectRatio: string;   // '16:9', '9:16', '1:1', '4:5'
  resolution: string;    // '720p', '1080p', '4k'
}

type ProgressCallback = (progress: ProcessingProgress) => void;

/**
 * Load FFmpeg.wasm - uses single-threaded UMD build from CDN
 * This does NOT require SharedArrayBuffer or special COOP/COEP headers
 */
export async function loadFFmpeg(onProgress?: ProgressCallback): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  
  if (loadPromise) {
    await loadPromise;
    return ffmpegInstance!;
  }

  onProgress?.({
    status: 'loading',
    message: 'Loading video processing engine...',
    percent: 5,
  });

  loadPromise = (async () => {
    ffmpegInstance = new FFmpeg();

    // Use single-threaded UMD build from CDN - no COOP/COEP headers needed
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
    const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

    // Listen for FFmpeg log/progress events
    ffmpegInstance.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    ffmpegInstance.on('progress', ({ progress }) => {
      if (progress >= 0 && progress <= 1) {
        onProgress?.({
          status: 'encoding',
          message: `Encoding video... ${Math.round(progress * 100)}%`,
          percent: 40 + progress * 50,
        });
      }
    });

    await ffmpegInstance.load({
      coreURL,
      wasmURL,
    });
  })();

  await loadPromise;
  return ffmpegInstance!;
}

/**
 * Get video duration using HTML5 video element (more reliable than ffprobe in wasm)
 */
export async function getVideoDuration(file: File): Promise<number> {
  return new Promise<number>((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    
    // Timeout fallback
    setTimeout(() => {
      URL.revokeObjectURL(url);
      resolve(0);
    }, 10000);
    
    video.src = url;
  });
}

/**
 * Build FFmpeg filter chain based on user settings
 */
function buildFilterChain(options: VideoProcessingOptions): string[] {
  const filters: string[] = [];
  const videoFilters: string[] = [];
  const audioFilters: string[] = [];

  // Resolution mapping
  const resolutionMap: Record<string, number> = {
    '720p': 720,
    '1080p': 1080,
    '4k': 2160,
  };

  // Aspect ratio mapping
  const aspectRatioMap: Record<string, { w: number; h: number }> = {
    '16:9': { w: 16, h: 9 },
    '9:16': { w: 9, h: 16 },
    '1:1': { w: 1, h: 1 },
    '4:5': { w: 4, h: 5 },
  };

  const targetHeight = resolutionMap[options.resolution] || 1080;
  const targetAspect = aspectRatioMap[options.aspectRatio];

  // Brightness: map 50-150 to -0.5 to 0.5 (FFmpeg eq brightness range)
  if (options.brightness !== 100) {
    const brightnessValue = (options.brightness - 100) / 100;
    videoFilters.push(`eq=brightness=${brightnessValue.toFixed(3)}`);
  }

  // Contrast: map 50-150 to 0.5-1.5 (FFmpeg eq contrast range)
  if (options.contrast !== 100) {
    const contrastValue = options.contrast / 100;
    videoFilters.push(`eq=contrast=${contrastValue.toFixed(3)}`);
  }

  // Saturation: map 0-200 to 0-2.0 (FFmpeg eq saturation range)
  if (options.saturation !== 100) {
    const saturationValue = options.saturation / 100;
    videoFilters.push(`eq=saturation=${saturationValue.toFixed(3)}`);
  }

  // Sharpness: use unsharp filter
  if (options.sharpness > 0) {
    // Map 0-100 to a reasonable unsharp amount
    const sharpAmount = (options.sharpness / 100) * 1.5;
    videoFilters.push(`unsharp=5:5:${sharpAmount.toFixed(2)}:5:5:0.0`);
  }

  // Scale and crop for aspect ratio + resolution
  if (targetAspect) {
    const { w, h } = targetAspect;
    // Calculate target width ensuring even numbers (required by H.264)
    const targetWidth = Math.round((targetHeight * w / h) / 2) * 2;
    const scaledHeight = Math.round(targetHeight / 2) * 2;
    // First scale to ensure we have enough pixels, then crop to exact aspect ratio
    videoFilters.push(`scale=${targetWidth}:${scaledHeight}:force_original_aspect_ratio=increase`);
    videoFilters.push(`crop=${targetWidth}:${scaledHeight}`);
  } else {
    // Just scale to target height, maintaining aspect ratio (-2 ensures even number)
    videoFilters.push(`scale=-2:${targetHeight}`);
  }

  // Audio volume: map 0-200 to 0-2.0
  if (options.volume !== 100) {
    const volumeValue = options.volume / 100;
    audioFilters.push(`volume=${volumeValue.toFixed(3)}`);
  }

  // Build the filter complex
  if (videoFilters.length > 0) {
    filters.push(`-vf`, videoFilters.join(','));
  }

  if (audioFilters.length > 0) {
    filters.push(`-af`, audioFilters.join(','));
  }

  return filters;
}

/**
 * Process a video file with FFmpeg.wasm
 * Returns a Blob of the processed MP4 file
 */
export async function processVideo(
  file: File,
  options: VideoProcessingOptions,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg(onProgress);

  onProgress?.({
    status: 'uploading',
    message: 'Reading video file...',
    percent: 10,
  });

  // Write input file to virtual filesystem
  const inputData = await fetchFile(file);
  await ffmpeg.writeFile('input.mp4', inputData);

  onProgress?.({
    status: 'analyzing',
    message: 'Analyzing video properties...',
    percent: 15,
  });

  // Build filter arguments
  const filterArgs = buildFilterChain(options);

  // Build the full command
  const args: string[] = ['-i', 'input.mp4'];

  // Add trimming if specified
  // Note: For trimming, we use -ss before -i for fast seeking
  // But since we already wrote the file, we use output trimming
  if (options.trimStart > 0 || options.trimEnd > 0) {
    // Remove the -i from args and re-add with trim
    args.splice(0, 2); // Remove '-i', 'input.mp4'
    
    if (options.trimStart > 0) {
      args.push('-ss', formatTime(options.trimStart));
    }
    args.push('-i', 'input.mp4');
    if (options.trimEnd > 0) {
      args.push('-to', formatTime(options.trimEnd));
    }
  }

  // Add video/audio filters
  args.push(...filterArgs);

  // Output settings
  args.push(
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y', // Overwrite output
    'output.mp4'
  );

  onProgress?.({
    status: 'applying-filters',
    message: 'Applying video enhancements...',
    percent: 25,
  });

  // Execute FFmpeg
  try {
    await ffmpeg.exec(args);
  } catch (error) {
    // Clean up on error
    try { await ffmpeg.deleteFile('input.mp4'); } catch {}
    try { await ffmpeg.deleteFile('output.mp4'); } catch {}
    
    throw new Error(
      `Video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
      'This may be due to an unsupported video format or insufficient browser memory.'
    );
  }

  onProgress?.({
    status: 'finalizing',
    message: 'Finalizing output file...',
    percent: 92,
  });

  // Read the output file
  const outputData = await ffmpeg.readFile('output.mp4');
  
  // Clean up virtual filesystem
  try { await ffmpeg.deleteFile('input.mp4'); } catch {}
  try { await ffmpeg.deleteFile('output.mp4'); } catch {}

  onProgress?.({
    status: 'completed',
    message: 'Video processing complete!',
    percent: 100,
  });

  // Create blob from output
  const blob = new Blob([outputData as unknown as BlobPart], { type: 'video/mp4' });
  return blob;
}

/**
 * Format seconds to HH:MM:SS.ms
 */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`;
}

/**
 * Check if FFmpeg is loaded and ready
 */
export function isFFmpegLoaded(): boolean {
  return ffmpegInstance !== null;
}

/**
 * Get file size in MB
 */
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024);
}

/**
 * Maximum recommended file size for browser processing (200MB)
 */
export const MAX_FILE_SIZE_MB = 200;

/**
 * Validate video file before processing
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const sizeMB = getFileSizeMB(file);
  
  if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|avi|webm|mkv)$/i)) {
    return { valid: false, error: 'Invalid file type. Please upload a video file (MP4, MOV, AVI, WebM).' };
  }

  if (sizeMB > MAX_FILE_SIZE_MB) {
    return { valid: false, error: `File is too large (${sizeMB.toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB for browser processing.` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  return { valid: true };
}
