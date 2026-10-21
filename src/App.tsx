import { useState, useCallback } from 'react';
import Header from './components/Header';
import VideoUpload from './components/VideoUpload';
import VideoSettings from './components/VideoSettings';
import VideoPreview from './components/VideoPreview';
import EnhanceControls from './components/EnhanceControls';
import ProcessingModal from './components/ProcessingModal';
import DownloadSection from './components/DownloadSection';
import type { VideoSettings as VideoSettingsType, EnhanceSettings } from './types';

export default function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [settings, setSettings] = useState<VideoSettingsType>({
    videoType: 'youtube-shorts',
    editingStyle: 'dynamic',
    aspectRatio: '9:16',
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [isProcessed, setIsProcessed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleVideoUpload = useCallback((file: File) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setIsProcessed(false);
    setCurrentStep(1);
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<VideoSettingsType>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleEnhanceChange = useCallback((key: keyof EnhanceSettings, value: number) => {
    setEnhance(prev => ({ ...prev, [key]: value }));
  }, []);

  const simulateProcessing = useCallback(async () => {
    setIsProcessing(true);
    setProgress(0);

    const steps = [
      'Analyzing video content...',
      'Applying AI scene detection...',
      `Optimizing for ${settings.videoType} format...`,
      `Setting aspect ratio to ${settings.aspectRatio}...`,
      `Rendering at ${settings.resolution}...`,
      settings.subtitles ? 'Generating AI subtitles...' : 'Skipping subtitles...',
      'Applying enhancement filters...',
      'Finalizing video...',
      'Complete!'
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      const targetProgress = ((i + 1) / steps.length) * 100;
      
      await new Promise<void>(resolve => {
        const duration = 400 + Math.random() * 600;
        const startTime = Date.now();
        const startProgress = (i / steps.length) * 100;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const fraction = Math.min(elapsed / duration, 1);
          setProgress(startProgress + (targetProgress - startProgress) * fraction);
          
          if (fraction < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(animate);
      });
    }

    setIsProcessing(false);
    setIsProcessed(true);
    setCurrentStep(4);
  }, [settings]);

  const handleDownload = useCallback(() => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    const ext = videoFile?.name.split('.').pop() || 'mp4';
    a.download = `ai-edited-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [videoUrl, videoFile]);

  const handleReset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl('');
    setIsProcessed(false);
    setCurrentStep(0);
    setSettings({
      videoType: 'youtube-shorts',
      editingStyle: 'dynamic',
      aspectRatio: '9:16',
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
  }, [videoUrl]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
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
            <VideoUpload onUpload={handleVideoUpload} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Preview & Download */}
              <div className="lg:col-span-2 space-y-6">
                <VideoPreview 
                  videoUrl={videoUrl}
                  enhance={enhance}
                  isProcessed={isProcessed}
                />
                
                {isProcessed && (
                  <DownloadSection 
                    onDownload={handleDownload} 
                    onReset={handleReset}
                    videoFile={videoFile}
                  />
                )}
              </div>

              {/* Right Column - Settings & Enhance */}
              <div className="space-y-6">
                <VideoSettings 
                  settings={settings} 
                  onChange={handleSettingsChange}
                />
                
                <EnhanceControls 
                  enhance={enhance} 
                  onChange={handleEnhanceChange}
                />

                <button
                  onClick={simulateProcessing}
                  disabled={isProcessing}
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
                      AI Edit Video
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isProcessing && (
        <ProcessingModal progress={progress} step={processingStep} />
      )}
    </div>
  );
}
