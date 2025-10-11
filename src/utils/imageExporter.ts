// Image export functionality using Skia for high-quality rendering

import { Skia, type SkCanvas, type SkImage } from '@shopify/react-native-skia';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { CanvasElement, ImageFilter } from '../types';
import { getFilterColorMatrix } from './colorMatrix';

export interface ExportOptions {
  format: 'png' | 'jpg';
  quality: number; // 0-100
  addWatermark: boolean;
  canvasSize?: { width: number; height: number };
}

const ARTIFEX_WATERMARK_TEXT = 'Made with Artifex';
const WATERMARK_FONT_SIZE = 14;
const WATERMARK_OPACITY = 0.6;
const WATERMARK_PADDING = 12;

const imageCache = new Map<string, SkImage>();

interface CanvasScale {
  x: number;
  y: number;
}

const createFont = (size: number, family?: string) => {
  try {
    let typeface: ReturnType<typeof Skia.Typeface.MakeDefault> | null = null;

    if (family && family !== 'System') {
      typeface =
        // @ts-expect-error - MakeFromName may not exist on all platforms
        (Skia.Typeface.MakeFromName?.(family) as ReturnType<
          typeof Skia.Typeface.MakeDefault
        > | null) ?? null;
    }

    if (!typeface && typeof Skia.Typeface.MakeDefault === 'function') {
      typeface = Skia.Typeface.MakeDefault();
    }

    const font = Skia.Font(typeface ?? undefined, size);
    if (!font) {
      console.warn('Skia: Failed to create font instance');
      return null;
    }

    if (typeof font.setEdging === 'function') {
      font.setEdging(Skia.FontEdging.SubpixelAntialias);
    }
    return font;
  } catch (error) {
    console.warn('Skia: Failed to create font', error);
    return null;
  }
};

interface ElementSize {
  width: number;
  height: number;
}

interface TextLayout {
  font: ReturnType<typeof Skia.Font>;
  text: string;
  fontSize: number;
  textWidth: number;
  textHeight: number;
  totalWidth: number;
  totalHeight: number;
  baseline: number;
  paddedBaseline: number;
  paddingX: number;
  paddingY: number;
}

/**
 * Exports the current canvas to an image file on disk.
 */
interface ExportResult {
  filepath: string;
  format: 'png' | 'jpg';
  mime: string;
}

