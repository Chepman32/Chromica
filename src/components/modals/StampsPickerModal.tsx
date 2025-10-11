// Stamps picker modal with free and pro assets

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
import { STAMPS, STAMP_CATEGORIES } from '../../constants/assets';
import { useAppStore } from '../../stores/appStore';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth, height: initialScreenHeight } =
  Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_GAP = Spacing.xs;
const STAMP_SIZE =
  (screenWidth - Spacing.m * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

interface Stamp {
  id: string;
  name: string;
  uri?: string;
  file?: any;
  category: string;
  isPro: boolean;
  width?: number;
  height?: number;
}

// Combine free and pro stamps
const ALL_STAMPS = [...STAMPS.free, ...STAMPS.pro];
type StampCategory = (typeof STAMP_CATEGORIES)[number];

interface StampsPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (stampUri: string, width: number, height: number) => void;
}

export const StampsPickerModal: React.FC<StampsPickerModalProps> = ({
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

  const filteredStamps = ALL_STAMPS.filter(stamp => {
    if (selectedCategory === 'all') {
      return isProUser || !stamp.isPro;
    }
    return stamp.category === selectedCategory && (isProUser || !stamp.isPro);
  });

  const handleStampPress = (stamp: Stamp) => {
    if (stamp.isPro && !isProUser) {
      // Navigate to paywall
      onClose();
      navigation.navigate('Paywall' as never);
      return;
    }

    // Select the stamp - use file if available, otherwise uri
    const stampSource = stamp.file || stamp.uri || '';
    onSelect(stampSource, stamp.width || 80, stamp.height || 80);
    onClose();
  };

  const renderCategory = (category: StampCategory) => {
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

  const renderStamp = ({ item }: { item: Stamp }) => {
    const isLocked = item.isPro && !isProUser;

    return (
      <TouchableOpacity
        style={styles.stampItem}
        onPress={() => handleStampPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.stampContainer}>
          <Image
            source={item.file ? item.file : { uri: item.uri }}
            style={[styles.stampImage, isLocked && styles.stampImageLocked]}
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
        <Text style={styles.title}>Stamps</Text>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContainer}
        >
          {STAMP_CATEGORIES.map(category => renderCategory(category))}
        </ScrollView>

        {/* Stamp Grid */}
        <FlatList
          data={filteredStamps}
          renderItem={renderStamp}
          keyExtractor={item => item.id}
          numColumns={GRID_COLUMNS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {isProUser
                  ? 'No stamps in this category'
                  : 'Unlock Pro to access premium stamps'}
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
            <Text style={styles.proButtonText}>👑 Unlock Premium Stamps</Text>
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
  },
  categoryPill: {
    paddingHorizontal: Spacing.l,
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
  stampItem: {
    width: STAMP_SIZE,
    height: STAMP_SIZE,
    padding: GRID_GAP / 2,
  },
  stampContainer: {
    flex: 1,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  stampImage: {
    width: '100%',
    height: '100%',
  },
  stampImageLocked: {
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
