/**
 * LiquidMenu - Gooey Radial Menu with Metaball Effect
 *
 * Uses React Native Skia for the liquid/gooey rendering effect
 * and Reanimated 3 for physics-based spring animations.
 *
 * Architecture:
 * - Skia Canvas layer: Renders the visual metaball effect
 * - React Native layer: Handles touch interactions (Pressable overlays)
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  AccessibilityInfo,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Paint,
  Blur,
  ColorMatrix,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  useDerivedValue,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useTranslation } from '../../hooks/useTranslation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configuration
const PARENT_RADIUS = 48;
const CHILD_RADIUS = 44;
const PARENT_ICON_SIZE = Math.round(PARENT_RADIUS);
const CHILD_ICON_SIZE = Math.round(CHILD_RADIUS * 0.9);
const ORBITAL_DISTANCE = 120;
const ENTRANCE_DELAY = 500; // 0.5s after mount
const STAGGER_DELAY = 80;

// Spring configs for natural physics
const SPRING_CONFIG = {
  damping: 12,
  stiffness: 100,
  mass: 1,
};

const SPRING_CONFIG_BOUNCY = {
  damping: 10,
  stiffness: 180,
  mass: 0.8,
};

// Satellite menu items
export interface SatelliteItem {
  id: string;
  label: string;
  icon: ImageSourcePropType;
  onPress: () => void;
}

interface LiquidMenuProps {
  onCenterPress: () => void;
  satellites: SatelliteItem[];
  centerIcon?: ImageSourcePropType;
  centerLabel?: string;
}

// Alpha threshold matrix for metaball effect
// This creates the "gooey" liquid separation effect
const ALPHA_THRESHOLD_MATRIX = [
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  25,
  -12, // Amplify alpha, threshold at ~0.48
];

interface AnimatedBubbleProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  radius: number;
  color: string;
}

const AnimatedBubble: React.FC<AnimatedBubbleProps> = ({
  x,
  y,
  radius,
  color,
}) => {
  const cx = useDerivedValue(() => x.value);
  const cy = useDerivedValue(() => y.value);

  return <Circle cx={cx} cy={cy} r={radius} color={color} />;
};

export const LiquidMenu: React.FC<LiquidMenuProps> = ({
  onCenterPress,
  satellites,
  centerIcon,
  centerLabel,
}) => {
  const t = useTranslation();
  const liquidMenuT = (t as any)?.liquidMenu ?? (t as any)?.settings?.liquidMenu;

  // Memoize satellite items to prevent unnecessary recalculations
  const memoizedSatellites = useMemo(() => satellites, [satellites]);

  // Center position
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2 - 50;

  // Reduce motion preference
  const [reduceMotion, setReduceMotion] = React.useState(false);

  // Shared values for animations
  const parentOpacity = useSharedValue(0);
  const parentScale = useSharedValue(0);
  
  // Individual satellite progress shared values
  const satelliteProgress0 = useSharedValue(0);
  const satelliteProgress1 = useSharedValue(0);
  const satelliteProgress2 = useSharedValue(0);
  const satelliteProgress3 = useSharedValue(0);
  const satelliteProgress4 = useSharedValue(0);
  const satelliteProgress5 = useSharedValue(0);
  const satelliteProgress6 = useSharedValue(0);
  const satelliteProgress7 = useSharedValue(0);
  
  const satelliteAngles = useMemo(() => {
    const count = satellites.length;
    return Array.from({ length: count }, (_, index) => {
      const angleStep = (2 * Math.PI) / count;
      return -Math.PI / 2 + index * angleStep; // Start from top
    });
  }, [satellites.length]);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  // Entrance animation
  useEffect(() => {
    const duration = reduceMotion ? 0 : 400;
    const springConfig = reduceMotion ? { duration: 0 } : SPRING_CONFIG_BOUNCY;

    // Parent entrance
    parentOpacity.value = withTiming(1, { duration });
    parentScale.value = withSpring(1, springConfig);

    // Satellites pop out with stagger
    satellites.forEach((_, index) => {
      const delay = reduceMotion ? 0 : ENTRANCE_DELAY + index * STAGGER_DELAY;
      const progressValue = [
        satelliteProgress0,
        satelliteProgress1,
        satelliteProgress2,
        satelliteProgress3,
        satelliteProgress4,
        satelliteProgress5,
        satelliteProgress6,
        satelliteProgress7,
      ][index];
      if (progressValue) {
        progressValue.value = withDelay(
          delay,
          withSpring(1, SPRING_CONFIG),
        );
      }
    });
  }, [reduceMotion, parentOpacity, parentScale, satelliteProgress0, satelliteProgress1, satelliteProgress2, satelliteProgress3, satelliteProgress4, satelliteProgress5, satelliteProgress6, satelliteProgress7, satellites]);

  // Parent animated styles
  const parentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: parentOpacity.value,
    transform: [{ scale: parentScale.value }],
  }));

  // Satellite animated styles
  const satelliteAnimatedStyles = [
    useAnimatedStyle(() => {
      const progress = satelliteProgress0.value;
      const angle = satelliteAngles[0] || 0;
      const x = Math.cos(angle) * ORBITAL_DISTANCE * progress;
      const y = Math.sin(angle) * ORBITAL_DISTANCE * progress;

      return {
        opacity: progress,
        transform: [
          { translateX: x },
          { translateY: y },
          {
            scale: interpolate(progress, [0, 1], [0.3, 1], Extrapolation.CLAMP),
          },
        ],
      };
    }),
    useAnimatedStyle(() => {
      const progress = satelliteProgress1.value;
      const angle = satelliteAngles[1] || 0;
      const x = Math.cos(angle) * ORBITAL_DISTANCE * progress;
      const y = Math.sin(angle) * ORBITAL_DISTANCE * progress;

      return {
        opacity: progress,
        transform: [
          { translateX: x },
          { translateY: y },
          {
            scale: interpolate(progress, [0, 1], [0.3, 1], Extrapolation.CLAMP),
          },
        ],
      };
    }),
    useAnimatedStyle(() => {
      const progress = satelliteProgress2.value;
      const angle = satelliteAngles[2] || 0;
      const x = Math.cos(angle) * ORBITAL_DISTANCE * progress;
      const y = Math.sin(angle) * ORBITAL_DISTANCE * progress;

      return {
        opacity: progress,
        transform: [
          { translateX: x },
          { translateY: y },
          {
            scale: interpolate(progress, [0, 1], [0.3, 1], Extrapolation.CLAMP),
          },
        ],
      };
    }),
    useAnimatedStyle(() => {
      const progress = satelliteProgress3.value;
      const angle = satelliteAngles[3] || 0;
      const x = Math.cos(angle) * ORBITAL_DISTANCE * progress;
      const y = Math.sin(angle) * ORBITAL_DISTANCE * progress;

      return {
        opacity: progress,
        transform: [
          { translateX: x },
          { translateY: y },
          {
            scale: interpolate(progress, [0, 1], [0.3, 1], Extrapolation.CLAMP),
          },
        ],
      };
    }),
    useAnimatedStyle(() => {
      const progress = satelliteProgress4.value;
      const angle = satelliteAngles[4] || 0;
      const x = Math.cos(angle) * ORBITAL_DISTANCE * progress;
      const y = Math.sin(angle) * ORBITAL_DISTANCE * progress;

      return {
        opacity: progress,
        transform: [
          { translateX: x },
          { translateY: y },
          {
            scale: interpolate(progress, [0, 1], [0.3, 1], Extrapolation.CLAMP),
          },
        ],
      };
    }),
    useAnimatedStyle(() => {
      const progress = satelliteProgress5.value;
      const angle = satelliteAngles[5] || 0;
      const x = Math.cos(angle) * ORBITAL_DISTANCE * progress;
      const y = Math.sin(angle) * ORBITAL_DISTANCE * progress;

      return {
        opacity: progress,
        transform: [
          { translateX: x },
          { translateY: y },
          {
            scale: interpolate(progress, [0, 1], [0.3, 1], Extrapolation.CLAMP),
          },
        ],
      };
    }),
    useAnimatedStyle(() => {
      const progress = satelliteProgress6.value;
      const angle = satelliteAngles[6] || 0;
      const x = Math.cos(angle) * ORBITAL_DISTANCE * progress;
      const y = Math.sin(angle) * ORBITAL_DISTANCE * progress;

      return {
        opacity: progress,
        transform: [
          { translateX: x },
          { translateY: y },
          {
            scale: interpolate(progress, [0, 1], [0.3, 1], Extrapolation.CLAMP),
          },
        ],
      };
    }),
    useAnimatedStyle(() => {
      const progress = satelliteProgress7.value;
      const angle = satelliteAngles[7] || 0;
      const x = Math.cos(angle) * ORBITAL_DISTANCE * progress;
      const y = Math.sin(angle) * ORBITAL_DISTANCE * progress;

      return {
        opacity: progress,
        transform: [
          { translateX: x },
          { translateY: y },
          {
            scale: interpolate(progress, [0, 1], [0.3, 1], Extrapolation.CLAMP),
          },
        ],
      };
    }),
  ];

  // Center X/Y for Skia (shared values for consistency)
  const parentX = useSharedValue(centerX);
  const parentY = useSharedValue(centerY);

  // Pulse animation for parent
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;

    const pulse = () => {
      pulseScale.value = withSpring(
        1.05,
        { damping: 8, stiffness: 100 },
      );
    };
    const interval = setInterval(pulse, 2000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const parentPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Skia Canvas Layer - Gooey Effect */}
      <Canvas style={styles.canvas}>
        <Group>
          <Paint>
            <Blur blur={20} />
            <ColorMatrix matrix={ALPHA_THRESHOLD_MATRIX} />
          </Paint>
        </Group>
      </Canvas>

      {/* React Native Touch Layer - Accessibility & Gestures */}
      <View style={styles.touchLayer}>
        {/* Parent Button */}
        <Animated.View
          style={[
            styles.parentContainer,
            { left: centerX - PARENT_RADIUS, top: centerY - PARENT_RADIUS },
            parentAnimatedStyle,
          ]}
        >
          <Animated.View style={parentPulseStyle}>
            <Pressable
              style={styles.parentButton}
              onPress={onCenterPress}
              accessibilityRole="button"
              accessibilityLabel={`${centerLabel ?? ''}. ${liquidMenuT?.openImagePicker ?? 'Open image picker'}`}
              accessibilityHint={`${liquidMenuT?.doubleTapToEdit ?? 'Double tap to select an image to edit'}`}
            >
              {centerIcon && (
                <Image
                  source={centerIcon}
                  style={styles.parentIcon}
                  resizeMode="contain"
                />
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Satellite Buttons */}
        {memoizedSatellites.map((satellite, index) => (
          <Animated.View
            key={satellite.id}
            style={[
              styles.satelliteContainer,
              { left: centerX - CHILD_RADIUS, top: centerY - CHILD_RADIUS },
              satelliteAnimatedStyles[index],
            ]}
          >
            <Animated.View
              style={styles.satelliteButton}
            >
              <Pressable
                style={styles.satelliteButton}
                onPress={satellite.onPress}
                accessibilityRole="button"
                accessibilityLabel={satellite.label}
              >
                <Image
                  source={satellite.icon}
                  style={styles.satelliteIcon}
                  resizeMode="contain"
                />
              </Pressable>
              <Text style={styles.satelliteLabel}>{satellite.label}</Text>
            </Animated.View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
  touchLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  parentContainer: {
    position: 'absolute',
    width: PARENT_RADIUS * 2,
    height: PARENT_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentButton: {
    width: PARENT_RADIUS * 2,
    height: PARENT_RADIUS * 2,
    borderRadius: PARENT_RADIUS,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  parentIcon: {
    width: PARENT_ICON_SIZE,
    height: PARENT_ICON_SIZE,
  },
  satelliteContainer: {
    position: 'absolute',
    width: CHILD_RADIUS * 2,
    height: CHILD_RADIUS * 2 + 24, // Extra space for label
    alignItems: 'center',
  },
  satelliteButton: {
    width: CHILD_RADIUS * 2,
    height: CHILD_RADIUS * 2,
    borderRadius: CHILD_RADIUS,
    backgroundColor: '#2A2A2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3A3A3E',
  },
  satelliteIcon: {
    width: CHILD_ICON_SIZE,
    height: CHILD_ICON_SIZE,
  },
  satelliteLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#A0A0A0',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LiquidMenu;
