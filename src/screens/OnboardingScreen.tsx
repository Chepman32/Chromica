// Onboarding carousel with parallax effects and rubber-band scrolling

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';

const { width: screenWidth } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const setOnboardingSeen = useAppStore(state => state.setOnboardingSeen);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const updateCurrentIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
      const index = Math.round(event.contentOffset.x / screenWidth);
      runOnJS(updateCurrentIndex)(index);
    },
  });

  const handleSkip = () => {
    setOnboardingSeen();
    navigation.navigate('Home' as never);
  };

  const handleNext = () => {
    if (currentIndex < 2) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    } else {
      handleSkip();
    }
  };

  const renderDot = (index: number) => {
    const dotStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        scrollX.value,
        [
          (index - 1) * screenWidth,
          index * screenWidth,
          (index + 1) * screenWidth,
        ],
        [0.8, 1.33, 0.8],
        Extrapolation.CLAMP,
      );

      const opacity = interpolate(
        scrollX.value,
        [
          (index - 1) * screenWidth,
          index * screenWidth,
          (index + 1) * screenWidth,
        ],
        [0.4, 1, 0.4],
        Extrapolation.CLAMP,
      );

      return {
        transform: [{ scale }],
        opacity,
      };
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          { backgroundColor: Colors.accent.primary },
          dotStyle,
        ]}
      />
    );
  };

  // Panel 1: Effects
  const Panel1 = () => {
    const heroStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        scrollX.value,
        [0, screenWidth],
        [0, -50],
        Extrapolation.CLAMP,
      );
      return { transform: [{ translateX }] };
    });

    const contentStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        scrollX.value,
        [0, screenWidth],
        [0, 50],
        Extrapolation.CLAMP,
      );
      const opacity = interpolate(
        scrollX.value,
        [0, screenWidth],
        [1, 0],
        Extrapolation.CLAMP,
      );
      return { transform: [{ translateX }], opacity };
    });

    return (
      <View style={styles.panel}>
        <Animated.View style={[styles.heroSection, heroStyle]}>
          <View style={styles.effectsGrid}>
            <View style={[styles.effectTile, { backgroundColor: '#6366F1' }]}>
              <Text style={styles.effectIcon}>🎨</Text>
              <Text style={styles.effectLabel}>Mosaic</Text>
            </View>
            <View style={[styles.effectTile, { backgroundColor: '#EC4899' }]}>
              <Text style={styles.effectIcon}>🌊</Text>
              <Text style={styles.effectLabel}>Wave</Text>
            </View>
            <View style={[styles.effectTile, { backgroundColor: '#10B981' }]}>
              <Text style={styles.effectIcon}>💎</Text>
              <Text style={styles.effectLabel}>Glass</Text>
            </View>
            <View style={[styles.effectTile, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.effectIcon}>⚡</Text>
              <Text style={styles.effectLabel}>Glitch</Text>
            </View>
          </View>
        </Animated.View>
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <Text style={styles.headline}>50+ Pro Effects</Text>
          <Text style={styles.body}>
            Transform your photos with stunning GPU-powered effects. Mosaic,
            Glass, Glitch, Artistic styles and more.
          </Text>
        </Animated.View>
      </View>
    );
  };

  // Panel 2: Real-time Preview
  const Panel2 = () => {
    const heroStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        scrollX.value,
        [screenWidth, screenWidth * 2],
        [50, -50],
        Extrapolation.CLAMP,
      );
      const scale = interpolate(
        scrollX.value,
        [0, screenWidth, screenWidth * 2],
        [0.8, 1, 0.8],
        Extrapolation.CLAMP,
      );
      return { transform: [{ translateX }, { scale }] };
    });

    const contentStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollX.value,
        [0, screenWidth, screenWidth * 2],
        [0, 1, 0],
        Extrapolation.CLAMP,
      );
      return { opacity };
    });

    return (
      <View style={styles.panel}>
        <Animated.View style={[styles.heroSection, heroStyle]}>
          <View style={styles.sliderDemo}>
            <View style={styles.sliderTrack}>
              <View style={styles.sliderFill} />
              <View style={styles.sliderThumb} />
            </View>
            <Text style={styles.sliderLabel}>Intensity: 75%</Text>
            <View style={styles.previewBox}>
              <Text style={styles.previewText}>Live Preview</Text>
            </View>
          </View>
        </Animated.View>
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <Text style={styles.headline}>Real-Time Control</Text>
          <Text style={styles.body}>
            Fine-tune every effect with intuitive sliders. See changes instantly
            as you adjust parameters.
          </Text>
        </Animated.View>
      </View>
    );
  };

  // Panel 3: Export
  const Panel3 = () => {
    const heroStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        scrollX.value,
        [screenWidth, screenWidth * 2],
        [100, 0],
        Extrapolation.CLAMP,
      );
      return { transform: [{ translateX }] };
    });

    const contentStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollX.value,
        [screenWidth, screenWidth * 2],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return { opacity };
    });

    return (
      <View style={styles.panel}>
        <Animated.View style={[styles.heroSection, heroStyle]}>
          <View style={styles.exportDemo}>
            <View style={styles.exportOption}>
              <Text style={styles.exportIcon}>📸</Text>
              <Text style={styles.exportLabel}>Instagram</Text>
            </View>
            <View style={styles.exportOption}>
              <Text style={styles.exportIcon}>🐦</Text>
              <Text style={styles.exportLabel}>X</Text>
            </View>
            <View style={styles.exportOption}>
              <Text style={styles.exportIcon}>🖼️</Text>
              <Text style={styles.exportLabel}>Gallery</Text>
            </View>
          </View>
        </Animated.View>
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <Text style={styles.headline}>Share Everywhere</Text>
          <Text style={styles.body}>
            Export in high resolution. Share directly to Instagram, X, or save
            to your gallery.
          </Text>
        </Animated.View>
        <TouchableOpacity style={styles.ctaButton} onPress={handleSkip}>
          <Text style={styles.ctaButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Carousel with parallax */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        decelerationRate="fast"
        bounces
      >
        <Panel1 />
        <Panel2 />
        <Panel3 />
      </Animated.ScrollView>

      {/* Progress Indicators */}
      <View style={styles.pagination}>{[0, 1, 2].map(renderDot)}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.m,
    zIndex: 1,
    padding: Spacing.s,
  },
  skipText: {
    ...Typography.body.regular,
    color: Colors.text.tertiary,
  },
  panel: {
    width: screenWidth,
    flex: 1,
  },
  heroSection: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
  },
  contentSection: {
    flex: 0.4,
    paddingHorizontal: Spacing.l,
    justifyContent: 'center',
  },
  headline: {
    ...Typography.display.h1,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  body: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Effects Grid
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 220,
    gap: 12,
    justifyContent: 'center',
  },
  effectTile: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  effectIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  effectLabel: {
    ...Typography.body.small,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Slider Demo
  sliderDemo: {
    width: 260,
    alignItems: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 4,
    marginBottom: 12,
    position: 'relative',
  },
  sliderFill: {
    width: '75%',
    height: '100%',
    backgroundColor: Colors.accent.primary,
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    left: '72%',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  sliderLabel: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  previewBox: {
    width: 200,
    height: 120,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent.primary,
  },
  previewText: {
    ...Typography.body.regular,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  // Export Demo
  exportDemo: {
    flexDirection: 'row',
    gap: 20,
  },
  exportOption: {
    width: 80,
    height: 80,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  exportLabel: {
    ...Typography.body.caption,
    color: Colors.text.secondary,
  },
  ctaButton: {
    marginHorizontal: Spacing.l,
    marginBottom: Spacing.xl,
    height: AppDimensions.button.height,
    backgroundColor: Colors.accent.primary,
    borderRadius: AppDimensions.button.cornerRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    ...Typography.ui.button,
    color: Colors.backgrounds.primary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    gap: Spacing.s,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default OnboardingScreen;
