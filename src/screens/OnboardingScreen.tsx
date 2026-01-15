// Onboarding carousel with parallax effects

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  G,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { useTranslation } from '../hooks/useTranslation';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';

const { width: screenWidth } = Dimensions.get('window');

// SVG Illustration: Effects Grid with visual effects
const EffectsIllustration = () => (
  <Svg width={280} height={200} viewBox="0 0 280 200">
    <Defs>
      <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#6366F1" />
        <Stop offset="100%" stopColor="#8B5CF6" />
      </LinearGradient>
      <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#EC4899" />
        <Stop offset="100%" stopColor="#F472B6" />
      </LinearGradient>
      <LinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#10B981" />
        <Stop offset="100%" stopColor="#34D399" />
      </LinearGradient>
      <LinearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#FBBF24" />
      </LinearGradient>
    </Defs>

    {/* Main canvas frame */}
    <Rect
      x="40"
      y="20"
      width="200"
      height="140"
      rx="12"
      fill="#1F1F2E"
      stroke="#3F3F5E"
      strokeWidth="2"
    />

    {/* Mosaic effect pattern */}
    <G>
      <Rect
        x="50"
        y="30"
        width="25"
        height="25"
        rx="4"
        fill="url(#grad1)"
        opacity="0.9"
      />
      <Rect
        x="80"
        y="30"
        width="25"
        height="25"
        rx="4"
        fill="url(#grad2)"
        opacity="0.8"
      />
      <Rect
        x="110"
        y="30"
        width="25"
        height="25"
        rx="4"
        fill="url(#grad1)"
        opacity="0.7"
      />
      <Rect
        x="140"
        y="30"
        width="25"
        height="25"
        rx="4"
        fill="url(#grad3)"
        opacity="0.9"
      />
      <Rect
        x="170"
        y="30"
        width="25"
        height="25"
        rx="4"
        fill="url(#grad4)"
        opacity="0.8"
      />
      <Rect
        x="200"
        y="30"
        width="25"
        height="25"
        rx="4"
        fill="url(#grad2)"
        opacity="0.6"
      />
    </G>

    {/* Wave distortion lines */}
    <Path
      d="M50 75 Q80 65 110 75 T170 75 T230 75"
      stroke="url(#grad2)"
      strokeWidth="3"
      fill="none"
      opacity="0.8"
    />
    <Path
      d="M50 90 Q80 100 110 90 T170 90 T230 90"
      stroke="url(#grad3)"
      strokeWidth="3"
      fill="none"
      opacity="0.7"
    />
    <Path
      d="M50 105 Q80 95 110 105 T170 105 T230 105"
      stroke="url(#grad1)"
      strokeWidth="3"
      fill="none"
      opacity="0.9"
    />

    {/* Glitch effect bars */}
    <Rect
      x="55"
      y="120"
      width="60"
      height="8"
      rx="2"
      fill="url(#grad4)"
      opacity="0.9"
    />
    <Rect
      x="125"
      y="120"
      width="40"
      height="8"
      rx="2"
      fill="url(#grad1)"
      opacity="0.7"
    />
    <Rect
      x="175"
      y="120"
      width="50"
      height="8"
      rx="2"
      fill="url(#grad2)"
      opacity="0.8"
    />

    {/* Glass/blur circles */}
    <Circle cx="70" cy="145" r="12" fill="url(#grad3)" opacity="0.5" />
    <Circle cx="100" cy="145" r="8" fill="url(#grad1)" opacity="0.6" />
    <Circle cx="130" cy="145" r="15" fill="url(#grad4)" opacity="0.4" />
    <Circle cx="170" cy="145" r="10" fill="url(#grad2)" opacity="0.5" />
    <Circle cx="200" cy="145" r="12" fill="url(#grad3)" opacity="0.6" />

    {/* Slider control */}
    <Rect x="40" y="175" width="200" height="6" rx="3" fill="#3F3F5E" />
    <Rect x="40" y="175" width="140" height="6" rx="3" fill="url(#grad1)" />
    <Circle cx="180" cy="178" r="10" fill="#FFFFFF" />
    <Circle cx="180" cy="178" r="6" fill="url(#grad1)" />

    {/* Category indicators */}
    <Circle cx="20" cy="50" r="6" fill="url(#grad1)" />
    <Circle cx="20" cy="75" r="6" fill="url(#grad2)" />
    <Circle cx="20" cy="100" r="6" fill="url(#grad3)" />
    <Circle cx="20" cy="125" r="6" fill="url(#grad4)" />

    <Circle cx="260" cy="50" r="6" fill="url(#grad4)" />
    <Circle cx="260" cy="75" r="6" fill="url(#grad3)" />
    <Circle cx="260" cy="100" r="6" fill="url(#grad2)" />
    <Circle cx="260" cy="125" r="6" fill="url(#grad1)" />
  </Svg>
);

