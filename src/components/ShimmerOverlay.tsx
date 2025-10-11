// Shimmer animation overlay for locked premium assets

import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
// Note: Using simple animated view instead of LinearGradient to avoid external dependency
import { Colors } from '../constants/colors';

interface ShimmerOverlayProps {
  children: React.ReactNode;
  isLocked: boolean;
  onPress?: () => void;
  shimmerColors?: string[];
  duration?: number;
}

export const ShimmerOverlay: React.FC<ShimmerOverlayProps> = ({
  children,
  isLocked,
  onPress,
  shimmerColors = [
    'rgba(255, 215, 0, 0)',
    'rgba(255, 215, 0, 0.3)',
    'rgba(255, 215, 0, 0.6)',
    'rgba(255, 215, 0, 0.3)',
    'rgba(255, 215, 0, 0)',
  ],
  duration = 2000,
}) => {
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    if (isLocked) {
      shimmerPosition.value = withRepeat(
        withTiming(1, { duration }),
        -1,
        false,
      );
    }
  }, [isLocked, duration]);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerPosition.value,
      [-1, 1],
      [-200, 200], // Adjust based on component width
    );

    return {
      transform: [{ translateX }],
      opacity: isLocked ? 1 : 0,
    };
  });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: isLocked ? 1 : 0,
  }));

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {children}

      {/* Dimming overlay */}
      <Animated.View style={[styles.overlay, overlayStyle]} />

      {/* Shimmer effect */}
      <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
        <View style={styles.shimmer} />
      </Animated.View>

      {/* Lock icon */}
      <Animated.View style={[styles.lockContainer, overlayStyle]}>
        <View style={styles.lockIcon}>
          <Text style={styles.lockText}>🔒</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 8,
  },
  shimmer: {
    flex: 1,
    width: 200,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  lockContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgrounds.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  lockText: {
    fontSize: 18,
  },
});
