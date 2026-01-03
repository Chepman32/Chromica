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
  Image,
} from 'react-native';

const InstagramIcon = require('../assets/icons/export/Instagram.png');
const XIcon = require('../assets/icons/export/X.png');
const GalleryIcon = require('../assets/icons/export/Gallery.png');
const FilesIcon = require('../assets/icons/export/Files.png');
const ShareIcon = require('../assets/icons/export/Share.png');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Share, { Social } from 'react-native-share';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { EffectRenderer } from '../components/effects/EffectRenderer';
import { EFFECTS } from '../domain/effects/registry';

type ExportAction = 'instagram' | 'x' | 'gallery' | 'files' | 'share' | null;

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

  const [exportingAction, setExportingAction] = useState<ExportAction>(null);

  const handleSave = async () => {
    try {
      setExportingAction('gallery');
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
      setExportingAction(null);
    }
  };

  const handleShare = async () => {
    try {
      setExportingAction('share');
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
      setExportingAction(null);
    }
  };

  const handleShareInstagram = async () => {
    try {
      setExportingAction('instagram');
      ReactNativeHapticFeedback.trigger('impactMedium');

      await Share.shareSingle({
        url: imageUri,
        type: 'image/jpeg',
        social: Social.Instagram,
      });

      ReactNativeHapticFeedback.trigger('notificationSuccess');
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Share error:', error);
        ReactNativeHapticFeedback.trigger('notificationError');
      }
    } finally {
      setExportingAction(null);
    }
  };

  const handleShareX = async () => {
    try {
      setExportingAction('x');
      ReactNativeHapticFeedback.trigger('impactMedium');

      await Share.shareSingle({
        url: imageUri,
        type: 'image/jpeg',
        social: Social.Twitter,
      });

      ReactNativeHapticFeedback.trigger('notificationSuccess');
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Share error:', error);
        ReactNativeHapticFeedback.trigger('notificationError');
      }
    } finally {
      setExportingAction(null);
    }
  };

  const handleSaveToFiles = async () => {
    try {
      setExportingAction('files');
      ReactNativeHapticFeedback.trigger('impactMedium');

      await Share.open({
        url: imageUri,
        type: 'image/jpeg',
        saveToFiles: true,
      });

      ReactNativeHapticFeedback.trigger('notificationSuccess');
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Save to files error:', error);
        ReactNativeHapticFeedback.trigger('notificationError');
      }
    } finally {
      setExportingAction(null);
    }
  };

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

      {/* Export Options Grid */}
      <View style={styles.exportGrid}>
        {/* Row 1 */}
        <TouchableOpacity
          onPress={handleShareInstagram}
          disabled={exportingAction !== null}
          style={styles.gridItem}
        >
          <View style={styles.iconContainer}>
            {exportingAction === 'instagram' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Image source={InstagramIcon} style={styles.icon} resizeMode="contain" />
            )}
          </View>
          <Text style={styles.gridItemLabel}>Instagram</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShareX}
          disabled={exportingAction !== null}
          style={styles.gridItem}
        >
          <View style={styles.iconContainer}>
            {exportingAction === 'x' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Image source={XIcon} style={styles.icon} resizeMode="contain" />
            )}
          </View>
          <Text style={styles.gridItemLabel}>X</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={exportingAction !== null}
          style={styles.gridItem}
        >
          <View style={styles.iconContainer}>
            {exportingAction === 'gallery' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Image source={GalleryIcon} style={styles.icon} resizeMode="contain" />
            )}
          </View>
          <Text style={styles.gridItemLabel}>Gallery</Text>
        </TouchableOpacity>

        {/* Row 2 */}
        <TouchableOpacity
          onPress={handleSaveToFiles}
          disabled={exportingAction !== null}
          style={styles.gridItem}
        >
          <View style={styles.iconContainer}>
            {exportingAction === 'files' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Image source={FilesIcon} style={styles.icon} resizeMode="contain" />
            )}
          </View>
          <Text style={styles.gridItemLabel}>Files</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          disabled={exportingAction !== null}
          style={styles.gridItem}
        >
          <View style={styles.iconContainer}>
            {exportingAction === 'share' ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Image source={ShareIcon} style={styles.icon} resizeMode="contain" />
            )}
          </View>
          <Text style={styles.gridItemLabel}>Share</Text>
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
  exportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 12,
    padding: 20,
    marginTop: 'auto',
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#1F1F2E',
    borderRadius: 16,
    padding: 16,
    paddingVertical: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F0F1E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 32,
    height: 32,
  },
  gridItemLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
