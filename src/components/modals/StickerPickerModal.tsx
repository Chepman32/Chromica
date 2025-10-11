// Sticker picker modal with free and pro assets

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { STICKERS, STICKER_CATEGORIES } from '../../constants/assets';
import { useAppStore } from '../../stores/appStore';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth, height: initialScreenHeight } =
  Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_GAP = Spacing.xs;
const STICKER_SIZE =
  (screenWidth - Spacing.m * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

interface Sticker {
  id: string;
  name: string;
  uri?: string;
  file?: any;
  category: string;
  isPro: boolean;
  width?: number;
  height?: number;
}

// Combine free and pro stickers
const ALL_STICKERS = [...STICKERS.free, ...STICKERS.pro];
type StickerCategory = (typeof STICKER_CATEGORIES)[number];

interface StickerPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (stickerUri: string, width: number, height: number) => void;
}

export const StickerPickerModal: React.FC<StickerPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const navigation = useNavigation();
  const isProUser = useAppStore(state => state.isProUser);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const modalHeight = useMemo(() => {
    // Let the sheet cover most of the screen while leaving breathing room at the top
    return Math.min(initialScreenHeight * 0.9, initialScreenHeight - 80);
  }, []);

  const filteredStickers = ALL_STICKERS.filter(sticker => {
    if (selectedCategory === 'all') {
      return isProUser || !sticker.isPro;
    }
    return (
      sticker.category === selectedCategory && (isProUser || !sticker.isPro)
    );
  });

  const handleStickerPress = (sticker: Sticker) => {
    if (sticker.isPro && !isProUser) {
      // Navigate to paywall
      onClose();
      navigation.navigate('Paywall' as never);
      return;
    }

    // Select the sticker - use file if available, otherwise uri
    const stickerSource = sticker.file || sticker.uri || '';
    onSelect(stickerSource, sticker.width || 100, sticker.height || 100);
    onClose();
  };

  const renderCategory = (category: StickerCategory) => {
    const isSelected = selectedCategory === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected,
          ]}
        >
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSticker = ({ item }: { item: Sticker }) => {
    const isLocked = item.isPro && !isProUser;

    return (
      <TouchableOpacity
        style={styles.stickerItem}
        onPress={() => handleStickerPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.stickerContainer}>
          <Image
            source={item.file ? item.file : { uri: item.uri }}
            style={[styles.stickerImage, isLocked && styles.stickerImageLocked]}
            resizeMode="contain"
          />

          {isLocked && (
            <View style={styles.lockedOverlay}>
              <View style={styles.crownBadge}>
                <Text style={styles.crownIcon}>👑</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height={modalHeight}>
      <View style={styles.container}>
        <Text style={styles.title}>Stickers</Text>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {STICKER_CATEGORIES.map(category => renderCategory(category))}
        </ScrollView>

        {/* Sticker Grid */}
        <FlatList
          data={filteredStickers}
          renderItem={renderSticker}
          keyExtractor={item => item.id}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {isProUser
                  ? 'No stickers in this category'
                  : 'Unlock Pro to access premium stickers'}
              </Text>
            </View>
          }
        />

        {/* Pro CTA */}
        {!isProUser && (
          <TouchableOpacity
            style={styles.proButton}
            onPress={() => {
              onClose();
              navigation.navigate('Paywall' as never);
            }}
          >
            <Text style={styles.proButtonText}>
              👑 Unlock 70+ Premium Stickers
            </Text>
          </TouchableOpacity>
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
  categoriesScroll: {
    marginBottom: Spacing.m,
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.l,
    paddingLeft: Spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: Spacing.s,
    marginVertical: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  categoryPillSelected: {
    backgroundColor: Colors.backgrounds.primary,
    borderColor: Colors.accent.primary,
  },
  categoryText: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
    fontWeight: '600',
    lineHeight: Typography.body.regular.lineHeight,
    textAlign: 'center',
    flexShrink: 0,
    paddingTop: 2,
    paddingBottom: 2,
  },
  categoryTextSelected: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  grid: {
    paddingBottom: Spacing.l,
  },
  stickerItem: {
    width: STICKER_SIZE,
    height: STICKER_SIZE,
    padding: GRID_GAP / 2,
  },
  stickerContainer: {
    flex: 1,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  stickerImageLocked: {
    opacity: 0.4,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  crownBadge: {
    width: 32,
    height: 32,
    backgroundColor: Colors.accent.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownIcon: {
    fontSize: 18,
  },
  emptyState: {
    paddingVertical: Spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body.regular,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  proButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  proButtonText: {
    ...Typography.ui.button,
    color: Colors.backgrounds.primary,
  },
});
