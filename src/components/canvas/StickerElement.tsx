// Interactive sticker element on canvas

import React from 'react';
import { StyleSheet, Image } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { Colors } from '../../constants/colors';

interface StickerElementProps {
  id: string;
  uri: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  width?: number;
  height?: number;
  opacity?: number;
  isSelected: boolean;
  canvasBounds?: { width: number; height: number };
  onSelect: () => void;
  onUpdate: (transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }) => void;
}

export const StickerElement: React.FC<StickerElementProps> = ({
  uri,
  x,
  y,
  scale = 1,
  rotation = 0,
  width = 100,
  height = 100,
  opacity = 1,
  isSelected,
  canvasBounds,
  onSelect,
  onUpdate,
}) => {
  const { gesture, animatedStyle, scaleValue } = useCanvasGestures({
    initialX: x,
    initialY: y,
    initialScale: scale,
    initialRotation: rotation,
    elementWidth: width,
    elementHeight: height,
    canvasBounds,
    onUpdate,
    onSelect,
  });

  const selectionBorderStyle = useAnimatedStyle(() => {
    const currentScale = scaleValue.value || 1;
    const normalizedScale = Math.max(currentScale, 0.001);
    return {
      borderWidth: 2 / normalizedScale,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.container, { width, height, opacity }, animatedStyle]}
      >
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />

        {/* Selection indicators */}
        {isSelected && (
          <Animated.View
            style={[styles.selectionBorder, selectionBorderStyle]}
          />
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderColor: Colors.accent.primary,
    borderStyle: 'dashed',
    borderRadius: 4,
  },
});
