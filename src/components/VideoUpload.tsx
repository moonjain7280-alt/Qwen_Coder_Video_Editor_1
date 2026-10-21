import { useCallback, useRef, useState } from 'react';

interface Props {
  onUpload: (file: File) => void;
}

export default function VideoUpload({ onUpload }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Transform Your Videos with AI
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Upload your video and let our AI enhance it with professional editing, effects, and optimization.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
          isDragging 
            ? 'border-purple-500 bg-purple-600/10 scale-[1.02]' 
            : 'border-white/20 bg-white/[0.02] hover:border-purple-500/50 hover:bg-purple-600/5'
        }`}
      >
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isDragging ? 'bg-purple-600/20' : 'bg-white/5'
        }`}>
          <svg className={`w-10 h-10 transition-colors ${isDragging ? 'text-purple-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div className="text-center">
          <p className="text-white font-semibold text-lg">
            {isDragging ? 'Drop your video here' : 'Drag & drop your video'}
          </p>
          <p className="text-gray-500 text-sm mt-1">or click to browse files</p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10">MP4</span>
          <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10">MOV</span>
          <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10">AVI</span>
          <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10">WEBM</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full max-w-3xl">
        {[
          { icon: '🎬', title: 'Smart Editing', desc: 'AI detects scenes & applies cuts' },
          { icon: '✨', title: 'Auto Enhance', desc: 'Brightness, color & audio fix' },
          { icon: '📱', title: 'Multi-Format', desc: 'Shorts, reels, cinematic & more' },
        ].map((feature) => (
          <div key={feature.title} className="glass-card p-4 text-center">
            <div className="text-2xl mb-2">{feature.icon}</div>
            <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
