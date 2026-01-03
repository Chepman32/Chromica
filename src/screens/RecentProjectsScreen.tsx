/**
 * Recent Projects Screen - List of recent app projects with thumbnails
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { useProjectGalleryStore } from '../stores/projectGalleryStore';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { Shadows } from '../constants/colors';
import { Project } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_SIZE = 72;

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const RecentProjectsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { projects, isLoading, loadProjects } = useProjectGalleryStore();

  // Reload projects every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('RecentProjectsScreen focused, loading projects...');
      loadProjects();
    }, [loadProjects]),
  );

  // Debug log
  useEffect(() => {
    console.log('Projects in store:', projects.length, projects);
  }, [projects]);

  const handleProjectPress = (project: Project) => {
    ReactNativeHapticFeedback.trigger('impactLight');
    navigation.navigate('Editor' as never, { projectId: project.id } as never);
  };

  const handleBackPress = () => {
    ReactNativeHapticFeedback.trigger('selection');
    navigation.goBack();
  };

  const renderProjectItem = ({
    item,
    index,
  }: {
    item: Project;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      layout={Layout.springify()}
    >
      <TouchableOpacity
        style={styles.projectItem}
        onPress={() => handleProjectPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          {item.thumbnailPath ? (
            <Image
              source={{ uri: item.thumbnailPath }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.placeholderIcon}>🖼️</Text>
            </View>
          )}
        </View>

        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle} numberOfLines={1}>
            Project
          </Text>
          <Text style={styles.projectDate}>
            {formatTimestamp(item.updatedAt)}
          </Text>
          <Text style={styles.projectElements}>
            {item.elements.length} element
            {item.elements.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.chevron}>
          <Text style={styles.chevronIcon}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📂</Text>
      <Text style={styles.emptyTitle}>No Recent Projects</Text>
      <Text style={styles.emptySubtitle}>
        Your edited projects will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recent Projects</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Project List */}
      <FlatList
        data={projects}
        renderItem={renderProjectItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={loadProjects}
      />
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
    paddingVertical: Spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgrounds.secondary,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: Colors.text.primary,
    fontWeight: '300',
  },
  headerTitle: {
    ...Typography.display.h4,
    color: Colors.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  listContent: {
    padding: Spacing.m,
    flexGrow: 1,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: AppDimensions.cornerRadius.medium,
    padding: Spacing.s,
    marginBottom: Spacing.s,
    ...Shadows.level1,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: AppDimensions.cornerRadius.small,
    overflow: 'hidden',
    backgroundColor: Colors.backgrounds.tertiary,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 28,
    opacity: 0.5,
  },
  projectInfo: {
    flex: 1,
    marginLeft: Spacing.m,
  },
  projectTitle: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  projectDate: {
    ...Typography.body.caption,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  projectElements: {
    ...Typography.body.caption,
    color: Colors.text.tertiary,
  },
  chevron: {
    paddingHorizontal: Spacing.s,
  },
  chevronIcon: {
    fontSize: 24,
    color: Colors.text.tertiary,
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.m,
    opacity: 0.3,
  },
  emptyTitle: {
    ...Typography.display.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body.regular,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default RecentProjectsScreen;
