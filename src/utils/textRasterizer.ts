// Utility to rasterize text-based watermark elements into image-based watermark elements

import { Skia } from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import type { CanvasElement } from '../types';

const createFont = (size: number, family?: string) => {
  try {
    let typeface: ReturnType<typeof Skia.Typeface.MakeDefault> | null = null;

    if (family && family !== 'System') {
      // @ts-expect-error - MakeFromName may not exist on all platforms
      typeface = (Skia.Typeface.MakeFromName?.(family) as ReturnType<
        typeof Skia.Typeface.MakeDefault
      > | null) ?? null;
    }

    if (!typeface && typeof Skia.Typeface.MakeDefault === 'function') {
      typeface = Skia.Typeface.MakeDefault();
    }

    const font = Skia.Font(typeface ?? undefined, size);
    if (!font) {
      return null;
    }

    if (typeof font.setEdging === 'function') {
      font.setEdging(Skia.FontEdging.SubpixelAntialias);
    }
    return font;
  } catch {
    return null;
  }
};

export const rasterizeTextElementToWatermark = async (
  element: CanvasElement,
): Promise<CanvasElement> => {
  const text = element.textContent ?? '';
  const baseFontSize = element.fontSize ?? 24;
  const font = createFont(baseFontSize, element.fontFamily);
  if (!font || !text) {
    return element;
  }

  const measurement = font.measureText(text);
  const metrics = font.getMetrics();
  const textWidth = measurement.width || baseFontSize;
  const textHeight =
    metrics.descent - metrics.ascent > 0
      ? metrics.descent - metrics.ascent
      : baseFontSize;

  const paddingX = Math.max(baseFontSize * 0.25, 8);
  const paddingY = Math.max(baseFontSize * 0.2, 6);

  const totalWidth = Math.ceil(textWidth + paddingX * 2);
  const totalHeight = Math.ceil(textHeight + paddingY * 2);

  const surface = Skia.Surface.Make(totalWidth, totalHeight);
  if (!surface) {
    return element;
  }

  const canvas = surface.getCanvas();
  const bgOpacity = element.textBackground ? Math.max(0, Math.min(element.opacity ?? 1, 1)) : 0;
  const textOpacity = Math.max(0, Math.min(element.opacity ?? 1, 1));

  canvas.clear(Skia.Color('#00000000'));

  if (element.textBackground) {
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setAntiAlias(true);
    backgroundPaint.setColor(Skia.Color(element.textBackground));
    backgroundPaint.setAlphaf(bgOpacity);
    canvas.drawRoundRect(
      Skia.XYWHRect(0, 0, totalWidth, totalHeight),
      baseFontSize * 0.25,
      baseFontSize * 0.25,
      backgroundPaint,
    );
  }

  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(element.color || '#FFFFFF'));
  paint.setAlphaf(textOpacity);

  const baseline = -metrics.ascent + paddingY;
  canvas.drawText(text, paddingX, baseline, paint, font);

  const snapshot = surface.makeImageSnapshot();
  const base64 = snapshot.encodeToBase64();
  const filename = `artifex_wm_text_${Date.now()}.png`;
  const filepath = `${RNFS.TemporaryDirectoryPath}/${filename}`;
  await RNFS.writeFile(filepath, base64, 'base64');

  return {
    id: element.id,
    type: 'watermark',
    position: element.position,
    scale: 1,
    rotation: element.rotation,
    width: totalWidth,
    height: totalHeight,
    opacity: element.opacity,
    assetPath: filepath,
  };
};