export const exportCanvasToImage = async (
  sourceImagePath: string,
  sourceImageDimensions: { width: number; height: number },
  canvasElements: CanvasElement[],
  options: ExportOptions,
  filter?: ImageFilter | null,
): Promise<ExportResult> => {
  const { width, height } = sourceImageDimensions;
  const { format, quality, addWatermark, canvasSize } = options;

  try {
    const surface = Skia.Surface.Make(Math.round(width), Math.round(height));
    if (!surface) {
      throw new Error('Failed to create Skia surface');
    }

    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color('#00000000'));

    const canvasScale = getCanvasScale(
      sourceImageDimensions,
      canvasSize || null,
    );

    const sourceImage = await getImageFromCache(
      sourceImagePath,
      sourceImageDimensions,
    );
    if (!sourceImage) {
      throw new Error('Failed to load source image');
    }

    drawSourceImage(canvas, sourceImage, width, height, filter);

    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const elementSummary = canvasElements.reduce((acc, element) => {
        acc[element.type] = (acc[element.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Export debug - element counts', elementSummary);

      // Debug watermark elements specifically
      const watermarkElements = canvasElements.filter(
        el => el.type === 'watermark',
      );
      if (watermarkElements.length > 0) {
        console.log(
          'Export debug - watermark elements:',
          watermarkElements.map(el => ({
            id: el.id,
            type: el.type,
            opacity: el.opacity,
            assetPath: el.assetPath,
            width: el.width,
            height: el.height,
            position: el.position,
          })),
        );
      }
    }

    for (const element of canvasElements) {
      await drawCanvasElement(canvas, element, canvasScale);
    }

    if (addWatermark) {
      drawWatermark(canvas, width, height, canvasScale);
    }

    const snapshot = surface.makeImageSnapshot();
    const imageFormatEnum = (Skia as any).ImageFormat;
    let encoded: string;

    let actualFormat: 'png' | 'jpg' = format;

    if (format === 'png') {
      if (imageFormatEnum?.PNG) {
        encoded = snapshot.encodeToBase64(imageFormatEnum.PNG, 100);
      } else {
        encoded = snapshot.encodeToBase64();
      }
    } else {
      if (imageFormatEnum?.JPEG) {
        encoded = snapshot.encodeToBase64(imageFormatEnum.JPEG, quality);
      } else {
        console.warn(
          'Skia.ImageFormat.JPEG unavailable; falling back to PNG encoding.',
        );
        encoded = snapshot.encodeToBase64();
        actualFormat = 'png';
      }
    }

    const filename = `artifex_export_${Date.now()}.${actualFormat}`;
    const filepath = `${RNFS.TemporaryDirectoryPath}/${filename}`;
    await RNFS.writeFile(filepath, encoded, 'base64');

    return {
      filepath,
      format: actualFormat,
      mime: actualFormat === 'png' ? 'image/png' : 'image/jpeg',
    };
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export image');
  }
};

const getImageFromCache = async (
  uri: string,
  dimensions?: { width: number; height: number },
): Promise<SkImage | null> => {
  const cacheKey = `${uri}|${dimensions?.width || 0}x${
    dimensions?.height || 0
  }`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey) as SkImage;
  }

  const image = await loadImage(uri, dimensions);
  if (image) {
    imageCache.set(cacheKey, image);
  }
  return image;
};

const stripFileScheme = (path: string): string => {
  if (path.startsWith('file://')) {
    return path.replace('file://', '');
  }
  return path;
};

const guessImageExtension = (
  uri: string,
  fallback: 'png' | 'jpg' = 'jpg',
): 'png' | 'jpg' => {
  const match = uri.match(/\.(png|jpg|jpeg)$/i);
  if (!match) {
    return fallback;
  }
  const ext = match[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : (ext as 'png' | 'jpg');
};

const resolveImageUriToPath = async (
  uri: string,
  dimensions?: { width: number; height: number },
): Promise<string | null> => {
  if (!uri) {
    return null;
  }

  if (uri.startsWith('data:image/')) {
    return uri;
  }

  try {
    if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
      const ext = 'jpg';
      const dest = `${
        RNFS.TemporaryDirectoryPath
      }/artifex_ph_${Date.now()}.${ext}`;
      await RNFS.copyAssetsFileIOS(
        uri,
        dest,
        dimensions?.width ?? 0,
        dimensions?.height ?? 0,
        1,
        ext,
      );
      return dest;
    }

    if (Platform.OS === 'android' && uri.startsWith('file:///android_asset/')) {
      const assetPath = uri.replace('file:///android_asset/', '');
      const ext = guessImageExtension(assetPath, 'png');
      const dest = `${
        RNFS.CachesDirectoryPath
      }/artifex_asset_${Date.now()}.${ext}`;
      await RNFS.copyFileAssets(assetPath, dest);
      return dest;
    }

    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      const ext = guessImageExtension(uri, 'jpg');
      const dest = `${
        RNFS.TemporaryDirectoryPath
      }/artifex_remote_${Date.now()}.${ext}`;
      const downloadResult = await RNFS.downloadFile({
        fromUrl: uri,
        toFile: dest,
      }).promise;

      if (downloadResult.statusCode && downloadResult.statusCode >= 400) {
        throw new Error(
          `Download failed with status ${downloadResult.statusCode}`,
        );
      }

      return dest;
    }

    const normalized = stripFileScheme(uri);
    const exists = await RNFS.exists(normalized);
    if (exists) {
      return normalized;
    }

    return normalized;
  } catch (error) {
    console.error('Failed to resolve image URI:', uri, error);
    return null;
  }
};

