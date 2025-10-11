// Core type definitions for Artifex

export interface Project {
  id: string;
  sourceImagePath: string;
  sourceImageDimensions: { width: number; height: number };
  canvasSize?: { width: number; height: number }; // Canvas size when elements were created
  thumbnailPath: string;
  elements: SerializedElement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedElement {
  id: string;
  type: 'text' | 'sticker' | 'watermark' | 'stamp';
  position: { x: number; y: number }; // Normalized 0-1
  scale: number;
  rotation: number; // Degrees
  opacity: number; // 0-1
  zIndex: number;

  // Type-specific properties
  textContent?: string;
  font?: string;
  fontSize?: number;
  color?: string;
  strokeWidth?: number;
  strokeColor?: string;
  assetPath?: string;
  originalSize?: { width: number; height: number };
  tint?: string;
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'sticker' | 'watermark' | 'stamp';
  position: { x: number; y: number };
  scale: number;
  rotation: number; // radians for Reanimated
  width?: number;
  height?: number;
  opacity?: number; // 0-1, for watermarks and other elements

  // Type-specific properties
  textContent?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  textEffect?: 'none' | 'neon' | 'glow' | 'shadow' | 'outline';
  textBackground?: string | null;
  assetPath?: string;
}

export interface ImageFilter {
  id: string;
  name: string;
  intensity: number;
  type:
    | 'none'
    | 'bw'
    | 'sepia'
    | 'vintage'
    | 'cool'
    | 'warm'
    | 'cinematic'
    | 'film'
    | 'hdr'
    | 'portrait'
    | 'landscape'
    | 'neon'
    | 'cyberpunk'
    | 'retro'
    | 'juno'
    | 'gingham'
    | 'clarendon'
    | 'lark'
    | 'ludwig'
    | 'xproii'
    | 'lofi'
    | 'mayfair'
    | 'sierra'
    | 'tattoo'
    | 'inkwell'
    | 'rise';
}

export interface UserPreferences {
  defaultExportFormat: 'png' | 'jpg';
  defaultExportQuality: number;
  autoSaveProjects: boolean;
  hapticFeedback: boolean;
  colorScheme: 'auto' | 'light' | 'dark';
  theme: 'light' | 'dark' | 'solar' | 'mono';
  soundEnabled: boolean;
  language: 'en' | 'ru' | 'es' | 'de' | 'fr' | 'pt' | 'ja' | 'zh' | 'ko' | 'uk';
}

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number;
  addWatermark: boolean;
  canvasSize?: { width: number; height: number };
}

export interface PhotoAsset {
  uri: string;
  filename: string;
  width: number;
  height: number;
  timestamp: Date;
}

export interface Album {
  title: string;
  count: number;
  assets: PhotoAsset[];
}

export interface EditorHistory {
  action: 'add' | 'update' | 'delete' | 'batchAdd' | 'filter' | 'reorder';
  element?: SerializedElement;
  elements?: SerializedElement[]; // For batch operations
  elementId?: string;
  oldState?: any; // Can be SerializedElement or { canvasElements: CanvasElement[] }
  newState?: any; // Can be SerializedElement or { canvasElements: CanvasElement[] }
  oldFilter?: ImageFilter | null;
  newFilter?: ImageFilter | null;
  timestamp: number;
}
