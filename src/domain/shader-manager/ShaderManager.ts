/**
 * Shader compilation and caching system
 */

import { Skia, SkRuntimeEffect } from '@shopify/react-native-skia';
import { MMKV } from 'react-native-mmkv';

const shaderCache = new Map<string, SkRuntimeEffect>();
const storage = new MMKV({ id: 'shader-cache' });

// Shader source files mapping
const SHADER_SOURCES: Record<string, string> = {
  'cellular/pixelate.sksl': require('../../assets/shaders/cellular/pixelate.sksl'),
  'cellular/halftone.sksl': require('../../assets/shaders/cellular/halftone.sksl'),
  'tiling/kaleidoscope.sksl': require('../../assets/shaders/tiling/kaleidoscope.sksl'),
  'tiling/mirror.sksl': require('../../assets/shaders/tiling/mirror.sksl'),
  'distortion/wave.sksl': require('../../assets/shaders/distortion/wave.sksl'),
  'distortion/twirl.sksl': require('../../assets/shaders/distortion/twirl.sksl'),
  'distortion/bulge.sksl': require('../../assets/shaders/distortion/bulge.sksl'),
  'glitch/rgb-split.sksl': require('../../assets/shaders/glitch/rgb-split.sksl'),
  'glitch/scanlines.sksl': require('../../assets/shaders/glitch/scanlines.sksl'),
  'relief/emboss.sksl': require('../../assets/shaders/relief/emboss.sksl'),
};

export class ShaderManager {
  /**
   * Load and compile a shader
   */
  static loadShader(shaderPath: string): SkRuntimeEffect | null {
    // Check memory cache first
    if (shaderCache.has(shaderPath)) {
      return shaderCache.get(shaderPath)!;
    }

    try {
      const source = SHADER_SOURCES[shaderPath];
      if (!source) {
        console.warn(`Shader not found: ${shaderPath}`);
        return null;
      }

      const shader = Skia.RuntimeEffect.Make(source);
      if (!shader) {
        console.error(`Failed to compile shader: ${shaderPath}`);
        return null;
      }

      // Cache in memory
      shaderCache.set(shaderPath, shader);

      return shader;
    } catch (error) {
      console.error(`Error loading shader ${shaderPath}:`, error);
      return null;
    }
  }

  /**
   * Preload common shaders on app launch
   */
  static preloadShaders() {
    const commonShaders = [
      'cellular/pixelate.sksl',
      'tiling/kaleidoscope.sksl',
      'glitch/rgb-split.sksl',
      'distortion/wave.sksl',
    ];

    commonShaders.forEach(path => {
      this.loadShader(path);
    });
  }

  /**
   * Clear shader cache
   */
  static clearCache() {
    shaderCache.clear();
  }
}
