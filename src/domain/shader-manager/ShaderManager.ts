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
  'glitch/scanlines.sksl': `
uniform shader image;
uniform float2 resolution;
uniform float lineCount;
uniform float opacity;

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float clampedLineCount = max(lineCount, 1.0);
  float clampedOpacity = clamp(opacity, 0.0, 1.0);

  float2 sampleCoord = clamp(coord, float2(0.0), size - float2(1.0));
  half4 color = image.eval(sampleCoord);

  float uvY = sampleCoord.y / size.y;
  float stripe = step(0.5, fract(uvY * clampedLineCount));
  float mask = mix(1.0, stripe, clampedOpacity);

  return half4(color.rgb * mask, color.a);
}`,
  'stylization/oil-paint.sksl': `
uniform shader image;
uniform float2 resolution;
uniform float brushSize;
uniform float detail;

const float3 LUMA_WEIGHTS = float3(0.299, 0.587, 0.114);
const int MAX_RADIUS = 7;
const int MAX_LEVELS = 16;

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float radius = clamp(brushSize, 1.0, float(MAX_RADIUS));
  float levelCountF = clamp(detail, 1.0, float(MAX_LEVELS));
  int levelCount = int(levelCountF);

  float bins[MAX_LEVELS];
  float3 sums[MAX_LEVELS];

  for (int i = 0; i < MAX_LEVELS; ++i) {
    bins[i] = 0.0;
    sums[i] = float3(0.0);
  }

  float2 clampedCoord = clamp(coord, float2(0.0), size - float2(1.0));

  for (int ox = -MAX_RADIUS; ox <= MAX_RADIUS; ++ox) {
    for (int oy = -MAX_RADIUS; oy <= MAX_RADIUS; ++oy) {
      float2 offset = float2(float(ox), float(oy));
      if (length(offset) > radius) {
        continue;
      }

      float2 sampleCoord = clamp(clampedCoord + offset, float2(0.0), size - float2(1.0));
      half4 sample = image.eval(sampleCoord);

      float intensity = dot(sample.rgb, LUMA_WEIGHTS);
      float scaled = clamp(intensity * levelCountF, 0.0, levelCountF - 1.0);
      int idx = int(floor(scaled + 0.5));

      bins[idx] += 1.0;
      sums[idx] += sample.rgb;
    }
  }

  float maxWeight = bins[0];
  int maxIndex = 0;
  for (int i = 1; i < MAX_LEVELS; ++i) {
    if (i < levelCount && bins[i] > maxWeight) {
      maxWeight = bins[i];
      maxIndex = i;
    }
  }

  float3 color = sums[maxIndex] / max(maxWeight, 0.001);
  color = floor(color * levelCountF + float3(0.5)) / levelCountF;
  color = clamp(color, float3(0.0), float3(1.0));

  half4 base = image.eval(clampedCoord);
  return half4(color, base.a);
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
      'glitch/scanlines.sksl',
      'stylization/oil-paint.sksl',
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
