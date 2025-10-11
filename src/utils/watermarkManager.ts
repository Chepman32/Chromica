// Watermark manager - Core logic for applying presets and generating watermarks

import {
  WatermarkInstance,
  WatermarkPreset,
  WatermarkPattern,
} from '../types/watermark';
import { CanvasElement } from '../types';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface CanvasSize {
  width: number;
  height: number;
}

export class WatermarkManager {
  /**
   * Apply a preset to generate watermark instances
   */
  static applyPreset(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image' = 'text',
  ): WatermarkInstance[] {
    const { pattern, config } = preset;

    switch (pattern) {
      case 'grid':
        return this.generateGridPattern(preset, canvasSize, content, type);
      case 'diagonal':
        return this.generateDiagonalPattern(preset, canvasSize, content, type);
      case 'scattered':
        return this.generateScatteredPattern(preset, canvasSize, content, type);
      case 'corners':
        return this.generateCornersPattern(preset, canvasSize, content, type);
      case 'edges':
        return this.generateEdgesPattern(preset, canvasSize, content, type);
      case 'center':
        return this.generateCenterPattern(preset, canvasSize, content, type);
      case 'single':
        return this.generateSinglePattern(preset, canvasSize, content, type);
      default:
        return [];
    }
  }

  /**
   * Generate grid pattern watermarks
   */
  private static generateGridPattern(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image',
  ): WatermarkInstance[] {
    const { config } = preset;
    const watermarks: WatermarkInstance[] = [];
    const spacing = config.spacing || 100;

    const cols = Math.ceil(canvasSize.width / spacing);
    const rows = Math.ceil(canvasSize.height / spacing);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;

        watermarks.push(
          this.createWatermarkInstance(preset, canvasSize, content, type, {
            x,
            y,
          }),
        );
      }
    }

    return watermarks.slice(0, config.count);
  }

  /**
   * Generate diagonal pattern watermarks
   */
  private static generateDiagonalPattern(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image',
  ): WatermarkInstance[] {
    const { config } = preset;
    const watermarks: WatermarkInstance[] = [];
    const spacing = config.spacing || 120;

    // Calculate diagonal length
    const diagonalLength = Math.sqrt(
      canvasSize.width ** 2 + canvasSize.height ** 2,
    );
    const count = Math.min(config.count, Math.ceil(diagonalLength / spacing));

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      const x = t * canvasSize.width;
      const y = t * canvasSize.height;

      watermarks.push(
        this.createWatermarkInstance(preset, canvasSize, content, type, {
          x,
          y,
        }),
      );
    }

    return watermarks;
  }

  /**
   * Generate scattered pattern watermarks
   */
  private static generateScatteredPattern(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image',
  ): WatermarkInstance[] {
    const { config } = preset;
    const watermarks: WatermarkInstance[] = [];

    // Use seeded random for consistent placement
    const seed = 12345;
    let random = seed;
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    for (let i = 0; i < config.count; i++) {
      const x = seededRandom() * canvasSize.width;
      const y = seededRandom() * canvasSize.height;

      watermarks.push(
        this.createWatermarkInstance(preset, canvasSize, content, type, {
          x,
          y,
        }),
      );
    }

    return watermarks;
  }

  /**
   * Generate corner pattern watermarks
   */
  private static generateCornersPattern(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image',
  ): WatermarkInstance[] {
    const { config } = preset;
    const padding = 40;

    const positions = [
      { x: padding, y: padding }, // Top-left
      { x: canvasSize.width - padding, y: padding }, // Top-right
      { x: padding, y: canvasSize.height - padding }, // Bottom-left
      { x: canvasSize.width - padding, y: canvasSize.height - padding }, // Bottom-right
    ];

    return positions.map(pos =>
      this.createWatermarkInstance(preset, canvasSize, content, type, pos),
    );
  }

  /**
   * Generate edge pattern watermarks
   */
  private static generateEdgesPattern(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image',
  ): WatermarkInstance[] {
    const { config } = preset;
    const watermarks: WatermarkInstance[] = [];
    const spacing = config.spacing || 100;
    const padding = 30;

    // Top edge
    const topCount = Math.floor(canvasSize.width / spacing);
    for (let i = 0; i < topCount; i++) {
      const x = (i + 0.5) * spacing;
      watermarks.push(
        this.createWatermarkInstance(preset, canvasSize, content, type, {
          x,
          y: padding,
        }),
      );
    }

    // Bottom edge
    const bottomCount = Math.floor(canvasSize.width / spacing);
    for (let i = 0; i < bottomCount; i++) {
      const x = (i + 0.5) * spacing;
      watermarks.push(
        this.createWatermarkInstance(preset, canvasSize, content, type, {
          x,
          y: canvasSize.height - padding,
        }),
      );
    }

    // Left edge
    const leftCount = Math.floor(canvasSize.height / spacing);
    for (let i = 1; i < leftCount - 1; i++) {
      const y = (i + 0.5) * spacing;
      watermarks.push(
        this.createWatermarkInstance(preset, canvasSize, content, type, {
          x: padding,
          y,
        }),
      );
    }

    // Right edge
    const rightCount = Math.floor(canvasSize.height / spacing);
    for (let i = 1; i < rightCount - 1; i++) {
      const y = (i + 0.5) * spacing;
      watermarks.push(
        this.createWatermarkInstance(preset, canvasSize, content, type, {
          x: canvasSize.width - padding,
          y,
        }),
      );
    }

    return watermarks.slice(0, config.count);
  }

  /**
   * Generate center pattern watermark
   */
  private static generateCenterPattern(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image',
  ): WatermarkInstance[] {
    return [
      this.createWatermarkInstance(preset, canvasSize, content, type, {
        x: canvasSize.width / 2,
        y: canvasSize.height / 2,
      }),
    ];
  }

  /**
   * Generate single pattern watermark (bottom-right)
   */
  private static generateSinglePattern(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image',
  ): WatermarkInstance[] {
    const padding = 40;
    const alignment = preset.config.alignment || 'right';

    let x: number;
    if (alignment === 'left') {
      x = padding;
    } else if (alignment === 'center') {
      x = canvasSize.width / 2;
    } else {
      x = canvasSize.width - padding;
    }

    return [
      this.createWatermarkInstance(preset, canvasSize, content, type, {
        x,
        y: canvasSize.height - padding,
      }),
    ];
  }

  /**
   * Create a single watermark instance with randomization
   */
  private static createWatermarkInstance(
    preset: WatermarkPreset,
    canvasSize: CanvasSize,
    content: string,
    type: 'text' | 'image',
    position: { x: number; y: number },
  ): WatermarkInstance {
    const { config } = preset;

    // Apply size variation
    const sizeMultiplier = 1 + (Math.random() - 0.5) * 2 * config.sizeVariation;
    const width = config.baseSize.width * sizeMultiplier;
    const height = config.baseSize.height * sizeMultiplier;

    // Apply opacity variation
    const opacity =
      config.opacityRange.min +
      Math.random() * (config.opacityRange.max - config.opacityRange.min);

    // Apply rotation variation
    const rotation =
      config.rotationRange.min +
      Math.random() * (config.rotationRange.max - config.rotationRange.min);

    return {
      id: generateId(),
      type,
      content,
      position,
      size: { width, height },
      rotation,
      opacity,
      locked: false,
      visible: true,
      style:
        type === 'text'
          ? {
              fontFamily: 'System',
              fontSize: 16,
              color: '#FFFFFF',
              textEffect: 'none',
            }
          : undefined,
    };
  }

  /**
   * Apply global settings to all watermarks
   */
  static applyGlobalSettings(
    watermarks: WatermarkInstance[],
    settings: { opacity?: number; scale?: number; rotation?: number },
  ): WatermarkInstance[] {
    return watermarks.map(wm => ({
      ...wm,
      opacity: settings.opacity !== undefined ? settings.opacity : wm.opacity,
      size:
        settings.scale !== undefined
          ? {
              width: wm.size.width * settings.scale,
              height: wm.size.height * settings.scale,
            }
          : wm.size,
      rotation:
        settings.rotation !== undefined
          ? wm.rotation + settings.rotation
          : wm.rotation,
    }));
  }

  /**
   * Convert watermark instances to canvas elements
   */
  static toCanvasElements(
    watermarks: WatermarkInstance[],
    canvasSize?: CanvasSize,
  ): CanvasElement[] {
    const clampPosition = (
      value: number,
      size: number,
      maxDimension?: number,
    ) => {
      const min = 0;
      if (maxDimension === undefined || Number.isNaN(maxDimension)) {
        return Math.max(value, min);
      }
      const max = Math.max(maxDimension - size, min);
      return Math.min(Math.max(value, min), max);
    };

    const canvasWidth = canvasSize?.width;
    const canvasHeight = canvasSize?.height;

    return watermarks.map(wm => {
      const width = wm.size.width;
      const height = wm.size.height;

      const position = {
        x: clampPosition(wm.position.x - width / 2, width, canvasWidth),
        y: clampPosition(wm.position.y - height / 2, height, canvasHeight),
      };

      return {
        id: wm.id,
        type: wm.type === 'text' ? 'text' : 'watermark',
        position,
        scale: 1,
        rotation: (wm.rotation * Math.PI) / 180, // Convert to radians
        width,
        height,
        opacity: wm.opacity, // Include opacity for proper rendering
        ...(wm.type === 'text'
          ? {
              textContent: wm.content,
              fontFamily: wm.style?.fontFamily || 'System',
              fontSize: wm.style?.fontSize || 16,
              color: wm.style?.color || '#FFFFFF',
              textEffect: wm.style?.textEffect || 'none',
            }
          : {
              assetPath: wm.content,
            }),
      };
    });
  }
}
