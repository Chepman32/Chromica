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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  Skia,
  RuntimeShader,
  Shader,
  Group,
  Rect,
  Text as SkiaText,
  matchFont,
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
import RNFS from 'react-native-fs';
import { useEffectsStore } from '../stores/effectsStore';
import { EFFECTS, getEffectsByCategory } from '../domain/effects/registry';
import { EffectCategory } from '../domain/effects/types';
import { ShaderManager } from '../domain/shader-manager/ShaderManager';
import { EffectRenderer } from '../components/effects/EffectRenderer';
import { EffectSlider } from '../components/effects/EffectSlider';

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

  const [fileUri, setFileUri] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  // Convert ph:// URI to file:// URI
  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoadingImage(true);

        // For ph:// URIs, try using them directly first
        // Skia might be able to handle them on iOS
        if (imageUri.startsWith('ph://')) {
          console.log('Using ph:// URI directly');
          setFileUri(imageUri);
        } else if (imageUri.startsWith('file://')) {
          setFileUri(imageUri);
        } else if (imageUri.startsWith('/')) {
          setFileUri(`file://${imageUri}`);
        } else {
          setFileUri(imageUri);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setFileUri(imageUri); // Fallback
      } finally {
        setLoadingImage(false);
      }
    };

    loadImage();
  }, [imageUri]);

  // Load image with Skia
  const image = useImage(fileUri || '');

  useEffect(() => {
    console.log('Original URI:', imageUri);
    console.log('File URI:', fileUri);
    if (!image) {
      console.log('Image not loaded yet...');
    } else {
      console.log(
        'Image loaded successfully:',
        image.width(),
        'x',
        image.height(),
      );
    }
  }, [image, imageUri, fileUri]);

  const [selectedCategory, setSelectedCategory] = useState<EffectCategory>(
    EffectCategory.CELLULAR,
  );
  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  const {
    effectStack,
    history,
    historyIndex,
    addEffect,
    updateEffectParams,
    clearEffects,
    undo,
    redo,
    canUndo,
    canRedo,
    isPremium,
  } = useEffectsStore();

  // Get the current effect to apply
  const currentEffect = useMemo(() => {
    if (!selectedEffectId || effectStack.length === 0) return null;
    return EFFECTS.find(e => e.id === selectedEffectId);
  }, [selectedEffectId, effectStack]);

  // Get current effect parameters
  const currentParams = useMemo(() => {
    if (effectStack.length === 0) return null;
    return effectStack[effectStack.length - 1]?.params;
  }, [effectStack]);

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

  // Removed pan gesture - image should not be movable
  const composedGesture = pinchGesture;

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
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

  // Sync selectedEffectId with effectStack changes (for undo/redo)
  useEffect(() => {
    if (effectStack.length > 0) {
      const lastEffect = effectStack[effectStack.length - 1];
      setSelectedEffectId(lastEffect.effectId);
    } else {
      setSelectedEffectId(null);
    }
  }, [effectStack]);

  const handleUndo = () => {
    console.log('Undo - historyIndex:', historyIndex, 'history.length:', history.length);
    if (canUndo()) {
      undo();
      ReactNativeHapticFeedback.trigger('impactLight');
      console.log('Undo executed');
    } else {
      console.log('Cannot undo');
    }
  };

  const handleRedo = () => {
    console.log('Redo - historyIndex:', historyIndex, 'history.length:', history.length);
    if (canRedo()) {
      redo();
      ReactNativeHapticFeedback.trigger('impactLight');
      console.log('Redo executed');
    } else {
      console.log('Cannot redo');
    }
  };

  const handleReset = () => {
    console.log('Reset clicked');
    console.log('Before reset - canUndo:', canUndo(), 'canRedo:', canRedo());
    clearEffects();
    setSelectedEffectId(null);
    ReactNativeHapticFeedback.trigger('notificationWarning');
    // Check state after reset
    setTimeout(() => {
      console.log('After reset - canUndo:', canUndo(), 'canRedo:', canRedo());
    }, 100);
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

        <View style={styles.topBarCenter}>
          <TouchableOpacity
            onPress={handleUndo}
            style={[styles.topToolButton, !canUndo() && styles.topToolButtonDisabled]}
          >
            <Text style={[styles.topToolIcon, !canUndo() && styles.topToolIconDisabled]}>↶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRedo}
            style={[styles.topToolButton, !canRedo() && styles.topToolButtonDisabled]}
          >
            <Text style={[styles.topToolIcon, !canRedo() && styles.topToolIconDisabled]}>↷</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleReset} style={styles.topToolButton}>
            <Text style={styles.topToolIcon}>↺</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate(
              'Export' as never,
              {
                imageUri: fileUri,
                effectId: selectedEffectId,
                params: currentParams,
              } as never,
            );
          }}
          style={styles.shareButton}
        >
          <Text style={styles.shareIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas Area */}
      <View style={styles.canvasContainer}>
        {loadingImage || !image ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {loadingImage ? 'Loading image...' : 'Image not available'}
            </Text>
          </View>
        ) : (
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.canvas, canvasStyle]}>
              <Canvas
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.5 }}
              >
                <EffectRenderer
                  image={image}
                  effect={currentEffect}
                  params={currentParams}
                  x={0}
                  y={0}
                  width={SCREEN_WIDTH}
                  height={SCREEN_HEIGHT * 0.5}
                />

                {/* Visual indicator when effect is selected */}
                {selectedEffectId && currentEffect && (
                  <Group>
                    <Rect
                      x={10}
                      y={10}
                      width={220}
                      height={50}
                      color="rgba(0,0,0,0.8)"
                      rx={8}
                    />
                    <SkiaText
                      x={20}
                      y={35}
                      text={`Effect: ${currentEffect.name}`}
                      color="white"
                      size={16}
                    />
                  </Group>
                )}
              </Canvas>
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      {/* Bottom Panel - Snap Scroll Container */}
      <ScrollView
        style={styles.bottomPanel}
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT * 0.3}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {/* First Page: Category Tabs + Effects Grid */}
        <View style={styles.effectsPage}>
          {/* Category Tabs */}
          <View style={styles.categoryTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
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
          </View>

          {/* Effects Grid */}
          <View style={styles.effectsGridContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
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
                    {effect.icon ? (
                      <Image
                        source={effect.icon}
                        style={styles.effectPreviewImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.effectPreviewIcon}>
                        {effect.category === EffectCategory.CELLULAR ? '⬛' : '🎨'}
                      </Text>
                    )}
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
          </View>
        </View>

        {/* Second Page: Effect Parameters */}
        {selectedEffect && currentParams && (
          <View style={styles.parametersPage}>
            <Text style={styles.parametersPanelTitle}>{selectedEffect.name}</Text>
            {selectedEffect.parameters.map(param => {
              if (param.type === 'slider') {
                const currentValue = currentParams[param.name] ?? param.default;
                return (
                  <EffectSlider
                    key={param.name}
                    label={param.label}
                    value={currentValue as number}
                    min={param.min!}
                    max={param.max!}
                    step={param.step}
                    onChange={value => handleParameterChange(param.name, value)}
                  />
                );
              }
              return null;
            })}
          </View>
        )}
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
  topBarCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flex: 1,
    justifyContent: 'center',
  },
  topToolButton: {
    padding: 8,
  },
  topToolButtonDisabled: {
    opacity: 0.3,
  },
  topToolIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  topToolIconDisabled: {
    color: '#666666',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
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
  parametersPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
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
  bottomPanel: {
    flex: 1,
  },
  effectsPage: {
    height: SCREEN_HEIGHT * 0.3,
  },
  parametersPage: {
    height: SCREEN_HEIGHT * 0.3,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryTabsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#1F1F2E',
    minWidth: 100,
    minHeight: 44,
  },
  categoryTabSelected: {
    backgroundColor: '#6366F1',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
  },
  effectsGridContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  effectsGridContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  effectCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#1F1F2E',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  effectCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#2A2A4E',
  },
  effectPreview: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A3E',
    overflow: 'hidden',
  },
  effectPreviewImage: {
    width: '100%',
    height: '100%',
  },
  effectPreviewIcon: {
    fontSize: 36,
  },
  effectName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
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
