// Haptic feedback utilities using react-native-haptic-feedback

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const haptics = {
  selection: () => ReactNativeHapticFeedback.trigger('impactMedium', options),
  snap: () => ReactNativeHapticFeedback.trigger('impactLight', options),
  error: () => ReactNativeHapticFeedback.trigger('notificationError', options),
  success: () =>
    ReactNativeHapticFeedback.trigger('notificationSuccess', options),
  warning: () =>
    ReactNativeHapticFeedback.trigger('notificationWarning', options),
  light: () => ReactNativeHapticFeedback.trigger('impactLight', options),
  medium: () => ReactNativeHapticFeedback.trigger('impactMedium', options),
  heavy: () => ReactNativeHapticFeedback.trigger('impactHeavy', options),
};

// Legacy export for backward compatibility
export const hapticFeedback = haptics;

// Unified trigger function for easier use
export const triggerHaptic = (
  type:
    | 'selection'
    | 'snap'
    | 'error'
    | 'success'
    | 'warning'
    | 'light'
    | 'medium'
    | 'heavy',
) => {
  haptics[type]();
};
