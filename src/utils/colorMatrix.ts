import { ImageFilter } from '../types';

type Matrix = readonly number[];

// Identity matrix for color transforms
const IDENTITY_MATRIX: Matrix = [
  1,
  0,
  0,
  0,
  0, //
  0,
  1,
  0,
  0,
  0, //
  0,
  0,
  1,
  0,
  0, //
  0,
  0,
  0,
  1,
  0,
];

// Clamp helper to keep values within a safe range
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const to5x5 = (matrix: Matrix): number[][] => [
  [matrix[0], matrix[1], matrix[2], matrix[3], matrix[4]],
  [matrix[5], matrix[6], matrix[7], matrix[8], matrix[9]],
  [matrix[10], matrix[11], matrix[12], matrix[13], matrix[14]],
  [matrix[15], matrix[16], matrix[17], matrix[18], matrix[19]],
  [0, 0, 0, 0, 1],
];

const from5x5 = (matrix: number[][]): Matrix => {
  const result: number[] = new Array(20);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      result[row * 5 + col] = matrix[row][col];
    }
  }
  return result as Matrix;
};

const multiplyMatrices = (a: Matrix, b: Matrix): Matrix => {
  const A = to5x5(a);
  const B = to5x5(b);
  const result = Array.from({ length: 5 }, () => new Array(5).fill(0));

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      let sum = 0;
      for (let k = 0; k < 5; k += 1) {
        sum += A[row][k] * B[k][col];
      }
      result[row][col] = sum;
    }
  }

  return from5x5(result);
};

const composeMatrices = (...matrices: Matrix[]): Matrix => {
  if (matrices.length === 0) {
    return IDENTITY_MATRIX;
  }

  return matrices.reduce<Matrix>(
    (acc, matrix) => multiplyMatrices(matrix, acc),
    IDENTITY_MATRIX,
  );
};

const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

const saturationMatrix = (value: number): Matrix => {
  const s = clamp(value, 0, 3);
  const inv = 1 - s;

  const r = inv * LUMA_R;
  const g = inv * LUMA_G;
  const b = inv * LUMA_B;

  return [
    r + s,
    g,
    b,
    0,
    0,
    r,
    g + s,
    b,
    0,
    0,
    r,
    g,
    b + s,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ] as Matrix;
};

const contrastMatrix = (value: number): Matrix => {
  const c = clamp(value, 0, 4);
  const t = 0.5 * (1 - c);

  return [
    c,
    0,
    0,
    0,
    t,
    0,
    c,
    0,
    0,
    t,
    0,
    0,
    c,
    0,
    t,
    0,
    0,
    0,
    1,
    0,
  ] as Matrix;
};

const brightnessMatrix = (value: number): Matrix => {
  const offset = clamp(value, -1, 1);

  return [
    1,
    0,
    0,
    0,
    offset,
    0,
    1,
    0,
    0,
    offset,
    0,
    0,
    1,
    0,
    offset,
    0,
    0,
    0,
    1,
    0,
  ] as Matrix;
};

const rgbScaleMatrix = (red: number, green: number, blue: number): Matrix => {
  const r = clamp(red, 0, 4);
  const g = clamp(green, 0, 4);
  const b = clamp(blue, 0, 4);

  return [
    r,
    0,
    0,
    0,
    0,
    0,
    g,
    0,
    0,
    0,
    0,
    0,
    b,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ] as Matrix;
};

const channelOffsetMatrix = (
  red: number,
  green: number,
  blue: number,
): Matrix => {
  const r = clamp(red, -1, 1);
  const g = clamp(green, -1, 1);
  const b = clamp(blue, -1, 1);

  return [
    1,
    0,
    0,
    0,
    r,
    0,
    1,
    0,
    0,
    g,
    0,
    0,
    1,
    0,
    b,
    0,
    0,
    0,
    1,
    0,
  ] as Matrix;
};

