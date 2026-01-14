/**
 * Mixes Screen - Build multi-filter stacks with a distinct UI.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Image as RNImage,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  Canvas,
  Fill,
  Image as SkiaImage,
  ImageShader,
  Shader,
  useImage,
  useCanvasRef,
} from '@shopify/react-native-skia';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import RNFS from 'react-native-fs';

import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { EFFECTS } from '../domain/effects/registry';
import { ShaderManager } from '../domain/shader-manager/ShaderManager';
import { ProjectDatabase } from '../database/ProjectDatabase';
import { useProjectGalleryStore } from '../stores/projectGalleryStore';
import {
  BlendMode,
  Effect,
  EffectCategory,
  EffectLayer,
} from '../domain/effects/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MAX_STACK = 4;
const TILE_GAP = Spacing.m;
const TILE_WIDTH =
  (SCREEN_WIDTH - Spacing.screen * 2 - TILE_GAP) / 2;

const CATEGORY_LABELS: Record<EffectCategory, string> = {
  [EffectCategory.CELLULAR]: 'Mosaic',
  [EffectCategory.TILING]: 'Tiling',
  [EffectCategory.DISTORTION]: 'Distortion',
  [EffectCategory.GLASS]: 'Glass',
  [EffectCategory.CORRECTION]: 'Correction',
  [EffectCategory.BLUR_SHARPEN]: 'Blur',
  [EffectCategory.GLITCH]: 'Glitch',
  [EffectCategory.RELIEF]: 'Relief',
  [EffectCategory.STYLIZATION]: 'Stylize',
  [EffectCategory.BRUSH]: 'Brush',
  [EffectCategory.FREQUENCY]: 'Frequency',
  [EffectCategory.RENDER]: 'Render',
};

const CATEGORY_ORDER: EffectCategory[] = [
  EffectCategory.CELLULAR,
  EffectCategory.TILING,
  EffectCategory.DISTORTION,
  EffectCategory.GLASS,
  EffectCategory.CORRECTION,
  EffectCategory.BLUR_SHARPEN,
  EffectCategory.GLITCH,
  EffectCategory.RELIEF,
  EffectCategory.STYLIZATION,
  EffectCategory.BRUSH,
  EffectCategory.FREQUENCY,
  EffectCategory.RENDER,
];

const MIXABLE_EFFECTS = EFFECTS.filter(effect => effect.shaderPath);
const MIX_CATEGORIES = CATEGORY_ORDER.filter(category =>
  MIXABLE_EFFECTS.some(effect => effect.category === category),
);
const EFFECT_MAP = new Map(MIXABLE_EFFECTS.map(effect => [effect.id, effect]));

const normalizeImageUri = (uri: string): string => {
  if (uri.startsWith('ph://')) return uri;
  if (uri.startsWith('file://')) return uri;
  if (uri.startsWith('/')) return `file://${uri}`;
  return uri;
};

const buildDefaultParams = (effect: Effect): Record<string, any> => {
  const defaults: Record<string, any> = {};
  effect.parameters.forEach(param => {
    defaults[param.name] = param.default;
  });
  return defaults;
};

const normalizeParams = (
  effect: Effect,
  params: Record<string, any>,
): Record<string, number> => {
  const normalized: Record<string, number> = {};

  effect.parameters.forEach(param => {
    const value = params[param.name] ?? param.default;

    if (typeof value === 'number') {
      normalized[param.name] = value;
    } else if (typeof value === 'boolean') {
      normalized[param.name] = value ? 1 : 0;
    } else if (typeof value === 'string' && param.options) {
      const index = param.options.indexOf(value);
      normalized[param.name] = index >= 0 ? index : 0;
    }
  });

  return normalized;
};

const resolveUniformValue = (
  name: string,
  size: number,
  params: Record<string, number>,
  width: number,
  height: number,
): number[] => {
  if (name === 'resolution') {
    return [width, height].slice(0, size);
  }

  if (name === 'center') {
    return [0.5, 0.5].slice(0, size);
  }

  if (name === 'offset') {
    const offsetX = params.offsetX ?? 0;
    const offsetY = params.offsetY ?? 0;
    return [offsetX, offsetY].slice(0, size);
  }

  const value = params[name];
  if (typeof value === 'number') {
    return [value].slice(0, size);
  }

  return new Array(size).fill(0);
};

const buildUniformMap = (
  runtimeEffect: ReturnType<typeof ShaderManager.loadShader>,
  effect: Effect,
  params: Record<string, any>,
  width: number,
  height: number,
): Record<string, number | number[]> => {
  if (!runtimeEffect) return {};
  const normalizedParams = normalizeParams(effect, params);
  const uniformCount = runtimeEffect.getUniformCount();
  const uniforms: Record<string, number | number[]> = {};

  for (let i = 0; i < uniformCount; i++) {
    const name = runtimeEffect.getUniformName(i);
    const info = runtimeEffect.getUniform(i);
    const size = info.columns * info.rows;
    const values = resolveUniformValue(
      name,
      size,
      normalizedParams,
      width,
      height,
    );
    const normalizedValues = info.isInteger
      ? values.map(value => Math.round(value))
      : values;
    uniforms[name] = size === 1 ? normalizedValues[0] : normalizedValues;
  }

  return uniforms;
};

export const MixesScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as
    | { imageUri?: string; projectId?: string }
    | undefined;
  const insets = useSafeAreaInsets();
  const { loadProjects } = useProjectGalleryStore();
  const canvasRef = useCanvasRef();

  const [imageUri, setImageUri] = useState<string | null>(
    params?.imageUri ? normalizeImageUri(params.imageUri) : null,
  );
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    params?.projectId ?? null,
  );
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory>(
    MIX_CATEGORIES[0] ?? EffectCategory.CELLULAR,
  );
  const [mixStack, setMixStack] = useState<EffectLayer[]>([]);

  const image = useImage(imageUri ?? '');

  useEffect(() => {
    const loadProject = async () => {
      if (!params?.projectId) return;
      try {
        const project = await ProjectDatabase.getById(params.projectId);
        if (!project) return;
        setImageUri(normalizeImageUri(project.sourceImagePath));
        setMixStack(Array.isArray(project.mixStack) ? project.mixStack : []);
        setCurrentProjectId(project.id);
      } catch (error) {
        console.error('Failed to load mix project:', error);
      }
    };

    loadProject();
  }, [params?.projectId]);

  const previewSize = useMemo(() => {
    const width = SCREEN_WIDTH - Spacing.screen * 2;
    if (!image) {
      return { width, height: 240 };
    }
    const ratio = image.height() / image.width();
    const rawHeight = Math.round(width * ratio);
    const height = Math.max(220, Math.min(rawHeight, 360));
    return { width, height };
  }, [image]);

  const stackedShader = useMemo(() => {
    if (!image || mixStack.length === 0) return null;

    let node: React.ReactNode = (
      <ImageShader
        image={image}
        fit="cover"
        x={0}
        y={0}
        width={previewSize.width}
        height={previewSize.height}
      />
    );

    mixStack.forEach(layer => {
      if (!layer.visible) return;
      const effect = EFFECT_MAP.get(layer.effectId);
      if (!effect?.shaderPath) return;

      const runtimeEffect = ShaderManager.loadShader(effect.shaderPath);
      if (!runtimeEffect) return;

      const uniforms = buildUniformMap(
        runtimeEffect,
        effect,
        layer.params,
        previewSize.width,
        previewSize.height,
      );

      node = (
        <Shader key={layer.id} source={runtimeEffect} uniforms={uniforms}>
          {node}
        </Shader>
      );
    });

    return node;
  }, [image, mixStack, previewSize]);

  const categoryEffects = useMemo(
    () =>
      MIXABLE_EFFECTS.filter(effect => effect.category === selectedCategory),
    [selectedCategory],
  );

  const handlePickImage = useCallback(async () => {
    ReactNativeHapticFeedback.trigger('impactMedium');

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      const asset = result.assets?.[0];
      if (asset?.uri) {
        setImageUri(normalizeImageUri(asset.uri));
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  }, []);

  const handleToggleEffect = useCallback((effect: Effect) => {
    setMixStack(prev => {
      const existingIndex = prev.findIndex(
        layer => layer.effectId === effect.id,
      );
      if (existingIndex >= 0) {
        ReactNativeHapticFeedback.trigger('selection');
        return prev.filter(layer => layer.effectId !== effect.id);
      }
      if (prev.length >= MAX_STACK) {
        Alert.alert(
          'Mix limit reached',
          `You can stack up to ${MAX_STACK} filters at once.`,
        );
        return prev;
      }

      ReactNativeHapticFeedback.trigger('impactLight');
      const newLayer: EffectLayer = {
        id: `mix_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        effectId: effect.id,
        params: buildDefaultParams(effect),
        opacity: 1,
        visible: true,
        blendMode: BlendMode.NORMAL,
      };

      return [...prev, newLayer];
    });
  }, []);

  const handleMoveLayer = useCallback((index: number, direction: -1 | 1) => {
    setMixStack(prev => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      ReactNativeHapticFeedback.trigger('selection');
      return next;
    });
  }, []);

  const handleToggleVisibility = useCallback((layerId: string) => {
    setMixStack(prev =>
      prev.map(layer =>
        layer.id === layerId
          ? { ...layer, visible: !layer.visible }
          : layer,
      ),
    );
    ReactNativeHapticFeedback.trigger('selection');
  }, []);

  const handleRemoveLayer = useCallback((layerId: string) => {
    setMixStack(prev => prev.filter(layer => layer.id !== layerId));
    ReactNativeHapticFeedback.trigger('notificationWarning');
  }, []);

  const handleResetStack = useCallback(() => {
    setMixStack([]);
    ReactNativeHapticFeedback.trigger('notificationWarning');
  }, []);

  const captureCanvasThumbnail = useCallback(async (): Promise<string | null> => {
    try {
      const snapshot = canvasRef.current?.makeImageSnapshot();
      if (!snapshot) {
        console.log('No snapshot available');
        return null;
      }

      const base64 = snapshot.encodeToBase64();
      const thumbnailDir = `${RNFS.DocumentDirectoryPath}/thumbnails`;
      await RNFS.mkdir(thumbnailDir).catch(() => {});

      const thumbnailPath = `${thumbnailDir}/mix_${Date.now()}.jpg`;
      await RNFS.writeFile(thumbnailPath, base64, 'base64');
      return `file://${thumbnailPath}`;
    } catch (error) {
      console.error('Failed to capture mix thumbnail:', error);
      return null;
    }
  }, [canvasRef]);

  const saveProject = useCallback(async () => {
    if (!imageUri) return;

    try {
      const thumbnailPath = (await captureCanvasThumbnail()) || imageUri;
      const dimensions = {
        width: image?.width() || 0,
        height: image?.height() || 0,
      };

      if (currentProjectId) {
        const existingProject =
          await ProjectDatabase.getById(currentProjectId);
        if (existingProject) {
          existingProject.sourceImagePath = imageUri;
          existingProject.sourceImageDimensions = dimensions;
          existingProject.thumbnailPath = thumbnailPath;
          existingProject.mixStack = mixStack;
          existingProject.updatedAt = new Date();
          await ProjectDatabase.save(existingProject);
        }
      } else {
        const project = await ProjectDatabase.create(
          imageUri,
          dimensions,
          thumbnailPath,
        );
        project.mixStack = mixStack;
        await ProjectDatabase.save(project);
        setCurrentProjectId(project.id);
      }

      await loadProjects();
    } catch (error) {
      console.error('Failed to save mix project:', error);
    }
  }, [
    captureCanvasThumbnail,
    currentProjectId,
    image,
    imageUri,
    loadProjects,
    mixStack,
  ]);

  const handleBack = useCallback(async () => {
    await saveProject();
    navigation.goBack();
  }, [navigation, saveProject]);

  const isLoadingImage = Boolean(imageUri) && !image;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.backgrounds.primary}
      />
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleBack}
            >
              <Text style={styles.headerButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Mixes</Text>
            <Text style={styles.headerSubtitle}>
              Stack a few filters at once
            </Text>
          </View>
          <View style={[styles.headerSide, styles.headerSideRight]}>
            <TouchableOpacity
              style={[
                styles.headerButton,
                mixStack.length === 0 && styles.headerButtonDisabled,
              ]}
              onPress={handleResetStack}
              disabled={mixStack.length === 0}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  mixStack.length === 0 && styles.headerButtonTextDisabled,
                ]}
              >
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Spacing.xxl + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewSection}>
            <View
              style={[
                styles.previewCard,
                { width: previewSize.width, height: previewSize.height },
              ]}
            >
              {image ? (
                <Canvas
                  ref={canvasRef}
                  style={{
                    width: previewSize.width,
                    height: previewSize.height,
                  }}
                >
                  {stackedShader ? (
                    <Fill>{stackedShader}</Fill>
                  ) : (
                    <SkiaImage
                      image={image}
                      fit="cover"
                      x={0}
                      y={0}
                      width={previewSize.width}
                      height={previewSize.height}
                    />
                  )}
                </Canvas>
              ) : (
                <View style={styles.previewPlaceholder}>
                  <Text style={styles.placeholderTitle}>
                    {isLoadingImage ? 'Loading image...' : 'No photo yet'}
                  </Text>
                  <Text style={styles.placeholderText}>
                    {isLoadingImage
                      ? 'Preparing your canvas.'
                      : 'Pick an image to start mixing filters.'}
                  </Text>
                  {!isLoadingImage && (
                    <TouchableOpacity
                      style={styles.pickButton}
                      onPress={handlePickImage}
                    >
                      <Text style={styles.pickButtonText}>Pick Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {image && (
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>
                    {mixStack.length === 0
                      ? 'Original'
                      : `Mix ${mixStack.length}`}
                  </Text>
                </View>
              )}
            </View>

            {image && (
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handlePickImage}
              >
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mix Stack</Text>
              <Text style={styles.sectionMeta}>
                {mixStack.length}/{MAX_STACK}
              </Text>
            </View>

            {mixStack.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No filters yet</Text>
                <Text style={styles.emptyText}>
                  Tap below to stack up to {MAX_STACK} filters for a mix.
                </Text>
              </View>
            ) : (
              mixStack.map((layer, index) => {
                const effect = EFFECT_MAP.get(layer.effectId);
                const label = effect?.category
                  ? CATEGORY_LABELS[effect.category]
                  : 'Effect';

                return (
                  <View
                    key={layer.id}
                    style={[
                      styles.stackCard,
                      !layer.visible && styles.stackCardMuted,
                    ]}
                  >
                    <View style={styles.stackCardHeader}>
                      <View style={styles.stackTitleGroup}>
                        <View style={styles.stackIndex}>
                          <Text style={styles.stackIndexText}>
                            {index + 1}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.stackTitle}>
                            {effect?.name ?? 'Unknown'}
                          </Text>
                          <Text style={styles.stackSubtitle}>{label}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.visibilityBadge,
                          layer.visible
                            ? styles.visibilityOn
                            : styles.visibilityOff,
                        ]}
                        onPress={() => handleToggleVisibility(layer.id)}
                      >
                        <Text style={styles.visibilityText}>
                          {layer.visible ? 'On' : 'Off'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.stackActions}>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          index === 0 && styles.actionButtonDisabled,
                        ]}
                        onPress={() => handleMoveLayer(index, -1)}
                        disabled={index === 0}
                      >
                        <Text style={styles.actionButtonText}>Up</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          index === mixStack.length - 1 &&
                            styles.actionButtonDisabled,
                        ]}
                        onPress={() => handleMoveLayer(index, 1)}
                        disabled={index === mixStack.length - 1}
                      >
                        <Text style={styles.actionButtonText}>Down</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveLayer(layer.id)}
                      >
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Add Filters</Text>
              <Text style={styles.sectionMeta}>Tap to toggle</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {MIX_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryPill,
                    selectedCategory === category && styles.categoryPillActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    ReactNativeHapticFeedback.trigger('selection');
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[category]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.effectsGrid}>
              {categoryEffects.map(effect => {
                const isSelected = mixStack.some(
                  layer => layer.effectId === effect.id,
                );
                return (
                  <TouchableOpacity
                    key={effect.id}
                    style={[
                      styles.effectTile,
                      isSelected && styles.effectTileSelected,
                    ]}
                    onPress={() => handleToggleEffect(effect)}
                  >
                    <View style={styles.effectIconWrap}>
                      {effect.icon ? (
                        <RNImage
                          source={effect.icon}
                          style={styles.effectIcon}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.effectFallbackIcon}>
                          <Text style={styles.effectFallbackText}>FX</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.effectName}>{effect.name}</Text>
                    <Text style={styles.effectMeta}>
                      {CATEGORY_LABELS[effect.category]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
  },
  safeArea: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.s,
  },
  headerSide: {
    width: 88,
    alignItems: 'flex-start',
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.display.h3,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    ...Typography.body.caption,
    color: Colors.text.secondary,
  },
  headerButton: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: AppDimensions.cornerRadius.small,
    backgroundColor: Colors.backgrounds.tertiary,
    borderWidth: 1,
    borderColor: Colors.overlays.light,
  },
  headerButtonDisabled: {
    opacity: 0.4,
  },
  headerButtonText: {
    ...Typography.ui.label,
    color: Colors.text.primary,
  },
  headerButtonTextDisabled: {
    color: Colors.text.tertiary,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  previewSection: {
    paddingHorizontal: Spacing.screen,
    marginTop: Spacing.s,
  },
  previewCard: {
    alignSelf: 'center',
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: AppDimensions.cornerRadius.xlarge,
    borderWidth: 1,
    borderColor: Colors.overlays.light,
    overflow: 'hidden',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.l,
  },
  placeholderTitle: {
    ...Typography.display.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  placeholderText: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  pickButton: {
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    borderRadius: AppDimensions.button.cornerRadius,
    backgroundColor: Colors.accent.primary,
  },
  pickButtonText: {
    ...Typography.ui.button,
    color: Colors.backgrounds.primary,
  },
  previewBadge: {
    position: 'absolute',
    right: Spacing.s,
    top: Spacing.s,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: AppDimensions.cornerRadius.large,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  previewBadgeText: {
    ...Typography.body.finePrint,
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  changePhotoButton: {
    alignSelf: 'center',
    marginTop: Spacing.s,
  },
  changePhotoText: {
    ...Typography.body.small,
    color: Colors.accent.secondary,
  },
  section: {
    marginTop: Spacing.l,
    paddingHorizontal: Spacing.screen,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.s,
  },
  sectionTitle: {
    ...Typography.display.h4,
    color: Colors.text.primary,
  },
  sectionMeta: {
    ...Typography.body.caption,
    color: Colors.text.tertiary,
  },
  emptyCard: {
    padding: Spacing.l,
    borderRadius: AppDimensions.cornerRadius.large,
    backgroundColor: Colors.backgrounds.secondary,
    borderWidth: 1,
    borderColor: Colors.overlays.light,
  },
  emptyTitle: {
    ...Typography.body.large,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.body.small,
    color: Colors.text.secondary,
  },
  stackCard: {
    padding: Spacing.m,
    borderRadius: AppDimensions.cornerRadius.large,
    backgroundColor: Colors.backgrounds.secondary,
    borderWidth: 1,
    borderColor: Colors.overlays.light,
    marginBottom: Spacing.s,
  },
  stackCardMuted: {
    opacity: 0.5,
  },
  stackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.s,
  },
  stackTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgrounds.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.s,
  },
  stackIndexText: {
    ...Typography.body.caption,
    color: Colors.text.primary,
  },
  stackTitle: {
    ...Typography.body.large,
    color: Colors.text.primary,
  },
  stackSubtitle: {
    ...Typography.body.caption,
    color: Colors.text.tertiary,
  },
  visibilityBadge: {
    paddingHorizontal: Spacing.s,
    paddingVertical: 4,
    borderRadius: AppDimensions.cornerRadius.large,
  },
  visibilityOn: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
  visibilityOff: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  visibilityText: {
    ...Typography.body.finePrint,
    color: Colors.text.primary,
    textTransform: 'uppercase',
  },
  stackActions: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  actionButton: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: AppDimensions.cornerRadius.small,
    backgroundColor: Colors.backgrounds.tertiary,
    borderWidth: 1,
    borderColor: Colors.overlays.light,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    ...Typography.body.small,
    color: Colors.text.primary,
  },
  removeButton: {
    marginLeft: 'auto',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: AppDimensions.cornerRadius.small,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.35)',
  },
  removeButtonText: {
    ...Typography.body.small,
    color: Colors.semantic.error,
  },
  categoryRow: {
    paddingVertical: Spacing.xs,
    gap: Spacing.s,
  },
  categoryPill: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: AppDimensions.cornerRadius.large,
    backgroundColor: Colors.backgrounds.tertiary,
    borderWidth: 1,
    borderColor: Colors.overlays.light,
  },
  categoryPillActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  categoryText: {
    ...Typography.body.small,
    color: Colors.text.secondary,
  },
  categoryTextActive: {
    color: Colors.backgrounds.primary,
    fontWeight: '600',
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.s,
    gap: Spacing.s,
  },
  effectTile: {
    width: TILE_WIDTH,
    padding: Spacing.m,
    borderRadius: AppDimensions.cornerRadius.large,
    backgroundColor: Colors.backgrounds.secondary,
    borderWidth: 1,
    borderColor: Colors.overlays.light,
  },
  effectTileSelected: {
    borderColor: Colors.accent.primary,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  effectIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.backgrounds.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.s,
  },
  effectIcon: {
    width: 48,
    height: 48,
  },
  effectFallbackIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectFallbackText: {
    ...Typography.body.caption,
    color: Colors.text.tertiary,
  },
  effectName: {
    ...Typography.body.small,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  effectMeta: {
    ...Typography.body.finePrint,
    color: Colors.text.tertiary,
  },
});

export default MixesScreen;
