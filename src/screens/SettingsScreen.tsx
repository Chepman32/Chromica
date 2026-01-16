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
  Image,
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

// Flag images mapping
const flagImages: Record<Language, any> = {
  en: require('../assets/flags/en.png'),
  ru: require('../assets/flags/ru.png'),
  es: require('../assets/flags/es.png'),
  de: require('../assets/flags/de.png'),
  fr: require('../assets/flags/fr.png'),
  pt: require('../assets/flags/pt-BR.png'),
  ja: require('../assets/flags/ja.png'),
  zh: require('../assets/flags/zh.png'),
  ko: require('../assets/flags/ko.png'),
  uk: require('../assets/flags/uk.png'),
  ar: require('../assets/flags/ar.png'),
  cs: require('../assets/flags/cs.png'),
  da: require('../assets/flags/da.png'),
  el: require('../assets/flags/el.png'),
  fi: require('../assets/flags/fi.png'),
  fil: require('../assets/flags/fil.png'),
  he: require('../assets/flags/he.png'),
  hi: require('../assets/flags/hi.png'),
  hu: require('../assets/flags/hu.png'),
  id: require('../assets/flags/id.png'),
  it: require('../assets/flags/it.png'),
  ms: require('../assets/flags/ms.png'),
  nl: require('../assets/flags/nl.png'),
  no: require('../assets/flags/no.png'),
  pl: require('../assets/flags/pl.png'),
  ro: require('../assets/flags/ro.png'),
  sv: require('../assets/flags/sv.png'),
  th: require('../assets/flags/th.png'),
  tr: require('../assets/flags/tr.png'),
  vi: require('../assets/flags/vi.png'),
};

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const t = useTranslation();
  const { preferences, updatePreferences, resetOnboarding } = useAppStore();
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

  const handleExportAllProjects = () => {
    Alert.alert('Export All Projects', 'This Pro feature will be implemented');
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

  const handleResetOnboarding = () => {
    Alert.alert(
      t.settings.resetOnboarding,
      t.settings.resetOnboardingDesc + '. Continue?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            Alert.alert('Onboarding Reset', 'The app will now show the onboarding screens again.');
          },
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

  const renderSwitchRow = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
  ) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onValueChange(!value)}
      style={[
        styles.settingRow,
        { borderBottomColor: theme.backgrounds.tertiary },
      ]}
    >
      <View style={styles.settingLeft}>
        <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.settingSubtitle, { color: theme.text.tertiary }]}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.settingRight}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: theme.backgrounds.tertiary,
            true: theme.accent.primary,
          }}
          thumbColor={theme.text.primary}
        />
      </View>
    </TouchableOpacity>
  );

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
  ) => {
    const RowComponent = onPress ? TouchableOpacity : View;

    const rowProps = onPress ? { onPress, disabled: false } : undefined;

    return (
      <RowComponent
        style={[
          styles.settingRow,
          { borderBottomColor: theme.backgrounds.tertiary },
        ]}
        {...rowProps}
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
      {rightElement && (
        <View style={styles.settingRight}>
          {rightElement}
        </View>
      )}
      </RowComponent>
    );
  };

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
                  styles.languageOption,
                  { borderBottomColor: theme.backgrounds.tertiary },
                ]}
                onPress={() => handleLanguageChange(lang)}
              >
                <View style={styles.languageOptionContent}>
                  <Image
                    source={flagImages[lang]}
                    style={{...styles.flagImage, width: 24, height: 24}}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.modalOptionText,
                      styles.languageText,
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
                </View>
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
            {renderSwitchRow(
              t.settings.haptics,
              preferences.hapticFeedback ? t.settings.hapticsOn : t.settings.hapticsOff,
              preferences.hapticFeedback,
              (value) => {
                if (value) triggerHaptic('selection');
                updatePreferences({ hapticFeedback: value });
              },
            )}
            {renderSettingRow(
              t.settings.language,
              languageNames[preferences.language],
              <View style={styles.languageRowContent}>
                <Image
                  source={flagImages[preferences.language]}
                  style={styles.flagImage}
                  resizeMode="contain"
                />
                <Text
                  style={[styles.settingValue, { color: theme.text.secondary }]}
                >
                  {languageNames[preferences.language]}
                </Text>
              </View>,
              () => setShowLanguageModal(true),
            )}
          </>,
        )}

        {/* Export All Projects */}
        {renderSettingRow(
          t.settings.exportAllProjects,
          t.settings.exportAllProjectsDesc,
          undefined,
          handleExportAllProjects,
        )}

        {/* Preferences Section */}
        {renderSection(
          t.settings.preferences,
          <>
            {renderSwitchRow(
              t.settings.confirmDelete,
              t.settings.confirmDeleteDesc,
              preferences.confirmDelete ?? true,
              (value) => {
                if (preferences.hapticFeedback) triggerHaptic('selection');
                updatePreferences({ confirmDelete: value });
              },
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
            {renderSettingRow(
              t.settings.resetOnboarding,
              t.settings.resetOnboardingDesc,
              undefined,
              handleResetOnboarding,
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
    paddingHorizontal: Spacing.m,
    paddingRight: Spacing.s,
    paddingVertical: Spacing.s,
    minHeight: 44,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flex: 1,
    flexShrink: 1,
    paddingRight: Spacing.s,
  },
  settingTitle: {
    ...Typography.body.regular,
  },
  settingSubtitle: {
    ...Typography.body.small,
    marginTop: 2,
  },
  settingRight: {
    marginLeft: Spacing.s,
    marginRight: 0,
    minWidth: 72,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
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
    ...Typography.body.large,
  },
  languageOption: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    minHeight: 60,
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagImage: {
    width: 36,
    height: 36,
    marginRight: Spacing.m,
    borderRadius: 2,
  },
  languageRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageText: {
    flex: 1,
  },
  checkmark: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
