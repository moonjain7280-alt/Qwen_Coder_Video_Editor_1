import type { EnhanceSettings } from '../types';

interface Props {
  enhance: EnhanceSettings;
  onChange: (key: keyof EnhanceSettings, value: number) => void;
}

const controls = [
  { key: 'brightness' as const, label: 'Brightness', icon: '☀️', min: 50, max: 150, default: 100 },
  { key: 'contrast' as const, label: 'Contrast', icon: '◐', min: 50, max: 150, default: 100 },
  { key: 'sharpness' as const, label: 'Sharpness', icon: '🔍', min: 0, max: 100, default: 0 },
  { key: 'saturation' as const, label: 'Color', icon: '🎨', min: 0, max: 200, default: 100 },
  { key: 'volume' as const, label: 'Audio', icon: '🔊', min: 0, max: 200, default: 100 },
];

export default function EnhanceControls({ enhance, onChange }: Props) {
  const handleReset = () => {
    controls.forEach(control => {
      onChange(control.key, control.default);
    });
  };

  const hasChanges = controls.some(c => enhance[c.key] !== c.default);

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title mb-0">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Enhance
        </h3>
        {hasChanges && (
          <button
            onClick={handleReset}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {controls.map(control => (
          <div key={control.key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-gray-300 flex items-center gap-1.5">
                <span className="text-base">{control.icon}</span>
                {control.label}
              </label>
              <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded">
                {enhance[control.key]}{control.key === 'volume' || control.key === 'brightness' || control.key === 'contrast' || control.key === 'saturation' ? '%' : ''}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={control.min}
                max={control.max}
                value={enhance[control.key]}
                onChange={(e) => onChange(control.key, Number(e.target.value))}
                className="w-full"
              />
              {/* Track fill indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 pointer-events-none opacity-60"
                style={{ width: `${((enhance[control.key] - control.min) / (control.max - control.min)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick presets */}
      <div className="pt-3 border-t border-white/5">
        <label className="text-xs text-gray-500 mb-2 block">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '🌅 Warm', values: { brightness: 110, contrast: 105, saturation: 120, sharpness: 10, volume: 100 } },
            { label: '❄️ Cool', values: { brightness: 105, contrast: 110, saturation: 80, sharpness: 20, volume: 100 } },
            { label: '🎬 Cinema', values: { brightness: 95, contrast: 120, saturation: 90, sharpness: 30, volume: 100 } },
            { label: '✨ Bright', values: { brightness: 130, contrast: 100, saturation: 110, sharpness: 15, volume: 100 } },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                Object.entries(preset.values).forEach(([key, value]) => {
                  onChange(key as keyof EnhanceSettings, value);
                });
              }}
              className="chip chip-inactive text-xs"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
