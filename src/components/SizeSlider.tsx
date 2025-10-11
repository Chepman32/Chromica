// Vertical size slider for adjusting selected element size

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Colors } from '../constants/colors';
import { haptics } from '../utils/haptics';

interface SizeSliderProps {
  visible: boolean;
  initialValue: number; // 0.5 to 3.0
  onValueChange: (value: number) => void;
  onChangeEnd?: (value: number) => void; // Called when gesture ends
  position: { x: number; y: number }; // Position relative to canvas
}

const SLIDER_HEIGHT = 200;
const SLIDER_WIDTH = 40;
const THUMB_SIZE = 24;
const MIN_SCALE = 0.5;
const MAX_SCALE = 3.0;

export const SizeSlider: React.FC<SizeSliderProps> = ({
  visible,
  initialValue,
  onValueChange,
  onChangeEnd,
  position,
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(initialValue);

  // Convert scale value to slider position (0 to 1)
  const getSliderPosition = (scaleValue: number) => {
    return (scaleValue - MIN_SCALE) / (MAX_SCALE - MIN_SCALE);
  };

  React.useEffect(() => {
    const sliderPos = getSliderPosition(initialValue);
    // Center thumb on track endpoints (thumb center at track top/bottom)
    const trackRange = SLIDER_HEIGHT;
    translateY.value = withSpring(
      (1 - sliderPos) * trackRange - THUMB_SIZE / 2,
    );
    scale.value = initialValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
      runOnJS(haptics.light)();
    })
    .onUpdate(event => {
      const newY = startY.value + event.translationY;
      // Center thumb on track endpoints (thumb center reaches track top/bottom)
      const minY = -THUMB_SIZE / 2;
      const maxY = SLIDER_HEIGHT - THUMB_SIZE / 2;
      const clampedY = Math.max(minY, Math.min(newY, maxY));
      translateY.value = clampedY;

      // Convert position to scale value (inline worklet calculation)
      const trackRange = SLIDER_HEIGHT;
      const normalizedPos = 1 - (clampedY + THUMB_SIZE / 2) / trackRange;
      const newScale = MIN_SCALE + normalizedPos * (MAX_SCALE - MIN_SCALE);
      scale.value = newScale;

      // Call onValueChange for live preview
      runOnJS(onValueChange)(newScale);
    })
    .onEnd(() => {
      runOnJS(haptics.light)();
      // Call onChangeEnd to save to history
      if (onChangeEnd) {
        runOnJS(onChangeEnd)(scale.value);
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: visible ? withSpring(1) : withSpring(0),
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { scale: visible ? withSpring(1) : withSpring(0.8) },
    ],
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background Track */}
      <View style={styles.track} />

      {/* Draggable Thumb */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <View style={styles.thumbInner} />
        </Animated.View>
      </GestureDetector>

      {/* Size Indicator Lines */}
      <View style={styles.indicators}>
        <View style={[styles.indicator, styles.indicatorSmall]} />
        <View style={[styles.indicator, styles.indicatorMedium]} />
        <View style={[styles.indicator, styles.indicatorLarge]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
  },
  track: {
    position: 'absolute',
    left: (SLIDER_WIDTH - 4) / 2,
    top: 0,
    width: 4,
    height: SLIDER_HEIGHT,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },

  thumb: {
    position: 'absolute',
    left: (SLIDER_WIDTH - THUMB_SIZE) / 2,
    top: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: THUMB_SIZE - 4,
    height: THUMB_SIZE - 4,
    borderRadius: (THUMB_SIZE - 4) / 2,
    backgroundColor: Colors.accent.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  indicators: {
    position: 'absolute',
    right: -12,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: THUMB_SIZE / 2,
  },
  indicator: {
    backgroundColor: Colors.text.tertiary,
    borderRadius: 1,
  },
  indicatorSmall: {
    width: 6,
    height: 2,
  },
  indicatorMedium: {
    width: 8,
    height: 2,
  },
  indicatorLarge: {
    width: 10,
    height: 2,
  },
});
