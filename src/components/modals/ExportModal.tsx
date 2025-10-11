// Export modal with format and quality options

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../stores/appStore';
import { useEditorStore } from '../../stores/editorStore';
import { exportCanvasToImage } from '../../utils/imageExporter';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Share } from 'react-native';

const instagramIcon = require('../../assets/icons/instagram.png');
const xIcon = require('../../assets/icons/x-logo.png');

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  canvasDimensions: { width: number; height: number };
}

type ExportFormat = 'png' | 'jpg';

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  canvasDimensions,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<number>(100);
  const [isExporting, setIsExporting] = useState(false);

  const isProUser = useAppStore(state => state.isProUser);
  const {
    canvasElements,
    sourceImagePath,
    sourceImageDimensions,
    canvasSize: storedCanvasSize,
    appliedFilter,
  } = useEditorStore();

  const openCameraRoll = async () => {
    const iosPhotosUrl = 'photos-redirect://';
    const androidPhotosUrl = 'content://media/internal/images/media';

    const targetUrl = Platform.OS === 'ios' ? iosPhotosUrl : androidPhotosUrl;
    await Linking.openURL(targetUrl);
  };

  const exportImage = async () => {
    if (!sourceImagePath || !sourceImageDimensions) {
      Alert.alert('Error', 'No image to export');
      throw new Error('Missing source image');
    }

    setIsExporting(true);

    try {
      // Export canvas to image file
      // Use stored canvas size if available, otherwise use current canvas dimensions
      const result = await exportCanvasToImage(
        sourceImagePath,
        sourceImageDimensions,
        canvasElements,
        {
          format: selectedFormat,
          quality,
          addWatermark: !isProUser,
          canvasSize: storedCanvasSize || canvasDimensions,
        },
        appliedFilter,
      );

      return result;
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export image');
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToDevice = async () => {
    let exportResult: Awaited<ReturnType<typeof exportImage>> | null = null;
    try {
      exportResult = await exportImage();
    } catch {
      return;
    }

    try {
      setIsExporting(true);
      await CameraRoll.save(exportResult.filepath, { type: 'photo' });

      onClose();

      Alert.alert(
        'Saved to Photos',
        'Your image has been saved to the gallery.',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
          {
            text: 'View in gallery',
            onPress: () => {
              openCameraRoll().catch(err =>
                console.warn('Failed to open gallery:', err),
              );
            },
          },
        ],
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save image to Photos');
      // exportImage already displayed an alert, so nothing extra here
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToInstagram = async (): Promise<void> => {
    let exportResult: Awaited<ReturnType<typeof exportImage>> | null = null;
    try {
      exportResult = await exportImage();
    } catch {
      return;
    }

    try {
      setIsExporting(true);

      const options = {
        url: `file://${exportResult.filepath}`,
        type: exportResult.mime,
      };

      const result = await Share.share(options, {
        dialogTitle: 'Share on Instagram',
        subject: 'Instagram',
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error) {
      console.error('Share error (Instagram):', error);
      Alert.alert('Error', 'Could not share on Instagram.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareToX = async (): Promise<void> => {
    let exportResult: Awaited<ReturnType<typeof exportImage>> | null = null;
    try {
      exportResult = await exportImage();
    } catch {
      return;
    }

    try {
      setIsExporting(true);

      const options = {
        url: `file://${exportResult.filepath}`,
        type: exportResult.mime,
      };

      const result = await Share.share(options, {
        dialogTitle: 'Share on X',
        subject: 'X',
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error) {
      console.error('Share error (X):', error);
      Alert.alert('Error', 'Could not share on X.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={380}>
      <View style={styles.container}>
        {/* Export actions */}
        <View style={styles.actionList}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveToDevice}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={Colors.text.primary} />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>💾</Text>
                </View>
                <Text style={styles.actionText}>Save on device</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareToInstagram}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={Colors.text.primary} />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Image
                    source={instagramIcon}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.actionText}>Share on Instagram</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShareToX}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={Colors.text.primary} />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Image
                    source={xIcon}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.actionText}>Share on X</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  actionList: {
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 16,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgrounds.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  socialIcon: {
    width: 28,
    height: 28,
  },
  actionText: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});
