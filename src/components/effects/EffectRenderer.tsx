/**
 * Effect Renderer Component
 * Handles rendering images with shader effects
 */

import React, { useMemo } from 'react';
import {
  Image as SkiaImage,
  Skia,
  Shader,
  ImageShader,
  Fill,
} from '@shopify/react-native-skia';
import type { SkRuntimeEffect } from '@shopify/react-native-skia';
import { Effect } from '../../domain/effects/types';
import { ShaderManager } from '../../domain/shader-manager/ShaderManager';

const COMMON_NOISE_SNIPPET = `
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
`;
interface EffectRendererProps {
  image: any;
  effect: Effect | null;
  params: Record<string, any> | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const EffectRenderer: React.FC<EffectRendererProps> = ({
  image,
  effect,
  params,
  x,
  y,
  width,
  height,
}) => {
  type ShaderData = {
    source: SkRuntimeEffect;
    uniforms: Record<string, number | number[]>;
  };

  // Create shader source and uniforms for the effect
  const effectData = useMemo<ShaderData | null>(() => {
    if (!effect || !params) return null;

    try {
      const compile = (
        source: string,
        uniforms: Record<string, number | number[]>,
      ): ShaderData | null => {
        const runtimeEffect = Skia.RuntimeEffect.Make(source);
        if (!runtimeEffect) {
          console.error(`Failed to compile shader for effect ${effect.id}`);
          return null;
        }
        return {
          source: runtimeEffect,
          uniforms,
        };
      };

      const buildUniformsFromParams = (): Record<string, number | number[]> => {
        const uniforms: Record<string, number | number[]> = {
          resolution: [width, height],
        };

        effect.parameters.forEach(param => {
          const value = params[param.name] ?? param.default;

          if (typeof value === 'number') {
            uniforms[param.name] = value;
          } else if (typeof value === 'boolean') {
            uniforms[param.name] = value ? 1 : 0;
          } else if (typeof value === 'string' && param.options) {
            const index = param.options.indexOf(value);
            uniforms[param.name] = index >= 0 ? index : 0;
          }
        });

        return uniforms;
      };

      const compileFromShaderPath = (path: string): ShaderData | null => {
        const runtimeEffect = ShaderManager.loadShader(path);
        if (!runtimeEffect) {
          console.error(
            `Failed to load shader for effect ${effect.id} using path ${path}`,
          );
          return null;
        }

        return {
          source: runtimeEffect,
          uniforms: buildUniformsFromParams(),
        };
      };

      // Map effects to implementations
      switch (effect.id) {
        case 'pixelate': {
          const cellSize = params.cellSize || 10;
          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float cellSize;

            half4 main(float2 coord) {
              float2 cellCoord = floor(coord / cellSize) * cellSize;
              float2 cellCenter = cellCoord + cellSize * 0.5;
              return image.eval(cellCenter);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            cellSize,
          });
        }

        case 'crystallize': {
          const cellCount = Math.max(params.cellCount ?? 100, 1);
          const randomSeed = params.randomSeed ?? 42;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float cellCount;
            uniform float randomSeed;

            float hash(float2 p) {
              return fract(sin(dot(p + randomSeed, float2(127.1, 311.7))) * 43758.5453);
            }

            float2 randomPoint(float2 cell) {
              return float2(hash(cell), hash(cell + 17.17));
            }

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float grid = max(sqrt(cellCount), 1.0);
              float2 uv = coord / size;
              float2 cell = floor(uv * grid);

              float minDist = 1e9;
              float2 bestCoord = coord;

              for (int j = -1; j <= 1; ++j) {
                for (int i = -1; i <= 1; ++i) {
                  float2 neighbor = cell + float2(float(i), float(j));
                  float2 randPoint = randomPoint(neighbor);
                  float2 candidateUV = (neighbor + randPoint) / grid;
                  float2 candidateCoord = candidateUV * size;
                  float dist = distance(candidateCoord, coord);
                  if (dist < minDist) {
                    minDist = dist;
                    bestCoord = candidateCoord;
                  }
                }
              }

              bestCoord = clamp(bestCoord, float2(0.0), size - float2(1.0));
              return image.eval(bestCoord);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            cellCount,
            randomSeed,
          });
        }

        case 'pointillize': {
          const dotSize = Math.max(params.dotSize ?? 8, 1);

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float dotSize;

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float sizePx = max(dotSize, 1.0);
              float2 cell = floor(coord / sizePx) * sizePx;
              float2 center = cell + sizePx * 0.5;
              center = clamp(center, float2(0.0), size - float2(1.0));

              half4 base = image.eval(coord);
              half4 sample = image.eval(center);

              float dist = length(coord - center);
              float radius = sizePx * 0.5;
              float falloff = smoothstep(radius * 0.4, radius, dist);
              float mask = 1.0 - falloff;

              float3 result = mix(sample.rgb, base.rgb, mask);
              return half4(result, base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            dotSize,
          });
        }

        case 'kaleidoscope': {
          const segments = params.segments || 6;
          const angle = params.angle || 0;
          const zoom = params.zoom || 1;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float segments;
            uniform float angle;
            uniform float zoom;

            const float PI = 3.14159265359;

            half4 main(float2 coord) {
              float2 center = resolution * 0.5;
              float2 pos = (coord - center) / zoom;

              float r = length(pos);
              float theta = atan(pos.y, pos.x) + angle * PI / 180.0;

              float segmentAngle = 2.0 * PI / segments;
              theta = mod(theta, segmentAngle);

              if (mod(floor(theta / segmentAngle), 2.0) == 1.0) {
                theta = segmentAngle - theta;
              }

              float2 newPos = float2(cos(theta), sin(theta)) * r;
              float2 sampleCoord = newPos + center;

              return image.eval(sampleCoord);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            segments,
            angle,
            zoom,
          });
        }

        case 'rgb-split': {
          const offsetX = params.offsetX || 10;
          const offsetY = params.offsetY || 0;

          const source = `
            uniform shader image;
            uniform float2 offset;

            half4 main(float2 coord) {
              float r = image.eval(coord - offset).r;
              float g = image.eval(coord).g;
              float b = image.eval(coord + offset).b;
              return half4(r, g, b, 1.0);
            }
          `;

          return compile(source, {
            offset: [offsetX, offsetY],
          });
        }

