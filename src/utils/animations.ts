// Animation utilities and presets

import { Easing } from 'react-native-reanimated';

// Standard durations (in milliseconds)
export const AnimationDurations = {
  micro: 100, // Button presses, icon state changes
  short: 200, // Transitions, fades, small movements
  medium: 350, // Modal presentations, screen transitions
  long: 600, // Complex animations, staggered sequences
  extraLong: 1000, // Splash screens, celebration animations
} as const;

// Easing curves
export const AnimationEasing = {
  // Ease Out (Default for Entrances)
  easeOut: Easing.bezier(0.33, 1.0, 0.68, 1.0),

  // Ease In (for Exits)
  easeIn: Easing.bezier(0.32, 0.0, 0.67, 0.0),

  // Ease In-Out (for Transitions)
  easeInOut: Easing.bezier(0.65, 0.0, 0.35, 1.0),

  // Standard curves
  linear: Easing.linear,
  quad: Easing.quad,
  cubic: Easing.cubic,
} as const;

// Spring presets
export const SpringPresets = {
  gentle: {
    damping: 20,
    stiffness: 90,
  },
  bouncy: {
    damping: 12,
    stiffness: 120,
  },
  tight: {
    damping: 25,
    stiffness: 180,
  },
  default: {
    damping: 15,
    stiffness: 100,
  },
} as const;

// Common animation sequences
export const AnimationSequences = {
  // Button press feedback
  buttonPress: {
    scale: 0.96,
    duration: AnimationDurations.micro,
    easing: AnimationEasing.easeOut,
  },

  // Modal presentation
  modalPresent: {
    duration: AnimationDurations.medium,
    easing: AnimationEasing.easeOut,
  },

  // Fade transitions
  fadeIn: {
    duration: AnimationDurations.short,
    easing: AnimationEasing.easeOut,
  },

  fadeOut: {
    duration: AnimationDurations.short,
    easing: AnimationEasing.easeIn,
  },
} as const;
