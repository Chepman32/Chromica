/**
 * Effect Parameter Slider Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface EffectSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeEnd?: (value: number) => void;
}

const SLIDER_WIDTH = 280;

export const EffectSlider: React.FC<EffectSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onChangeEnd,
}) => {
  const position = useSharedValue(((value - min) / (max - min)) * SLIDER_WIDTH);
  const scale = useSharedValue(1);
  const lastValue = useSharedValue(value);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.3);
      lastValue.value = value;
      runOnJS(ReactNativeHapticFeedback.trigger)('impactLight');
    })
    .onUpdate(e => {
      const newPos = Math.max(0, Math.min(SLIDER_WIDTH, e.absoluteX - 40));
      position.value = newPos;

      const newValue = min + (newPos / SLIDER_WIDTH) * (max - min);
      const steppedValue = Math.round(newValue / step) * step;

      runOnJS(onChange)(steppedValue);
    })
    .onEnd(() => {
      scale.value = withSpring(1);

      if (onChangeEnd) {
        const finalPos = position.value;
        const finalValue = min + (finalPos / SLIDER_WIDTH) * (max - min);
        const steppedFinalValue = Math.round(finalValue / step) * step;
        runOnJS(onChangeEnd)(steppedFinalValue);
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }, { scale: scale.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: position.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>

        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    width: SLIDER_WIDTH,
    height: 4,
    backgroundColor: '#1F1F2E',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#6366F1',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
});
