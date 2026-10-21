export interface VideoSettings {
  videoType: string;
  editingStyle: string;
  aspectRatio: string;
  resolution: string;
  subtitles: boolean;
  subtitleStyle: string;
}

export interface EnhanceSettings {
  brightness: number;
  contrast: number;
  sharpness: number;
  saturation: number;
  volume: number;
}

export interface TrimSettings {
  startTime: number;  // seconds
  endTime: number;    // seconds (0 = no trim)
  duration: number;   // total video duration in seconds
}

export type ProcessingStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'uploading'
  | 'analyzing'
  | 'applying-filters'
  | 'encoding'
  | 'finalizing'
  | 'completed'
  | 'error';

export interface ProcessingState {
  status: ProcessingStatus;
  message: string;
  percent: number;
  error?: string;
}
