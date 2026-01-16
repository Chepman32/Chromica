/**
 * LiquidRadialHomeScreen - Liquid Radial Menu Home Screen
 *
 * A high-performance home screen featuring a central "liquid" button
 * with satellite bubbles that pop out using a gooey metaball effect.
 *
 * UX Flow:
 * - Central button: Primary CTA to open image picker
 * - Satellites: Settings, Recent Projects, Mixes, About (pop out 0.5s after mount)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  AccessibilityInfo,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeIn,
} from 'react-native-reanimated';

import { LiquidMenu, SatelliteItem } from '../components/LiquidMenu/LiquidMenu';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { useTranslation } from '../hooks/useTranslation';

const menuIcons = {
  settings: require('../assets/icons/homescreenMenu/setting.png'),
  recent: require('../assets/icons/homescreenMenu/recents.png'),
  mixes: require('../assets/icons/homescreenMenu/mixes.png'),
  about: require('../assets/icons/homescreenMenu/about.png'),
  main: require('../assets/icons/homescreenMenu/main.png'),
};

export const LiquidRadialHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [reduceMotion, setReduceMotion] = useState(false);
  const t = useTranslation();

  const homeT = (t as any)?.home;

  // Check reduce motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  // Header animation
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    const duration = reduceMotion ? 0 : 600;
    headerOpacity.value = withDelay(200, withTiming(1, { duration }));
    headerTranslateY.value = withDelay(200, withTiming(0, { duration }));
  }, [reduceMotion]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  // Open Image Picker (Primary CTA)
  const handleOpenImagePicker = useCallback(async () => {
    ReactNativeHapticFeedback.trigger('impactMedium');

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
        assetRepresentationMode: 'compatible',
      });

      if (result.errorCode) {
        console.error('Image picker error:', result.errorCode, result.errorMessage);
        Alert.alert(
          'Unable to Load Photos',
          'Please ensure you have granted photo library access and have photos available.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          // @ts-ignore - navigation types
          navigation.navigate('Editor', { imageUri: asset.uri });
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open photo library');
    }
  }, [navigation]);

  // Navigate to Settings
  const handleSettings = useCallback(() => {
    ReactNativeHapticFeedback.trigger('selection');
    navigation.navigate('Settings' as never);
  }, [navigation]);

  // Navigate to Recent Projects
  const handleRecent = useCallback(() => {
    ReactNativeHapticFeedback.trigger('selection');
    navigation.navigate('RecentProjects' as never);
  }, [navigation]);

  // Navigate to Mixes
  const handleMixes = useCallback(() => {
    ReactNativeHapticFeedback.trigger('selection');
    navigation.navigate('Mixes' as never);
  }, [navigation]);

  // Show About screen
  const handleAbout = useCallback(() => {
    ReactNativeHapticFeedback.trigger('selection');
    navigation.navigate('About' as never);
  }, [navigation]);

  // Satellite menu items
  const satellites: SatelliteItem[] = [
    {
      id: 'settings',
      label: t.settings.title,
      icon: menuIcons.settings,
      onPress: handleSettings,
    },
    {
      id: 'recent',
      label: homeT?.recent ?? 'Recent',
      icon: menuIcons.recent,
      onPress: handleRecent,
    },
    {
      id: 'mixes',
      label: homeT?.mixes ?? 'Mixes',
      icon: menuIcons.mixes,
      onPress: handleMixes,
    },
    {
      id: 'about',
      label: t.settings.about,
      icon: menuIcons.about,
      onPress: handleAbout,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.backgrounds.primary}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <Text style={styles.title}>Chromica</Text>
          <Text style={styles.subtitle}>
            {homeT?.tapToStartEditing ?? 'Tap to start editing'}
          </Text>
        </Animated.View>

        {/* Liquid Menu */}
        <View style={styles.menuContainer}>
          <LiquidMenu
            onCenterPress={handleOpenImagePicker}
            satellites={satellites}
            centerIcon={menuIcons.main}
            centerLabel={homeT?.startEditing ?? 'Start Editing'}
          />
        </View>

        {/* Footer hint */}
        <Animated.View
          style={styles.footer}
          entering={reduceMotion ? undefined : FadeIn.delay(1000).duration(500)}
        >
          <Text style={styles.footerText}>
            {homeT?.selectImageHint ?? 'Select an image to apply stunning effects'}
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.m,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  menuContainer: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.m,
  },
  footerText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default LiquidRadialHomeScreen;