const loadImage = async (
  uri: string,
  dimensions?: { width: number; height: number },
): Promise<SkImage | null> => {
  try {
    const resolved = await resolveImageUriToPath(uri, dimensions);
    if (!resolved) {
      return null;
    }

    if (resolved.startsWith('data:image/')) {
      const base64 = resolved.split(',')[1] ?? '';
      const data = Skia.Data.fromBase64(base64);
      return Skia.Image.MakeImageFromEncoded(data);
    }

    const normalized = stripFileScheme(resolved);
    const base64 = await RNFS.readFile(normalized, 'base64');
    const data = Skia.Data.fromBase64(base64);
    return Skia.Image.MakeImageFromEncoded(data);
  } catch (error) {
    console.error('Failed to load image:', uri, error);
    return null;
  }
};

const getCanvasScale = (
  sourceDimensions: { width: number; height: number },
  canvasSize: { width: number; height: number } | null,
): CanvasScale => {
  if (!canvasSize || canvasSize.width <= 0 || canvasSize.height <= 0) {
    console.warn(
      'getCanvasScale: Invalid canvasSize, returning 1:1 scale. This may cause incorrect export sizing.',
    );
    return { x: 1, y: 1 };
  }

  const scaleX = sourceDimensions.width / canvasSize.width;
  const scaleY = sourceDimensions.height / canvasSize.height;

  return {
    x: Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1,
    y: Number.isFinite(scaleY) && scaleY > 0 ? scaleY : 1,
  };
};

const drawSourceImage = (
  canvas: SkCanvas,
  image: SkImage,
  width: number,
  height: number,
  filter?: ImageFilter | null,
) => {
  const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  const dstRect = Skia.XYWHRect(0, 0, width, height);
  const paint = Skia.Paint();
  paint.setAntiAlias(true);

  const colorMatrix = getFilterColorMatrix(filter);
  if (colorMatrix) {
    const colorFilter = Skia.ColorFilter.MakeMatrix(colorMatrix);
    if (colorFilter) {
      paint.setColorFilter(colorFilter);
    }
  }

  canvas.drawImageRect(image, srcRect, dstRect, paint);
};

const drawCanvasElement = async (
  canvas: SkCanvas,
  element: CanvasElement,
  scale: CanvasScale,
): Promise<void> => {
  const drawTextWithTransform = async () => {
    const layout = measureTextLayout(element, scale);
    if (!layout) {
      console.warn(
        'Export: skipped text element - failed to measure layout',
        element.id,
        element.textContent,
      );
      return;
    }
    await withElementTransform(
      canvas,
      element,
      {
        width: layout.totalWidth,
        height: layout.totalHeight,
      },
      scale,
      async () => {
        drawTextElement(canvas, element, layout);
      },
    );
  };

  switch (element.type) {
    case 'text': {
      await drawTextWithTransform();
      break;
    }
    case 'watermark': {
      if (!element.assetPath && element.textContent) {
        await drawTextWithTransform();
        break;
      }
      // Fall through to image-based handling when assetPath is present
    }
    case 'sticker':
    case 'stamp': {
      if (!element.assetPath) {
        return;
      }
      const width = (element.width || 100) * scale.x;
      const height = (element.height || 100) * scale.y;
      await withElementTransform(
        canvas,
        element,
        { width, height },
        scale,
        async () => {
          await drawImageElement(canvas, element, { width, height });
        },
      );
      break;
    }
    default:
      break;
  }
};

