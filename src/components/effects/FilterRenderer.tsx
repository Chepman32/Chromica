/**
 * Filter Renderer Component
 * Applies color matrix filters to images
 */

import React, { useMemo } from 'react';
import {
  Image as SkiaImage,
  ColorMatrix,
  Paint,
} from '@shopify/react-native-skia';
import { getFilterById } from '../../domain/effects/filters';

interface FilterRendererProps {
  image: any;
  filterId: string | null;
  intensity: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FilterRenderer: React.FC<FilterRendererProps> = ({
  image,
  filterId,
  intensity,
  x,
  y,
  width,
  height,
}) => {
  // Get the color matrix for the filter
  const colorMatrix = useMemo(() => {
    if (!filterId || filterId === 'none') {
      return null;
    }

    const filter = getFilterById(filterId);
    if (!filter) {
      return null;
    }

    return filter.getColorMatrix(intensity);
  }, [filterId, intensity]);

  // Create paint with color matrix
  const paint = useMemo(() => {
    if (!colorMatrix) {
      return undefined;
    }

    return (
      <Paint>
        <ColorMatrix matrix={colorMatrix} />
      </Paint>
    );
  }, [colorMatrix]);

  return (
    <SkiaImage
      image={image}
      fit="contain"
      x={x}
      y={y}
      width={width}
      height={height}
    >
      {paint}
    </SkiaImage>
  );
};