// SVG Illustration: Project Management & Export
const ProjectsIllustration = () => (
  <Svg width={280} height={200} viewBox="0 0 280 200">
    <Defs>
      <LinearGradient id="projGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#6366F1" />
        <Stop offset="100%" stopColor="#8B5CF6" />
      </LinearGradient>
      <LinearGradient id="projGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#10B981" />
        <Stop offset="100%" stopColor="#34D399" />
      </LinearGradient>
      <LinearGradient id="projGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#EC4899" />
        <Stop offset="100%" stopColor="#F472B6" />
      </LinearGradient>
    </Defs>

    {/* Project thumbnails grid */}
    <G>
      {/* Thumbnail 1 */}
      <Rect
        x="20"
        y="20"
        width="70"
        height="70"
        rx="10"
        fill="#1F1F2E"
        stroke="#3F3F5E"
        strokeWidth="2"
      />
      <Rect
        x="28"
        y="28"
        width="54"
        height="40"
        rx="4"
        fill="url(#projGrad1)"
        opacity="0.8"
      />
      <Rect x="28" y="72" width="30" height="10" rx="2" fill="#3F3F5E" />

      {/* Thumbnail 2 */}
      <Rect
        x="105"
        y="20"
        width="70"
        height="70"
        rx="10"
        fill="#1F1F2E"
        stroke="url(#projGrad1)"
        strokeWidth="2"
      />
      <Rect
        x="113"
        y="28"
        width="54"
        height="40"
        rx="4"
        fill="url(#projGrad2)"
        opacity="0.8"
      />
      <Rect x="113" y="72" width="30" height="10" rx="2" fill="#3F3F5E" />
      {/* Selected indicator */}
      <Circle cx="163" cy="32" r="8" fill="url(#projGrad1)" />
      <Path
        d="M159 32 L162 35 L168 29"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
      />

      {/* Thumbnail 3 */}
      <Rect
        x="190"
        y="20"
        width="70"
        height="70"
        rx="10"
        fill="#1F1F2E"
        stroke="#3F3F5E"
        strokeWidth="2"
      />
      <Rect
        x="198"
        y="28"
        width="54"
        height="40"
        rx="4"
        fill="url(#projGrad3)"
        opacity="0.8"
      />
      <Rect x="198" y="72" width="30" height="10" rx="2" fill="#3F3F5E" />
    </G>

    {/* Export/Share section */}
    <G>
      {/* Export panel */}
      <Rect
        x="40"
        y="105"
        width="200"
        height="80"
        rx="12"
        fill="#1F1F2E"
        stroke="#3F3F5E"
        strokeWidth="2"
      />

      {/* Share icons */}
      {/* Instagram-style icon */}
      <G transform="translate(60, 120)">
        <Rect
          x="0"
          y="0"
          width="36"
          height="36"
          rx="8"
          fill="url(#projGrad3)"
        />
        <Rect
          x="6"
          y="6"
          width="24"
          height="24"
          rx="6"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <Circle
          cx="18"
          cy="18"
          r="6"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <Circle cx="26" cy="10" r="2" fill="#FFFFFF" />
      </G>

      {/* Gallery icon */}
      <G transform="translate(110, 120)">
        <Rect
          x="0"
          y="0"
          width="36"
          height="36"
          rx="8"
          fill="url(#projGrad2)"
        />
        <Rect
          x="8"
          y="10"
          width="20"
          height="16"
          rx="2"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <Circle cx="14" cy="16" r="3" fill="#FFFFFF" />
        <Path
          d="M10 22 L16 18 L22 22 L26 19"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          fill="none"
        />
      </G>

      {/* Share icon */}
      <G transform="translate(160, 120)">
        <Rect
          x="0"
          y="0"
          width="36"
          height="36"
          rx="8"
          fill="url(#projGrad1)"
        />
        <Path d="M18 8 L18 24" stroke="#FFFFFF" strokeWidth="2" />
        <Path
          d="M12 14 L18 8 L24 14"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
        />
        <Path
          d="M10 20 L10 26 L26 26 L26 20"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
        />
      </G>

      {/* High-res badge */}
      <Rect
        x="60"
        y="165"
        width="60"
        height="16"
        rx="8"
        fill="url(#projGrad1)"
      />
      <SvgText
        x="90"
        y="176"
        fontSize="8"
        fill="#FFFFFF"
        textAnchor="middle"
        fontWeight="bold"
      >
        1080p
      </SvgText>
    </G>

    {/* Auto-save indicator */}
    <G transform="translate(220, 105)">
      <Circle cx="15" cy="15" r="12" fill="url(#projGrad2)" opacity="0.2" />
      <Circle cx="15" cy="15" r="8" fill="url(#projGrad2)" />
      <Path
        d="M12 15 L14 17 L19 12"
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
      />
    </G>

    {/* Connection lines */}
    <Line
      x1="140"
      y1="90"
      x2="140"
      y2="105"
      stroke="#3F3F5E"
      strokeWidth="2"
      strokeDasharray="4,4"
    />
  </Svg>
);

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const t = useTranslation();
  const setOnboardingSeen = useAppStore(state => state.setOnboardingSeen);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleSkip = () => {
    setOnboardingSeen();
    navigation.navigate('Home' as never);
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

  // Panel 1: Professional Photo Effects Editor
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
          <EffectsIllustration />
        </Animated.View>
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <Text style={styles.headline}>{t.onboarding.effectsHeadline}</Text>
          <Text style={styles.body}>
            {t.onboarding.effectsBody}
          </Text>
          <View style={styles.featurePills}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>{t.onboarding.effectPixelate}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>{t.onboarding.effectKaleidoscope}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>{t.onboarding.effectOilPaint}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>{t.onboarding.effectRgbSplit}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  // Panel 2: Project Management & Export
  const Panel2 = () => {
    const heroStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        scrollX.value,
        [0, screenWidth],
        [100, 0],
        Extrapolation.CLAMP,
      );
      return { transform: [{ translateX }] };
    });

    const contentStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scrollX.value,
        [0, screenWidth],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return { opacity };
    });

    return (
      <View style={styles.panel}>
        <Animated.View style={[styles.heroSection, heroStyle]}>
          <ProjectsIllustration />
        </Animated.View>
        <Animated.View style={[styles.contentSection, contentStyle]}>
          <Text style={styles.headline}>{t.onboarding.saveShareHeadline}</Text>
          <Text style={styles.body}>
            {t.onboarding.saveShareBody}
          </Text>
          <View style={styles.featurePills}>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>{t.onboarding.featureAutoSave}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>{t.onboarding.feature1080pExport}</Text>
            </View>
            <View style={styles.featurePill}>
              <Text style={styles.featurePillText}>{t.onboarding.featureQuickShare}</Text>
            </View>
          </View>
        </Animated.View>
        <TouchableOpacity style={styles.ctaButton} onPress={handleSkip}>
          <Text style={styles.ctaButtonText}>{t.onboarding.getStarted}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>{t.onboarding.skip}</Text>
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
      </Animated.ScrollView>

      {/* Progress Indicators */}
      <View style={styles.pagination}>{[0, 1].map(renderDot)}</View>
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
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
  },
  contentSection: {
    flex: 0.5,
    paddingHorizontal: Spacing.l,
    justifyContent: 'flex-start',
    paddingTop: Spacing.l,
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
