import { calculateContainedImageBounds } from '../imageBounds';

describe('calculateContainedImageBounds', () => {
  it('centers a portrait image without including vertical letterbox space', () => {
    const bounds = calculateContainedImageBounds({
      imageWidth: 300,
      imageHeight: 400,
      containerX: 0,
      containerY: 0,
      containerWidth: 400,
      containerHeight: 600,
    });

    expect(bounds.x).toBeCloseTo(0);
    expect(bounds.y).toBeCloseTo(100 / 3);
    expect(bounds.width).toBeCloseTo(400);
    expect(bounds.height).toBeCloseTo(1600 / 3);
  });

  it('centers a landscape image without including horizontal letterbox space', () => {
    expect(
      calculateContainedImageBounds({
        imageWidth: 1600,
        imageHeight: 900,
        containerX: 0,
        containerY: 0,
        containerWidth: 400,
        containerHeight: 600,
      }),
    ).toEqual({ x: 0, y: 187.5, width: 400, height: 225 });
  });

  it('preserves the container origin when centering the image', () => {
    expect(
      calculateContainedImageBounds({
        imageWidth: 100,
        imageHeight: 100,
        containerX: 10,
        containerY: 20,
        containerWidth: 300,
        containerHeight: 200,
      }),
    ).toEqual({ x: 60, y: 20, width: 200, height: 200 });
  });

  it('falls back to the container bounds for invalid image dimensions', () => {
    expect(
      calculateContainedImageBounds({
        imageWidth: 0,
        imageHeight: 0,
        containerX: 10,
        containerY: 20,
        containerWidth: 300,
        containerHeight: 200,
      }),
    ).toEqual({ x: 10, y: 20, width: 300, height: 200 });
  });
});
