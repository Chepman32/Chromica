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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configuration
const PARENT_RADIUS = 45;
const CHILD_RADIUS = 30;
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
  icon: string;
  onPress: () => void;
}

interface LiquidMenuProps {
  onCenterPress: () => void;
  satellites: SatelliteItem[];
  centerIcon?: string;
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
  centerIcon = '📷',
  centerLabel = 'Start',
}) => {
  // Center position
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2 - 50;

  // Reduce motion preference
  const [reduceMotion, setReduceMotion] = React.useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  // Parent bubble animation values
  const parentScale = useSharedValue(0);
  const parentOpacity = useSharedValue(0);

  // Satellite animation values - positions relative to center
  const satelliteProgress = satellites.map(() => useSharedValue(0));

  // Calculate satellite positions based on count
  const satelliteAngles = useMemo(() => {
    const count = satellites.length;
    const startAngle = -Math.PI / 2; // Start from top
    return satellites.map((_, index) => {
      return startAngle + (2 * Math.PI * index) / count;
    });
  }, [satellites.length]);

  // Satellite X/Y positions for Skia rendering
  const satelliteX = satellites.map((_, index) => {
    return useDerivedValue(() => {
      const progress = satelliteProgress[index].value;
      const angle = satelliteAngles[index];
      return centerX + Math.cos(angle) * ORBITAL_DISTANCE * progress;
    });
  });

  const satelliteY = satellites.map((_, index) => {
    return useDerivedValue(() => {
      const progress = satelliteProgress[index].value;
      const angle = satelliteAngles[index];
      return centerY + Math.sin(angle) * ORBITAL_DISTANCE * progress;
    });
  });

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
      satelliteProgress[index].value = withDelay(
        delay,
        withSpring(1, SPRING_CONFIG),
      );
    });
  }, [reduceMotion]);

  // Parent animated styles
  const parentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: parentOpacity.value,
    transform: [{ scale: parentScale.value }],
  }));

  // Satellite animated styles
  const satelliteAnimatedStyles = satellites.map((_, index) => {
    return useAnimatedStyle(() => {
      const progress = satelliteProgress[index].value;
      const angle = satelliteAngles[index];
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
    });
  });

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
        () => {
          pulseScale.value = withSpring(1, { damping: 8, stiffness: 100 });
        },
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
        <Group
          layer={
            <Paint>
              <Blur blur={20} />
              <ColorMatrix matrix={ALPHA_THRESHOLD_MATRIX} />
            </Paint>
          }
        >
          {/* Parent bubble */}
          <AnimatedBubble
            x={parentX}
            y={parentY}
            radius={PARENT_RADIUS + 8}
            color="#D4AF37"
          />

          {/* Satellite bubbles */}
          {satellites.map((_, index) => (
            <AnimatedBubble
              key={index}
              x={satelliteX[index]}
              y={satelliteY[index]}
              radius={CHILD_RADIUS + 5}
              color="#3A3A4E"
            />
          ))}
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
              accessibilityLabel={`${centerLabel}. Open image picker`}
              accessibilityHint="Double tap to select an image to edit"
            >
              <Text style={styles.parentIcon}>{centerIcon}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Satellite Buttons */}
        {satellites.map((satellite, index) => (
          <Animated.View
            key={satellite.id}
            style={[
              styles.satelliteContainer,
              { left: centerX - CHILD_RADIUS, top: centerY - CHILD_RADIUS },
              satelliteAnimatedStyles[index],
            ]}
          >
            <Pressable
              style={styles.satelliteButton}
              onPress={satellite.onPress}
              accessibilityRole="button"
              accessibilityLabel={satellite.label}
            >
              <Text style={styles.satelliteIcon}>{satellite.icon}</Text>
            </Pressable>
            <Text style={styles.satelliteLabel}>{satellite.label}</Text>
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
    fontSize: 32,
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
    fontSize: 20,
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
