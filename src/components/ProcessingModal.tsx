interface Props {
  progress: number;
  step: string;
}

export default function ProcessingModal({ progress, step }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-card p-8 max-w-md w-full mx-4 text-center">
        {/* Animated AI Icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-purple-600/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-purple-600/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">AI Processing</h3>
        <p className="text-gray-400 text-sm mb-6">{step}</p>

        {/* Progress Bar */}
        <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-3">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded-full blur-sm transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="text-purple-300 font-mono font-bold">{Math.round(progress)}%</span>
        </div>

        {/* Processing steps */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          {['Analyze', 'Edit', 'Enhance', 'Export'].map((s, i) => (
            <div key={s} className={`text-center ${progress > i * 25 ? 'text-purple-300' : 'text-gray-600'}`}>
              <div className={`w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center text-xs ${
                progress > (i + 1) * 25 ? 'bg-purple-600 text-white' :
                progress > i * 25 ? 'bg-purple-600/30 border border-purple-500' :
                'bg-white/5 border border-white/10'
              }`}>
                {progress > (i + 1) * 25 ? '✓' : i + 1}
              </div>
              <span className="text-[10px]">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
