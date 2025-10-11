// Home screen - Project gallery with FAB and staggered animations

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useProjectGalleryStore } from '../stores/projectGalleryStore';
import { useAppStore } from '../stores/appStore';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { Shadows } from '../constants/colors';
import { Project } from '../types';

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_ITEM_SIZE =
  (screenWidth - Spacing.m * 2 - Spacing.m * 2) / GRID_COLUMNS;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const isProUser = useAppStore(state => state.isProUser);
  const {
    projects,
    selectionMode,
    selectedIds,
    isLoading,
    loadProjects,
    deleteProjects,
    duplicateProject,
    enterSelectionMode,
    exitSelectionMode,
    toggleSelection,
  } = useProjectGalleryStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const handleFabPress = () => {
    try {
      // Navigate to Image Picker
      navigation.navigate('ImagePicker' as never);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleProjectPress = (project: Project) => {
    if (selectionMode) {
      toggleSelection(project.id);
    } else {
      navigation.navigate(
        'Editor' as never,
        { projectId: project.id } as never,
      );
    }
  };

  const handleProjectLongPress = (project: Project) => {
    if (!selectionMode) {
      enterSelectionMode();
      toggleSelection(project.id);
    }
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    Alert.alert(
      'Delete Projects',
      `Delete ${count} project${count > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProjects(Array.from(selectedIds)),
        },
      ],
    );
  };

  const handleDuplicateSelected = async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await duplicateProject(id);
    }
    exitSelectionMode();
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };

  const handleProPress = () => {
    navigation.navigate('Paywall' as never);
  };

  // Animated project item component
  const AnimatedProjectItem = ({
    item,
    index,
  }: {
    item: Project;
    index: number;
  }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const scale = useSharedValue(0.9);
    const isSelected = selectedIds.has(item.id);

    useEffect(() => {
      // Staggered entrance animation
      opacity.value = withDelay(index * 50, withTiming(1, { duration: 400 }));
      translateY.value = withDelay(
        index * 50,
        withSpring(0, { damping: 15, stiffness: 100 }),
      );
      scale.value = withDelay(
        index * 50,
        withSpring(1, { damping: 12, stiffness: 80 }),
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    return (
      <Animated.View
        style={[styles.projectItem, animatedStyle]}
        layout={Layout.springify()}
        exiting={FadeOut.duration(200)}
      >
        <TouchableOpacity
          style={[styles.touchable, isSelected && styles.projectItemSelected]}
          onPress={() => handleProjectPress(item)}
          onLongPress={() => handleProjectLongPress(item)}
          activeOpacity={0.8}
        >
          <View style={styles.projectThumbnail}>
            {item.thumbnailPath ? (
              <Image
                source={{ uri: item.thumbnailPath }}
                style={styles.thumbnailImage}
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <Text style={styles.thumbnailPlaceholderText}>📷</Text>
              </View>
            )}

            {/* Timestamp badge */}
            <View style={styles.timestampBadge}>
              <Text style={styles.timestampText}>
                {formatTimestamp(item.updatedAt)}
              </Text>
            </View>

            {/* Selection indicator */}
            {selectionMode && (
              <View
                style={[
                  styles.selectionIndicator,
                  isSelected && styles.selectionIndicatorSelected,
                ]}
              >
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderProject = ({ item, index }: { item: Project; index: number }) => (
    <AnimatedProjectItem item={item} index={index} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Text style={styles.emptyStateIconText}>🖼️</Text>
      </View>
      <Text style={styles.emptyStateTitle}>No Projects Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Tap the + button to create your first masterpiece
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleSettingsPress}
        >
          <Text style={styles.topBarIcon}>⚙️</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Artifex</Text>

        {!isProUser && (
          <TouchableOpacity
            style={styles.topBarButton}
            onPress={handleProPress}
          >
            <Text style={styles.crownIcon}>👑</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selection Mode Top Bar */}
      {selectionMode && (
        <View style={styles.selectionTopBar}>
          <TouchableOpacity onPress={exitSelectionMode}>
            <Text style={styles.selectionAction}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.selectionTitle}>{selectedIds.size} Selected</Text>

          <TouchableOpacity onPress={handleDeleteSelected}>
            <Text style={styles.deleteAction}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Project Grid */}
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={item => item.id}
        numColumns={GRID_COLUMNS}
        contentContainerStyle={styles.gridContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <View style={styles.fab}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={selectionMode ? handleDuplicateSelected : handleFabPress}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>{selectionMode ? '📋' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 56,
  },
  topBarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarIcon: {
    fontSize: 20,
  },
  title: {
    ...Typography.display.h4,
    color: Colors.text.primary,
    letterSpacing: 0.5,
  },
  crownIcon: {
    fontSize: 20,
  },
  selectionTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 44,
    backgroundColor: Colors.backgrounds.secondary,
  },
  selectionAction: {
    ...Typography.body.regular,
    color: Colors.accent.secondary,
  },
  selectionTitle: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  deleteAction: {
    fontSize: 20,
  },
  gridContainer: {
    padding: Spacing.m,
    flexGrow: 1,
  },
  projectItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    marginRight: Spacing.m,
    marginBottom: Spacing.m,
  },
  touchable: {
    flex: 1,
  },
  projectItemSelected: {
    transform: [{ scale: 0.98 }],
  },
  projectThumbnail: {
    flex: 1,
    borderRadius: AppDimensions.cornerRadius.medium,
    backgroundColor: Colors.backgrounds.tertiary,
    ...Shadows.level1,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 32,
    opacity: 0.5,
  },
  timestampBadge: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timestampText: {
    ...Typography.body.caption,
    color: Colors.text.primary,
    fontSize: 10,
    fontWeight: '500',
  },
  selectionIndicator: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.text.primary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: Colors.accent.secondary,
    borderColor: Colors.accent.secondary,
  },
  checkmark: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  emptyStateIconText: {
    fontSize: 64,
    opacity: 0.3,
  },
  emptyStateTitle: {
    ...Typography.display.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.s,
  },
  emptyStateSubtitle: {
    ...Typography.body.regular,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.l + 34, // Account for safe area
    right: Spacing.l,
    width: AppDimensions.fab.size,
    height: AppDimensions.fab.size,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.accent.primary,
    borderRadius: AppDimensions.fab.cornerRadius,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.goldGlow,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.backgrounds.primary,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
