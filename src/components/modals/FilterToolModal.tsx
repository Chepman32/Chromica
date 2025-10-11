// Filter tool modal with Skia shader effects

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAppStore } from '../../stores/appStore';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');
const FILTER_COLUMNS = 3;
const FILTER_SIZE =
  (screenWidth - Spacing.m * 2 - Spacing.s * 2) / FILTER_COLUMNS;

// Get preview style for different filters
const getFilterPreviewStyle = (filterId: string) => {
  switch (filterId) {
    case 'bw':
      return { backgroundColor: '#888888' };
    case 'sepia':
      return { backgroundColor: '#D2B48C' };
    case 'vintage':
      return { backgroundColor: '#F4A460' };
    case 'cool':
      return { backgroundColor: '#87CEEB' };
    case 'warm':
      return { backgroundColor: '#FFB347' };
    case 'cinematic':
      return { backgroundColor: '#2F4F4F' };
    case 'film':
      return { backgroundColor: '#696969' };
    case 'hdr':
      return { backgroundColor: '#FFD700' };
    case 'portrait':
      return { backgroundColor: '#DDA0DD' };
    case 'landscape':
      return { backgroundColor: '#98FB98' };
    case 'neon':
      return { backgroundColor: '#FF1493' };
    case 'cyberpunk':
      return { backgroundColor: '#00FFFF' };
    case 'retro':
      return { backgroundColor: '#FF69B4' };
    default:
      return {};
  }
};

interface Filter {
  id: string;
  name: string;
  preview: string; // Base64 or URI for preview
  isPro: boolean;
  intensity?: number; // 0-1
}

// Mock filter data - would be replaced with actual Skia shader implementations
const FILTERS: Filter[] = [
  // Free filters
  { id: 'none', name: 'Original', preview: '', isPro: false },
  { id: 'bw', name: 'Black & White', preview: '', isPro: false },
  { id: 'sepia', name: 'Sepia', preview: '', isPro: false },
  { id: 'vintage', name: 'Vintage', preview: '', isPro: false },
  { id: 'cool', name: 'Cool', preview: '', isPro: false },
  { id: 'warm', name: 'Warm', preview: '', isPro: false },

  // Pro filters
  { id: 'cinematic', name: 'Cinematic', preview: '', isPro: true },
  { id: 'film', name: 'Film Grain', preview: '', isPro: true },
  { id: 'hdr', name: 'HDR', preview: '', isPro: true },
  { id: 'portrait', name: 'Portrait', preview: '', isPro: true },
  { id: 'landscape', name: 'Landscape', preview: '', isPro: true },
  { id: 'neon', name: 'Neon', preview: '', isPro: true },
  { id: 'cyberpunk', name: 'Cyberpunk', preview: '', isPro: true },
  { id: 'retro', name: 'Retro Wave', preview: '', isPro: true },
];

interface FilterToolModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filterId: string, intensity: number) => void;
}

export const FilterToolModal: React.FC<FilterToolModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const navigation = useNavigation();
  const isProUser = useAppStore(state => state.isProUser);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [intensity, setIntensity] = useState<number>(1.0);

  const availableFilters = FILTERS.filter(filter => isProUser || !filter.isPro);

  const handleFilterPress = (filter: Filter) => {
    if (filter.isPro && !isProUser) {
      // Navigate to paywall
      onClose();
      navigation.navigate('Paywall' as never);
      return;
    }

    setSelectedFilter(filter.id);
  };

  const handleApply = () => {
    onApply(selectedFilter, intensity);
    onClose();
  };

  const renderFilter = ({ item }: { item: Filter }) => {
    const isSelected = selectedFilter === item.id;
    const isLocked = item.isPro && !isProUser;

    return (
      <TouchableOpacity
        style={[styles.filterItem, isSelected && styles.filterItemSelected]}
        onPress={() => handleFilterPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.filterPreview}>
          {/* Filter preview with color indication */}
          <View
            style={[
              styles.previewPlaceholder,
              isLocked && styles.previewPlaceholderLocked,
              getFilterPreviewStyle(item.id),
            ]}
          >
            <Text style={styles.previewText}>{item.name.charAt(0)}</Text>
          </View>

          {/* Locked overlay for Pro filters */}
          {isLocked && (
            <View style={styles.lockedOverlay}>
              <View style={styles.lockBadge}>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            </View>
          )}

          {/* Pro badge */}
          {item.isPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.filterName, isSelected && styles.filterNameSelected]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderIntensityButton = (value: number, label: string) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.intensityButton,
        intensity === value && styles.intensityButtonActive,
      ]}
      onPress={() => setIntensity(value)}
    >
      <Text
        style={[
          styles.intensityButtonText,
          intensity === value && styles.intensityButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.7, 0.9]}>
      <View style={styles.container}>
        <Text style={styles.title}>Filters</Text>

        {/* Filter Grid */}
        <FlatList
          data={availableFilters}
          renderItem={renderFilter}
          keyExtractor={item => item.id}
          numColumns={FILTER_COLUMNS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          style={styles.filterList}
        />

        {/* Intensity Control */}
        {selectedFilter !== 'none' && (
          <View style={styles.intensitySection}>
            <Text style={styles.sectionLabel}>Intensity</Text>
            <View style={styles.intensityButtons}>
              {renderIntensityButton(0.3, '30%')}
              {renderIntensityButton(0.5, '50%')}
              {renderIntensityButton(0.7, '70%')}
              {renderIntensityButton(1.0, '100%')}
            </View>
          </View>
        )}

        {/* Apply Button */}
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filter</Text>
        </TouchableOpacity>

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
              👑 Unlock 8+ Premium Filters
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
  filterList: {
    maxHeight: 300,
  },
  grid: {
    paddingBottom: Spacing.m,
  },
  filterItem: {
    width: FILTER_SIZE,
    marginRight: Spacing.s,
    marginBottom: Spacing.m,
    alignItems: 'center',
  },
  filterItemSelected: {
    // Selection handled by border on preview
  },
  filterPreview: {
    width: FILTER_SIZE - 10,
    height: FILTER_SIZE - 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  previewPlaceholder: {
    flex: 1,
    backgroundColor: Colors.backgrounds.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  previewPlaceholderLocked: {
    opacity: 0.4,
  },
  previewText: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
    fontSize: 18,
    fontWeight: '600',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgrounds.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 14,
  },
  proBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    ...Typography.body.caption,
    color: Colors.backgrounds.primary,
    fontSize: 8,
    fontWeight: '700',
  },
  filterName: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontSize: 11,
  },
  filterNameSelected: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  intensitySection: {
    marginTop: Spacing.m,
    marginBottom: Spacing.m,
  },
  sectionLabel: {
    ...Typography.body.caption,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.s,
  },
  intensityButtons: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  intensityButton: {
    flex: 1,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 8,
    paddingVertical: Spacing.s,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intensityButtonActive: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.backgrounds.primary,
  },
  intensityButtonText: {
    ...Typography.body.small,
    color: Colors.text.secondary,
  },
  intensityButtonTextActive: {
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.m,
  },
  applyButtonText: {
    ...Typography.ui.button,
    color: Colors.backgrounds.primary,
  },
  proButton: {
    backgroundColor: Colors.accent.primary + '15',
    borderRadius: 12,
    padding: Spacing.m,
    alignItems: 'center',
    marginTop: Spacing.s,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
  },
  proButtonText: {
    ...Typography.body.regular,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
});
