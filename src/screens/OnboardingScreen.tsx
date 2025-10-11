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
        [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth],
        [0.8, 1.33, 0.8],
        Extrapolation.CLAMP,
      );

      const opacity = interpolate(
        scrollX.value,
        [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth],
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

  // Parallax panels
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
          <View style={styles.heroImagePlaceholder}>
            <Text style={styles.heroImageText}>☕️ Coffee Shop Photo</Text>
            <Text style={styles.watermarkDemo}>Roasted & Posted ☕</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <Text style={styles.headline}>Add Your Mark</Text>
          <Text style={styles.body}>
            Protect your work and build your brand with elegant watermarks,
            stamps, and signatures.
          </Text>
        </Animated.View>
      </View>
    );
  };

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
          <View style={styles.gestureDemo}>
            <Text style={styles.gestureDemoText}>👆 Pinch • Rotate • Drag</Text>
            <View style={styles.gestureElement}>
              <Text style={styles.gestureElementText}>Your Text</Text>
            </View>
          </View>
        </Animated.View>
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <Text style={styles.headline}>Gesture-Powered Editing</Text>
          <Text style={styles.body}>
            Pinch, rotate, and drag to perfect your composition. No clunky
            menus—just natural, fluid control.
          </Text>
        </Animated.View>
      </View>
    );
  };

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
          <View style={styles.beforeAfter}>
            <View style={styles.beforeAfterSide}>
              <Text style={styles.beforeAfterLabel}>Free</Text>
              <View style={styles.beforeAfterImage}>
                <Text style={styles.beforeAfterWatermark}>Made with Artifex</Text>
              </View>
            </View>
            <View style={styles.beforeAfterSide}>
              <Text style={styles.beforeAfterLabel}>Pro</Text>
              <View style={styles.beforeAfterImage} />
            </View>
          </View>
        </Animated.View>
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <Text style={styles.headline}>Unlock Pro</Text>
          <Text style={styles.body}>
            One-time purchase. Premium fonts, exclusive assets, and your photos,
            completely unmarked.
          </Text>
          <View style={styles.featurePills}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>100+ Premium Assets</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>Advanced Tools</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>No Watermarks</Text>
            </View>
          </View>
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
  heroImagePlaceholder: {
    width: screenWidth - Spacing.m * 2,
    height: 200,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: AppDimensions.cornerRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroImageText: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
  },
  watermarkDemo: {
    position: 'absolute',
    bottom: Spacing.m,
    right: Spacing.m,
    ...Typography.body.small,
    color: Colors.accent.primary,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gestureDemo: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gestureDemoText: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.m,
  },
  gestureElement: {
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: AppDimensions.cornerRadius.small,
    transform: [{ rotate: '15deg' }],
  },
  gestureElementText: {
    ...Typography.body.regular,
    color: Colors.backgrounds.primary,
    fontWeight: '600',
  },
  beforeAfter: {
    flexDirection: 'row',
    width: screenWidth - Spacing.m * 2,
    height: 160,
  },
  beforeAfterSide: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  beforeAfterLabel: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  beforeAfterImage: {
    flex: 1,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: AppDimensions.cornerRadius.small,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: Spacing.xs,
  },
  beforeAfterWatermark: {
    ...Typography.body.caption,
    color: Colors.text.tertiary,
    fontSize: 10,
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
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.m,
    gap: Spacing.xs,
  },
  featurePill: {
    backgroundColor: Colors.backgrounds.tertiary,
    paddingHorizontal: Spacing.s,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featurePillText: {
    ...Typography.body.caption,
    color: Colors.accent.primary,
    fontWeight: '500',
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
