export type ContainedImageBoundsInput = {
  imageWidth: number;
  imageHeight: number;
  containerX: number;
  containerY: number;
  containerWidth: number;
  containerHeight: number;
};

export type ImageBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const calculateContainedImageBounds = ({
  imageWidth,
  imageHeight,
  containerX,
  containerY,
  containerWidth,
  containerHeight,
}: ContainedImageBoundsInput): ImageBounds => {
  if (imageWidth <= 0 || imageHeight <= 0) {
    return {
      x: containerX,
      y: containerY,
      width: containerWidth,
      height: containerHeight,
    };
  }

  const scale = Math.min(
    containerWidth / imageWidth,
    containerHeight / imageHeight,
  );
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    x: containerX + (containerWidth - width) / 2,
    y: containerY + (containerHeight - height) / 2,
    width,
    height,
  };
};
