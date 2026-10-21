import type { EnhanceSettings } from '../types';

interface Props {
  originalUrl: string;
  processedUrl: string;
  enhance: EnhanceSettings;
  isProcessed: boolean;
  viewMode: 'original' | 'processed' | 'compare';
  onViewModeChange: (mode: 'original' | 'processed' | 'compare') => void;
}

export default function VideoPreview({ originalUrl, processedUrl, enhance, isProcessed, viewMode, onViewModeChange }: Props) {
  // Apply CSS filters for original video preview (matches what FFmpeg will apply)
  const filterStyle = {
    filter: `brightness(${enhance.brightness}%) contrast(${enhance.contrast + enhance.sharpness * 0.3}%) saturate(${enhance.saturation}%)`,
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header with view mode toggle */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="section-title mb-0">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {viewMode === 'compare' ? 'Side-by-Side Comparison' : viewMode === 'processed' ? 'Processed Preview' : 'Original Video'}
        </h3>

        {isProcessed && (
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => onViewModeChange('original')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'original'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => onViewModeChange('processed')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'processed'
                  ? 'bg-green-600/30 text-green-200 border border-green-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Processed
            </button>
            <button
              onClick={() => onViewModeChange('compare')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'compare'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Compare
            </button>
          </div>
        )}
      </div>
      
      {/* Video Display */}
      {viewMode === 'compare' ? (
        // Side-by-side comparison
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="relative bg-black aspect-video border-b md:border-b-0 md:border-r border-white/10">
            <video
              src={originalUrl}
              controls
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 text-xs text-gray-300 border border-white/10 backdrop-blur-sm">
              Original
            </div>
          </div>
          <div className="relative bg-black aspect-video">
            <video
              src={processedUrl}
              controls
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-green-900/70 text-xs text-green-300 border border-green-500/20 backdrop-blur-sm">
              ✓ Processed
            </div>
          </div>
        </div>
      ) : viewMode === 'processed' ? (
        // Processed video only
        <div className="relative bg-black aspect-video">
          <video
            src={processedUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-900/70 text-xs text-green-300 border border-green-500/20 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            FFmpeg Processed
          </div>
        </div>
      ) : (
        // Original video with CSS preview filters
        <div className="relative bg-black aspect-video">
          <video
            src={originalUrl}
            controls
            className="w-full h-full object-contain"
            style={filterStyle}
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 text-xs text-gray-300 border border-white/10 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Original + CSS Preview Filters
          </div>
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-amber-900/50 text-[10px] text-amber-300 border border-amber-500/20 backdrop-blur-sm">
            Preview only — export applies real FFmpeg changes
          </div>
        </div>
      )}

      {/* Info Bar */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {viewMode === 'compare' && (
            <span className="text-indigo-300 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Side-by-Side
            </span>
          )}
          {viewMode === 'processed' && (
            <span className="text-green-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Real MP4 Output
            </span>
          )}
          {viewMode === 'original' && (
            <span className="text-gray-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Original Source
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isProcessed && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">
              Process video to see real changes
            </span>
          )}
          {isProcessed && viewMode !== 'compare' && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-gray-400">
              Click &quot;Compare&quot; for side-by-side view
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
