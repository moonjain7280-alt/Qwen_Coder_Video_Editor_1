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
