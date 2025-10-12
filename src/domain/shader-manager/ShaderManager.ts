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
  'distortion/shear.sksl': `
uniform shader image;
uniform float2 resolution;
uniform float angle;

const float PI = 3.14159265359;

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float2 center = size * 0.5;
  float rad = clamp(angle, -89.0, 89.0) * PI / 180.0;
  float shear = tan(rad);

  float2 pos = coord - center;
  float2 sheared = float2(pos.x + pos.y * shear, pos.y);

  float2 sampleCoord = clamp(sheared + center, float2(0.0), size - float2(1.0));
  return image.eval(sampleCoord);
}`,
  'distortion/pinch.sksl': `
uniform shader image;
uniform float2 resolution;
uniform float strength;

const float EPS = 0.0001;

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float2 center = size * 0.5;
  float radius = min(center.x, center.y);
  float2 delta = coord - center;
  float dist = length(delta) / max(radius, EPS);
  float s = clamp(strength, 0.0, 1.0);

  if (dist >= 1.0) {
    return image.eval(coord);
  }

  if (dist < EPS) {
    return image.eval(center);
  }

  float warped = pow(dist, 1.0 + s * 2.0);
  float scale = warped / dist;
  float2 sampleCoord = clamp(center + delta * scale, float2(0.0), size - float2(1.0));
  return image.eval(sampleCoord);
}`,
  'distortion/spherize.sksl': `
uniform shader image;
uniform float2 resolution;
uniform float strength;

const float PI = 3.14159265359;
const float EPS = 0.0001;

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float2 center = size * 0.5;
  float radius = min(center.x, center.y);
  float2 delta = coord - center;
  float dist = length(delta) / max(radius, EPS);
  float s = clamp(strength, 0.0, 1.0);

  if (dist >= 1.0) {
    return image.eval(coord);
  }

  if (dist < EPS) {
    return image.eval(center);
  }

  float warped = sin(dist * (PI * 0.5));
  float mixDist = mix(dist, warped, s);
  float scale = mixDist / dist;
  float2 sampleCoord = clamp(center + delta * scale, float2(0.0), size - float2(1.0));
  return image.eval(sampleCoord);
}`,
  'distortion/noise-displace.sksl': `
uniform shader image;
uniform float2 resolution;
uniform float amount;

float rand(float2 co) {
  return fract(sin(dot(co, float2(12.9898, 78.233))) * 43758.5453);
}

float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);

  float a = rand(i);
  float b = rand(i + float2(1.0, 0.0));
  float c = rand(i + float2(0.0, 1.0));
  float d = rand(i + float2(1.0, 1.0));

  float2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(float2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  float2 shift = float2(100.0);

  for (int i = 0; i < 5; ++i) {
    total += noise(p) * amplitude;
    p = p * 2.0 + shift;
    amplitude *= 0.5;
  }

  return total;
}

const float TAU = 6.28318530718;

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float2 uv = coord / size;
  float disp = max(amount, 0.0);

  float n1 = fbm(uv * 6.0);
  float n2 = fbm(uv * 9.0 + float2(3.17, 7.13));
  float angle = n1 * TAU;
  float magnitude = (n2 - 0.5) * 2.0;

  float2 offset = float2(cos(angle), sin(angle)) * magnitude * disp;
  float2 sampleCoord = clamp(coord + offset, float2(0.0), size - float2(1.0));
  return image.eval(sampleCoord);
}`,
  'blur/surface-blur.sksl': `
uniform shader image;
uniform float radius;
uniform float threshold;
uniform float2 resolution;

const int MAX_RADIUS = 6;

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float2 baseCoord = clamp(coord, float2(0.0), size - float2(1.0));
  half4 center = image.eval(baseCoord);

  int r = clamp(int(floor(radius + 0.5)), 1, MAX_RADIUS);
  float t = clamp(threshold, 0.0, 1.0);

  float3 accum = center.rgb;
  float weightSum = 1.0;

  for (int oy = -MAX_RADIUS; oy <= MAX_RADIUS; ++oy) {
    for (int ox = -MAX_RADIUS; ox <= MAX_RADIUS; ++ox) {
      if (abs(ox) > r || abs(oy) > r) {
        continue;
      }

      float2 offset = float2(float(ox), float(oy));
      float dist2 = dot(offset, offset);
      float spatial = exp(-dist2 / (float(r * r) + 0.0001));

      float2 sampleCoord = clamp(baseCoord + offset, float2(0.0), size - float2(1.0));
      half4 sample = image.eval(sampleCoord);
      float diff = length(sample.rgb - center.rgb);
      float range = exp(-max(diff - t, 0.0) * 12.0);

      float weight = spatial * range;
      accum += sample.rgb * weight;
      weightSum += weight;
    }
  }

  float3 result = accum / max(weightSum, 0.001);
  return half4(result, center.a);
}`,
  'blur/unsharp-mask.sksl': `
uniform shader image;
uniform float amount;
uniform float radius;
uniform float2 resolution;

half4 sampleSafe(float2 coord, float2 offset, float2 size) {
  float2 sampleCoord = clamp(coord + offset, float2(0.0), size - float2(1.0));
  return image.eval(sampleCoord);
}

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float2 baseCoord = clamp(coord, float2(0.0), size - float2(1.0));

  float step = max(radius, 1.0);
  float2 offset = float2(step);

  half4 c00 = sampleSafe(baseCoord, float2(-offset.x, -offset.y), size);
  half4 c01 = sampleSafe(baseCoord, float2(0.0, -offset.y), size);
  half4 c02 = sampleSafe(baseCoord, float2(offset.x, -offset.y), size);
  half4 c10 = sampleSafe(baseCoord, float2(-offset.x, 0.0), size);
  half4 c11 = sampleSafe(baseCoord, float2(0.0, 0.0), size);
  half4 c12 = sampleSafe(baseCoord, float2(offset.x, 0.0), size);
  half4 c20 = sampleSafe(baseCoord, float2(-offset.x, offset.y), size);
  half4 c21 = sampleSafe(baseCoord, float2(0.0, offset.y), size);
  half4 c22 = sampleSafe(baseCoord, float2(offset.x, offset.y), size);

  half4 blur = (c00 + c02 + c20 + c22) * 0.0625;
  blur += (c01 + c10 + c12 + c21) * 0.125;
  blur += c11 * 0.25;

  half4 detail = c11 - blur;
  float amt = clamp(amount, 0.0, 2.5);
  float3 sharpened = clamp(c11.rgb + detail.rgb * amt, 0.0, 1.0);

  return half4(sharpened, c11.a);
}`,
  'noise/reduce-noise.sksl': `
uniform shader image;
uniform float strength;
uniform float threshold;
uniform float2 resolution;

const int MAX_RADIUS = 3;

half4 main(float2 coord) {
  float2 size = max(resolution, float2(1.0));
  float2 baseCoord = clamp(coord, float2(0.0), size - float2(1.0));
  half4 center = image.eval(baseCoord);

  float s = clamp(strength, 0.0, 1.0);
  float t = clamp(threshold, 0.0, 1.0);

  float3 accum = center.rgb;
  float weightSum = 1.0;

  for (int oy = -MAX_RADIUS; oy <= MAX_RADIUS; ++oy) {
    for (int ox = -MAX_RADIUS; ox <= MAX_RADIUS; ++ox) {
      if (ox == 0 && oy == 0) {
        continue;
      }

      float2 offset = float2(float(ox), float(oy));
      float2 sampleCoord = clamp(baseCoord + offset, float2(0.0), size - float2(1.0));
      half4 sample = image.eval(sampleCoord);

      float diff = length(sample.rgb - center.rgb);
      if (diff > t) {
        continue;
      }

      float dist = length(offset);
      float spatial = exp(-dist * 0.75);
      float range = exp(-diff * 12.0);
      float weight = spatial * range;

      accum += sample.rgb * weight;
      weightSum += weight;
    }
  }

  float3 smooth = accum / max(weightSum, 0.001);
  float3 result = mix(center.rgb, smooth, s);
  return half4(result, center.a);
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
