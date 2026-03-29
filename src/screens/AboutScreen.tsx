// About screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { Typography } from '../constants/typography';
import { Spacing, Dimensions as AppDimensions } from '../constants/spacing';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const t = useTranslation();

  const handleClose = () => {
    navigation.goBack();
  };

  const handleRateApp = () => {
    Alert.alert('Rate Corivo', 'This will open the App Store rating dialog');
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'This will open email composer to support@corivo.app',
    );
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
        <Text style={[styles.settingTitle, { color: theme.text.primary }]}>
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgrounds.primary }]}
      edges={['top']}
    >
      <View
        style={[styles.header, { borderBottomColor: theme.backgrounds.tertiary }]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={[styles.closeIcon, { color: theme.text.secondary }]}>
            ✕
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t.settings.about}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
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
                  'This will open corivo.app/privacy',
                ),
            )}
            {renderSettingRow(
              t.settings.termsOfService,
              t.settings.termsOfServiceDesc,
              undefined,
              () =>
                Alert.alert(
                  t.settings.termsOfService,
                  'This will open corivo.app/terms',
                ),
            )}
          </>,
        )}
      </ScrollView>
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
});

export default AboutScreen;