        case 'mirror': {
          const axis = params.axis || 'Horizontal';
          const offset = params.offset || 0;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform int axis; // 0=Horizontal, 1=Vertical, 2=Both, 3=Diagonal
            uniform float offset;

            half4 main(float2 coord) {
              float2 uv = coord / resolution;
              float2 newUv = uv;

              if (axis == 0) { // Horizontal
                newUv.x = uv.x < 0.5 + offset ? uv.x : 1.0 - uv.x;
              } else if (axis == 1) { // Vertical
                newUv.y = uv.y < 0.5 + offset ? uv.y : 1.0 - uv.y;
              } else if (axis == 2) { // Both
                newUv.x = uv.x < 0.5 ? uv.x : 1.0 - uv.x;
                newUv.y = uv.y < 0.5 ? uv.y : 1.0 - uv.y;
              } else { // Diagonal
                if (uv.x + uv.y > 1.0) {
                  newUv = 1.0 - uv;
                }
              }

              return image.eval(newUv * resolution);
            }
          `;

          const axisMap: Record<string, number> = {
            Horizontal: 0,
            Vertical: 1,
            Both: 2,
            Diagonal: 3,
          };

          return compile(source, {
            resolution: [width, height],
            axis: axisMap[axis] || 0,
            offset,
          });
        }

        case 'tile': {
          const tileCount = Math.floor(params.tileCount ?? 2);
          const gap = params.gap ?? 4;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float tileCount;
            uniform float gap;

            half4 main(float2 coord) {
              float2 size = resolution;
              float n = max(tileCount, 1.0);
              float g = gap;
              
              // Total gap space and tile size
              float totalGap = g * (n - 1.0);
              float2 tileSize = (size - float2(totalGap)) / n;
              
              // Find which tile we're in
              float cellWidth = tileSize.x + g;
              float cellHeight = tileSize.y + g;
              
              float col = floor(coord.x / cellWidth);
              float row = floor(coord.y / cellHeight);
              
              // Position within the cell
              float localX = coord.x - col * cellWidth;
              float localY = coord.y - row * cellHeight;
              
              // Check if we're in the gap
              if (localX > tileSize.x || localY > tileSize.y) {
                return half4(0.0, 0.0, 0.0, 1.0);
              }
              
              // Handle edge case for last column/row (no gap after)
              if (col >= n || row >= n) {
                return half4(0.0, 0.0, 0.0, 1.0);
              }
              
              // Map local position to full image UV
              float2 uv = float2(localX / tileSize.x, localY / tileSize.y);
              
              return image.eval(uv * size);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            tileCount: tileCount,
            gap: gap,
          });
        }

        case 'wave': {
          const amplitude = params.amplitude || 20;
          const frequency = params.frequency || 2;
          const phase = params.phase || 0;
          const direction = params.direction || 'Horizontal';

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float amplitude;
            uniform float frequency;
            uniform float phase;
            uniform int direction; // 0=Horizontal, 1=Vertical, 2=Radial

            const float PI = 3.14159265359;

            half4 main(float2 coord) {
              float2 displaced = coord;

              if (direction == 0) { // Horizontal wave
                displaced.x += sin(coord.y / resolution.y * frequency * 2.0 * PI + phase * PI / 180.0) * amplitude;
              } else if (direction == 1) { // Vertical wave
                displaced.y += sin(coord.x / resolution.x * frequency * 2.0 * PI + phase * PI / 180.0) * amplitude;
              } else { // Radial wave
                float2 center = resolution * 0.5;
                float dist = length(coord - center);
                float angle = atan(coord.y - center.y, coord.x - center.x);
                float wave = sin(dist / max(resolution.x, resolution.y) * frequency * 2.0 * PI + phase * PI / 180.0) * amplitude;
                displaced = coord + float2(cos(angle), sin(angle)) * wave;
              }

              return image.eval(displaced);
            }
          `;

          const directionMap: Record<string, number> = {
            Horizontal: 0,
            Vertical: 1,
            Radial: 2,
          };

          return compile(source, {
            resolution: [width, height],
            amplitude,
            frequency,
            phase,
            direction: directionMap[direction] || 0,
          });
        }

