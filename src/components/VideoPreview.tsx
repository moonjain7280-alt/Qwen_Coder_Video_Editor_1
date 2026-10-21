import type { EnhanceSettings } from '../types';

interface Props {
  videoUrl: string;
  enhance: EnhanceSettings;
  isProcessed: boolean;
  isOriginal?: boolean;
}

export default function VideoPreview({ videoUrl, enhance, isProcessed, isOriginal = false }: Props) {
  // Apply CSS filters for live preview (these match what FFmpeg will apply)
  const filterStyle = !isProcessed ? {
    filter: `brightness(${enhance.brightness}%) contrast(${enhance.contrast + enhance.sharpness * 0.3}%) saturate(${enhance.saturation}%)`,
  } : {};

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="section-title mb-0">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {isProcessed ? 'Processed Output' : 'Live Preview'}
        </h3>
        <div className="flex items-center gap-2">
          {isProcessed ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              FFmpeg Processed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Original + Preview Filters
            </span>
          )}
        </div>
      </div>
      
      <div className="relative bg-black aspect-video flex items-center justify-center">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
          style={filterStyle}
        />
      </div>

      {/* Video Info Bar */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isProcessed ? 'Processed' : 'Original'}
          </span>
          {!isProcessed && (
            <span className="text-amber-400/70 text-[10px]">
              CSS preview only — export applies real FFmpeg changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isProcessed && (
            <span className="px-2 py-0.5 rounded bg-green-400/10 text-green-400 text-[10px]">
              Real MP4 Output
            </span>
          )}
          {!isProcessed && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">Live Preview</span>
          )}
        </div>
      </div>
    </div>
  );
}
