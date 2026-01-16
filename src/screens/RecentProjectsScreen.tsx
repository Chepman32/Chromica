/**
 * Recent Projects Screen - List of recent app projects with thumbnails
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { useProjectGalleryStore } from '../stores/projectGalleryStore';
import { useAppStore } from '../stores/appStore';
import { SwipeableProjectItem } from '../components/projects/SwipeableProjectItem';
import { RenameProjectModal } from '../components/modals/RenameProjectModal';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Project } from '../types';
import { useTranslation } from '../hooks/useTranslation';

export const RecentProjectsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { projects, isLoading, loadProjects, deleteProjects, duplicateProject, renameProject } =
    useProjectGalleryStore();
  const { preferences } = useAppStore();
  const { recents, common } = useTranslation();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);

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
    if (Array.isArray(project.mixStack)) {
      (navigation as any).navigate('Mixes', { projectId: project.id });
      return;
    }
    (navigation as any).navigate('Editor', { projectId: project.id });
  };

  const handleBackPress = () => {
    ReactNativeHapticFeedback.trigger('selection');
    navigation.goBack();
  };

  const handleDelete = (id: string) => {
    const confirmDelete = preferences.confirmDelete ?? true;

    const executeDelete = () => {
      ReactNativeHapticFeedback.trigger('notificationSuccess');
      deleteProjects([id]);
    };

    if (confirmDelete) {
      Alert.alert(
        recents.deleteConfirmation.title,
        recents.deleteConfirmation.message,
        [
          {
            text: common.cancel,
            style: 'cancel',
            onPress: () => {
              ReactNativeHapticFeedback.trigger('selection');
            },
          },
          {
            text: common.delete,
            style: 'destructive',
            onPress: executeDelete,
          },
        ],
      );
    } else {
      executeDelete();
    }
  };

  const handleDuplicate = (id: string) => {
    ReactNativeHapticFeedback.trigger('notificationSuccess');
    duplicateProject(id);
  };

  const handleRename = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setSelectedProject(project);
      setShowRenameModal(true);
    }
  };

  const handleRenameSave = (name: string) => {
    if (selectedProject) {
      renameProject(selectedProject.id, name);
    }
    setShowRenameModal(false);
    setSelectedProject(null);
  };

  const handleRenameClose = () => {
    setShowRenameModal(false);
    setSelectedProject(null);
  };

  const renderProjectItem = ({
    item,
    index,
  }: {
    item: Project;
    index: number;
  }) => {
    return (
      <SwipeableProjectItem
        project={item}
        index={index}
        onPress={handleProjectPress}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onRename={handleRename}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📂</Text>
      <Text style={styles.emptyTitle}>{recents.emptyState.title}</Text>
      <Text style={styles.emptySubtitle}>
        {recents.emptyState.subtitle}
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{recents.title}</Text>
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

        {/* Rename Modal */}
        <RenameProjectModal
          visible={showRenameModal}
          project={selectedProject}
          onClose={handleRenameClose}
          onSave={handleRenameSave}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
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
    gap: Spacing.s,
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
