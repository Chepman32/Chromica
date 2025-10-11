/**
 * Core image processing engine
 */

import {
  Skia,
  SkImage,
  SkSurface,
  SkPaint,
  ImageFormat,
} from '@shopify/react-native-skia';
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
      const width = Math.floor(image.width() * quality);
      const height = Math.floor(image.height() * quality);

      const surface = Skia.Surface.Make(width, height);
      if (!surface) return null;

      const canvas = surface.getCanvas();
      const paint = Skia.Paint();

      // Load shader if available
      if (effect.shaderPath) {
        const shader = ShaderManager.loadShader(effect.shaderPath);
        if (shader) {
          const uniforms = this.buildUniforms(effect, params, width, height);
          const runtimeShader = shader.makeShader(uniforms);
          paint.setShader(runtimeShader);
        }
      }

      // Draw image with effect
      canvas.drawImage(image, 0, 0, paint);

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

    for (const layer of layers) {
      if (!layer.visible) continue;

      const effect = effects.find(e => e.id === layer.effectId);
      if (!effect) continue;

      const processed = this.applyEffect(result, effect, layer.params, quality);
      if (processed) {
        result = processed;
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
      }/chromica_${Date.now()}.${format}`;
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
  ): number[] {
    const uniforms: number[] = [];

    // Add resolution (common for most shaders)
    uniforms.push(width, height);

    // Add effect-specific parameters
    effect.parameters.forEach(param => {
      const value = params[param.name] ?? param.default;

      if (typeof value === 'number') {
        uniforms.push(value);
      } else if (typeof value === 'string') {
        // Convert string options to indices
        if (param.options) {
          const index = param.options.indexOf(value);
          uniforms.push(index >= 0 ? index : 0);
        }
      }
    });

    return uniforms;
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
