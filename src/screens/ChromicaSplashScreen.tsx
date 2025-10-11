/**
 * Chromica Animated Splash Screen
 * Simple animated logo with text reveal
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface ChromicaSplashScreenProps {
  onFinish?: () => void;
}

export const ChromicaSplashScreen: React.FC<ChromicaSplashScreenProps> = ({
  onFinish,
}) => {
  // Animation values
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);

  useEffect(() => {
    // Stage 1: Logo fade in and scale (0-1s)
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // Stage 2: Logo rotation (1-2s)
    setTimeout(() => {
      logoRotation.value = withSequence(
        withTiming(360, { duration: 600, easing: Easing.out(Easing.quad) }),
        withSpring(0, { damping: 15, stiffness: 120 }),
      );
    }, 1000);

    // Stage 3: Text reveal (2-2.8s)
    setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 600 });
      textTranslateY.value = withSpring(0, { damping: 12 });
    }, 2000);

    // Stage 4: Call onFinish callback (3.5s)
    if (onFinish) {
      setTimeout(() => {
        onFinish();
      }, 3500);
    }
  }, [onFinish]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotateY: `${logoRotation.value}deg` },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.logo}>
          <View style={styles.logoCircle} />
          <View style={[styles.logoCircle, styles.logoCircleInner]} />
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.View style={[styles.textContainer, textStyle]}>
        <Animated.Text style={styles.appName}>CHROMICA</Animated.Text>
        <Animated.Text style={styles.tagline}>
          Professional Image Effects
        </Animated.Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  logoCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: '#EC4899',
    shadowColor: '#EC4899',
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
});
