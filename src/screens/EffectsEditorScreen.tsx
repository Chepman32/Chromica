/**
 * Effects Editor Screen - Main editing interface
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useEffectsStore } from '../stores/effectsStore';
import { EFFECTS, getEffectsByCategory } from '../domain/effects/registry';
import { EffectCategory } from '../domain/effects/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORIES = [
  { id: EffectCategory.CELLULAR, label: 'Cellular', icon: '⬛' },
  { id: EffectCategory.TILING, label: 'Tiling', icon: '🔄' },
  { id: EffectCategory.DISTORTION, label: 'Wave', icon: '〰️' },
  { id: EffectCategory.GLITCH, label: 'Glitch', icon: '⚡' },
  { id: EffectCategory.RELIEF, label: 'Relief', icon: '🔲' },
  { id: EffectCategory.STYLIZATION, label: 'Style', icon: '🎨' },
];

export const EffectsEditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri } = route.params as { imageUri: string };

  const image = useImage(imageUri);

  const [selectedCategory, setSelectedCategory] = useState<EffectCategory>(
    EffectCategory.CELLULAR,
  );
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  const {
    effectStack,
    addEffect,
    updateEffectParams,
    clearEffects,
    undo,
    redo,
    canUndo,
    canRedo,
    isPremium,
  } = useEffectsStore();

  // Canvas transform
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Gestures
  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate(e => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const categoryEffects = useMemo(
    () => getEffectsByCategory(selectedCategory),
    [selectedCategory],
  );

  const selectedEffect = useMemo(
    () => EFFECTS.find(e => e.id === selectedEffectId),
    [selectedEffectId],
  );

  const handleEffectSelect = (effectId: string) => {
    const effect = EFFECTS.find(e => e.id === effectId);
    if (!effect) return;

    if (effect.isPremium && !isPremium) {
      // Show paywall
      navigation.navigate('Paywall' as never);
      return;
    }

    ReactNativeHapticFeedback.trigger('impactMedium');
    setSelectedEffectId(effectId);

    // Apply effect with default parameters
    const defaultParams: Record<string, any> = {};
    effect.parameters.forEach(param => {
      defaultParams[param.name] = param.default;
    });

    addEffect(effectId, defaultParams);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    if (!selectedEffectId || effectStack.length === 0) return;

    const currentLayer = effectStack[effectStack.length - 1];
    updateEffectParams(currentLayer.id, { [paramName]: value });
  };

  const handleUndo = () => {
    if (canUndo()) {
      undo();
      ReactNativeHapticFeedback.trigger('impactLight');
    }
  };

  const handleRedo = () => {
    if (canRedo()) {
      redo();
      ReactNativeHapticFeedback.trigger('impactLight');
    }
  };

  const handleReset = () => {
    clearEffects();
    setSelectedEffectId(null);
    ReactNativeHapticFeedback.trigger('notificationWarning');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {imageUri.split('/').pop()}
        </Text>
        <TouchableOpacity onPress={() => {}} style={styles.shareButton}>
          <Text style={styles.shareIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasContainer}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.canvas, canvasStyle]}>
            <Canvas
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.5 }}
            >
              {image && (
                <SkiaImage
                  image={image}
                  fit="contain"
                  x={0}
                  y={0}
                  width={SCREEN_WIDTH}
                  height={SCREEN_HEIGHT * 0.5}
                />
              )}
            </Canvas>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Quick Tools Bar */}
      <View style={styles.quickTools}>
        <TouchableOpacity
          onPress={handleUndo}
          disabled={!canUndo()}
          style={[styles.toolButton, !canUndo() && styles.toolButtonDisabled]}
        >
          <Text style={styles.toolIcon}>↶</Text>
          <Text style={styles.toolLabel}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRedo}
          disabled={!canRedo()}
          style={[styles.toolButton, !canRedo() && styles.toolButtonDisabled]}
        >
          <Text style={styles.toolIcon}>↷</Text>
          <Text style={styles.toolLabel}>Redo</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {}} style={styles.toolButton}>
          <Text style={styles.toolIcon}>👁</Text>
          <Text style={styles.toolLabel}>Compare</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReset} style={styles.toolButton}>
          <Text style={styles.toolIcon}>↺</Text>
          <Text style={styles.toolLabel}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Effect Parameters Panel */}
      {selectedEffect && (
        <View style={styles.parametersPanel}>
          <Text style={styles.parametersPanelTitle}>{selectedEffect.name}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedEffect.parameters.map(param => (
              <View key={param.name} style={styles.parameterControl}>
                <Text style={styles.parameterLabel}>{param.label}</Text>
                {param.type === 'slider' && (
                  <Text style={styles.parameterValue}>{param.default}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              ReactNativeHapticFeedback.trigger('selection');
            }}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabSelected,
            ]}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === category.id &&
                  styles.categoryLabelSelected,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Effects Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.effectsGrid}
        contentContainerStyle={styles.effectsGridContent}
      >
        {categoryEffects.map(effect => (
          <TouchableOpacity
            key={effect.id}
            onPress={() => handleEffectSelect(effect.id)}
            style={[
              styles.effectCard,
              selectedEffectId === effect.id && styles.effectCardSelected,
            ]}
          >
            <View style={styles.effectPreview}>
              <Text style={styles.effectPreviewIcon}>
                {effect.category === EffectCategory.CELLULAR ? '⬛' : '🎨'}
              </Text>
            </View>
            <Text style={styles.effectName}>{effect.name}</Text>
            {effect.isPremium && !isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 20,
  },
  canvasContainer: {
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: '#000000',
  },
  canvas: {
    flex: 1,
  },
  quickTools: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  toolButton: {
    alignItems: 'center',
    padding: 8,
  },
  toolButtonDisabled: {
    opacity: 0.3,
  },
  toolIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  toolLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  parametersPanel: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  parametersPanelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  parameterControl: {
    marginRight: 16,
  },
  parameterLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  parameterValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryTabs: {
    maxHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#1F1F2E',
  },
  categoryTabSelected: {
    backgroundColor: '#6366F1',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
  },
  effectsGrid: {
    flex: 1,
  },
  effectsGridContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  effectCard: {
    width: 100,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#1F1F2E',
    overflow: 'hidden',
  },
  effectCardSelected: {
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  effectPreview: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A3E',
  },
  effectPreviewIcon: {
    fontSize: 32,
  },
  effectName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 8,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
});
