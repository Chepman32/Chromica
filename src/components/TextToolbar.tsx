// Text Toolbar - Additional toolbar for text styling options

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface TextToolbarProps {
  onFontSelect: (fontFamily: string) => void;
  onColorSelect: (color: string) => void;
  onEffectSelect: (effect: string) => void;
  onBackgroundSelect: (background: string | null) => void;
  selectedFont?: string;
  selectedColor?: string;
  selectedEffect?: string;
  selectedBackground?: string | null;
}

// Available fonts from assets
const FONTS = [
  { id: 'System', name: 'System', family: 'System' },
  { id: 'ArchivoBlack', name: 'Archivo', family: 'ArchivoBlack-Regular' },
  { id: 'BitcountInk', name: 'Bitcount', family: 'BitcountInk' },
  { id: 'FiraSans', name: 'Fira Sans', family: 'FiraSans-Regular' },
  { id: 'HomemadeApple', name: 'Homemade', family: 'HomemadeApple-Regular' },
];

// Text colors
const TEXT_COLORS = [
  { id: 'white', color: '#FFFFFF', name: 'White' },
  { id: 'black', color: '#000000', name: 'Black' },
  { id: 'red', color: '#FF3B30', name: 'Red' },
  { id: 'orange', color: '#FF9500', name: 'Orange' },
  { id: 'yellow', color: '#FFCC00', name: 'Yellow' },
  { id: 'green', color: '#34C759', name: 'Green' },
  { id: 'blue', color: '#007AFF', name: 'Blue' },
  { id: 'purple', color: '#AF52DE', name: 'Purple' },
  { id: 'pink', color: '#FF2D55', name: 'Pink' },
];

// Text effects
const TEXT_EFFECTS = [
  { id: 'none', name: 'None', icon: '//A' },
  { id: 'neon', name: 'Neon', icon: '✨' },
  { id: 'glow', name: 'Glow', icon: '💫' },
  { id: 'shadow', name: 'Shadow', icon: '🌑' },
  { id: 'outline', name: 'Outline', icon: '⭕' },
];

// Text backgrounds
const TEXT_BACKGROUNDS = [
  { id: 'none', name: 'None', color: null },
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'white', name: 'White', color: '#FFFFFF' },
  { id: 'gray', name: 'Gray', color: '#8E8E93' },
  { id: 'red', name: 'Red', color: '#FF3B30' },
  { id: 'blue', name: 'Blue', color: '#007AFF' },
];

export const TextToolbar: React.FC<TextToolbarProps> = ({
  onFontSelect,
  onColorSelect,
  onEffectSelect,
  onBackgroundSelect,
  selectedFont = 'System',
  selectedColor = '#FFFFFF',
  selectedEffect = 'none',
  selectedBackground = null,
}) => {
  const [activeTab, setActiveTab] = useState<
    'font' | 'color' | 'effect' | 'background'
  >('font');

  return (
    <View style={styles.container}>
      {/* Tab buttons */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'font' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('font')}
        >
          <Text style={styles.tabIcon}>Aa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'color' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('color')}
        >
          <View style={styles.colorIcon}>
            <View
              style={[
                styles.colorIconInner,
                { backgroundColor: selectedColor },
              ]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'effect' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('effect')}
        >
          <Text style={styles.tabIcon}>//A</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'background' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('background')}
        >
          <View style={styles.bgIcon}>
            <Text style={styles.bgIconText}>A</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content area */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'font' && (
          <>
            {FONTS.map(font => (
              <TouchableOpacity
                key={font.id}
                style={[
                  styles.optionButton,
                  selectedFont === font.family && styles.optionButtonActive,
                ]}
                onPress={() => onFontSelect(font.family)}
                activeOpacity={0.7}
              >
                <Text style={[styles.fontPreview, { fontFamily: font.family }]}>
                  Aa
                </Text>
                <Text style={styles.optionLabel}>{font.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'color' && (
          <>
            {TEXT_COLORS.map(colorItem => (
              <TouchableOpacity
                key={colorItem.id}
                style={[
                  styles.colorButton,
                  selectedColor === colorItem.color && styles.colorButtonActive,
                ]}
                onPress={() => onColorSelect(colorItem.color)}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: colorItem.color },
                    colorItem.color === '#FFFFFF' && styles.colorSwatchBorder,
                  ]}
                />
                <Text style={styles.optionLabel}>{colorItem.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'effect' && (
          <>
            {TEXT_EFFECTS.map(effect => (
              <TouchableOpacity
                key={effect.id}
                style={[
                  styles.optionButton,
                  selectedEffect === effect.id && styles.optionButtonActive,
                ]}
                onPress={() => onEffectSelect(effect.id)}
              >
                <Text style={styles.effectIcon}>{effect.icon}</Text>
                <Text style={styles.optionLabel}>{effect.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab === 'background' && (
          <>
            {TEXT_BACKGROUNDS.map(bg => (
              <TouchableOpacity
                key={bg.id}
                style={[
                  styles.colorButton,
                  selectedBackground === bg.color && styles.colorButtonActive,
                ]}
                onPress={() => onBackgroundSelect(bg.color)}
              >
                {bg.color ? (
                  <View
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: bg.color },
                      bg.color === '#FFFFFF' && styles.colorSwatchBorder,
                    ]}
                  />
                ) : (
                  <View style={[styles.colorSwatch, styles.noBackgroundSwatch]}>
                    <Text style={styles.noBackgroundIcon}>⊘</Text>
                  </View>
                )}
                <Text style={styles.optionLabel}>{bg.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgrounds.secondary,
    paddingVertical: Spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.m,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabIcon: {
    fontSize: 20,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  colorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorIconInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bgIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgIconText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.m,
    paddingTop: Spacing.s,
    alignItems: 'center',
  },
  optionButton: {
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    padding: Spacing.s,
    borderRadius: 8,
    minWidth: 60,
  },
  optionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  fontPreview: {
    fontSize: 24,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  colorButton: {
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    padding: Spacing.s,
    borderRadius: 8,
    minWidth: 60,
  },
  colorButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  colorSwatchBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  effectIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  noBackgroundSwatch: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBackgroundIcon: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
});
