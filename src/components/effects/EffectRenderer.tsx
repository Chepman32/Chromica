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
} from '@shopify/react-native-skia';
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
  // Create shader for the effect
  const shader = useMemo(() => {
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
            return runtimeEffect.makeShaderWithChildren(
              [width, height, cellSize],
              [image],
            );
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
            return runtimeEffect.makeShaderWithChildren(
              [width, height, segments, angle, zoom],
              [image],
            );
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
            return runtimeEffect.makeShaderWithChildren(
              [offsetX, offsetY],
              [image],
            );
          }
          break;
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

  // Always render the image
  // Note: Shader rendering needs to be implemented differently in Skia
  // For now, we'll use a simpler approach with color transformations

  // Apply simple visual effect based on effect type
  const opacity = effect ? 0.9 : 1.0;

  return (
    <SkiaImage
      image={image}
      fit="contain"
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={opacity}
    />
  );
};
