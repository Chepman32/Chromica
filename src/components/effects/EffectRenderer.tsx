/**
 * Effect Renderer Component
 * Handles rendering images with shader effects
 */

import React, { useMemo } from 'react';
import {
  Image as SkiaImage,
  Skia,
  Paint,
  ColorMatrix,
  Blur,
  Shader,
  ImageShader,
  Fill,
} from '@shopify/react-native-skia';
import type { SkRuntimeEffect } from '@shopify/react-native-skia';
import { Effect } from '../../domain/effects/types';

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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                resolution: [width, height],
                cellSize: cellSize,
              },
            };
          }
          break;
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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                resolution: [width, height],
                segments: segments,
                angle: angle,
                zoom: zoom,
              },
            };
          }
          break;
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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                offset: [offsetX, offsetY],
              },
            };
          }
          break;
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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                resolution: [width, height],
                axis: axisMap[axis] || 0,
                offset: offset,
              },
            };
          }
          break;
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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                resolution: [width, height],
                amplitude: amplitude,
                frequency: frequency,
                phase: phase,
                direction: directionMap[direction] || 0,
              },
            };
          }
          break;
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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                resolution: [width, height],
                angle: angle,
                radius: radius,
              },
            };
          }
          break;
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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                resolution: [width, height],
                strength: strength,
                radius: radius,
              },
            };
          }
          break;
        }

        case 'scanlines': {
          const lineCount = Math.max(params.lineCount ?? 300, 1);
          const opacity = Math.min(Math.max(params.opacity ?? 0.5, 0), 1);

          const source = Skia.RuntimeEffect.Make(`
            uniform shader image;
            uniform float2 resolution;
            uniform float lineCount;
            uniform float opacity;

            const float TWO_PI = 6.28318530718;

            half4 main(float2 coord) {
              float2 safeResolution = max(resolution, float2(1.0));
              float2 uv = coord / safeResolution;
              half4 color = image.eval(coord);

              float stripe = 0.5 + 0.5 * sin(uv.y * lineCount * TWO_PI);
              float mask = mix(1.0, stripe, opacity);

              return half4(color.rgb * mask, color.a);
            }
          `);

          if (!source) {
            console.error('Scanlines shader failed to compile');
            return null;
          }

          return {
            source: source,
            uniforms: {
              resolution: [width, height],
              lineCount: lineCount,
              opacity: opacity,
            },
          };
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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                resolution: [width, height],
                dotSize: dotSize,
                angle: angle,
              },
            };
          }
          break;
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

          const runtimeEffect = Skia.RuntimeEffect.Make(source);
          if (runtimeEffect) {
            return {
              source: runtimeEffect,
              uniforms: {
                resolution: [width, height],
                angle: angle,
                height: height,
              },
            };
          }
          break;
        }

        case 'oil-paint': {
          const brushSize = Math.max(params.brushSize ?? 5, 1);
          const detail = Math.max(params.detail ?? 5, 1);

          const source = Skia.RuntimeEffect.Make(`
            uniform shader image;
            uniform float2 resolution;
            uniform float brushSize;
            uniform float detail;

            const float3 LUMA_WEIGHTS = float3(0.299, 0.587, 0.114);

            half4 main(float2 coord) {
              float2 safeResolution = max(resolution, float2(1.0));
              float sampleStep = max(brushSize, 1.0);
              float levels = max(detail, 1.0);

              float3 accum = float3(0.0);
              float3 accumDetail = float3(0.0);
              float totalSamples = 0.0;
              float totalDetail = 0.0;

              for (int x = -3; x <= 3; ++x) {
                for (int y = -3; y <= 3; ++y) {
                  float2 offset = float2(float(x), float(y)) * sampleStep;
                  float2 sampleCoord = clamp(coord + offset, float2(0.0), safeResolution - float2(1.0));
                  half4 sample = image.eval(sampleCoord);

                  float intensity = dot(sample.rgb, LUMA_WEIGHTS);
                  float quantized = floor(intensity * levels) / levels;
                  float weight = 1.0 - abs(intensity - quantized);

                  accum += sample.rgb;
                  totalSamples += 1.0;

                  accumDetail += sample.rgb * weight;
                  totalDetail += weight;
                }
              }

              float3 average = accum / max(totalSamples, 1.0);
              float3 stylized = accumDetail / max(totalDetail, 0.001);
              float3 color = mix(average, stylized, 0.7);
              color = floor(color * levels) / levels;

              half4 base = image.eval(coord);
              return half4(color, base.a);
            }
          `);

          if (!source) {
            console.error('Oil Paint shader failed to compile');
            return null;
          }

          return {
            source: source,
            uniforms: {
              resolution: [width, height],
              brushSize: brushSize,
              detail: detail,
            },
          };
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
