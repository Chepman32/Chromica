/**
 * SwipeableProjectItem - Project list item with swipe-to-delete and context menu
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { ContextMenuView } from 'react-native-ios-context-menu';

import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../../constants/spacing';
import { Shadows } from '../../constants/colors';
import { Project } from '../../types';

const THUMBNAIL_SIZE = 72;

interface SwipeableProjectItemProps {
  project: Project;
  index: number;
  onPress: (project: Project) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string) => void;
}

export const SwipeableProjectItem: React.FC<SwipeableProjectItemProps> = ({
  project,
  index,
  onPress,
  onDelete,
  onDuplicate,
  onRename,
}) => {
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

  const elementCount = Array.isArray(project.mixStack)
    ? project.mixStack.length
    : Array.isArray(project.elements)
      ? project.elements.length
      : project.effect
        ? 1
        : 0;

  const renderRightActions = () => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        ReactNativeHapticFeedback.trigger('impactMedium');
        onDelete(project.id);
      }}
    >
      <Text style={styles.deleteButtonText}>🗑️</Text>
      <Text style={styles.deleteButtonLabel}>Delete</Text>
    </TouchableOpacity>
  );

  const contextMenuConfig = {
    menuTitle: '',
    menuItems: [
      {
        actionKey: 'duplicate',
        actionTitle: 'Duplicate',
        icon: {
          type: 'IMAGE_SYSTEM' as const,
          imageValue: {
            systemName: 'doc.on.doc',
          },
        },
      },
      {
        actionKey: 'rename',
        actionTitle: 'Rename',
        icon: {
          type: 'IMAGE_SYSTEM' as const,
          imageValue: {
            systemName: 'pencil',
          },
        },
      },
      {
        actionKey: 'delete',
        actionTitle: 'Delete',
        menuAttributes: ['destructive'],
        icon: {
          type: 'IMAGE_SYSTEM' as const,
          imageValue: {
            systemName: 'trash',
          },
        },
      },
    ],
  };

  const handleContextMenuPress = (event: any) => {
    ReactNativeHapticFeedback.trigger('selection');

    const actionKey = event.nativeEvent.actionKey;

    switch (actionKey) {
      case 'duplicate':
        onDuplicate(project.id);
        break;
      case 'rename':
        onRename(project.id);
        break;
      case 'delete':
        ReactNativeHapticFeedback.trigger('impactHeavy');
        onDelete(project.id);
        break;
    }
  };

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
    onPress(project);
  };

  const handleSwipeableOpen = () => {
    ReactNativeHapticFeedback.trigger('impactLight');
  };

  const projectContent = (
    <View style={styles.projectItem}>
      <View style={styles.thumbnailContainer}>
        {project.thumbnailPath ? (
          <Image
            source={{ uri: project.thumbnailPath }}
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
        <View style={styles.projectTitleRow}>
          <Text style={styles.projectTitle} numberOfLines={1}>
            {project.name || 'Untitled Project'}
          </Text>
          {Array.isArray(project.mixStack) && (
            <View style={styles.mixBadge}>
              <Text style={styles.mixBadgeText}>Mixed</Text>
            </View>
          )}
        </View>
        <Text style={styles.projectDate}>{formatTimestamp(project.updatedAt)}</Text>
        <Text style={styles.projectElements}>
          {elementCount} element{elementCount !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.chevron}>
        <Text style={styles.chevronIcon}>›</Text>
      </View>
    </View>
  );

  // Wrap with ContextMenuView for iOS
  const contextWrappedContent = Platform.OS === 'ios' ? (
    <ContextMenuView
      menuConfig={contextMenuConfig}
      onPressMenuItem={handleContextMenuPress}
      onMenuWillShow={() => {
        ReactNativeHapticFeedback.trigger('impactMedium');
      }}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {projectContent}
      </TouchableOpacity>
    </ContextMenuView>
  ) : (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      {projectContent}
    </TouchableOpacity>
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
      layout={Layout.springify()}
    >
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={handleSwipeableOpen}
        overshootRight={false}
        friction={2}
      >
        {contextWrappedContent}
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: AppDimensions.cornerRadius.medium,
    padding: Spacing.s,
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
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mixBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: AppDimensions.cornerRadius.small,
    backgroundColor: Colors.backgrounds.tertiary,
    borderWidth: 1,
    borderColor: Colors.overlays.light,
  },
  mixBadgeText: {
    ...Typography.body.finePrint,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
    height: '100%',
    borderTopRightRadius: AppDimensions.cornerRadius.medium,
    borderBottomRightRadius: AppDimensions.cornerRadius.medium,
  },
  deleteButtonText: {
    fontSize: 24,
    marginBottom: 4,
  },
  deleteButtonLabel: {
    ...Typography.body.small,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SwipeableProjectItem;
