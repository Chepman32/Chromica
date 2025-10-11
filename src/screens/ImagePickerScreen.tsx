// Image picker screen with proper iOS permissions

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLUMNS = 4;
const GRID_ITEM_SIZE =
  (screenWidth - Spacing.xs * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

interface PhotoAsset {
  uri: string;
  filename: string;
  width: number;
  height: number;
  timestamp: Date;
}

// Fallback photos if CameraRoll fails
const FALLBACK_PHOTOS: PhotoAsset[] = [
  {
    uri: 'https://picsum.photos/400/400?random=1',
    filename: 'Sample Photo 1',
    width: 400,
    height: 400,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/400/600?random=2',
    filename: 'Sample Photo 2',
    width: 400,
    height: 600,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/600/400?random=3',
    filename: 'Sample Photo 3',
    width: 600,
    height: 400,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/500/500?random=4',
    filename: 'Sample Photo 4',
    width: 500,
    height: 500,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/400/700?random=5',
    filename: 'Sample Photo 5',
    width: 400,
    height: 700,
    timestamp: new Date(),
  },
  {
    uri: 'https://picsum.photos/700/400?random=6',
    filename: 'Sample Photo 6',
    width: 700,
    height: 400,
    timestamp: new Date(),
  },
];

const ImagePickerScreen: React.FC = () => {
  const navigation = useNavigation();
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      // Request permissions first
      if (Platform.OS === 'android') {
        const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permission);

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Android permission denied, using fallback photos');
          setPhotos(FALLBACK_PHOTOS);
          setLoading(false);
          return;
        }
      }

      // Try to load real photos with file URIs
      const result = await CameraRoll.getPhotos({
        first: 20,
        assetType: 'Photos',
        include: ['filename', 'imageSize'], // Request additional info
      });

      if (result.edges && result.edges.length > 0) {
        const devicePhotos: PhotoAsset[] = result.edges.map(edge => ({
          uri: edge.node.image.uri,
          filename: edge.node.image.filename || 'Photo',
          width: edge.node.image.width || 400,
          height: edge.node.image.height || 400,
          timestamp: new Date(edge.node.timestamp * 1000),
        }));

        setPhotos(devicePhotos);
      } else {
        // No photos found, use fallback
        setPhotos(FALLBACK_PHOTOS);
      }
    } catch (error) {
      console.log('Failed to load photos, using fallback:', error);
      setPhotos(FALLBACK_PHOTOS);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (photo: PhotoAsset) => {
    // Close the modal first, then navigate to Editor
    navigation.goBack();

    // Small delay to ensure smooth modal dismissal
    setTimeout(() => {
      navigation.navigate(
        'Editor' as never,
        {
          imageUri: photo.uri,
          imageDimensions: { width: photo.width, height: photo.height },
        } as never,
      );
    }, 150);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderPhoto = ({ item }: { item: PhotoAsset }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoSelect(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.uri }}
        style={styles.photoImage}
        onError={() => console.log('Image failed to load:', item.uri)}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.dragHandle} />

        <View style={styles.placeholder} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Select Photo</Text>
        <Text style={styles.subtitle}>
          {loading ? 'Loading photos...' : `${photos.length} photos available`}
        </Text>
      </View>

      {/* Photo Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your photos...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 60,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: Colors.text.secondary,
    fontWeight: '300',
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 2.5,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  titleContainer: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.m,
    alignItems: 'center',
  },
  title: {
    ...Typography.display.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
  },
  gridContainer: {
    padding: Spacing.xs,
  },
  photoItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    margin: Spacing.xs / 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.backgrounds.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
  },
});

export default ImagePickerScreen;
