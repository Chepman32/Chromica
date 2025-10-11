// Physics-based splash screen with logo shatter animation

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Canvas, Group, Path, vec, Skia } from '@shopify/react-native-skia';
import { Colors } from '../constants/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Logo particle configuration
interface Particle {
  x: number;
  y: number;
  size: number;
  angle: number;
  velocity: { x: number; y: number };
}

const generateParticles = (count: number): Particle[] => {
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 40 + Math.random() * 20;

    particles.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      size: 4 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      velocity: {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
      },
    });
  }

  return particles;
};

const SplashScreen: React.FC = () => {
  const logoScale = useSharedValue(0);
  const logoRotation = useSharedValue(-180);
  const logoOpacity = useSharedValue(0);
  const shatterProgress = useSharedValue(0);
  const fadeOut = useSharedValue(0);

  useEffect(() => {
    // Initial logo entrance
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 100,
      mass: 0.8,
    });
    logoRotation.value = withSpring(0, {
      damping: 15,
      stiffness: 80,
    });

    // Hold for a moment, then shatter
    setTimeout(() => {
      shatterProgress.value = withTiming(1, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, 1200);

    // Fade out the entire screen
    setTimeout(() => {
      fadeOut.value = withTiming(1, { duration: 400 });
    }, 2400);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value * (1 - shatterProgress.value),
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: 1 - fadeOut.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Logo that shatters */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.logo}>
          {/* Geometric "A" */}
          <View style={styles.logoTriangle} />
          <View style={styles.logoBar} />
        </View>
      </Animated.View>

      {/* Particle effect overlay (simulated for now) */}
      <View style={styles.particleContainer} pointerEvents="none">
        {shatterProgress.value > 0 && (
          <View style={styles.particleEffect}>
            {/* Particles would be rendered here with Skia */}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 52,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.accent.primary,
    position: 'absolute',
  },
  logoBar: {
    width: 36,
    height: 4,
    backgroundColor: Colors.accent.primary,
    position: 'absolute',
    bottom: 12,
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particleEffect: {
    flex: 1,
  },
});

export default SplashScreen;
