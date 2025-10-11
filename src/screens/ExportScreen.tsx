/**
 * Export Screen - Save and share edited images
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Share from 'react-native-share';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { EffectRenderer } from '../components/effects/EffectRenderer';
import { EFFECTS } from '../domain/effects/registry';

type ExportFormat = 'jpeg' | 'png';
type ExportQuality = 50 | 80 | 95 | 100;

export const ExportScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { imageUri, effectId, params } = route.params as {
    imageUri: string;
    effectId?: string;
    params?: Record<string, any>;
  };

  const image = useImage(imageUri);
  const effect = effectId ? EFFECTS.find(e => e.id === effectId) : null;

  const [format, setFormat] = useState<ExportFormat>('jpeg');
  const [quality, setQuality] = useState<ExportQuality>(80);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    try {
      setExporting(true);
      ReactNativeHapticFeedback.trigger('impactMedium');

      // Save to camera roll
      await CameraRoll.save(imageUri, { type: 'photo' });

      ReactNativeHapticFeedback.trigger('notificationSuccess');
      Alert.alert('Success', 'Image saved to Photos!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Save error:', error);
      ReactNativeHapticFeedback.trigger('notificationError');
      Alert.alert('Error', 'Failed to save image');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      setExporting(true);
      ReactNativeHapticFeedback.trigger('impactMedium');

      await Share.open({
        url: imageUri,
        type: 'image/jpeg',
      });

      ReactNativeHapticFeedback.trigger('notificationSuccess');
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Share error:', error);
        ReactNativeHapticFeedback.trigger('notificationError');
      }
    } finally {
      setExporting(false);
    }
  };

  const formatButtons: { format: ExportFormat; label: string }[] = [
    { format: 'jpeg', label: 'JPG' },
    { format: 'png', label: 'PNG' },
  ];

  const qualityButtons: { quality: ExportQuality; label: string }[] = [
    { quality: 50, label: 'Low' },
    { quality: 80, label: 'Medium' },
    { quality: 95, label: 'High' },
    { quality: 100, label: 'Max' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        {image && (
          <Canvas style={styles.preview}>
            <EffectRenderer
              image={image}
              effect={effect}
              params={params || null}
              x={0}
              y={0}
              width={300}
              height={300}
            />
          </Canvas>
        )}
      </View>

      {/* Format Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Format</Text>
        <View style={styles.buttonRow}>
          {formatButtons.map(btn => (
            <TouchableOpacity
              key={btn.format}
              onPress={() => setFormat(btn.format)}
              style={[
                styles.optionButton,
                format === btn.format && styles.optionButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  format === btn.format && styles.optionButtonTextSelected,
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quality Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quality</Text>
        <View style={styles.buttonRow}>
          {qualityButtons.map(btn => (
            <TouchableOpacity
              key={btn.quality}
              onPress={() => setQuality(btn.quality)}
              style={[
                styles.optionButton,
                quality === btn.quality && styles.optionButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  quality === btn.quality && styles.optionButtonTextSelected,
                ]}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={exporting}
          style={[styles.actionButton, styles.saveButton]}
        >
          {exporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.actionButtonText}>Save to Photos</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          disabled={exporting}
          style={[styles.actionButton, styles.shareButton]}
        >
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  header: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  preview: {
    width: 300,
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1F1F2E',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#6366F1',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  optionButtonTextSelected: {
    color: '#FFFFFF',
  },
  actions: {
    padding: 20,
    gap: 12,
    marginTop: 'auto',
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  shareButton: {
    backgroundColor: '#1F1F2E',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
