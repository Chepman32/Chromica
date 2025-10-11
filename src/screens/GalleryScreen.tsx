/**
 * Gallery Screen - Photo selection with filters and gestures
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 2;
const ITEM_SIZE = (SCREEN_WIDTH - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

type FilterType = 'all' | 'recent' | 'favorites';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All Photos' },
  { id: 'recent', label: 'Recent' },
  { id: 'favorites', label: 'Favorites' },
];

export const GalleryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [photos, setPhotos] = useState<PhotoIdentifier[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const scrollY = useSharedValue(0);
  const fabScale = useSharedValue(1);

  useEffect(() => {
    loadPhotos();
  }, [selectedFilter]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const result = await CameraRoll.getPhotos({
        first: 100,
        assetType: 'Photos',
      });
      setPhotos(result.edges);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoPress = async (photo: PhotoIdentifier) => {
    ReactNativeHapticFeedback.trigger('impactLight');

    const phUri = photo.node.image.uri;
    console.log('Photo selected:', {
      uri: phUri,
      width: photo.node.image.width,
      height: photo.node.image.height,
    });

    // Convert ph:// URI to file:// URI by copying to temp directory
    try {
      if (phUri.startsWith('ph://')) {
        // Extract the asset ID from ph:// URI
        const assetId = phUri.replace('ph://', '').split('/')[0];

        // Use CameraRoll to get the photo with proper file path
        const photoData = await CameraRoll.iosGetImageDataById(assetId);

        if (photoData?.node?.image?.filepath) {
          // Check if filepath already has file:// prefix
          const filepath = photoData.node.image.filepath;
          const fileUri = filepath.startsWith('file://')
            ? filepath
            : `file://${filepath}`;
          console.log('Converted to file URI:', fileUri);

          navigation.navigate('EffectsEditor' as never, {
            imageUri: fileUri,
            imageDimensions: {
              width: photo.node.image.width,
              height: photo.node.image.height,
            },
          } as never);
          return;
        }
      }

      // If not ph:// or conversion failed, use original URI
      navigation.navigate('EffectsEditor' as never, {
        imageUri: phUri,
      } as never);
    } catch (error) {
      console.error('Error converting photo URI:', error);
      // Fallback: use original URI
      navigation.navigate('EffectsEditor' as never, {
        imageUri: phUri,
      } as never);
    }
  };

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.assets && result.assets[0]) {
      navigation.navigate(
        'Editor' as never,
        { imageUri: result.assets[0].uri } as never,
      );
    }
  };

  const handleChooseFromLibrary = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });

    if (result.assets && result.assets[0]) {
      navigation.navigate(
        'Editor' as never,
        { imageUri: result.assets[0].uri } as never,
      );
    }
  };

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, 100],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  const renderPhotoItem = ({
    item,
    index,
  }: {
    item: PhotoIdentifier;
    index: number;
  }) => (
    <Pressable
      onPress={() => handlePhotoPress(item)}
      style={({ pressed }) => [
        styles.photoItem,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Image
        source={{ uri: item.node.image.uri }}
        style={styles.photoImage}
        resizeMode="cover"
      />
    </Pressable>
  );

  const renderFilterPill = (filter: { id: FilterType; label: string }) => {
    const isSelected = selectedFilter === filter.id;

    return (
      <TouchableOpacity
        key={filter.id}
        onPress={() => {
          setSelectedFilter(filter.id);
          ReactNativeHapticFeedback.trigger('selection');
        }}
        style={[styles.filterPill, isSelected && styles.filterPillSelected]}
      >
        <Text
          style={[
            styles.filterPillText,
            isSelected && styles.filterPillTextSelected,
          ]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chromica</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings' as never)}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map(renderFilterPill)}
      </ScrollView>

      {/* Photo Grid */}
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item, index) => `${item.node.image.uri}_${index}`}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.gridContent}
        onScroll={event => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        refreshing={loading}
        onRefresh={loadPhotos}
      />

      {/* Floating Action Button */}
      <Animated.View style={[styles.fab, fabAnimatedStyle]}>
        <TouchableOpacity
          onPress={handleChooseFromLibrary}
          style={styles.fabButton}
          onPressIn={() => {
            fabScale.value = withSpring(0.9);
          }}
          onPressOut={() => {
            fabScale.value = withSpring(1);
          }}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  filterContainer: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1F1F2E',
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillSelected: {
    backgroundColor: '#6366F1',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  filterPillTextSelected: {
    color: '#FFFFFF',
  },
  gridContent: {
    padding: SPACING,
  },
  photoItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: SPACING / 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
