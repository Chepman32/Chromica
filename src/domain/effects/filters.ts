/**
 * Color filter implementations using ColorMatrix
 * Based on the SDD requirements for filter effects
 */

import { Skia } from '@shopify/react-native-skia';

export interface ColorFilter {
  id: string;
  name: string;
  isPro: boolean;
  getColorMatrix: (intensity: number) => number[];
}

/**
 * Color matrix helper functions
 */
const identity = (): number[] => [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const lerpMatrix = (m1: number[], m2: number[], t: number): number[] => {
  return m1.map((v, i) => lerp(v, m2[i], t));
};

/**
 * Available color filters
 */
export const COLOR_FILTERS: ColorFilter[] = [
  {
    id: 'none',
    name: 'Original',
    isPro: false,
    getColorMatrix: () => identity(),
  },
  {
    id: 'bw',
    name: 'Black & White',
    isPro: false,
    getColorMatrix: (intensity: number) => {
      const grayscale = [
        0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587,
        0.114, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), grayscale, intensity);
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    isPro: false,
    getColorMatrix: (intensity: number) => {
      const sepia = [
        0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534,
        0.131, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), sepia, intensity);
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    isPro: false,
    getColorMatrix: (intensity: number) => {
      // Vintage: Sepia + reduced contrast + slight vignette effect
      const vintage = [
        0.6,
        0.5,
        0.4,
        0,
        0.1 * intensity,
        0.3,
        0.6,
        0.3,
        0,
        0.05 * intensity,
        0.2,
        0.3,
        0.5,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
      ];
      return lerpMatrix(identity(), vintage, intensity);
    },
  },
  {
    id: 'cool',
    name: 'Cool',
    isPro: false,
    getColorMatrix: (intensity: number) => {
      // Cool: Boost blues, reduce reds
      const cool = [
        0.8, 0, 0, 0, 0, 0, 0.9, 0.1, 0, 0, 0, 0.1, 1.2, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), cool, intensity);
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    isPro: false,
    getColorMatrix: (intensity: number) => {
      // Warm: Boost reds/yellows, reduce blues
      const warm = [
        1.2, 0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), warm, intensity);
    },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    isPro: true,
    getColorMatrix: (intensity: number) => {
      // Cinematic: Teal shadows, orange highlights
      const cinematic = [
        1.1, 0, 0, 0, 0, 0, 1.0, 0, 0, 0, 0.1, 0.1, 0.9, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), cinematic, intensity);
    },
  },
  {
    id: 'film',
    name: 'Film Grain',
    isPro: true,
    getColorMatrix: (intensity: number) => {
      // Film: Slightly desaturated with lifted blacks
      const film = [
        0.9,
        0.05,
        0.05,
        0,
        0.05 * intensity,
        0.05,
        0.9,
        0.05,
        0,
        0.05 * intensity,
        0.05,
        0.05,
        0.9,
        0,
        0.05 * intensity,
        0,
        0,
        0,
        1,
        0,
      ];
      return lerpMatrix(identity(), film, intensity);
    },
  },
  {
    id: 'hdr',
    name: 'HDR',
    isPro: true,
    getColorMatrix: (intensity: number) => {
      // HDR: Enhanced contrast and saturation
      const hdr = [
        1.3,
        0,
        0,
        0,
        -0.15 * intensity,
        0,
        1.3,
        0,
        0,
        -0.15 * intensity,
        0,
        0,
        1.3,
        0,
        -0.15 * intensity,
        0,
        0,
        0,
        1,
        0,
      ];
      return lerpMatrix(identity(), hdr, intensity);
    },
  },
  {
    id: 'portrait',
    name: 'Portrait',
    isPro: true,
    getColorMatrix: (intensity: number) => {
      // Portrait: Warm skin tones, soft contrast
      const portrait = [
        1.1,
        0,
        0,
        0,
        0.05 * intensity,
        0,
        1.0,
        0,
        0,
        0.03 * intensity,
        0,
        0,
        0.9,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
      ];
      return lerpMatrix(identity(), portrait, intensity);
    },
  },
  {
    id: 'landscape',
    name: 'Landscape',
    isPro: true,
    getColorMatrix: (intensity: number) => {
      // Landscape: Vibrant greens and blues
      const landscape = [
        1.0, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0, 1.2, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), landscape, intensity);
    },
  },
  {
    id: 'neon',
    name: 'Neon',
    isPro: true,
    getColorMatrix: (intensity: number) => {
      // Neon: High saturation, vibrant colors
      const neon = [
        1.5, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), neon, intensity);
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    isPro: true,
    getColorMatrix: (intensity: number) => {
      // Cyberpunk: Cyan and magenta tones
      const cyberpunk = [
        1.0, 0, 0.2, 0, 0, 0, 1.0, 0.2, 0, 0, 0.2, 0, 1.2, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), cyberpunk, intensity);
    },
  },
  {
    id: 'retro',
    name: 'Retro Wave',
    isPro: true,
    getColorMatrix: (intensity: number) => {
      // Retro: Pink and purple tones
      const retro = [
        1.2, 0, 0.1, 0, 0, 0, 0.9, 0.1, 0, 0, 0.1, 0, 1.1, 0, 0, 0, 0, 0, 1, 0,
      ];
      return lerpMatrix(identity(), retro, intensity);
    },
  },
];

export const getFilterById = (id: string): ColorFilter | undefined => {
  return COLOR_FILTERS.find(filter => filter.id === id);
};

export const getFreeFilters = (): ColorFilter[] => {
  return COLOR_FILTERS.filter(filter => !filter.isPro);
};

export const getPremiumFilters = (): ColorFilter[] => {
  return COLOR_FILTERS.filter(filter => filter.isPro);
};
