// Core type definitions for PixelFX

import { EffectLayer } from '../domain/effects/types';

export interface ProjectEffect {
  effectId: string;
  params: Record<string, any>;
}

export interface Project {
  id: string;
  name?: string; // User-defined project name
  sourceImagePath: string;
  sourceImageDimensions: { width: number; height: number };
  thumbnailPath: string;
  effect?: ProjectEffect; // Applied effect
  mixStack?: EffectLayer[]; // Mixes stack for multi-effect projects.
  elements?: unknown[]; // Optional/legacy list for UI counts.
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
  confirmDelete: boolean; // Show confirmation before deleting projects
  language: 'en' | 'ru' | 'es' | 'de' | 'fr' | 'pt' | 'ja' | 'zh' | 'ko' | 'uk' | 'ar' | 'cs' | 'da' | 'el' | 'fi' | 'fil' | 'he' | 'hi' | 'hu' | 'id' | 'it' | 'ms' | 'nl' | 'no' | 'pl' | 'ro' | 'sv' | 'th' | 'tr' | 'vi';
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
