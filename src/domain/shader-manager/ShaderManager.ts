/**
 * Shader compilation and caching system
 */

import { Skia, SkRuntimeEffect } from '@shopify/react-native-skia';
import { MMKV } from 'react-native-mmkv';

const shaderCache = new Map<string, SkRuntimeEffect>();

// Safe MMKV initialization
let storage: MMKV | null = null;
try {
  storage = new MMKV({ id: 'shader-cache' });
} catch (error) {
  console.warn('MMKV initialization failed for shader cache:', error);
}

// Shader source files - inline for now (will be loaded from files in production)
const SHADER_SOURCES: Record<string, string> = {
  'cellular/pixelate.sksl': `
uniform shader image;
uniform float2 resolution;
uniform float cellSize;

half4 main(float2 coord) {
  float2 cellCoord = floor(coord / cellSize) * cellSize;
  float2 cellCenter = cellCoord + cellSize * 0.5;
  half4 color = image.eval(cellCenter);
  return color;
}`,
  'tiling/kaleidoscope.sksl': `
uniform shader image;
uniform float2 resolution;
uniform float2 center;
uniform int segments;
uniform float angle;

const float PI = 3.14159265359;

half4 main(float2 coord) {
  float2 pos = coord - center * resolution;
  float r = length(pos);
  float theta = atan(pos.y, pos.x) + angle * PI / 180.0;
  float segmentAngle = 2.0 * PI / float(segments);
  theta = mod(theta, segmentAngle);
  if (mod(floor(theta / segmentAngle), 2.0) == 1.0) {
    theta = segmentAngle - theta;
  }
  float2 newPos = float2(cos(theta), sin(theta)) * r;
  float2 sampleCoord = newPos + center * resolution;
  return image.eval(sampleCoord);
}`,
  'glitch/rgb-split.sksl': `
uniform shader image;
uniform float2 offset;

half4 main(float2 coord) {
  float r = image.eval(coord - offset).r;
  float g = image.eval(coord).g;
  float b = image.eval(coord + offset).b;
  return half4(r, g, b, 1.0);
}`,
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
