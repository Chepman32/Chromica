/**
 * RenameProjectModal - Modal for renaming projects with iOS keyboard
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../../constants/spacing';
import { Project } from '../../types';

interface RenameProjectModalProps {
  visible: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const RenameProjectModal: React.FC<RenameProjectModalProps> = ({
  visible,
  project,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const backdropOpacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      setName(project?.name || '');
      setError('');

      backdropOpacity.value = withSpring(1);
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
      });

      // Auto-focus input after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      backdropOpacity.value = withSpring(0);
      scale.value = withSpring(0.9);
    }
  }, [visible, project]);

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name cannot be empty');
      ReactNativeHapticFeedback.trigger('notificationError');
      return;
    }

    ReactNativeHapticFeedback.trigger('notificationSuccess');
    onSave(trimmedName);
    onClose();
  };

  const handleCancel = () => {
    ReactNativeHapticFeedback.trigger('selection');
    onClose();
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleCancel}
        >
          <Animated.View style={[styles.backdropOverlay, backdropStyle]} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          <Animated.View
            style={[
              styles.content,
              contentStyle,
              { marginBottom: insets.bottom + Spacing.m },
            ]}
          >
            <Text style={styles.title}>Rename Project</Text>

            <TextInput
              ref={inputRef}
              style={styles.input}
              value={name}
              onChangeText={text => {
                setName(text);
                setError('');
              }}
              placeholder="Enter project name"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              maxLength={50}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    flex: 1,
    backgroundColor: Colors.overlays.dark,
  },
  content: {
    width: '85%',
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: AppDimensions.cornerRadius.large,
    padding: Spacing.l,
  },
  title: {
    ...Typography.display.h3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  input: {
    ...Typography.body.large,
    color: Colors.text.primary,
    backgroundColor: Colors.backgrounds.tertiary,
    borderRadius: AppDimensions.cornerRadius.small,
    padding: Spacing.m,
    marginBottom: Spacing.s,
    borderWidth: 1,
    borderColor: Colors.backgrounds.tertiary,
  },
  errorText: {
    ...Typography.body.small,
    color: Colors.semantic.error,
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginTop: Spacing.s,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.m,
    borderRadius: AppDimensions.cornerRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.backgrounds.tertiary,
  },
  cancelButtonText: {
    ...Typography.body.regular,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.accent.primary,
  },
  saveButtonText: {
    ...Typography.body.regular,
    color: Colors.text.primary,
    fontWeight: '600',
  },
});

export default RenameProjectModal;
