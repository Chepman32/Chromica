/**
 * Core image processing engine
 */

import {
  Skia,
  SkImage,
  SkSurface,
  SkPaint,
  ImageFormat,
  FilterMode,
  MipmapMode,
  TileMode,
} from '@shopify/react-native-skia';
import type { SkRuntimeEffect } from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import { Effect, EffectLayer } from '../effects/types';
import { ShaderManager } from '../shader-manager/ShaderManager';

export enum PreviewQuality {
  LOW = 0.25,
  MEDIUM = 0.5,
  HIGH = 1.0,
}

export class ImageProcessor {
  /**
   * Load image from URI
   */
  static async loadImage(uri: string): Promise<SkImage | null> {
    try {
      const data = await RNFS.readFile(uri, 'base64');
      const imageData = Skia.Data.fromBase64(data);
      return Skia.Image.MakeImageFromEncoded(imageData);
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  }

  /**
   * Apply single effect to image
   */
  static applyEffect(
    image: SkImage,
    effect: Effect,
    params: Record<string, any>,
    quality: PreviewQuality = PreviewQuality.HIGH,
  ): SkImage | null {
    try {
      const width = Math.max(1, Math.floor(image.width() * quality));
      const height = Math.max(1, Math.floor(image.height() * quality));

      const offscreenSurface = Skia.Surface.MakeOffscreen(width, height);
      const surface = offscreenSurface || Skia.Surface.Make(width, height);
      if (!surface) return null;
      const sourceImage = offscreenSurface
        ? image
        : image.makeNonTextureImage();

      const canvas = surface.getCanvas();
      const paint = Skia.Paint();

      // Load shader if available
      if (effect.shaderPath) {
        const shader = ShaderManager.loadShader(effect.shaderPath);
        if (shader) {
          const uniforms = this.buildUniforms(
            effect,
            params,
            width,
            height,
            shader,
          );
          const scaleMatrix = Skia.Matrix().scale(
            sourceImage.width() / width,
            sourceImage.height() / height,
          );
          const imageShader = sourceImage.makeShaderOptions(
            TileMode.Clamp,
            TileMode.Clamp,
            FilterMode.Linear,
            MipmapMode.None,
            scaleMatrix,
          );
          const runtimeShader = shader.makeShaderWithChildren(uniforms, [
            imageShader,
          ]);
          paint.setShader(runtimeShader);
          canvas.drawRect(Skia.XYWHRect(0, 0, width, height), paint);
          return surface.makeImageSnapshot();
        }
      }

      // Draw image with effect
      canvas.drawImage(sourceImage, 0, 0, paint);

      return surface.makeImageSnapshot();
    } catch (error) {
      console.error('Error applying effect:', error);
      return null;
    }
  }

  /**
   * Apply effect stack (multiple layers)
   */
  static applyEffectStack(
    image: SkImage,
    layers: EffectLayer[],
    effects: Effect[],
    quality: PreviewQuality = PreviewQuality.HIGH,
  ): SkImage | null {
    let result = image;
    let appliedOnce = false;

    for (const layer of layers) {
      if (!layer.visible) continue;

      const effect = effects.find(e => e.id === layer.effectId);
      if (!effect) continue;

      const processed = this.applyEffect(
        result,
        effect,
        layer.params,
        appliedOnce ? PreviewQuality.HIGH : quality,
      );
      if (processed) {
        result = processed;
        appliedOnce = true;
      }
    }

    return result;
  }

  /**
   * Export image to file
   */
  static async exportImage(
    image: SkImage,
    format: 'jpeg' | 'png' | 'webp' = 'jpeg',
    quality: number = 80,
  ): Promise<string | null> {
    try {
      const imageFormat =
        format === 'jpeg'
          ? ImageFormat.JPEG
          : format === 'png'
          ? ImageFormat.PNG
          : ImageFormat.WEBP;

      const encoded = image.encodeToBytes(imageFormat, quality);
      if (!encoded) return null;

      const path = `${
        RNFS.CachesDirectoryPath
      }/pixelfx_${Date.now()}.${format}`;
      await RNFS.writeFile(path, encoded.toBase64(), 'base64');

      return path;
    } catch (error) {
      console.error('Error exporting image:', error);
      return null;
    }
  }

  /**
   * Build shader uniforms from effect parameters
   */
  private static buildUniforms(
    effect: Effect,
    params: Record<string, any>,
    width: number,
    height: number,
    runtimeEffect: SkRuntimeEffect,
  ): number[] {
    const normalizedParams = this.normalizeParams(effect, params);
    const uniformCount = runtimeEffect.getUniformCount();
    const floatCount = runtimeEffect.getUniformFloatCount();
    const uniforms = new Array(floatCount).fill(0);

    for (let i = 0; i < uniformCount; i++) {
      const name = runtimeEffect.getUniformName(i);
      const info = runtimeEffect.getUniform(i);
      const size = info.columns * info.rows;
      const values = this.resolveUniformValue(
        name,
        size,
        normalizedParams,
        width,
        height,
      );

      for (let j = 0; j < size; j++) {
        const raw = values[j] ?? 0;
        uniforms[info.slot + j] = info.isInteger ? Math.round(raw) : raw;
      }
    }

    return uniforms;
  }

  private static normalizeParams(
    effect: Effect,
    params: Record<string, any>,
  ): Record<string, number> {
    const normalized: Record<string, number> = {};

    effect.parameters.forEach(param => {
      const value = params[param.name] ?? param.default;

      if (typeof value === 'number') {
        normalized[param.name] = value;
      } else if (typeof value === 'boolean') {
        normalized[param.name] = value ? 1 : 0;
      } else if (typeof value === 'string' && param.options) {
        const index = param.options.indexOf(value);
        normalized[param.name] = index >= 0 ? index : 0;
      }
    });

    return normalized;
  }

  private static resolveUniformValue(
    name: string,
    size: number,
    params: Record<string, number>,
    width: number,
    height: number,
  ): number[] {
    if (name === 'resolution') {
      return [width, height].slice(0, size);
    }

    if (name === 'center') {
      return [0.5, 0.5].slice(0, size);
    }

    if (name === 'offset') {
      const offsetX = params.offsetX ?? 0;
      const offsetY = params.offsetY ?? 0;
      return [offsetX, offsetY].slice(0, size);
    }

    const value = params[name];
    if (typeof value === 'number') {
      return [value].slice(0, size);
    }

    return new Array(size).fill(0);
  }

  /**
   * Determine preview quality based on effect complexity and interaction state
   */
  static getAdaptiveQuality(
    effect: Effect,
    isInteracting: boolean,
  ): PreviewQuality {
    if (isInteracting) {
      return effect.complexity > 0.7
        ? PreviewQuality.LOW
        : PreviewQuality.MEDIUM;
    }
    return PreviewQuality.HIGH;
  }
}
