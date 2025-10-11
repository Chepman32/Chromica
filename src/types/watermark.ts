// Watermark type definitions

export type WatermarkType = 'text' | 'image' | 'combined';

export type WatermarkPattern =
  | 'grid'
  | 'diagonal'
  | 'scattered'
  | 'corners'
  | 'edges'
  | 'center'
  | 'single';

export type WatermarkDensity = 'dense' | 'moderate' | 'sparse';

export type WatermarkStyle = 'subtle' | 'standard' | 'prominent';

export interface WatermarkInstance {
  id: string;
  type: WatermarkType;
  content: string; // Text content or image URI
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number; // degrees
  opacity: number; // 0-1
  locked: boolean;
  visible: boolean;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
    textEffect?: 'none' | 'neon' | 'glow' | 'shadow' | 'outline';
  };
}

export interface WatermarkPreset {
  id: string;
  name: string;
  description: string;
  category: 'coverage' | 'size' | 'pattern' | 'density' | 'style';
  pattern: WatermarkPattern;
  density: WatermarkDensity;
  style: WatermarkStyle;
  config: {
    count: number;
    baseSize: { width: number; height: number };
    sizeVariation: number; // 0-1, amount of random size variation
    opacityRange: { min: number; max: number };
    rotationRange: { min: number; max: number };
    spacing?: number; // For grid patterns
    alignment?: 'left' | 'center' | 'right';
  };
  thumbnail?: string;
}

export interface WatermarkGlobalSettings {
  opacity: number;
  scale: number;
  rotation: number;
}

export interface WatermarkState {
  watermarks: WatermarkInstance[];
  activePresetId: string | null;
  selectedWatermarkId: string | null;
  globalSettings: WatermarkGlobalSettings;
  customText: string;
  customImageUri: string | null;
}
