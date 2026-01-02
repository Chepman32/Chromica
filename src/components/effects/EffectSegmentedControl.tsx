/**
 * Segmented Control for Effect Parameters
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const COLOR_MAP: Record<string, string> = {
  Blue: '#0A84FF',
  Green: '#34C759',
  Purple: '#6366F1',
  Orange: '#FF9500',
  Pink: '#FF3B30',
  Teal: '#5AC8FA',
};

interface EffectSegmentedControlProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  mode?: 'text' | 'color';
}

export const EffectSegmentedControl: React.FC<EffectSegmentedControlProps> = ({
  label,
  options,
  value,
  onChange,
  mode = 'text',
}) => {
  const handlePress = (option: string) => {
    if (option !== value) {
      ReactNativeHapticFeedback.trigger('selection', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      onChange(option);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          mode === 'color' ? styles.colorOptionsContainer : styles.optionsContainer
        }
      >
        {options.map(option => {
          const isSelected = option === value;

          if (mode === 'color') {
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.circleOption,
                  { backgroundColor: COLOR_MAP[option] || '#808080' },
                  isSelected && styles.circleOptionSelected,
                ]}
                onPress={() => handlePress(option)}
                activeOpacity={0.7}
                accessibilityLabel={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              />
            );
          }

          return (
            <TouchableOpacity
              key={option}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => handlePress(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1F1F2E',
    borderWidth: 1,
    borderColor: '#2F2F3E',
  },
  optionSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  circleOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 0,
  },
  circleOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8888AA',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
});