const withElementTransform = async (
  canvas: SkCanvas,
  element: CanvasElement,
  size: ElementSize,
  scale: CanvasScale,
  draw: () => Promise<void>,
): Promise<void> => {
  const { position } = element;
  const x = (position?.x ?? 0) * scale.x;
  const y = (position?.y ?? 0) * scale.y;
  const rotationDegrees = ((element.rotation ?? 0) * 180) / Math.PI;
  const scaleValue = element.scale ?? 1;
  const safeScale = Math.max(scaleValue, 0.0001);

  const pivotX = size.width / 2;
  const pivotY = size.height / 2;

  canvas.save();
  canvas.translate(x + pivotX, y + pivotY);
  if (rotationDegrees !== 0) {
    canvas.rotate(rotationDegrees);
  }
  if (safeScale !== 1) {
    canvas.scale(safeScale, safeScale);
  }
  canvas.translate(-pivotX, -pivotY);

  await draw();
  canvas.restore();
};

const measureTextLayout = (
  element: CanvasElement,
  scale: CanvasScale,
): TextLayout | null => {
  const text = element.textContent ?? '';
  if (!text) {
    return null;
  }

  const baseFontSize = element.fontSize ?? 24;
  const scaledFontSize = baseFontSize * scale.x;
  const font = createFont(scaledFontSize, element.fontFamily);
  if (!font) {
    return null;
  }
  const measurement = font.measureText(text);
  const metrics = font.getMetrics();

  const textWidth = measurement.width || scaledFontSize;
  const textHeight =
    metrics.descent - metrics.ascent > 0
      ? metrics.descent - metrics.ascent
      : scaledFontSize;
  const baseline = -metrics.ascent;

  const paddingX = Math.max(baseFontSize * 0.25, 8) * scale.x;
  const paddingY = Math.max(baseFontSize * 0.2, 6) * scale.y;

  const totalWidth = textWidth + paddingX * 2;
  const totalHeight = textHeight + paddingY * 2;

  return {
    font,
    text,
    fontSize: scaledFontSize,
    textWidth,
    textHeight,
    totalWidth,
    totalHeight,
    baseline,
    paddedBaseline: baseline + paddingY,
    paddingX,
    paddingY,
  };
};

const drawTextElement = (
  canvas: SkCanvas,
  element: CanvasElement,
  layout: TextLayout,
) => {
  const { text, font, fontSize, totalWidth, totalHeight } = layout;
  const baseColor = element.color || '#FFFFFF';
  const opacity = Math.max(0, Math.min(element.opacity ?? 1, 1));

  if (element.textBackground) {
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setAntiAlias(true);
    backgroundPaint.setColor(Skia.Color(element.textBackground));
    backgroundPaint.setAlphaf(opacity);
    canvas.drawRoundRect(
      Skia.XYWHRect(0, 0, totalWidth, totalHeight),
      fontSize * 0.25,
      fontSize * 0.25,
      backgroundPaint,
    );
  }

  drawTextEffects(canvas, element, layout, baseColor, font, opacity);

  const textPaint = Skia.Paint();
  textPaint.setAntiAlias(true);
  textPaint.setColor(Skia.Color(baseColor));
  textPaint.setAlphaf(opacity);
  canvas.drawText(
    text,
    layout.paddingX,
    layout.paddedBaseline,
    textPaint,
    font,
  );
};

const drawTextEffects = (
  canvas: SkCanvas,
  element: CanvasElement,
  layout: TextLayout,
  baseColor: string,
  font: ReturnType<typeof Skia.Font>,
  opacity: number,
) => {
  const textX = layout.paddingX;
  const textY = layout.paddedBaseline;

  switch (element.textEffect) {
    case 'neon':
      drawGlow(canvas, layout.text, textX, textY, font, baseColor, opacity, {
        radius: layout.fontSize * 0.65,
        opacity: 0.35,
      });
      drawGlow(canvas, layout.text, textX, textY, font, baseColor, opacity, {
        radius: layout.fontSize * 0.35,
        opacity: 0.55,
      });
      break;
    case 'glow':
      drawGlow(canvas, layout.text, textX, textY, font, baseColor, opacity, {
        radius: layout.fontSize * 0.45,
        opacity: 0.4,
      });
      break;
    case 'shadow':
      drawShadow(
        canvas,
        layout.text,
        textX,
        textY,
        font,
        layout.fontSize,
        opacity,
      );
      break;
    case 'outline':
      drawOutline(
        canvas,
        layout.text,
        textX,
        textY,
        font,
        layout.fontSize,
        opacity,
      );
      break;
    default:
      break;
  }
};

