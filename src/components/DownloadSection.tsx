import type { VideoSettings } from '../types';

interface Props {
  onDownload: () => void;
  onReset: () => void;
  videoFile: File;
  processedSize: number;
  settings: VideoSettings;
}

export default function DownloadSection({ onDownload, onReset, videoFile, processedSize, settings }: Props) {
  const inputSize = (videoFile.size / (1024 * 1024)).toFixed(1);
  const outputSize = (processedSize / (1024 * 1024)).toFixed(1);

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">Video Exported Successfully</h3>
            <p className="text-sm text-gray-400">
              Processed with FFmpeg • Real MP4 output
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onReset}
            className="btn-secondary flex-1 sm:flex-none text-center flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Video
          </button>
          <button
            onClick={onDownload}
            className="btn-primary flex-1 sm:flex-none text-center flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download MP4
          </button>
        </div>
      </div>

      {/* Export details */}
      <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-2 rounded-lg bg-white/[0.03]">
          <div className="text-xs text-gray-500">Input</div>
          <div className="text-sm font-medium text-gray-300 mt-0.5">{inputSize} MB</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03]">
          <div className="text-xs text-gray-500">Output</div>
          <div className="text-sm font-medium text-green-300 mt-0.5">{outputSize} MB</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03]">
          <div className="text-xs text-gray-500">Resolution</div>
          <div className="text-sm font-medium text-gray-300 mt-0.5">{settings.resolution}</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.03]">
          <div className="text-xs text-gray-500">Aspect Ratio</div>
          <div className="text-sm font-medium text-gray-300 mt-0.5">{settings.aspectRatio}</div>
        </div>
      </div>

      {/* Technical details */}
      <div className="mt-3 pt-3 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-600">
          <span className="px-2 py-0.5 rounded bg-white/5">Codec: H.264</span>
          <span className="px-2 py-0.5 rounded bg-white/5">Audio: AAC 128k</span>
          <span className="px-2 py-0.5 rounded bg-white/5">Container: MP4</span>
          <span className="px-2 py-0.5 rounded bg-white/5">Engine: FFmpeg.wasm</span>
        </div>
      </div>
    </div>
  );
}
