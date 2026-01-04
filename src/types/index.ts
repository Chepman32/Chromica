// Core type definitions for Chromica

export interface ProjectEffect {
  effectId: string;
  params: Record<string, any>;
}

export interface Project {
  id: string;
  sourceImagePath: string;
  sourceImageDimensions: { width: number; height: number };
  thumbnailPath: string;
  effect?: ProjectEffect; // Applied effect
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageFilter {
  id: string;
  name: string;
  intensity: number;
  type: string;
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
