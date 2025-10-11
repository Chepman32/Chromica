// Utility functions for creating canvas elements

import { CanvasElement } from '../types';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const createTextElement = (
  text: string,
  fontFamily: string,
  fontSize: number,
  color: string,
  x: number = 0,
  y: number = 0,
  textEffect: 'none' | 'neon' | 'glow' | 'shadow' | 'outline' = 'none',
  textBackground: string | null = null,
): CanvasElement => {
  return {
    id: generateId(),
    type: 'text',
    textContent: text,
    fontFamily,
    fontSize,
    color,
    textEffect,
    textBackground,
    position: { x, y },
    scale: 1,
    rotation: 0,
    width: 200,
    height: fontSize * 1.5,
  };
};

export const createStickerElement = (
  assetPath: string,
  x: number = 0,
  y: number = 0,
  width: number = 100,
  height: number = 100,
): CanvasElement => {
  return {
    id: generateId(),
    type: 'sticker',
    assetPath,
    position: { x, y },
    scale: 1,
    rotation: 0,
    width,
    height,
  };
};

export const createWatermarkElement = (
  assetPath: string,
  x: number = 0,
  y: number = 0,
  width: number = 150,
  height: number = 50,
): CanvasElement => {
  return {
    id: generateId(),
    type: 'watermark',
    assetPath,
    position: { x, y },
    scale: 1,
    rotation: 0,
    width,
    height,
  };
};

export const createStampElement = (
  assetPath: string,
  x: number = 0,
  y: number = 0,
  width: number = 80,
  height: number = 80,
): CanvasElement => {
  return {
    id: generateId(),
    type: 'stamp',
    assetPath,
    position: { x, y },
    scale: 1,
    rotation: 0,
    width,
    height,
  };
};
