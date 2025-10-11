// Settings screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../stores/appStore';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';
import { ThemeType } from '../constants/themes';
import { Language, languageNames } from '../localization';
import { triggerHaptic } from '../utils/haptics';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const t = useTranslation();
  const { isProUser, preferences, updatePreferences } = useAppStore();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleThemeChange = (newTheme: ThemeType) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('selection');
    }
    updatePreferences({ theme: newTheme });
    setShowThemeModal(false);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    if (preferences.hapticFeedback) {
      triggerHaptic('selection');
    }
    updatePreferences({ language: newLanguage });
    setShowLanguageModal(false);
  };

  const handleRestorePurchases = () => {
    Alert.alert(
      'Restore Purchases',
      'This feature will be implemented with IAP',
    );
  };

  const handleExportAllProjects = () => {
    Alert.alert('Export All Projects', 'This Pro feature will be implemented');
  };

  const handleRateApp = () => {
    Alert.alert('Rate Artifex', 'This will open the App Store rating dialog');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'This will open email composer to support@artifex.app',
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove cached thumbnails and temporary files. Continue?',
      [
        { text: t.common.cancel, style: 'cancel' },
        { text: 'Clear', onPress: () => Alert.alert('Cache cleared') },
      ],
    );
  };

  const handleDeleteAllProjects = () => {
    Alert.alert(
      'Delete All Projects',
      'This will permanently delete all projects. This cannot be undone. Continue?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => Alert.alert('All projects deleted'),
        },
      ],
    );
  };

  const getThemeName = (themeType: ThemeType) => {
    switch (themeType) {
      case 'light':
        return t.settings.themeLight;
      case 'dark':
        return t.settings.themeDark;
      case 'solar':
        return t.settings.themeSolar;
      case 'mono':
        return t.settings.themeMono;
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionHeader, { color: theme.text.tertiary }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: theme.backgrounds.secondary },
        ]}
      >
        {children}
      </View>
    </View>
  );

  const renderSettingRow = (
    title: string,
    subtitle?: string,
    rightElement?: React.ReactNode,
    onPress?: () => void,
    destructive?: boolean,
  ) => (
    <TouchableOpacity
      style={[
        styles.settingRow,
        { borderBottomColor: theme.backgrounds.tertiary },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Text
          style={[
            styles.settingTitle,
            { color: destructive ? theme.semantic.error : theme.text.primary },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.settingSubtitle, { color: theme.text.tertiary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.settingRight}>{rightElement}</View>}
    </TouchableOpacity>
  );

  const renderThemeModal = () => (
    <Modal
      visible={showThemeModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowThemeModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowThemeModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.backgrounds.secondary },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
            {t.settings.theme}
          </Text>
          {(['light', 'dark', 'solar', 'mono'] as ThemeType[]).map(
            themeType => (
              <TouchableOpacity
                key={themeType}
                style={[
                  styles.modalOption,
                  { borderBottomColor: theme.backgrounds.tertiary },
                ]}
                onPress={() => handleThemeChange(themeType)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    {
                      color:
                        preferences.theme === themeType
                          ? theme.accent.primary
                          : theme.text.primary,
                    },
                  ]}
                >
                  {getThemeName(themeType)}
                </Text>
                {preferences.theme === themeType && (
                  <Text
                    style={[styles.checkmark, { color: theme.accent.primary }]}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ),
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderLanguageModal = () => (
    <Modal
      visible={showLanguageModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowLanguageModal(false)}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.backgrounds.secondary },
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
            {t.settings.language}
          </Text>
          <ScrollView style={styles.modalScroll}>
            {(Object.keys(languageNames) as Language[]).map(lang => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.modalOption,
                  { borderBottomColor: theme.backgrounds.tertiary },
                ]}
                onPress={() => handleLanguageChange(lang)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    {
                      color:
                        preferences.language === lang
                          ? theme.accent.primary
                          : theme.text.primary,
                    },
                  ]}
                >
                  {languageNames[lang]}
                </Text>
                {preferences.language === lang && (
                  <Text
                    style={[styles.checkmark, { color: theme.accent.primary }]}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgrounds.primary }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.backgrounds.tertiary },
        ]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={[styles.closeIcon, { color: theme.text.secondary }]}>
            ✕
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t.settings.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        {renderSection(
          t.settings.appearance,
          <>
            {renderSettingRow(
              t.settings.theme,
              getThemeName(preferences.theme),
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                {getThemeName(preferences.theme)}
              </Text>,
              () => setShowThemeModal(true),
            )}
            {renderSettingRow(
              t.settings.sound,
              preferences.soundEnabled
                ? t.settings.soundOn
                : t.settings.soundOff,
              <Switch
                value={preferences.soundEnabled}
                onValueChange={value => {
                  if (preferences.hapticFeedback) {
                    triggerHaptic('selection');
                  }
                  updatePreferences({ soundEnabled: value });
                }}
                trackColor={{
                  false: theme.backgrounds.tertiary,
                  true: theme.accent.primary,
                }}
                thumbColor={theme.text.primary}
              />,
            )}
            {renderSettingRow(
              t.settings.haptics,
              preferences.hapticFeedback
                ? t.settings.hapticsOn
                : t.settings.hapticsOff,
              <Switch
                value={preferences.hapticFeedback}
                onValueChange={value => {
                  if (value) {
                    triggerHaptic('selection');
                  }
                  updatePreferences({ hapticFeedback: value });
                }}
                trackColor={{
                  false: theme.backgrounds.tertiary,
                  true: theme.accent.primary,
                }}
                thumbColor={theme.text.primary}
              />,
            )}
            {renderSettingRow(
              t.settings.language,
              languageNames[preferences.language],
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                {languageNames[preferences.language]}
              </Text>,
              () => setShowLanguageModal(true),
            )}
          </>,
        )}

        {/* Account Section */}
        {renderSection(
          t.settings.account,
          <>
            {renderSettingRow(
              t.settings.restorePurchases,
              t.settings.restorePurchasesDesc,
              undefined,
              handleRestorePurchases,
            )}
            {isProUser &&
              renderSettingRow(
                t.settings.exportAllProjects,
                t.settings.exportAllProjectsDesc,
                undefined,
                handleExportAllProjects,
              )}
          </>,
        )}

        {/* Preferences Section */}
        {renderSection(
          t.settings.preferences,
          <>
            {renderSettingRow(
              t.settings.defaultExportFormat,
              preferences.defaultExportFormat.toUpperCase(),
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                {preferences.defaultExportFormat.toUpperCase()}
              </Text>,
            )}
            {renderSettingRow(
              t.settings.defaultExportQuality,
              `${preferences.defaultExportQuality}%`,
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                {preferences.defaultExportQuality}%
              </Text>,
            )}
            {renderSettingRow(
              t.settings.autoSaveProjects,
              t.settings.autoSaveProjectsDesc,
              <Switch
                value={preferences.autoSaveProjects}
                onValueChange={value => {
                  if (preferences.hapticFeedback) {
                    triggerHaptic('selection');
                  }
                  updatePreferences({ autoSaveProjects: value });
                }}
                trackColor={{
                  false: theme.backgrounds.tertiary,
                  true: theme.accent.primary,
                }}
                thumbColor={theme.text.primary}
              />,
            )}
          </>,
        )}

        {/* About Section */}
        {renderSection(
          t.settings.about,
          <>
            {renderSettingRow(
              t.settings.version,
              '1.0.0',
              <Text
                style={[styles.settingValue, { color: theme.text.secondary }]}
              >
                1.0.0
              </Text>,
            )}
            {renderSettingRow(
              t.settings.rateApp,
              t.settings.rateAppDesc,
              undefined,
              handleRateApp,
            )}
            {renderSettingRow(
              t.settings.contactSupport,
              t.settings.contactSupportDesc,
              undefined,
              handleContactSupport,
            )}
            {renderSettingRow(
              t.settings.privacyPolicy,
              t.settings.privacyPolicyDesc,
              undefined,
              () =>
                Alert.alert(
                  t.settings.privacyPolicy,
                  'This will open artifex.app/privacy',
                ),
            )}
            {renderSettingRow(
              t.settings.termsOfService,
              t.settings.termsOfServiceDesc,
              undefined,
              () =>
                Alert.alert(
                  t.settings.termsOfService,
                  'This will open artifex.app/terms',
                ),
            )}
          </>,
        )}

        {/* Danger Zone Section */}
        {renderSection(
          t.settings.dangerZone,
          <>
            {renderSettingRow(
              t.settings.clearCache,
              t.settings.clearCacheDesc,
              undefined,
              handleClearCache,
            )}
            {renderSettingRow(
              t.settings.deleteAllProjects,
              t.settings.deleteAllProjectsDesc,
              undefined,
              handleDeleteAllProjects,
              true,
            )}
          </>,
        )}
      </ScrollView>

      {renderThemeModal()}
      {renderLanguageModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 56,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
  },
  title: {
    ...Typography.display.h4,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.l,
  },
  sectionHeader: {
    ...Typography.body.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.m,
    marginBottom: Spacing.s,
  },
  sectionContent: {
    marginHorizontal: Spacing.m,
    borderRadius: AppDimensions.cornerRadius.medium,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    minHeight: 44,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body.regular,
  },
  settingSubtitle: {
    ...Typography.body.small,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: Spacing.m,
  },
  settingValue: {
    ...Typography.body.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '75%',
    borderRadius: AppDimensions.cornerRadius.large,
    overflow: 'hidden',
  },
  modalTitle: {
    ...Typography.display.h3,
    padding: Spacing.l,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: 500,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.l,
    minHeight: 60,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    ...Typography.display.h5,
  },
  checkmark: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
