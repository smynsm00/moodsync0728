export interface FilterParams {
  brightness: number;   // 0 to 200, default 100 (%)
  contrast: number;     // 0 to 200, default 100 (%)
  saturation: number;   // 0 to 200, default 100 (%)
  temperature: number;  // -50 to 50, default 0 (cool to warm)
  tint: number;         // -50 to 50, default 0 (green to magenta)
  sepia: number;        // 0 to 100, default 0 (%)
  hueRotate: number;    // -180 to 180, default 0 (deg)
}

export interface ColorToken {
  hex: string;
  rgb: string;
  hsl: string;
  name: string;
  textColor: string;      // recommended text color on this background (#ffffff or #000000)
  contrastRatio: string;  // e.g., "7.2:1 (AAA)"
}

export interface ImageAsset {
  id: string;
  name: string;
  originalUrl: string;
  thumbnailUrl: string;
  isAnchor: boolean;
  width: number;
  height: number;
  colorPalette: ColorToken[];
  appliedParams: FilterParams;
  presetId?: string;
  isSynced?: boolean;
}

export interface MoodPreset {
  id: string;
  name: string;
  category: 'Cinematic' | 'Film & Analog' | 'Vivid & Neon' | 'Monochrome' | 'Commercial';
  description: string;
  previewColor: string;
  defaultParams: FilterParams;
  isPremium: boolean;
  isFavorite?: boolean;
  cssFilterString?: string;
}

export interface SavedToneLock {
  id: string;
  name: string;
  anchorImageName: string;
  params: FilterParams;
  createdAt: string;
  presetId?: string;
}

export type ViewMode = 'grid' | 'split';

export interface ExportConfig {
  format: 'jpg' | 'png' | 'webp' | 'json';
  quality: number; // 0.1 - 1.0
  resolutionMode: '1080p' | 'original';
}
