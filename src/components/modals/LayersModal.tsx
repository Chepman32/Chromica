// Layers modal for managing canvas elements

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { BottomSheet } from './BottomSheet';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useEditorStore } from '../../stores/editorStore';
import { CanvasElement } from '../../types';

interface LayersModalProps {
  visible: boolean;
  onClose: () => void;
}

const getElementIcon = (type: CanvasElement['type']) => {
  switch (type) {
    case 'text':
      return '📝';
    case 'sticker':
      return '😀';
    case 'watermark':
      return '💧';
    case 'stamp':
      return '🏷️';
    default:
      return '📄';
  }
};

const getElementName = (element: CanvasElement) => {
  switch (element.type) {
    case 'text':
      return element.textContent || 'Text';
    case 'sticker':
    case 'watermark':
    case 'stamp':
      return element.type.charAt(0).toUpperCase() + element.type.slice(1);
    default:
      return 'Element';
  }
};

export const LayersModal: React.FC<LayersModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    canvasElements,
    selectedElementIds,
    selectElement,
    updateElement,
    deleteElement,
    moveElementUp,
    moveElementDown,
  } = useEditorStore();

  // Sort elements by z-index (top to bottom in layers panel)
  const sortedElements = [...canvasElements].sort((a, b) => {
    const aIndex = canvasElements.indexOf(a);
    const bIndex = canvasElements.indexOf(b);
    return bIndex - aIndex; // Reverse order (newest first)
  });

  const handleElementSelect = (elementId: string) => {
    selectElement(elementId);
  };

  const handleElementDelete = (elementId: string) => {
    deleteElement(elementId);
  };

  const handleVisibilityToggle = (elementId: string) => {
    const element = canvasElements.find(el => el.id === elementId);
    if (element) {
      const newOpacity = (element.opacity ?? 1) > 0 ? 0 : 1;
      updateElement(elementId, { opacity: newOpacity });
    }
  };

  const handleMoveElementUp = (elementId: string) => {
    moveElementUp(elementId);
  };

  const handleMoveElementDown = (elementId: string) => {
    moveElementDown(elementId);
  };

  const renderLayerItem = ({
    item,
    index,
  }: {
    item: CanvasElement;
    index: number;
  }) => {
    const isSelected = selectedElementIds.includes(item.id);
    const isVisible = (item.opacity ?? 1) > 0;
    const canMoveUp = index > 0;
    const canMoveDown = index < sortedElements.length - 1;

    return (
      <TouchableOpacity
        style={[styles.layerItem, isSelected && styles.layerItemSelected]}
        onPress={() => handleElementSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.layerContent}>
          {/* Element Icon */}
          <Text style={styles.elementIcon}>{getElementIcon(item.type)}</Text>

          {/* Element Info */}
          <View style={styles.elementInfo}>
            <Text
              style={[
                styles.elementName,
                !isVisible && styles.elementNameHidden,
              ]}
            >
              {getElementName(item)}
            </Text>
            <Text style={styles.elementType}>{item.type}</Text>
          </View>

          {/* Layer Controls */}
          <View style={styles.layerControls}>
            {/* Visibility Toggle */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleVisibilityToggle(item.id)}
            >
              <Text style={styles.controlIcon}>{isVisible ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>

            {/* Move Up */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                !canMoveUp && styles.controlButtonDisabled,
              ]}
              onPress={() => handleMoveElementUp(item.id)}
              disabled={!canMoveUp}
            >
              <Text
                style={[
                  styles.controlIcon,
                  !canMoveUp && styles.controlIconDisabled,
                ]}
              >
                ⬆️
              </Text>
            </TouchableOpacity>

            {/* Move Down */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                !canMoveDown && styles.controlButtonDisabled,
              ]}
              onPress={() => handleMoveElementDown(item.id)}
              disabled={!canMoveDown}
            >
              <Text
                style={[
                  styles.controlIcon,
                  !canMoveDown && styles.controlIconDisabled,
                ]}
              >
                ⬇️
              </Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleElementDelete(item.id)}
            >
              <Text style={styles.controlIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={[0.6, 0.8]}>
      <View style={styles.container}>
        <Text style={styles.title}>Layers</Text>

        {canvasElements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📄</Text>
            <Text style={styles.emptyStateText}>No layers yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add text, stickers, or stamps to see them here
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedElements}
            renderItem={renderLayerItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.layersList}
            showsVerticalScrollIndicator={false}
            style={styles.layersContainer}
          />
        )}

        {/* Layer Count */}
        {canvasElements.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.layerCount}>
              {canvasElements.length} layer
              {canvasElements.length !== 1 ? 's' : ''}
            </Text>
          </View>
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
  layersContainer: {
    flex: 1,
    maxHeight: 400,
  },
  layersList: {
    paddingBottom: Spacing.m,
  },
  layerItem: {
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: 12,
    marginBottom: Spacing.s,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  layerItemSelected: {
    borderColor: Colors.accent.primary,
    backgroundColor: Colors.backgrounds.primary,
  },
  layerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
  },
  elementIcon: {
    fontSize: 24,
    marginRight: Spacing.m,
  },
  elementInfo: {
    flex: 1,
  },
  elementName: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  elementNameHidden: {
    opacity: 0.5,
  },
  elementType: {
    ...Typography.body.caption,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  layerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgrounds.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  controlIcon: {
    fontSize: 14,
  },
  controlIconDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.m,
  },
  emptyStateText: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.body.small,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    paddingTop: Spacing.m,
    borderTopWidth: 1,
    borderTopColor: Colors.backgrounds.tertiary,
    alignItems: 'center',
  },
  layerCount: {
    ...Typography.body.caption,
    color: Colors.text.secondary,
  },
});
