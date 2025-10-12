/**
 * Effect registry - defines all available effects
 */

import { Effect, EffectCategory } from './types';

export const EFFECTS: Effect[] = [
  // CELLULAR EFFECTS
  {
    id: 'pixelate',
    name: 'Pixelate',
    category: EffectCategory.CELLULAR,
    description: 'Classic pixel mosaic effect',
    isPremium: false,
    complexity: 0.2,
    parameters: [
      {
        name: 'cellSize',
        label: 'Cell Size',
        type: 'slider',
        min: 2,
        max: 100,
        default: 10,
        step: 1,
      },
      {
        name: 'shape',
        label: 'Shape',
        type: 'segmented',
        options: ['Square', 'Circle', 'Diamond'],
        default: 'Square',
      },
    ],
    shaderPath: 'cellular/pixelate.sksl',
  },
  {
    id: 'crystallize',
    name: 'Crystallize',
    category: EffectCategory.CELLULAR,
    description: 'Voronoi cell-based effect',
    isPremium: true,
    complexity: 0.6,
    parameters: [
      {
        name: 'cellCount',
        label: 'Cell Count',
        type: 'slider',
        min: 10,
        max: 500,
        default: 100,
        step: 10,
      },
      {
        name: 'randomSeed',
        label: 'Random Seed',
        type: 'slider',
        min: 0,
        max: 1000,
        default: 42,
        step: 1,
      },
    ],
  },
  {
    id: 'halftone',
    name: 'Halftone',
    category: EffectCategory.CELLULAR,
    description: 'Classic print halftone dots',
    isPremium: true,
    complexity: 0.4,
    parameters: [
      {
        name: 'dotSize',
        label: 'Dot Size',
        type: 'slider',
        min: 2,
        max: 30,
        default: 8,
        step: 1,
      },
      {
        name: 'angle',
        label: 'Angle',
        type: 'slider',
        min: 0,
        max: 90,
        default: 45,
        step: 1,
      },
    ],
    shaderPath: 'cellular/halftone.sksl',
  },

  // TILING EFFECTS
  {
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    category: EffectCategory.TILING,
    description: 'Radial symmetry effect',
    isPremium: false,
    complexity: 0.3,
    parameters: [
      {
        name: 'segments',
        label: 'Segments',
        type: 'slider',
        min: 2,
        max: 24,
        default: 6,
        step: 1,
      },
      {
        name: 'angle',
        label: 'Rotation',
        type: 'slider',
        min: 0,
        max: 360,
        default: 0,
        step: 1,
      },
      {
        name: 'zoom',
        label: 'Zoom',
        type: 'slider',
        min: 0.5,
        max: 3,
        default: 1,
        step: 0.1,
      },
    ],
    shaderPath: 'tiling/kaleidoscope.sksl',
  },
  {
    id: 'mirror',
    name: 'Mirror',
    category: EffectCategory.TILING,
    description: 'Mirror reflection effect',
    isPremium: false,
    complexity: 0.2,
    parameters: [
      {
        name: 'axis',
        label: 'Axis',
        type: 'segmented',
        options: ['Horizontal', 'Vertical', 'Both', 'Diagonal'],
        default: 'Horizontal',
      },
      {
        name: 'offset',
        label: 'Offset',
        type: 'slider',
        min: -1,
        max: 1,
        default: 0,
        step: 0.01,
      },
    ],
    shaderPath: 'tiling/mirror.sksl',
  },

  // DISTORTION EFFECTS
  {
    id: 'wave',
    name: 'Wave',
    category: EffectCategory.DISTORTION,
    description: 'Sinusoidal wave distortion',
    isPremium: false,
    complexity: 0.3,
    parameters: [
      {
        name: 'amplitude',
        label: 'Amplitude',
        type: 'slider',
        min: 0,
        max: 100,
        default: 20,
        step: 1,
      },
      {
        name: 'frequency',
        label: 'Frequency',
        type: 'slider',
        min: 0.1,
        max: 10,
        default: 2,
        step: 0.1,
      },
      {
        name: 'phase',
        label: 'Phase',
        type: 'slider',
        min: 0,
        max: 360,
        default: 0,
        step: 1,
      },
      {
        name: 'direction',
        label: 'Direction',
        type: 'segmented',
        options: ['Horizontal', 'Vertical', 'Radial'],
        default: 'Horizontal',
      },
    ],
    shaderPath: 'distortion/wave.sksl',
  },
  {
    id: 'twirl',
    name: 'Twirl',
    category: EffectCategory.DISTORTION,
    description: 'Spiral rotation effect',
    isPremium: true,
    complexity: 0.4,
    parameters: [
      {
        name: 'angle',
        label: 'Angle',
        type: 'slider',
        min: -720,
        max: 720,
        default: 180,
        step: 10,
      },
      {
        name: 'radius',
        label: 'Radius',
        type: 'slider',
        min: 0,
        max: 1,
        default: 0.5,
        step: 0.01,
      },
    ],
    shaderPath: 'distortion/twirl.sksl',
  },
  {
    id: 'bulge',
    name: 'Bulge/Pinch',
    category: EffectCategory.DISTORTION,
    description: 'Radial scale distortion',
    isPremium: true,
    complexity: 0.3,
    parameters: [
      {
        name: 'strength',
        label: 'Strength',
        type: 'slider',
        min: -1,
        max: 1,
        default: 0.5,
        step: 0.01,
      },
      {
        name: 'radius',
        label: 'Radius',
        type: 'slider',
        min: 0,
        max: 1,
        default: 0.5,
        step: 0.01,
      },
    ],
    shaderPath: 'distortion/bulge.sksl',
  },

  // GLITCH EFFECTS
  {
    id: 'rgb-split',
    name: 'RGB Split',
    category: EffectCategory.GLITCH,
    description: 'Chromatic aberration effect',
    isPremium: false,
    complexity: 0.2,
    parameters: [
      {
        name: 'offsetX',
        label: 'Offset X',
        type: 'slider',
        min: -50,
        max: 50,
        default: 10,
        step: 1,
      },
      {
        name: 'offsetY',
        label: 'Offset Y',
        type: 'slider',
        min: -50,
        max: 50,
        default: 0,
        step: 1,
      },
    ],
    shaderPath: 'glitch/rgb-split.sksl',
  },
  {
    id: 'scanlines',
    name: 'Scanlines',
    category: EffectCategory.GLITCH,
    description: 'CRT monitor effect',
    isPremium: false,
    complexity: 0.2,
    parameters: [
      {
        name: 'lineCount',
        label: 'Line Count',
        type: 'slider',
        min: 100,
        max: 1000,
        default: 300,
        step: 10,
      },
      {
        name: 'opacity',
        label: 'Opacity',
        type: 'slider',
        min: 0,
        max: 1,
        default: 0.5,
        step: 0.01,
      },
    ],
    shaderPath: 'glitch/scanlines.sksl',
  },

  // RELIEF EFFECTS
  {
    id: 'emboss',
    name: 'Emboss',
    category: EffectCategory.RELIEF,
    description: '3D raised surface effect',
    isPremium: true,
    complexity: 0.4,
    parameters: [
      {
        name: 'angle',
        label: 'Light Angle',
        type: 'slider',
        min: 0,
        max: 360,
        default: 135,
        step: 1,
      },
      {
        name: 'height',
        label: 'Height',
        type: 'slider',
        min: 0,
        max: 10,
        default: 3,
        step: 0.1,
      },
    ],
    shaderPath: 'relief/emboss.sksl',
  },

  // STYLIZATION EFFECTS
  {
    id: 'oil-paint',
    name: 'Oil Paint',
    category: EffectCategory.STYLIZATION,
    description: 'Painted appearance',
    isPremium: true,
    complexity: 0.8,
    parameters: [
      {
        name: 'brushSize',
        label: 'Brush Size',
        type: 'slider',
        min: 1,
        max: 20,
        default: 5,
        step: 1,
      },
      {
        name: 'detail',
        label: 'Detail',
        type: 'slider',
        min: 1,
        max: 10,
        default: 5,
        step: 1,
      },
    ],
    shaderPath: 'stylization/oil-paint.sksl',
  },
];

export const getEffectById = (id: string): Effect | undefined => {
  return EFFECTS.find(effect => effect.id === id);
};

export const getEffectsByCategory = (category: EffectCategory): Effect[] => {
  return EFFECTS.filter(effect => effect.category === category);
};

export const getFreeEffects = (): Effect[] => {
  return EFFECTS.filter(effect => !effect.isPremium);
};
