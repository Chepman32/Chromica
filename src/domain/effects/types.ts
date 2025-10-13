/**
 * Core effect system types
 */

export enum EffectCategory {
  CELLULAR = 'cellular',
  TILING = 'tiling',
  DISTORTION = 'distortion',
  RELIEF = 'relief',
  GLITCH = 'glitch',
  STYLIZATION = 'stylization',
  BLUR_SHARPEN = 'blur-sharpen',
  BRUSH = 'brush',
  GLASS = 'glass',
  CORRECTION = 'correction',
  FREQUENCY = 'frequency',
  RENDER = 'render',
}

export enum BlendMode {
  NORMAL = 'normal',
  MULTIPLY = 'multiply',
  SCREEN = 'screen',
  OVERLAY = 'overlay',
  SOFT_LIGHT = 'softLight',
}

export interface EffectParameter {
  name: string;
  label: string;
  type: 'slider' | 'segmented' | 'color' | 'toggle' | '2d-pad';
  min?: number;
  max?: number;
  default: number | string | boolean;
  options?: string[];
  step?: number;
}

export interface Effect {
  id: string;
  name: string;
  category: EffectCategory;
  description: string;
  isPremium: boolean;
  complexity: number; // 0-1, affects preview quality
  parameters: EffectParameter[];
  shaderPath?: string;
  icon?: any; // Image source for effect preview icon
}

export interface EffectLayer {
  id: string;
  effectId: string;
  params: Record<string, any>;
  opacity: number;
  visible: boolean;
  blendMode: BlendMode;
}

export interface EffectPreset {
  id: string;
  name: string;
  effectId: string;
  params: Record<string, any>;
  thumbnail?: string;
  createdAt: number;
}