        case 'twirl': {
          const angle = params.angle || 180;
          const radius = params.radius || 0.5;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float angle;
            uniform float radius;

            const float PI = 3.14159265359;

            half4 main(float2 coord) {
              float2 center = resolution * 0.5;
              float2 pos = coord - center;
              float dist = length(pos) / (radius * max(resolution.x, resolution.y));

              float rotAmount = angle * PI / 180.0 * (1.0 - smoothstep(0.0, 1.0, dist));

              float cosA = cos(rotAmount);
              float sinA = sin(rotAmount);
              float2 rotated = float2(
                pos.x * cosA - pos.y * sinA,
                pos.x * sinA + pos.y * cosA
              );

              float2 newCoord = rotated + center;
              return image.eval(newCoord);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            angle,
            radius,
          });
        }

        case 'bulge': {
          const strength = params.strength || 0.5;
          const radius = params.radius || 0.5;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float strength;
            uniform float radius;

            half4 main(float2 coord) {
              float2 center = resolution * 0.5;
              float2 pos = coord - center;
              float dist = length(pos) / (radius * max(resolution.x, resolution.y));

              float scale = 1.0;
              if (dist < 1.0) {
                scale = 1.0 + strength * (1.0 - dist);
              }

              float2 displaced = pos / scale + center;
              return image.eval(displaced);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            strength,
            radius,
          });
        }

        case 'pinch':
        case 'spherize':
        case 'shear':
        case 'noise-displace': {
          if (!effect.shaderPath) {
            return null;
          }
          return compileFromShaderPath(effect.shaderPath);
        }

        case 'scanlines': {
          const lineCount = Math.max(params.lineCount ?? 300, 1);
          const opacity = Math.min(Math.max(params.opacity ?? 0.5, 0), 1);

          const source = `
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
            }
          `;

          return compile(source, {
            resolution: [width, height],
            lineCount,
            opacity,
          });
        }

        case 'glitch-rows': {
          const amount = params.amount ?? 0.5;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float amount;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float row = floor(coord.y);

              float noiseVal = fbm(float2(row * 0.013, 0.0));
              float mask = step(0.65, fract(noiseVal * 7.0));
              float shift = (noiseVal - 0.5) * amount * 120.0 * mask;

              float2 sampleCoord = clamp(coord + float2(shift, 0.0), float2(0.0), size - float2(1.0));
              half4 color = image.eval(sampleCoord);

              float band = step(0.75, fract(coord.y * 0.2));
              color.rgb *= mix(1.0, 0.7, band * amount * 0.5);

              return color;
            }
          `;

          return compile(source, {
            resolution: [width, height],
            amount,
          });
        }

        case 'halftone': {
          const dotSize = params.dotSize || 8;
          const angle = params.angle || 45;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float dotSize;
            uniform float angle;

            const float PI = 3.14159265359;

            half4 main(float2 coord) {
              float angleRad = angle * PI / 180.0;
              float cosA = cos(angleRad);
              float sinA = sin(angleRad);

              float2 rotated = float2(
                coord.x * cosA - coord.y * sinA,
                coord.x * sinA + coord.y * cosA
              );

              float2 cellCoord = mod(rotated, dotSize);
              float2 cellCenter = float2(dotSize * 0.5);

              half4 color = image.eval(coord);
              float lum = dot(color.rgb, float3(0.299, 0.587, 0.114));

              float radius = lum * dotSize * 0.5;
              float dist = length(cellCoord - cellCenter);

              float intensity = dist < radius ? 1.0 : 0.0;
              return half4(float3(intensity), 1.0);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            dotSize,
            angle,
          });
        }

        case 'emboss': {
          const angle = params.angle || 135;
          const height = params.height || 3;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float angle;
            uniform float height;

            const float PI = 3.14159265359;

            half4 main(float2 coord) {
              float angleRad = angle * PI / 180.0;
              float2 offset = float2(cos(angleRad), sin(angleRad)) * height;

              half4 c1 = image.eval(coord - offset);
              half4 c2 = image.eval(coord + offset);

              float lum1 = dot(c1.rgb, float3(0.299, 0.587, 0.114));
              float lum2 = dot(c2.rgb, float3(0.299, 0.587, 0.114));
              float diff = lum1 - lum2;

              float embossed = 0.5 + diff;
              return half4(float3(embossed), 1.0);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            angle,
            height,
          });
        }

        case 'oil-paint': {
          const brushSize = params.brushSize || 5;
          const detail = params.detail || 5;

          const source = `
            uniform shader image;
            uniform float brushSize;
            uniform float detail;

            half4 main(float2 coord) {
              half4 sum = half4(0.0);
              float totalWeight = 0.0;
              int samples = int(clamp(detail, 1.0, 5.0));

              // Use nested loops with constant bounds
              for (int i = -5; i <= 5; i++) {
                for (int j = -5; j <= 5; j++) {
                  // Skip if outside detail range
                  if (i > samples || i < -samples || j > samples || j < -samples) {
                    continue;
                  }

                  float2 offset = float2(float(i), float(j)) * brushSize * 0.3;
                  float dist = length(offset);

                  if (dist <= brushSize) {
                    half4 sample = image.eval(coord + offset);
                    float weight = 1.0 / (1.0 + dist * 0.1);
                    sum += sample * weight;
                    totalWeight += weight;
                  }
                }
              }

              if (totalWeight > 0.0) {
                half4 result = sum / totalWeight;
                // Posterize slightly for oil paint effect
                result.rgb = floor(result.rgb * detail + 0.5) / detail;
                return result;
              }

              return image.eval(coord);
            }
          `;

          return compile(source, {
            brushSize,
            detail,
          });
        }

        case 'posterize': {
          const levels = Math.max(params.levels ?? 4, 2);

          const source = `
            uniform shader image;
            uniform float levels;

            half4 main(float2 coord) {
              half4 color = image.eval(coord);
              float lvl = max(levels, 2.0);
              float3 quantized = floor(color.rgb * (lvl - 1.0) + 0.5) / (lvl - 1.0);
              return half4(quantized, color.a);
            }
          `;

          return compile(source, {
            levels,
          });
        }

        case 'poster-edges': {
          const edge = params.edge ?? 0.5;

          const source = `
            uniform shader image;
            uniform float edge;

            half4 main(float2 coord) {
              half4 c00 = image.eval(coord + float2(-1.0, -1.0));
              half4 c01 = image.eval(coord + float2(0.0, -1.0));
              half4 c02 = image.eval(coord + float2(1.0, -1.0));
              half4 c10 = image.eval(coord + float2(-1.0, 0.0));
              half4 c11 = image.eval(coord);
              half4 c12 = image.eval(coord + float2(1.0, 0.0));
              half4 c20 = image.eval(coord + float2(-1.0, 1.0));
              half4 c21 = image.eval(coord + float2(0.0, 1.0));
              half4 c22 = image.eval(coord + float2(1.0, 1.0));

              float3 w = float3(0.299, 0.587, 0.114);
              float baseEdge = length(float2(
                dot(c02.rgb, w) + 2.0 * dot(c12.rgb, w) + dot(c22.rgb, w) -
                dot(c00.rgb, w) - 2.0 * dot(c10.rgb, w) - dot(c20.rgb, w),
                dot(c00.rgb, w) + 2.0 * dot(c01.rgb, w) + dot(c02.rgb, w) -
                dot(c20.rgb, w) - 2.0 * dot(c21.rgb, w) - dot(c22.rgb, w)
              ));

              float lvl = 6.0;
              float3 poster = floor(c11.rgb * (lvl - 1.0) + 0.5) / (lvl - 1.0);

              float e = clamp(edge, 0.0, 1.0);
              float edgeMask = smoothstep(0.1, 0.4, baseEdge) * e;
              float3 darkened = max(poster - edgeMask * 0.6, 0.0);

              return half4(darkened, c11.a);
            }
          `;

          return compile(source, {
            edge,
          });
        }

        case 'watercolor': {
          const intensity = params.intensity ?? 0.5;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float intensity;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              half4 base = image.eval(coord);

              float3 blurAccum = float3(0.0);
              float blurWeight = 0.0;
              for (int y = -3; y <= 3; ++y) {
                for (int x = -3; x <= 3; ++x) {
                  float2 offset = float2(float(x), float(y));
                  float weight = exp(-dot(offset, offset) * 0.18);
                  float2 sampleCoord = clamp(coord + offset, float2(0.0), size - float2(1.0));
                  half4 sample = image.eval(sampleCoord);
                  blurAccum += sample.rgb * weight;
                  blurWeight += weight;
                }
              }

              float3 smooth = blurAccum / max(blurWeight, 0.001);

              float3 localAccum = float3(0.0);
              float localWeight = 0.0;
              for (int y = -1; y <= 1; ++y) {
                for (int x = -1; x <= 1; ++x) {
                  float2 offset = float2(float(x), float(y));
                  float weight = exp(-dot(offset, offset) * 0.7);
                  float2 sampleCoord = clamp(coord + offset, float2(0.0), size - float2(1.0));
                  half4 sample = image.eval(sampleCoord);
                  localAccum += sample.rgb * weight;
                  localWeight += weight;
                }
              }

              float3 localAverage = localAccum / max(localWeight, 0.001);
              float3 wash = mix(base.rgb, smooth, 0.7);
              float3 poster = floor(wash * 5.0 + 0.5) / 5.0;

              half4 c10 = image.eval(coord + float2(-1.0, 0.0));
              half4 c12 = image.eval(coord + float2(1.0, 0.0));
              half4 c01 = image.eval(coord + float2(0.0, -1.0));
              half4 c21 = image.eval(coord + float2(0.0, 1.0));

              float3 w = float3(0.299, 0.587, 0.114);
              float edge = abs(dot(c10.rgb - c12.rgb, w)) + abs(dot(c01.rgb - c21.rgb, w));
              float edgeMask = smoothstep(0.08, 0.25, edge);

              float textureA = fbm(coord / (size * 0.6));
              float textureB = fbm((coord + float2(37.1, 91.7)) / (size * 0.35));
              float texture = clamp(textureA * 0.7 + textureB * 0.3, 0.0, 1.0);

              float t = clamp(intensity, 0.0, 1.0);
              float3 bleeds = mix(poster, localAverage, 0.35);
              float3 textured = bleeds * (0.65 + texture * 0.7 * t);
              float3 outlined = textured - edgeMask * 0.28 * t;
              float3 result = clamp(outlined, 0.0, 1.0);

              return half4(result, base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            intensity,
          });
        }

        case 'gaussian-blur': {
          const radius = Math.max(params.radius ?? 0, 0);
          const quality = Math.max(params.quality ?? 2, 1);

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float radius;
            uniform float quality;

            half4 main(float2 coord) {
              float r = max(radius, 0.0);
              if (r < 0.001) {
                return image.eval(coord);
              }

              float q = max(quality, 1.0);
              float stepSize = max(r / q, 0.5);
              float2 step = float2(stepSize, stepSize);

              half4 c00 = image.eval(coord + float2(-step.x, -step.y));
              half4 c01 = image.eval(coord + float2(0.0, -step.y));
              half4 c02 = image.eval(coord + float2(step.x, -step.y));
              half4 c10 = image.eval(coord + float2(-step.x, 0.0));
              half4 c11 = image.eval(coord);
              half4 c12 = image.eval(coord + float2(step.x, 0.0));
              half4 c20 = image.eval(coord + float2(-step.x, step.y));
              half4 c21 = image.eval(coord + float2(0.0, step.y));
              half4 c22 = image.eval(coord + float2(step.x, step.y));

              half4 blur = (c00 + c02 + c20 + c22) * 0.0625;
              blur += (c01 + c10 + c12 + c21) * 0.125;
              blur += c11 * 0.25;

              if (q > 1.5) {
                float factor = clamp((q - 1.0) / 2.0, 0.0, 1.0);
                float2 step2 = step * 1.6;
                half4 d00 = image.eval(coord + float2(-step2.x, -step2.y));
                half4 d01 = image.eval(coord + float2(0.0, -step2.y));
                half4 d02 = image.eval(coord + float2(step2.x, -step2.y));
                half4 d10 = image.eval(coord + float2(-step2.x, 0.0));
                half4 d12 = image.eval(coord + float2(step2.x, 0.0));
                half4 d20 = image.eval(coord + float2(-step2.x, step2.y));
                half4 d21 = image.eval(coord + float2(0.0, step2.y));
                half4 d22 = image.eval(coord + float2(step2.x, step2.y));
                half4 blur2 = (d00 + d02 + d20 + d22) * 0.0625;
                blur2 += (d01 + d10 + d12 + d21) * 0.125;
                blur2 += c11 * 0.25;
                blur = mix(blur, blur2, factor);
              }

              return blur;
            }
          `;

          return compile(source, {
            resolution: [width, height],
            radius,
            quality,
          });
        }

        case 'motion-blur': {
          const blurDistance = params.distance ?? 25;
          const angle = params.angle ?? 0;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float blurDistance;
            uniform float angle;

            const float PI = 3.14159265359;
            const int STEPS = 32;

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float dist = max(blurDistance, 0.0);
              if (dist < 0.001) {
                float2 clamped = clamp(coord, float2(0.0), size - float2(1.0));
                return image.eval(clamped);
              }

              float rad = angle * PI / 180.0;
              float2 dir = float2(cos(rad), sin(rad));
              float stepSize = dist / float(STEPS - 1);

              half4 sum = half4(0.0);
              float total = 0.0;

              for (int i = 0; i < STEPS; ++i) {
                float idx = float(i);
                float offset = (idx - float(STEPS - 1) * 0.5) * stepSize;
                float2 sampleCoord = clamp(coord + dir * offset, float2(0.0), size - float2(1.0));
                half4 sample = image.eval(sampleCoord);
                float weight = 1.0 - abs(idx - float(STEPS - 1) * 0.5) / (float(STEPS) * 0.5);
                weight = clamp(weight, 0.0, 1.0);
                sum += sample * weight;
                total += weight;
              }

              return sum / max(total, 0.001);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            blurDistance,
            angle,
          });
        }

        case 'surface-blur':
        case 'unsharp-mask':
        case 'reduce-noise': {
          if (!effect.shaderPath) {
            return null;
          }
          return compileFromShaderPath(effect.shaderPath);
        }

        case 'accented-edges': {
          const strength = params.strength ?? 0.5;
          const threshold = params.threshold ?? 0.3;

          const source = `
            uniform shader image;
            uniform float strength;
            uniform float threshold;
            uniform float2 resolution;

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float2 centerCoord = clamp(coord, float2(0.0), size - float2(1.0));
              half4 c00 = image.eval(clamp(centerCoord + float2(-1.0, -1.0), float2(0.0), size - float2(1.0)));
              half4 c01 = image.eval(clamp(centerCoord + float2(0.0, -1.0), float2(0.0), size - float2(1.0)));
              half4 c02 = image.eval(clamp(centerCoord + float2(1.0, -1.0), float2(0.0), size - float2(1.0)));
              half4 c10 = image.eval(clamp(centerCoord + float2(-1.0, 0.0), float2(0.0), size - float2(1.0)));
              half4 c11 = image.eval(centerCoord);
              half4 c12 = image.eval(clamp(centerCoord + float2(1.0, 0.0), float2(0.0), size - float2(1.0)));
              half4 c20 = image.eval(clamp(centerCoord + float2(-1.0, 1.0), float2(0.0), size - float2(1.0)));
              half4 c21 = image.eval(clamp(centerCoord + float2(0.0, 1.0), float2(0.0), size - float2(1.0)));
              half4 c22 = image.eval(clamp(centerCoord + float2(1.0, 1.0), float2(0.0), size - float2(1.0)));

              float3 w = float3(0.299, 0.587, 0.114);

              float gx = dot(c02.rgb, w) + 2.0 * dot(c12.rgb, w) + dot(c22.rgb, w)
                       - dot(c00.rgb, w) - 2.0 * dot(c10.rgb, w) - dot(c20.rgb, w);

              float gy = dot(c00.rgb, w) + 2.0 * dot(c01.rgb, w) + dot(c02.rgb, w)
                       - dot(c20.rgb, w) - 2.0 * dot(c21.rgb, w) - dot(c22.rgb, w);

              float edge = sqrt(gx * gx + gy * gy);
              float t = clamp(threshold, 0.0, 1.0);
              float s = clamp(strength, 0.0, 1.0);

              float mask = smoothstep(t * 0.4, t, edge);
              float3 enhanced = clamp(c11.rgb + edge * s, 0.0, 1.0);
              float3 result = mix(c11.rgb, enhanced, mask);

              return half4(result, c11.a);
            }
          `;

          return compile(source, {
            strength,
            threshold,
            resolution: [width, height],
          });
        }

        case 'cross-hatch': {
          const density = params.density ?? 1;
          const rotation = params.rotation ?? 45;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float density;
            uniform float rotation;

            const float PI = 3.14159265359;

            float pattern(float2 uv, float angle, float freq) {
              float rad = angle * PI / 180.0;
              float2 dir = float2(cos(rad), sin(rad));
              float v = dot(uv, dir) * freq;
              return smoothstep(0.35, 0.5, abs(fract(v) - 0.5));
            }

            half4 main(float2 coord) {
              float2 uv = coord / resolution;
              half4 base = image.eval(coord);
              float lum = dot(base.rgb, float3(0.299, 0.587, 0.114));

              float freq = max(density * 15.0, 0.1);

              float p1 = pattern(uv, rotation, freq);
              float p2 = pattern(uv, rotation + 90.0, freq * 0.9);
              float p3 = pattern(uv, rotation + 45.0, freq * 0.7);
              float p4 = pattern(uv, rotation - 45.0, freq * 0.7);

              float dark = clamp(1.0 - lum * 1.5, 0.0, 1.0);
              float ink = (p1 + p2) * dark;
              float shading = (p3 + p4) * clamp(dark * 0.6, 0.0, 1.0);

              float stroke = clamp(ink + shading, 0.0, 1.0);
              float3 result = mix(base.rgb, float3(1.0 - stroke), 0.7);

              return half4(result, base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            density,
            rotation,
          });
        }

        case 'ink-outlines': {
          const threshold = params.threshold ?? 0.4;
          const smoothness = params.smoothness ?? 0.3;

          const source = `
            uniform shader image;
            uniform float threshold;
            uniform float smoothness;

            half4 main(float2 coord) {
              half4 c00 = image.eval(coord + float2(-1.0, -1.0));
              half4 c01 = image.eval(coord + float2(0.0, -1.0));
              half4 c02 = image.eval(coord + float2(1.0, -1.0));
              half4 c10 = image.eval(coord + float2(-1.0, 0.0));
              half4 c11 = image.eval(coord);
              half4 c12 = image.eval(coord + float2(1.0, 0.0));
              half4 c20 = image.eval(coord + float2(-1.0, 1.0));
              half4 c21 = image.eval(coord + float2(0.0, 1.0));
              half4 c22 = image.eval(coord + float2(1.0, 1.0));

              float3 w = float3(0.299, 0.587, 0.114);

              float gx = dot(c02.rgb, w) + 2.0 * dot(c12.rgb, w) + dot(c22.rgb, w)
                       - dot(c00.rgb, w) - 2.0 * dot(c10.rgb, w) - dot(c20.rgb, w);

              float gy = dot(c00.rgb, w) + 2.0 * dot(c01.rgb, w) + dot(c02.rgb, w)
                       - dot(c20.rgb, w) - 2.0 * dot(c21.rgb, w) - dot(c22.rgb, w);

              float edge = sqrt(gx * gx + gy * gy);
              float outline = smoothstep(threshold, threshold * 0.3, edge);
              float fill = smoothstep(0.0, 1.0, dot(c11.rgb, w));

              float3 ink = float3(1.0 - outline);
              float3 blended = mix(ink, c11.rgb, smoothness);

              return half4(blended * fill, c11.a);
            }
          `;

          return compile(source, {
            threshold,
            smoothness,
          });
        }

        case 'spatter': {
          const density = params.density ?? 0.5;
          const size = Math.max(params.size ?? 10, 1);

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float density;
            uniform float size;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              half4 base = image.eval(coord);
              float2 uv = coord / resolution;
              float d = clamp(density, 0.0, 1.0);
              float scale = max(size, 1.0);

              float n = fbm(coord / (scale * 6.0));
              float splat = step(1.0 - d, n);
              float jitter1 = rand(coord / scale);
              float jitter2 = rand(coord / scale + float2(3.17, 1.23));

              float2 offset = (float2(jitter1, jitter2) - 0.5) * scale * 4.0;
              half4 sample = image.eval(coord + offset);

              float mask = splat * clamp(d * 1.5, 0.0, 1.0);
              return half4(mix(base.rgb, sample.rgb, mask), base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            density,
            size,
          });
        }

        case 'sumi-e': {
          const ink = params.ink ?? 0.6;
          const wash = params.wash ?? 0.4;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float ink;
            uniform float wash;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              half4 base = image.eval(coord);
              float3 w = float3(0.299, 0.587, 0.114);
              float lum = dot(base.rgb, w);

              half4 c10 = image.eval(coord + float2(-1.0, 0.0));
              half4 c12 = image.eval(coord + float2(1.0, 0.0));
              half4 c01 = image.eval(coord + float2(0.0, -1.0));
              half4 c21 = image.eval(coord + float2(0.0, 1.0));

              float lumLeft = dot(c10.rgb, w);
              float lumRight = dot(c12.rgb, w);
              float lumUp = dot(c01.rgb, w);
              float lumDown = dot(c21.rgb, w);

              float edge = abs(lumLeft - lumRight) + abs(lumUp - lumDown);

              float grain = fbm(coord / (resolution * 0.8));
              float washMask = smoothstep(0.0, 1.0, lum + (grain - 0.5) * wash);

              float inkLevel = pow(lum, mix(0.6, 1.4, clamp(ink, 0.0, 1.0)));
              float outline = smoothstep(0.05, 0.25, edge * 3.0);

              float3 inked = float3(inkLevel);
              float3 result = mix(float3(1.0 - outline), inked, washMask);

              return half4(result, base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            ink,
            wash,
          });
        }

        case 'plastic-wrap': {
          const highlight = params.highlight ?? 0.7;
          const detail = params.detail ?? 0.4;

          const source = `
            uniform shader image;
            uniform float highlight;
            uniform float detail;

            half4 main(float2 coord) {
              half4 base = image.eval(coord);

              half4 c00 = image.eval(coord + float2(-2.0, -2.0));
              half4 c01 = image.eval(coord + float2(0.0, -2.0));
              half4 c02 = image.eval(coord + float2(2.0, -2.0));
              half4 c10 = image.eval(coord + float2(-2.0, 0.0));
              half4 c12 = image.eval(coord + float2(2.0, 0.0));
              half4 c20 = image.eval(coord + float2(-2.0, 2.0));
              half4 c21 = image.eval(coord + float2(0.0, 2.0));
              half4 c22 = image.eval(coord + float2(2.0, 2.0));

              half4 smooth = (c00 + c02 + c20 + c22) * 0.0625;
              smooth += (c01 + c10 + c12 + c21) * 0.125;
              smooth += base * 0.25;

              half4 detailMap = base - smooth;
              float h = clamp(highlight, 0.0, 1.0);
              float d = clamp(detail, 0.0, 1.0);

              float3 spec = clamp(detailMap.rgb * 2.5 + h, 0.0, 1.0);
              float3 finalColor = clamp(base.rgb * (1.0 + d) + spec * d, 0.0, 1.0);

              return half4(finalColor, base.a);
            }
          `;

          return compile(source, {
            highlight,
            detail,
          });
        }

        case 'clouds-fibers': {
          const scale = params.scale ?? 2;
          const contrast = params.contrast ?? 1;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float scale;
            uniform float contrast;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              half4 base = image.eval(coord);
              float2 uv = coord / resolution;
              float s = max(scale, 0.1);

              float cloud = fbm(uv * s * 4.0);
              float fibers = fbm(float2(uv.y, uv.x) * s * 8.0);
              float texture = clamp(cloud * 0.7 + fibers * 0.3, 0.0, 1.0);

              float gain = clamp(contrast, 0.0, 2.0);
              texture = pow(texture, gain);

              float3 blend = mix(base.rgb, float3(texture), 0.5);
              float3 result = clamp(blend * (0.6 + texture * 0.4), 0.0, 1.0);

              return half4(result, base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            scale,
            contrast,
          });
        }

        case 'bilateral-filter': {
          const radius = Math.max(params.radius ?? 8, 1);
          const sigmaColor = params.sigmaColor ?? 0.6;
          const sigmaSpace = params.sigmaSpace ?? 0.8;

          const source = `
            uniform shader image;
            uniform float radius;
            uniform float sigmaColor;
            uniform float sigmaSpace;
            uniform float2 resolution;
            const int MAX_BILATERAL_RADIUS = 25;

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float2 clampedCoord = clamp(coord, float2(0.0), size - float2(1.0));
              half4 center = image.eval(clampedCoord);
              float r = clamp(radius, 1.0, 15.0);
              float colorSigma = max(sigmaColor, 0.01);
              float spaceSigma = max(sigmaSpace, 0.01);

              half4 sum = center;
              float weightSum = 1.0;

              for (int x = -MAX_BILATERAL_RADIUS; x <= MAX_BILATERAL_RADIUS; ++x) {
                for (int y = -MAX_BILATERAL_RADIUS; y <= MAX_BILATERAL_RADIUS; ++y) {
                  if (x == 0 && y == 0) {
                    continue;
                  }

                  float2 offset = float2(float(x), float(y));
                  float dist = length(offset);
                  if (dist > r) {
                    continue;
                  }

                  float2 sampleCoord = clamp(clampedCoord + offset, float2(0.0), size - float2(1.0));
                  half4 sample = image.eval(sampleCoord);

                  float spaceWeight = exp(-(dist * dist) / (2.0 * spaceSigma * spaceSigma * r));
                  float colorDiff = length(sample.rgb - center.rgb);
                  float colorWeight = exp(-(colorDiff * colorDiff) / (2.0 * colorSigma * colorSigma));

                  float weight = spaceWeight * colorWeight;

                  sum += sample * weight;
                  weightSum += weight;
                }
              }

              return sum / max(weightSum, 0.001);
            }
          `;

          return compile(source, {
            radius,
            sigmaColor,
            sigmaSpace,
            resolution: [width, height],
          });
        }

        case 'median-filter': {
          const radius = Math.max(params.radius ?? 3, 1);

          const source = `
            uniform shader image;
            uniform float radius;
            uniform float2 resolution;

            void swapIfGreater(inout float la, inout float3 ca, inout float lb, inout float3 cb) {
              if (la > lb) {
                float tempL = la;
                la = lb;
                lb = tempL;

                float3 tempC = ca;
                ca = cb;
                cb = tempC;
              }
            }

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float2 centerCoord = clamp(coord, float2(0.0), size - float2(1.0));
              float r = clamp(radius, 1.0, 5.0);
              float3 w = float3(0.299, 0.587, 0.114);

              float2 o0 = float2(-1.0, -1.0) * r;
              float2 o1 = float2(0.0, -1.0) * r;
              float2 o2 = float2(1.0, -1.0) * r;
              float2 o3 = float2(-1.0, 0.0) * r;
              float2 o4 = float2(0.0, 0.0);
              float2 o5 = float2(1.0, 0.0) * r;
              float2 o6 = float2(-1.0, 1.0) * r;
              float2 o7 = float2(0.0, 1.0) * r;
              float2 o8 = float2(1.0, 1.0) * r;

              half4 s0 = image.eval(clamp(centerCoord + o0, float2(0.0), size - float2(1.0)));
              half4 s1 = image.eval(clamp(centerCoord + o1, float2(0.0), size - float2(1.0)));
              half4 s2 = image.eval(clamp(centerCoord + o2, float2(0.0), size - float2(1.0)));
              half4 s3 = image.eval(clamp(centerCoord + o3, float2(0.0), size - float2(1.0)));
              half4 s4 = image.eval(centerCoord);
              half4 s5 = image.eval(clamp(centerCoord + o5, float2(0.0), size - float2(1.0)));
              half4 s6 = image.eval(clamp(centerCoord + o6, float2(0.0), size - float2(1.0)));
              half4 s7 = image.eval(clamp(centerCoord + o7, float2(0.0), size - float2(1.0)));
              half4 s8 = image.eval(clamp(centerCoord + o8, float2(0.0), size - float2(1.0)));

              float3 c0 = s0.rgb;
              float3 c1 = s1.rgb;
              float3 c2 = s2.rgb;
              float3 c3 = s3.rgb;
              float3 c4 = s4.rgb;
              float3 c5 = s5.rgb;
              float3 c6 = s6.rgb;
              float3 c7 = s7.rgb;
              float3 c8 = s8.rgb;

              float l0 = dot(c0, w);
              float l1 = dot(c1, w);
              float l2 = dot(c2, w);
              float l3 = dot(c3, w);
              float l4 = dot(c4, w);
              float l5 = dot(c5, w);
              float l6 = dot(c6, w);
              float l7 = dot(c7, w);
              float l8 = dot(c8, w);

              swapIfGreater(l0, c0, l1, c1);
              swapIfGreater(l3, c3, l4, c4);
              swapIfGreater(l6, c6, l7, c7);
              swapIfGreater(l1, c1, l2, c2);
              swapIfGreater(l4, c4, l5, c5);
              swapIfGreater(l7, c7, l8, c8);
              swapIfGreater(l0, c0, l1, c1);
              swapIfGreater(l3, c3, l4, c4);
              swapIfGreater(l6, c6, l7, c7);
              swapIfGreater(l0, c0, l3, c3);
              swapIfGreater(l3, c3, l6, c6);
              swapIfGreater(l0, c0, l3, c3);
              swapIfGreater(l1, c1, l4, c4);
              swapIfGreater(l4, c4, l7, c7);
              swapIfGreater(l1, c1, l4, c4);
              swapIfGreater(l2, c2, l5, c5);
              swapIfGreater(l5, c5, l8, c8);
              swapIfGreater(l2, c2, l5, c5);
              swapIfGreater(l1, c1, l2, c2);
              swapIfGreater(l4, c4, l5, c5);
              swapIfGreater(l7, c7, l8, c8);
              swapIfGreater(l2, c2, l5, c5);
              swapIfGreater(l5, c5, l8, c8);
              swapIfGreater(l2, c2, l5, c5);
              swapIfGreater(l4, c4, l7, c7);
              swapIfGreater(l4, c4, l6, c6);
              swapIfGreater(l2, c2, l4, c4);
              swapIfGreater(l4, c4, l6, c6);
              swapIfGreater(l4, c4, l5, c5);

              float3 medianColor = c4;
              half4 centerSample = image.eval(centerCoord);
              float3 result = mix(centerSample.rgb, medianColor, 0.85);

              return half4(result, centerSample.a);
            }
          `;

          return compile(source, {
            radius,
            resolution: [width, height],
          });
        }

        case 'liquify': {
          const amount = params.amount ?? 0.4;
          const radius = params.radius ?? 0.5;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float amount;
            uniform float radius;

            const float PI = 3.14159265359;

            half4 main(float2 coord) {
              float2 center = resolution * 0.5;
              float2 pos = coord - center;

              float maxRadius = max(max(resolution.x, resolution.y) * max(radius, 0.1), 1.0);
              float dist = length(pos);
              float norm = dist / maxRadius;

              float falloff = smoothstep(1.0, 0.0, norm);
              float swirl = amount * PI * falloff;

              float cosA = cos(swirl);
              float sinA = sin(swirl);
              float2 rotated = float2(
                pos.x * cosA - pos.y * sinA,
                pos.x * sinA + pos.y * cosA
              );

              float push = amount * 40.0 * falloff * falloff;
              float2 direction = normalize(pos + float2(0.0001, 0.0001));
              float2 displaced = rotated + direction * push;

              return image.eval(displaced + center);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            amount,
            radius,
          });
        }

        case 'lens-correction': {
          const distortion = params.distortion ?? -0.2;
          const centerOffset = params.center ?? 0;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float distortion;
            uniform float center;

            half4 main(float2 coord) {
              float2 uv = coord / resolution;
              float2 c = float2(0.5 + center, 0.5);
              float2 delta = uv - c;
              float r2 = dot(delta, delta);
              float factor = 1.0 + distortion * r2;
              float2 sampleUv = c + delta * factor;
              sampleUv = clamp(sampleUv, float2(0.0), float2(1.0));
              float2 sampleCoord = sampleUv * resolution;

              return image.eval(sampleCoord);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            distortion,
            center: centerOffset,
          });
        }

        case 'high-pass': {
          const radius = Math.max(params.radius ?? 12, 1);
          const amount = params.amount ?? 0.8;

          const source = `
            uniform shader image;
            uniform float radius;
            uniform float amount;

            half4 gaussianBlur(float2 coord, float r) {
              float2 step = float2(max(r, 1.0));

              half4 c00 = image.eval(coord + float2(-step.x, -step.y));
              half4 c01 = image.eval(coord + float2(0.0, -step.y));
              half4 c02 = image.eval(coord + float2(step.x, -step.y));
              half4 c10 = image.eval(coord + float2(-step.x, 0.0));
              half4 c11 = image.eval(coord);
              half4 c12 = image.eval(coord + float2(step.x, 0.0));
              half4 c20 = image.eval(coord + float2(-step.x, step.y));
              half4 c21 = image.eval(coord + float2(0.0, step.y));
              half4 c22 = image.eval(coord + float2(step.x, step.y));

              half4 blur = (c00 + c02 + c20 + c22) * 0.0625;
              blur += (c01 + c10 + c12 + c21) * 0.125;
              blur += c11 * 0.25;

              return blur;
            }

            half4 main(float2 coord) {
              half4 base = image.eval(coord);
              half4 blur = gaussianBlur(coord, radius);
              half4 detail = base - blur;
              float amt = clamp(amount, 0.0, 2.0);
              float3 result = clamp(base.rgb + detail.rgb * amt, 0.0, 1.0);
              return half4(result, base.a);
            }
          `;

          return compile(source, {
            radius,
            amount,
          });
        }

        case 'low-pass': {
          const radius = Math.max(params.radius ?? 18, 1);

          const source = `
            uniform shader image;
            uniform float radius;

            half4 gaussianBlur(float2 coord, float r) {
              float2 step = float2(max(r, 1.0));

              half4 c00 = image.eval(coord + float2(-step.x, -step.y));
              half4 c01 = image.eval(coord + float2(0.0, -step.y));
              half4 c02 = image.eval(coord + float2(step.x, -step.y));
              half4 c10 = image.eval(coord + float2(-step.x, 0.0));
              half4 c11 = image.eval(coord);
              half4 c12 = image.eval(coord + float2(step.x, 0.0));
              half4 c20 = image.eval(coord + float2(-step.x, step.y));
              half4 c21 = image.eval(coord + float2(0.0, step.y));
              half4 c22 = image.eval(coord + float2(step.x, step.y));

              half4 blur = (c00 + c02 + c20 + c22) * 0.0625;
              blur += (c01 + c10 + c12 + c21) * 0.125;
              blur += c11 * 0.25;

              return blur;
            }

            half4 main(float2 coord) {
              return gaussianBlur(coord, radius);
            }
          `;

          return compile(source, {
            radius,
          });
        }

        case 'gradient-filter': {
          const angle = params.angle ?? 45;
          const intensity = params.intensity ?? 0.6;

          const source = `
            uniform shader image;
            uniform float angle;
            uniform float intensity;

            const float PI = 3.14159265359;

            half4 main(float2 coord) {
              half4 base = image.eval(coord);
              float rad = angle * PI / 180.0;
              float2 dir = float2(cos(rad), sin(rad));
              float2 offset = dir * 2.0;

              half4 ahead = image.eval(coord + offset);
              half4 behind = image.eval(coord - offset);

              float3 diff = ahead.rgb - behind.rgb;
              float grad = dot(diff, float3(0.299, 0.587, 0.114));

              float amt = clamp(intensity, 0.0, 1.0);
              float3 result = clamp(base.rgb + grad * amt, 0.0, 1.0);

              return half4(result, base.a);
            }
          `;

          return compile(source, {
            angle,
            intensity,
          });
        }

        case 'fourier-mask': {
          const band = params.band ?? 0.5;
          const contrast = params.contrast ?? 1;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float band;
            uniform float contrast;

            half4 gaussianBlur(float2 coord, float r) {
              float2 step = float2(max(r, 1.0));

              half4 c00 = image.eval(coord + float2(-step.x, -step.y));
              half4 c01 = image.eval(coord + float2(0.0, -step.y));
              half4 c02 = image.eval(coord + float2(step.x, -step.y));
              half4 c10 = image.eval(coord + float2(-step.x, 0.0));
              half4 c11 = image.eval(coord);
              half4 c12 = image.eval(coord + float2(step.x, 0.0));
              half4 c20 = image.eval(coord + float2(-step.x, step.y));
              half4 c21 = image.eval(coord + float2(0.0, step.y));
              half4 c22 = image.eval(coord + float2(step.x, step.y));

              half4 blur = (c00 + c02 + c20 + c22) * 0.0625;
              blur += (c01 + c10 + c12 + c21) * 0.125;
              blur += c11 * 0.25;

              return blur;
            }

            half4 main(float2 coord) {
              half4 base = image.eval(coord);
              half4 blur = gaussianBlur(coord, 12.0);
              half4 high = base - blur;

              float2 uv = coord / resolution - float2(0.5);
              float radius = length(uv) * 2.0;

              float mask = smoothstep(band, band + 0.2, radius);
              float c = clamp(contrast, 0.0, 2.0);

              float3 highColor = clamp(base.rgb + high.rgb * c, 0.0, 1.0);
              float3 mixColor = mix(highColor, blur.rgb, mask);

              return half4(mixColor, base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            band,
            contrast,
          });
        }

        case 'flame-render': {
          const intensity = params.intensity ?? 0.7;
          const detail = params.detail ?? 1.5;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float intensity;
            uniform float detail;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              half4 base = image.eval(coord);
              float2 uv = coord / resolution;

              float scale = max(detail, 0.5);
              float noiseVal = fbm(float2(uv.x * scale * 1.5, (1.0 - uv.y) * scale * 3.0));
              float flame = pow(clamp(noiseVal, 0.0, 1.0), 3.0);
              float glow = pow(clamp(noiseVal, 0.0, 1.0), 1.5);

              float amount = clamp(intensity, 0.0, 1.0);
              float3 flameColor = float3(
                flame * (2.0 * amount),
                glow * (1.2 * amount),
                glow * 0.3 * amount
              );

              float3 result = clamp(base.rgb + flameColor, 0.0, 1.0);
              return half4(result, base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            intensity,
            detail,
          });
        }

        case 'render-clouds': {
          const scale = params.scale ?? 1.5;
          const contrast = params.contrast ?? 0.8;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float scale;
            uniform float contrast;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              half4 base = image.eval(coord);
              float2 uv = coord / resolution;
              float s = max(scale, 0.1);

              float n = fbm(uv * s * 4.0);
              float clouds = pow(clamp(n, 0.0, 1.0), clamp(contrast + 0.5, 0.5, 2.5));
              float3 cloudColor = float3(clouds);

              return half4(mix(base.rgb, cloudColor, 0.5), base.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            scale,
            contrast,
          });
        }

        case 'glass': {
          const distortion = params.distortion ?? 10;
          const smoothness = Math.max(params.smoothness ?? 5, 1);

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float distortion;
            uniform float smoothness;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float2 uv = coord / size;

              float noiseX = fbm(uv * smoothness + float2(0.0, 0.0));
              float noiseY = fbm(uv * smoothness + float2(5.2, 1.3));

              float2 offset = float2(noiseX - 0.5, noiseY - 0.5) * distortion;
              float2 sampleCoord = clamp(coord + offset, float2(0.0), size - float2(1.0));

              return image.eval(sampleCoord);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            distortion,
            smoothness,
          });
        }

        case 'frosted-glass': {
          const blur = Math.max(params.blur ?? 12, 1);
          const grain = params.grain ?? 0.3;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float blur;
            uniform float grain;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float r = max(blur, 1.0);

              half4 sum = half4(0.0);
              float total = 0.0;

              for (int y = -8; y <= 8; ++y) {
                for (int x = -8; x <= 8; ++x) {
                  float2 offset = float2(float(x), float(y)) * (r / 8.0);
                  float dist = length(offset);
                  if (dist > r) continue;

                  float weight = exp(-dist * dist / (2.0 * r * r));
                  float2 sampleCoord = clamp(coord + offset, float2(0.0), size - float2(1.0));
                  sum += image.eval(sampleCoord) * weight;
                  total += weight;
                }
              }

              half4 blurred = sum / max(total, 0.001);

              float noiseVal = noise(coord / size * 500.0) * grain;
              float3 result = clamp(blurred.rgb + noiseVal, 0.0, 1.0);

              return half4(result, blurred.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            blur,
            grain,
          });
        }

        case 'ocean-ripple': {
          const rippleSize = Math.max(params.size ?? 10, 1);
          const magnitude = params.magnitude ?? 15;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float rippleSize;
            uniform float magnitude;
            ${COMMON_NOISE_SNIPPET}

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float2 uv = coord / size;

              float n1 = fbm(uv * rippleSize * 0.5);
              float n2 = fbm((uv + float2(0.5, 0.5)) * rippleSize * 0.7);

              float2 offset = float2(
                sin(n1 * 6.28) * magnitude,
                sin(n2 * 6.28) * magnitude
              );

              float2 sampleCoord = clamp(coord + offset, float2(0.0), size - float2(1.0));
              return image.eval(sampleCoord);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            rippleSize,
            magnitude,
          });
        }

        case 'zigzag': {
          const amount = params.amount ?? 10;
          const ridges = Math.max(params.ridges ?? 5, 1);

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float amount;
            uniform float ridges;

            const float PI = 3.14159265359;

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float2 center = size * 0.5;
              float2 pos = coord - center;

              float dist = length(pos);
              float angle = atan(pos.y, pos.x);

              float wave = sin(dist / max(size.x, size.y) * ridges * 2.0 * PI) * amount;

              float2 displaced = pos + float2(cos(angle), sin(angle)) * wave;
              float2 sampleCoord = clamp(displaced + center, float2(0.0), size - float2(1.0));

              return image.eval(sampleCoord);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            amount,
            ridges,
          });
        }

        case 'glassmorphism': {
          const blur = Math.max(params.blur ?? 20, 1);
          const transparency = params.transparency ?? 0.3;
          const shine = params.shine ?? 0.5;

          const source = `
            uniform shader image;
            uniform float2 resolution;
            uniform float blur;
            uniform float transparency;
            uniform float shine;

            half4 main(float2 coord) {
              float2 size = max(resolution, float2(1.0));
              float r = max(blur, 1.0);

              half4 sum = half4(0.0);
              float total = 0.0;

              for (int y = -12; y <= 12; ++y) {
                for (int x = -12; x <= 12; ++x) {
                  float2 offset = float2(float(x), float(y)) * (r / 12.0);
                  float dist = length(offset);
                  if (dist > r) continue;

                  float weight = exp(-dist * dist / (2.0 * r * r));
                  float2 sampleCoord = clamp(coord + offset, float2(0.0), size - float2(1.0));
                  sum += image.eval(sampleCoord) * weight;
                  total += weight;
                }
              }

              half4 blurred = sum / max(total, 0.001);

              float2 uv = coord / size;
              float gradient = smoothstep(0.0, 1.0, 1.0 - uv.y);
              float highlight = pow(gradient, 3.0) * shine;

              float3 glass = blurred.rgb * (1.0 - transparency) + highlight;

              return half4(glass, blurred.a);
            }
          `;

          return compile(source, {
            resolution: [width, height],
            blur,
            transparency,
            shine,
          });
        }

        default:
          return null;
      }
    } catch (error) {
      console.error('Error creating shader:', error);
      return null;
    }

    return null;
  }, [effect, params, image, width, height]);

  // Render image with or without shader effect
  if (effectData) {
    // Render with shader effect
    return (
      <Fill>
        <Shader source={effectData.source} uniforms={effectData.uniforms}>
          <ImageShader
            image={image}
            fit="contain"
            x={x}
            y={y}
            width={width}
            height={height}
          />
        </Shader>
      </Fill>
    );
  }

  // Render without effect
  return (
    <SkiaImage
      image={image}
      fit="contain"
      x={x}
      y={y}
      width={width}
      height={height}
    />
  );
};
