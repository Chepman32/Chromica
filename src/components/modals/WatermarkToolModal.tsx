// Watermark tool modal with preset configurations

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet } from './BottomSheet';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { WATERMARK_PRESETS } from '../../constants/watermarkPresets';
import { WatermarkPreset } from '../../types/watermark';

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const PRESET_WIDTH = (screenWidth - Spacing.m * 2 - Spacing.m) / GRID_COLUMNS;

interface WatermarkToolModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyPreset: (
    preset: WatermarkPreset,
    text: string,
    settings: { opacity: number; scale: number; rotation: number },
  ) => void;
}

export const WatermarkToolModal: React.FC<WatermarkToolModalProps> = ({
  visible,
  onClose,
  onApplyPreset,
}) => {
  const insets = useSafeAreaInsets();
  const [watermarkText, setWatermarkText] = useState('© Your Brand');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  const bottomSafePadding = Math.max(insets.bottom, Spacing.s);

  // Global adjustment values
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const [globalScale, setGlobalScale] = useState(1);
  const [globalRotation, setGlobalRotation] = useState(0);

  const filteredPresets = WATERMARK_PRESETS.filter(preset => {
    return preset.category === 'pattern';
  });

  const handlePresetPress = (preset: WatermarkPreset) => {
    setSelectedPresetId(preset.id);
    setShowCustomization(true);
  };

  const handleApply = () => {
    const preset = WATERMARK_PRESETS.find(p => p.id === selectedPresetId);
    if (preset && watermarkText.trim()) {
      onApplyPreset(preset, watermarkText, {
        opacity: globalOpacity,
        scale: globalScale,
        rotation: globalRotation,
      });
      onClose();
      // Reset customization
      setShowCustomization(false);
      setGlobalOpacity(1);
      setGlobalScale(1);
      setGlobalRotation(0);
    }
  };

  const renderPreset = ({ item }: { item: WatermarkPreset }) => {
    const isSelected = selectedPresetId === item.id;

    return (
      <TouchableOpacity
        style={[styles.presetItem, isSelected && styles.presetItemSelected]}
        onPress={() => handlePresetPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.presetPreview}>
          {/* Visual representation of pattern */}
          <View style={styles.previewPattern}>
            {item.pattern === 'grid' && (
              <>
                <View
                  style={[styles.previewDot, { top: '20%', left: '20%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '20%', right: '20%' }]}
                />
                <View
                  style={[styles.previewDot, { bottom: '20%', left: '20%' }]}
                />
                <View
                  style={[styles.previewDot, { bottom: '20%', right: '20%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '50%', left: '50%' }]}
                />
              </>
            )}
            {item.pattern === 'corners' && (
              <>
                <View style={[styles.previewDot, { top: 8, left: 8 }]} />
                <View style={[styles.previewDot, { top: 8, right: 8 }]} />
                <View style={[styles.previewDot, { bottom: 8, left: 8 }]} />
                <View style={[styles.previewDot, { bottom: 8, right: 8 }]} />
              </>
            )}
            {item.pattern === 'diagonal' && (
              <>
                <View
                  style={[styles.previewDot, { top: '10%', left: '10%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '35%', left: '35%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '60%', left: '60%' }]}
                />
                <View
                  style={[styles.previewDot, { bottom: '10%', right: '10%' }]}
                />
              </>
            )}
            {item.pattern === 'scattered' && (
              <>
                <View
                  style={[styles.previewDot, { top: '15%', left: '25%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '40%', right: '30%' }]}
                />
                <View
                  style={[styles.previewDot, { bottom: '25%', left: '35%' }]}
                />
                <View
                  style={[styles.previewDot, { top: '65%', right: '20%' }]}
                />
              </>
            )}
            {(item.pattern === 'center' || item.pattern === 'single') && (
              <View style={[styles.previewDot, { top: '50%', left: '50%' }]} />
            )}
            {item.pattern === 'edges' && (
              <>
                <View style={[styles.previewDot, { top: 8, left: '30%' }]} />
                <View style={[styles.previewDot, { top: 8, right: '30%' }]} />
                <View style={[styles.previewDot, { bottom: 8, left: '30%' }]} />
                <View
                  style={[styles.previewDot, { bottom: 8, right: '30%' }]}
                />
                <View style={[styles.previewDot, { top: '30%', left: 8 }]} />
                <View style={[styles.previewDot, { top: '30%', right: 8 }]} />
              </>
            )}
          </View>
        </View>
        <View style={styles.presetInfo}>
          <Text style={styles.presetName}>{item.name}</Text>
          <Text style={styles.presetDescription}>{item.description}</Text>
          <View style={styles.presetMeta}>
            <Text style={styles.presetMetaText}>{item.config.count} marks</Text>
            <Text style={styles.presetMetaText}>•</Text>
            <Text style={styles.presetMetaText}>{item.density}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.85, 0.95]}>
      <View style={styles.container}>
        <Text style={styles.title}>💧 Watermark Tool</Text>

        {!showCustomization ? (
          <>
            {/* Watermark Text Input */}
            <View style={styles.textInputContainer}>
              <Text style={styles.inputLabel}>Watermark Text</Text>
              <TextInput
                style={styles.textInput}
                value={watermarkText}
                onChangeText={setWatermarkText}
                placeholder="Enter your watermark text"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            {/* Preset Grid */}
            <View style={{ flex: 1 }}>
              <FlatList
                data={filteredPresets}
                renderItem={renderPreset}
                keyExtractor={item => item.id}
                numColumns={GRID_COLUMNS}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.columnWrapper}
              />
            </View>

            {/* Apply Button - shown when preset is selected */}
            {selectedPresetId && (
              <View
                style={[
                  styles.quickApplyContainer,
                  { paddingBottom: bottomSafePadding },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.quickApplyButton,
                    !watermarkText.trim() && styles.applyButtonDisabled,
                  ]}
                  onPress={handleApply}
                  disabled={!watermarkText.trim()}
                >
                  <Text style={styles.applyButtonText}>Apply Watermark</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Customization Panel */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setShowCustomization(false)}
            >
              <Text style={styles.backButtonText}>‹ Back to Presets</Text>
            </TouchableOpacity>

            <View style={styles.customizationContent}>
              <ScrollView
                style={styles.customizationPanel}
                contentContainerStyle={[
                  styles.customizationScrollContent,
                  { paddingBottom: bottomSafePadding + Spacing.l },
                ]}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sectionTitle}>Global Adjustments</Text>

                {/* Opacity Slider */}
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Opacity</Text>
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderValue}>
                      {Math.round(globalOpacity * 100)}%
                    </Text>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          { width: `${globalOpacity * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.sliderButtons}>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() =>
                        setGlobalOpacity(Math.max(0.1, globalOpacity - 0.1))
                      }
                    >
                      <Text style={styles.sliderButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() =>
                        setGlobalOpacity(Math.min(1, globalOpacity + 0.1))
                      }
                    >
                      <Text style={styles.sliderButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Scale Slider */}
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Size</Text>
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderValue}>
                      {Math.round(globalScale * 100)}%
                    </Text>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          { width: `${(globalScale / 2) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.sliderButtons}>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() =>
                        setGlobalScale(Math.max(0.5, globalScale - 0.1))
                      }
                    >
                      <Text style={styles.sliderButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() =>
                        setGlobalScale(Math.min(2, globalScale + 0.1))
                      }
                    >
                      <Text style={styles.sliderButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Rotation Slider */}
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Rotation</Text>
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderValue}>{globalRotation}°</Text>
                    <View style={styles.sliderTrack}>
                      <View
                        style={[
                          styles.sliderFill,
                          { width: `${((globalRotation + 45) / 90) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.sliderButtons}>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() =>
                        setGlobalRotation(Math.max(-45, globalRotation - 5))
                      }
                    >
                      <Text style={styles.sliderButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sliderButton}
                      onPress={() =>
                        setGlobalRotation(Math.min(45, globalRotation + 5))
                      }
                    >
                      <Text style={styles.sliderButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    styles.confirmButton,
                    !watermarkText.trim() && styles.applyButtonDisabled,
                  ]}
                  onPress={handleApply}
                  disabled={!watermarkText.trim()}
                >
                  <Text style={styles.applyButtonText}>
                    Confirm Adjustments
                  </Text>
                </TouchableOpacity>

                {/* Preview Info */}
                <View style={styles.previewInfo}>
                  <Text style={styles.previewInfoTitle}>Selected Preset</Text>
                  <Text style={styles.previewInfoText}>
                    {
                      WATERMARK_PRESETS.find(p => p.id === selectedPresetId)
                        ?.name
                    }
                  </Text>
                  <Text style={styles.previewInfoDescription}>
                    {
                      WATERMARK_PRESETS.find(p => p.id === selectedPresetId)
                        ?.description
                    }
                  </Text>
                </View>
              </ScrollView>
            </View>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    ...Typography.display.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.m,
  },
  textInputContainer: {
    marginBottom: Spacing.m,
  },
  inputLabel: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 12,
    padding: Spacing.m,
    ...Typography.body.regular,
    color: Colors.text.primary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  grid: {
    paddingBottom: Spacing.l,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.m,
  },
  presetItem: {
    width: PRESET_WIDTH,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetItemSelected: {
    borderColor: Colors.accent.primary,
  },
  presetPreview: {
    height: 100,
    backgroundColor: Colors.backgrounds.secondary,
    position: 'relative',
  },
  previewPattern: {
    flex: 1,
    position: 'relative',
  },
  previewDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent.primary,
    opacity: 0.6,
  },
  presetInfo: {
    padding: Spacing.m,
  },
  presetName: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  presetDescription: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  presetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs / 2,
  },
  presetMetaText: {
    ...Typography.body.small,
    color: Colors.text.tertiary,
    fontSize: 11,
  },
  backButton: {
    marginBottom: Spacing.m,
  },
  backButtonText: {
    ...Typography.body.regular,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  customizationPanel: {
    flex: 1,
  },
  customizationContent: {
    flex: 1,
  },
  customizationScrollContent: {
    paddingBottom: Spacing.l,
  },
  sectionTitle: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.m,
  },
  sliderContainer: {
    marginBottom: Spacing.l,
  },
  sliderLabel: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sliderValue: {
    ...Typography.body.small,
    color: Colors.text.primary,
    width: 50,
    fontWeight: '600',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  sliderButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  previewInfo: {
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 12,
    padding: Spacing.m,
    marginTop: Spacing.m,
  },
  previewInfoTitle: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs / 2,
    fontWeight: '600',
  },
  previewInfoText: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs / 2,
  },
  previewInfoDescription: {
    ...Typography.body.small,
    color: Colors.text.secondary,
  },
  applyButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  confirmButton: {
    marginTop: Spacing.l,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    ...Typography.ui.button,
    color: Colors.backgrounds.primary,
  },
  quickApplyContainer: {
    paddingTop: Spacing.m,
  },
  quickApplyButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
});