const drawGlow = (
  canvas: SkCanvas,
  text: string,
  x: number,
  y: number,
  font: ReturnType<typeof Skia.Font>,
  color: string,
  baseOpacity: number,
  options: { radius: number; opacity: number },
) => {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  paint.setAlphaf(Math.max(0, Math.min(options.opacity * baseOpacity, 1)));

  const maskFilter = Skia.MaskFilter.MakeBlur(
    Skia.BlurStyle.Normal,
    Math.max(options.radius, 0.1),
    true,
  );
  if (maskFilter) {
    paint.setMaskFilter(maskFilter);
  }

  canvas.drawText(text, x, y, paint, font);
};

const drawShadow = (
  canvas: SkCanvas,
  text: string,
  x: number,
  y: number,
  font: ReturnType<typeof Skia.Font>,
  fontSize: number,
  baseOpacity: number,
) => {
  const offset = Math.max(fontSize * 0.15, 2);
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color('#000000'));
  paint.setAlphaf(0.6 * baseOpacity);
  canvas.drawText(text, x + offset, y + offset, paint, font);
};

const drawOutline = (
  canvas: SkCanvas,
  text: string,
  x: number,
  y: number,
  font: ReturnType<typeof Skia.Font>,
  fontSize: number,
  baseOpacity: number,
) => {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color('#000000'));
  paint.setAlphaf(0.85 * baseOpacity);

  const offsets = [-1, 0, 1];
  const distance = Math.max(fontSize * 0.08, 1);

  for (const dx of offsets) {
    for (const dy of offsets) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      canvas.drawText(text, x + dx * distance, y + dy * distance, paint, font);
    }
  }
};

const drawImageElement = async (
  canvas: SkCanvas,
  element: CanvasElement,
  size: ElementSize,
): Promise<void> => {
  if (!element.assetPath) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(
        'Export debug - skipping element (no assetPath):',
        element.id,
        element.type,
      );
    }
    return;
  }

  const image = await getImageFromCache(element.assetPath);
  if (!image) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(
        'Export debug - failed to load image:',
        element.id,
        element.assetPath,
      );
    }
    return;
  }

  if (
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    element.type === 'watermark'
  ) {
    console.log('Export debug - drawing watermark:', {
      id: element.id,
      opacity: element.opacity,
      size,
      assetPath: element.assetPath,
    });
  }

  const paint = Skia.Paint();
  paint.setAntiAlias(true);

  // Apply opacity if specified (for watermarks and other elements)
  if (element.opacity !== undefined && element.opacity < 1) {
    paint.setAlphaf(Math.max(0, Math.min(element.opacity, 1)));
  }

  const srcRect = Skia.XYWHRect(0, 0, image.width(), image.height());
  const dstRect = Skia.XYWHRect(0, 0, size.width, size.height);
  canvas.drawImageRect(image, srcRect, dstRect, paint);
};

const drawWatermark = (
  canvas: SkCanvas,
  canvasWidth: number,
  canvasHeight: number,
  scale: CanvasScale,
) => {
  const scaleFactor = Math.max(scale.x, scale.y);
  const font = createFont(WATERMARK_FONT_SIZE * scaleFactor);
  if (!font) {
    return;
  }
  const metrics = font.getMetrics();
  const textWidth = font.measureText(ARTIFEX_WATERMARK_TEXT).width;
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color('#FFFFFF'));
  paint.setAlphaf(WATERMARK_OPACITY);

  const paddingX = WATERMARK_PADDING * scale.x;
  const paddingY = WATERMARK_PADDING * scale.y;

  const x = canvasWidth - textWidth - paddingX;
  const baseline = canvasHeight - paddingY - metrics.descent;
  canvas.drawText(ARTIFEX_WATERMARK_TEXT, x, baseline, paint, font);
};
