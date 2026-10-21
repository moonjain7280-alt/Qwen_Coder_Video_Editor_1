import { useState, useCallback } from 'react';
import type { TrimSettings } from '../types';

interface Props {
  trim: TrimSettings;
  onChange: (trim: TrimSettings) => void;
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrimControls({ trim, onChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const handleStartChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value < trim.endTime) {
      onChange({ ...trim, startTime: value });
    }
  }, [trim, onChange]);

  const handleEndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value > trim.startTime) {
      onChange({ ...trim, endTime: value });
    }
  }, [trim, onChange]);

  const isTrimmed = trim.startTime > 0 || (trim.endTime > 0 && trim.endTime < trim.duration);
  const trimDuration = isTrimmed 
    ? (trim.endTime > 0 ? trim.endTime : trim.duration) - trim.startTime 
    : trim.duration;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
          Trim Video
        </h3>
        {isTrimmed && (
          <button
            onClick={() => onChange({ ...trim, startTime: 0, endTime: 0 })}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Reset Trim
          </button>
        )}
      </div>

      {/* Timeline visualization */}
      <div className="relative">
        <div className="h-10 bg-white/5 rounded-lg border border-white/10 overflow-hidden relative">
          {/* Full duration bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-indigo-900/30" />
          
          {/* Selected range */}
          {isTrimmed && (
            <div 
              className="absolute inset-y-0 bg-purple-600/30 border-l-2 border-r-2 border-purple-500"
              style={{
                left: `${(trim.startTime / trim.duration) * 100}%`,
                width: `${((trim.endTime > 0 ? trim.endTime : trim.duration) - trim.startTime) / trim.duration * 100}%`,
              }}
            />
          )}

          {/* Time markers */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="text-[10px] text-gray-500">0:00</span>
            <span className="text-[10px] text-gray-500">{formatTime(trim.duration)}</span>
          </div>
        </div>
      </div>

      {/* Trim controls */}
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {isTrimmed ? (
              <span>
                <span className="text-purple-300 font-mono">{formatTime(trim.startTime)}</span>
                {' → '}
                <span className="text-purple-300 font-mono">{formatTime(trim.endTime > 0 ? trim.endTime : trim.duration)}</span>
                {' '}<span className="text-gray-500">({formatTime(trimDuration)})</span>
              </span>
            ) : (
              <span className="text-gray-500">Full video ({formatTime(trim.duration)})</span>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            {isTrimmed ? 'Edit Trim' : 'Set Trim'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">Start Time</label>
              <span className="text-xs text-purple-300 font-mono">{formatTime(trim.startTime)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={trim.duration}
              step={0.1}
              value={trim.startTime}
              onChange={handleStartChange}
              className="w-full"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-400">End Time</label>
              <span className="text-xs text-purple-300 font-mono">{formatTime(trim.endTime > 0 ? trim.endTime : trim.duration)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={trim.duration}
              step={0.1}
              value={trim.endTime > 0 ? trim.endTime : trim.duration}
              onChange={handleEndChange}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="btn-primary text-xs py-1.5 px-3 flex-1"
            >
              Apply Trim
            </button>
            <button
              onClick={() => {
                onChange({ ...trim, startTime: 0, endTime: 0 });
                setIsEditing(false);
              }}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-600 flex items-start gap-1.5">
        <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Trimming is applied during export. The original video is preserved.</span>
      </div>
    </div>
  );
}
