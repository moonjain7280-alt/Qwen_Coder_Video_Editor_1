import { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import VideoUpload from './components/VideoUpload';
import VideoSettings from './components/VideoSettings';
import VideoPreview from './components/VideoPreview';
import EnhanceControls from './components/EnhanceControls';
import TrimControls from './components/TrimControls';
import ProcessingModal from './components/ProcessingModal';
import DownloadSection from './components/DownloadSection';
import {
  processVideo,
  getVideoDuration,
  loadFFmpeg,
  validateVideoFile,
  isFFmpegLoaded,
  getFileSizeMB,
} from './services/videoProcessor';
import type {
  VideoSettings as VideoSettingsType,
  EnhanceSettings,
  TrimSettings,
  ProcessingStatus,
} from './types';

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);

  const [settings, setSettings] = useState<VideoSettingsType>({
    videoType: 'youtube-shorts',
    editingStyle: 'dynamic',
    aspectRatio: '16:9',
    resolution: '1080p',
    subtitles: false,
    subtitleStyle: 'modern',
  });

  const [enhance, setEnhance] = useState<EnhanceSettings>({
    brightness: 100,
    contrast: 100,
    sharpness: 0,
    saturation: 100,
    volume: 100,
  });

  const [trim, setTrim] = useState<TrimSettings>({
    startTime: 0,
    endTime: 0,
    duration: 0,
  });

  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle');
  const [processingMessage, setProcessingMessage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingError, setProcessingError] = useState<string | undefined>();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processingRef = useRef(false);

  // Pre-load FFmpeg on mount
  useEffect(() => {
    let cancelled = false;
    
    const preload = async () => {
      setFfmpegLoading(true);
      try {
        await loadFFmpeg((p) => {
          if (!cancelled) {
            setProcessingMessage(p.message);
          }
        });
        if (!cancelled) {
          setFfmpegReady(true);
        }
      } catch (err) {
        console.error('FFmpeg load error:', err);
        if (!cancelled) {
          setProcessingMessage('Failed to load processing engine. Some features may not work.');
        }
      } finally {
        if (!cancelled) {
          setFfmpegLoading(false);
        }
      }
    };

    preload();
    return () => { cancelled = true; };
  }, []);

  const handleVideoUpload = useCallback(async (file: File) => {
    // Validate file
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }
    setUploadError(null);

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setProcessedBlob(null);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setProcessedUrl('');
    setProcessingStatus('idle');
    setCurrentStep(1);

    // Get video duration
    try {
      const duration = await getVideoDuration(file);
      setVideoDuration(duration);
      setTrim({ startTime: 0, endTime: 0, duration });
    } catch {
      // If duration detection fails, use a default
      setVideoDuration(0);
      setTrim({ startTime: 0, endTime: 0, duration: 0 });
    }
  }, [processedUrl]);

  const handleSettingsChange = useCallback((newSettings: Partial<VideoSettingsType>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleEnhanceChange = useCallback((key: keyof EnhanceSettings, value: number) => {
    setEnhance(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleTrimChange = useCallback((newTrim: TrimSettings) => {
    setTrim(newTrim);
  }, []);

  const handleProcessVideo = useCallback(async () => {
    if (!videoFile || processingRef.current) return;

    processingRef.current = true;
    setProcessingStatus('loading');
    setProcessingProgress(0);
    setProcessingError(undefined);
    setProcessingMessage('Initializing FFmpeg...');

    try {
      // Ensure FFmpeg is loaded
      if (!isFFmpegLoaded()) {
        await loadFFmpeg((p) => {
          setProcessingStatus(p.status);
          setProcessingMessage(p.message);
          setProcessingProgress(p.percent);
        });
      }

      setProcessingStatus('ready');
      setProcessingMessage('Preparing video processing...');
      setProcessingProgress(5);

      // Process the video
      const blob = await processVideo(
        videoFile,
        {
          brightness: enhance.brightness,
          contrast: enhance.contrast,
          saturation: enhance.saturation,
          sharpness: enhance.sharpness,
          volume: enhance.volume,
          trimStart: trim.startTime,
          trimEnd: trim.endTime,
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
        },
        (progress) => {
          setProcessingStatus(progress.status);
          setProcessingMessage(progress.message);
          setProcessingProgress(progress.percent);
        }
      );

      // Store processed video
      setProcessedBlob(blob);
      const newUrl = URL.createObjectURL(blob);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      setProcessedUrl(newUrl);
      setProcessingStatus('completed');
      setProcessingProgress(100);
      setProcessingMessage('Video processing complete!');
      setCurrentStep(4);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed with an unknown error.';
      setProcessingStatus('error');
      setProcessingError(errorMessage);
      setProcessingMessage('Processing failed');
    } finally {
      processingRef.current = false;
    }
  }, [videoFile, enhance, trim, settings, processedUrl]);

  const handleDownload = useCallback(() => {
    if (!processedBlob) return;
    const url = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-edited-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [processedBlob]);

  const handleReset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setVideoFile(null);
    setVideoUrl('');
    setProcessedBlob(null);
    setProcessedUrl('');
    setProcessingStatus('idle');
    setCurrentStep(0);
    setVideoDuration(0);
    setUploadError(null);
    setSettings({
      videoType: 'youtube-shorts',
      editingStyle: 'dynamic',
      aspectRatio: '16:9',
      resolution: '1080p',
      subtitles: false,
      subtitleStyle: 'modern',
    });
    setEnhance({
      brightness: 100,
      contrast: 100,
      sharpness: 0,
      saturation: 100,
      volume: 100,
    });
    setTrim({ startTime: 0, endTime: 0, duration: 0 });
  }, [videoUrl, processedUrl]);

  const isProcessing = processingStatus !== 'idle' && processingStatus !== 'completed' && processingStatus !== 'error';
  const isProcessed = processedBlob !== null;
  const previewUrl = isProcessed ? processedUrl : videoUrl;

  // Check if any settings have changed from defaults
  const hasEnhanceChanges = enhance.brightness !== 100 || enhance.contrast !== 100 || 
    enhance.sharpness !== 0 || enhance.saturation !== 100 || enhance.volume !== 100;
  const hasTrimChanges = trim.startTime > 0 || (trim.endTime > 0 && trim.endTime < trim.duration);
  const hasAspectChanges = settings.aspectRatio !== '16:9';
  const hasResolutionChanges = settings.resolution !== '1080p';
  const hasAnyChanges = hasEnhanceChanges || hasTrimChanges || hasAspectChanges || hasResolutionChanges;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Engine Status Bar */}
      <div className="px-4 md:px-8 py-2 border-b border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {ffmpegLoading ? (
              <>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300">Loading FFmpeg engine...</span>
              </>
            ) : ffmpegReady ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-green-300">FFmpeg.wasm Ready</span>
                <span className="text-gray-600">• Real video processing in browser</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-300">Engine unavailable</span>
              </>
            )}
          </div>
          <span className="text-gray-600 hidden sm:inline">
            Max file size: 200MB • All processing local
          </span>
        </div>
      </div>
      
      {/* Progress Steps */}
      {videoFile && (
        <div className="px-4 md:px-8 py-4 border-b border-white/5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {['Upload', 'Configure', 'Enhance', 'Export'].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center gap-2 ${i <= currentStep ? 'text-purple-400' : 'text-gray-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i < currentStep ? 'bg-purple-600 text-white' : 
                    i === currentStep ? 'bg-purple-600/30 border-2 border-purple-500 text-purple-300' : 
                    'bg-white/5 border border-white/10 text-gray-500'
                  }`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{step}</span>
                </div>
                {i < 3 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 transition-all duration-500 ${
                    i < currentStep ? 'bg-purple-600' : 'bg-white/10'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {!videoFile ? (
            <div>
              <VideoUpload onUpload={handleVideoUpload} />
              {uploadError && (
                <div className="max-w-2xl mx-auto mt-4 p-4 rounded-xl bg-red-900/20 border border-red-500/20 text-center">
                  <p className="text-red-300 text-sm">{uploadError}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Preview & Download */}
              <div className="lg:col-span-2 space-y-6">
                <VideoPreview 
                  videoUrl={previewUrl}
                  enhance={isProcessed ? { brightness: 100, contrast: 100, sharpness: 0, saturation: 100, volume: 100 } : enhance}
                  isProcessed={isProcessed}
                  isOriginal={!isProcessed}
                />

                {/* Video Info */}
                <div className="glass-card p-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-400">{videoFile.name}</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{getFileSizeMB(videoFile).toFixed(1)} MB</span>
                    {videoDuration > 0 && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">{Math.floor(videoDuration / 60)}:{Math.floor(videoDuration % 60).toString().padStart(2, '0')}</span>
                      </>
                    )}
                    {isProcessed && processedBlob && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-green-400">Output: {(processedBlob.size / (1024 * 1024)).toFixed(1)} MB</span>
                      </>
                    )}
                  </div>
                </div>
                
                {isProcessed && (
                  <DownloadSection 
                    onDownload={handleDownload} 
                    onReset={handleReset}
                    videoFile={videoFile}
                    processedSize={processedBlob ? processedBlob.size : 0}
                    settings={settings}
                  />
                )}
              </div>

              {/* Right Column - Settings & Enhance */}
              <div className="space-y-6">
                <VideoSettings 
                  settings={settings} 
                  onChange={handleSettingsChange}
                />

                {videoDuration > 0 && (
                  <TrimControls 
                    trim={trim}
                    onChange={handleTrimChange}
                  />
                )}
                
                <EnhanceControls 
                  enhance={enhance} 
                  onChange={handleEnhanceChange}
                />

                {/* Process Button */}
                <button
                  onClick={handleProcessVideo}
                  disabled={isProcessing || !ffmpegReady}
                  className="btn-primary w-full text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : isProcessed ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Re-process Video
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {hasAnyChanges ? 'Export Edited Video' : 'Export Video'}
                    </>
                  )}
                </button>

                {!hasAnyChanges && !isProcessed && (
                  <p className="text-xs text-gray-600 text-center">
                    Adjust settings above to apply real changes to your video export.
                  </p>
                )}

                {isProcessed && (
                  <div className="glass-card p-4 text-center">
                    <p className="text-sm text-green-300 mb-1">✓ Video processed successfully</p>
                    <p className="text-xs text-gray-500">
                      The downloaded file contains real FFmpeg-applied changes.
                    </p>
                  </div>
                )}

                {processingStatus === 'error' && (
                  <div className="glass-card p-4 border-red-500/20">
                    <p className="text-sm text-red-300 mb-2">Processing failed</p>
                    <p className="text-xs text-gray-500 mb-3">{processingError}</p>
                    <button
                      onClick={handleProcessVideo}
                      className="btn-secondary text-xs w-full"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Processing Modal */}
      {(isProcessing || processingStatus === 'completed' || processingStatus === 'error') && (
        <ProcessingModal
          status={processingStatus}
          message={processingMessage}
          progress={processingProgress}
          error={processingError}
          onRetry={processingStatus === 'error' ? handleProcessVideo : undefined}
          onCancel={processingStatus === 'completed' ? () => setProcessingStatus('idle') : undefined}
        />
      )}
    </div>
  );
}
