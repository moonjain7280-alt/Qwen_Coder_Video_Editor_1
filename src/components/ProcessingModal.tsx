import type { ProcessingStatus } from '../types';

interface Props {
  status: ProcessingStatus;
  message: string;
  progress: number;
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const statusSteps = [
  { key: 'loading', label: 'Load Engine', threshold: 5 },
  { key: 'uploading', label: 'Read File', threshold: 15 },
  { key: 'analyzing', label: 'Analyze', threshold: 20 },
  { key: 'applying-filters', label: 'Filters', threshold: 30 },
  { key: 'encoding', label: 'Encode', threshold: 40 },
  { key: 'finalizing', label: 'Finalize', threshold: 90 },
  { key: 'completed', label: 'Done', threshold: 100 },
];

export default function ProcessingModal({ status, message, progress, error, onRetry, onCancel }: Props) {
  const isError = status === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-card p-6 sm:p-8 max-w-md w-full text-center">
        {/* Status Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {isError ? (
            <>
              <div className="absolute inset-0 rounded-full bg-red-600/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </>
          ) : status === 'completed' ? (
            <>
              <div className="absolute inset-0 rounded-full bg-green-600/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-ping" />
              <div className="absolute inset-2 rounded-full bg-purple-600/30 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">
          {isError ? 'Processing Failed' : status === 'completed' ? 'Processing Complete!' : 'FFmpeg Processing'}
        </h3>
        
        {/* Message */}
        <p className={`text-sm mb-6 ${isError ? 'text-red-300' : 'text-gray-400'}`}>
          {isError ? error || 'An unknown error occurred.' : message}
        </p>

        {/* Error details */}
        {isError && error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-left">
            <p className="text-xs text-red-300 font-mono break-words">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        {!isError && (
          <>
            <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded-full blur-sm transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-gray-500">Progress</span>
              <span className="text-purple-300 font-mono font-bold">{Math.round(progress)}%</span>
            </div>
          </>
        )}

        {/* Processing steps */}
        {!isError && (
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-7 gap-1">
            {statusSteps.map((step) => (
              <div key={step.key} className={`text-center ${progress >= step.threshold ? 'text-purple-300' : 'text-gray-600'}`}>
                <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                  progress >= step.threshold ? 'bg-purple-600 text-white' :
                  progress >= (step.threshold - 15) ? 'bg-purple-600/30 border border-purple-500' :
                  'bg-white/5 border border-white/10'
                }`}>
                  {progress >= step.threshold ? '✓' : step.key === status ? '⋯' : '·'}
                </div>
                <span className="text-[9px] leading-tight block">{step.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {isError && onRetry && (
            <button onClick={onRetry} className="btn-primary flex-1 text-sm">
              Retry Processing
            </button>
          )}
          {onCancel && (
            <button 
              onClick={onCancel} 
              className={`${isError ? 'btn-secondary' : 'btn-secondary'} flex-1 text-sm`}
            >
              {isError ? 'Close' : 'Cancel'}
            </button>
          )}
        </div>

        {/* Technical info */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-gray-600">
            Processing with FFmpeg.wasm in your browser. Video data never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