const instagramMatrices: Partial<Record<ImageFilter['type'], Matrix>> = {
  juno: composeMatrices(
    saturationMatrix(1.25),
    contrastMatrix(1.12),
    rgbScaleMatrix(1.15, 1.0, 1.2),
    channelOffsetMatrix(0.03, 0.0, 0.02),
  ),
  gingham: composeMatrices(
    saturationMatrix(0.9),
    contrastMatrix(0.95),
    brightnessMatrix(0.05),
    rgbScaleMatrix(1.05, 1.08, 1.12),
    channelOffsetMatrix(-0.01, 0.01, 0.03),
  ),
  clarendon: composeMatrices(
    saturationMatrix(1.2),
    contrastMatrix(1.25),
    rgbScaleMatrix(1.05, 1.05, 1.18),
    channelOffsetMatrix(0.02, 0.0, 0.04),
  ),
  lark: composeMatrices(
    saturationMatrix(1.1),
    contrastMatrix(1.08),
    brightnessMatrix(0.04),
    rgbScaleMatrix(0.98, 1.06, 1.12),
    channelOffsetMatrix(0.0, 0.02, 0.05),
  ),
  ludwig: composeMatrices(
    saturationMatrix(0.85),
    contrastMatrix(1.1),
    rgbScaleMatrix(1.18, 1.05, 0.92),
    channelOffsetMatrix(0.04, 0.02, -0.02),
  ),
  xproii: composeMatrices(
    saturationMatrix(1.3),
    contrastMatrix(1.35),
    rgbScaleMatrix(1.25, 1.05, 0.9),
    channelOffsetMatrix(0.02, -0.01, -0.02),
  ),
  lofi: composeMatrices(
    saturationMatrix(1.7),
    contrastMatrix(1.55),
    brightnessMatrix(-0.05),
    rgbScaleMatrix(1.18, 1.1, 1.02),
    channelOffsetMatrix(0.02, -0.01, -0.03),
  ),
  mayfair: composeMatrices(
    saturationMatrix(1.2),
    contrastMatrix(1.12),
    brightnessMatrix(0.06),
    rgbScaleMatrix(1.12, 1.02, 0.95),
    channelOffsetMatrix(0.03, 0.0, 0.02),
  ),
  sierra: composeMatrices(
    saturationMatrix(1.05),
    contrastMatrix(0.95),
    brightnessMatrix(0.05),
    rgbScaleMatrix(1.08, 1.02, 0.95),
    channelOffsetMatrix(0.02, 0.01, 0.0),
  ),
  tattoo: composeMatrices(
    saturationMatrix(1.35),
    contrastMatrix(1.45),
    brightnessMatrix(-0.04),
    rgbScaleMatrix(1.2, 1.1, 1.05),
    channelOffsetMatrix(0.02, -0.01, -0.03),
  ),
  inkwell: composeMatrices(
    saturationMatrix(0),
    contrastMatrix(1.2),
    brightnessMatrix(0.01),
  ),
  rise: composeMatrices(
    saturationMatrix(0.92),
    contrastMatrix(0.98),
    brightnessMatrix(0.08),
    rgbScaleMatrix(1.1, 1.02, 0.9),
    channelOffsetMatrix(0.04, 0.02, -0.01),
  ),
};

// Base matrices tuned for each supported filter type.
// Values stay within the expected Skia range to avoid clipping when exporting.
const BASE_FILTER_MATRICES: Partial<Record<ImageFilter['type'], Matrix>> = {
  bw: composeMatrices(saturationMatrix(0), contrastMatrix(1.1)),
  sepia: composeMatrices(
    saturationMatrix(0.4),
    contrastMatrix(1.05),
    rgbScaleMatrix(1.05, 0.95, 0.82),
    channelOffsetMatrix(0.02, 0.0, -0.02),
  ),
  vintage: composeMatrices(
    saturationMatrix(0.8),
    contrastMatrix(0.9),
    brightnessMatrix(0.04),
    rgbScaleMatrix(1.08, 0.98, 0.88),
  ),
  cool: composeMatrices(
    saturationMatrix(1.05),
    contrastMatrix(1.05),
    rgbScaleMatrix(0.95, 1.05, 1.2),
    channelOffsetMatrix(-0.01, 0.0, 0.03),
  ),
  warm: composeMatrices(
    saturationMatrix(1.05),
    contrastMatrix(1.05),
    rgbScaleMatrix(1.2, 1.05, 0.9),
    channelOffsetMatrix(0.03, 0.02, -0.01),
  ),
  ...instagramMatrices,
};

const mixMatrices = (from: Matrix, to: Matrix, amount: number): number[] => {
  const result: number[] = new Array(from.length);
  for (let i = 0; i < from.length; i += 1) {
    const start = from[i];
    const end = to[i];
    result[i] = start + (end - start) * amount;
  }
  return result;
};

export const getFilterColorMatrix = (
  filter?: ImageFilter | null,
): number[] | null => {
  if (!filter || filter.type === 'none') {
    return null;
  }

  const baseMatrix = BASE_FILTER_MATRICES[filter.type];
  if (!baseMatrix) {
    return null;
  }

  const intensity = clamp(filter.intensity ?? 1, 0, 1);
  if (intensity <= 0) {
    return Array.from(IDENTITY_MATRIX);
  }

  if (intensity >= 1) {
    return Array.from(baseMatrix);
  }

  return mixMatrices(IDENTITY_MATRIX, baseMatrix, intensity);
};
