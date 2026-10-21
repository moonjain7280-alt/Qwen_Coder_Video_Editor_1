import type { VideoSettings } from '../types';

interface Props {
  settings: VideoSettings;
  onChange: (settings: Partial<VideoSettings>) => void;
}

const videoTypes = [
  { id: 'youtube-shorts', label: 'YouTube Shorts', icon: '📱' },
  { id: 'long-video', label: 'Long Video', icon: '🎬' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎥' },
  { id: 'vlog', label: 'Vlog', icon: '📹' },
  { id: 'faceless', label: 'Faceless', icon: '🤖' },
];

const editingStyles = [
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'smooth', label: 'Smooth' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'energetic', label: 'Energetic' },
  { id: 'vintage', label: 'Vintage' },
];

const aspectRatios = [
  { id: '9:16', label: '9:16', desc: 'Vertical' },
  { id: '16:9', label: '16:9', desc: 'Landscape' },
  { id: '1:1', label: '1:1', desc: 'Square' },
  { id: '4:5', label: '4:5', desc: 'Portrait' },
];

const resolutions = [
  { id: '720p', label: '720p', desc: 'HD' },
  { id: '1080p', label: '1080p', desc: 'Full HD' },
  { id: '4k', label: '4K', desc: 'Ultra HD' },
];

const subtitleStyles = [
  { id: 'modern', label: 'Modern' },
  { id: 'classic', label: 'Classic' },
  { id: 'bold', label: 'Bold' },
  { id: 'neon', label: 'Neon' },
];

export default function VideoSettings({ settings, onChange }: Props) {
  return (
    <div className="glass-card p-5 space-y-5">
      <h3 className="section-title">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Video Settings
      </h3>

      {/* Video Type */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Video Type</label>
        <div className="flex flex-wrap gap-2">
          {videoTypes.map(type => (
            <button
              key={type.id}
              onClick={() => onChange({ videoType: type.id })}
              className={`chip ${settings.videoType === type.id ? 'chip-active' : 'chip-inactive'}`}
            >
              <span className="mr-1">{type.icon}</span> {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editing Style */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Editing Style</label>
        <div className="flex flex-wrap gap-2">
          {editingStyles.map(style => (
            <button
              key={style.id}
              onClick={() => onChange({ editingStyle: style.id })}
              className={`chip ${settings.editingStyle === style.id ? 'chip-active' : 'chip-inactive'}`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Aspect Ratio</label>
        <div className="grid grid-cols-4 gap-2">
          {aspectRatios.map(ratio => (
            <button
              key={ratio.id}
              onClick={() => onChange({ aspectRatio: ratio.id })}
              className={`p-2 rounded-xl text-center transition-all duration-200 border ${
                settings.aspectRatio === ratio.id
                  ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="text-sm font-bold">{ratio.label}</div>
              <div className="text-xs opacity-60">{ratio.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Resolution</label>
        <div className="grid grid-cols-3 gap-2">
          {resolutions.map(res => (
            <button
              key={res.id}
              onClick={() => onChange({ resolution: res.id })}
              className={`p-2 rounded-xl text-center transition-all duration-200 border ${
                settings.resolution === res.id
                  ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="text-sm font-bold">{res.label}</div>
              <div className="text-xs opacity-60">{res.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Subtitles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-400">Subtitles</label>
          <button
            onClick={() => onChange({ subtitles: !settings.subtitles })}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              settings.subtitles ? 'bg-purple-600' : 'bg-white/10'
            }`}
          >
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow ${
              settings.subtitles ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
        
        {settings.subtitles && (
          <div className="mt-2">
            <label className="text-xs text-gray-500 mb-1.5 block">Subtitle Style</label>
            <div className="flex flex-wrap gap-2">
              {subtitleStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => onChange({ subtitleStyle: style.id })}
                  className={`chip text-xs ${settings.subtitleStyle === style.id ? 'chip-active' : 'chip-inactive'}`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
