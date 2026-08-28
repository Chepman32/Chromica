// Main app navigation structure

import React, { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore, detectDeviceLanguage } from '../stores/appStore';

// Screens
import { CorivoSplashScreen } from '../screens/CorivoSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { LiquidRadialHomeScreen } from '../screens/LiquidRadialHomeScreen';
import { RecentProjectsScreen } from '../screens/RecentProjectsScreen';
import { EffectsEditorScreen } from '../screens/EffectsEditorScreen';
import { MixesScreen } from '../screens/MixesScreen';
import { ExportScreen } from '../screens/ExportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import ImagePickerScreen from '../screens/ImagePickerScreen';
import {
  cancelInactivityNotification,
  REENGAGEMENT_MESSAGES,
  scheduleInactivityNotification,
} from '../services/notifications';
import { useTranslation } from '../hooks/useTranslation';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  RecentProjects: undefined;
  Mixes: {
    imageUri?: string;
    projectId?: string;
  } | undefined;
  Editor: {
    projectId?: string;
    imageUri?: string;
  };
  Export: {
    imageUri: string;
    effectId?: string;
    params?: Record<string, any>;
  };
  Settings: undefined;
  About: undefined;
  ImagePicker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const hasSeenOnboarding = useAppStore(state => state.hasSeenOnboarding);
  const currentLanguage = useAppStore(state => state.preferences.language);
  const updatePreferences = useAppStore(state => state.updatePreferences);
  const t = useTranslation();
  const [hasHydrated, setHasHydrated] = useState(useAppStore.persist.hasHydrated());
  const [showSplash, setShowSplash] = useState(true);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');

  useEffect(() => {
    // Always set up the listener, it only fires once when hydration completes
    const unsubscribe = useAppStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Splash screen duration matches animation (2.8 seconds)
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    cancelInactivityNotification().catch(() => undefined);

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        cancelInactivityNotification().catch(() => undefined);
      } else if (nextAppState === 'background') {
        const messages = currentLanguage === 'en'
          ? REENGAGEMENT_MESSAGES
          : [t.home.selectImageHint] as const;
        scheduleInactivityNotification({
          channelName: t.settings.notifications,
          messages,
        }).catch(() => undefined);
      }
    });

    return () => subscription.remove();
  }, [currentLanguage, t.home.selectImageHint, t.settings.notifications]);

  // Re-detect device language if onboarding hasn't been completed
  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!hasSeenOnboarding) {
      const detectedLang = detectDeviceLanguage();
      setDetectedLanguage(detectedLang);

      // Always update language if different, regardless of hasCheckedLanguage
      if (detectedLang !== currentLanguage) {
        updatePreferences({ language: detectedLang });
      }
    }
  }, [hasHydrated, hasSeenOnboarding, currentLanguage, updatePreferences]);

  if (showSplash || !hasHydrated) {
    return <CorivoSplashScreen onFinish={() => setShowSplash(false)} initialLanguage={detectedLanguage} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Custom headers per screen
          animation: 'default',
        }}
      >
        {!hasSeenOnboarding && (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false, // Can't swipe away onboarding
            }}
          />
        )}

        <Stack.Screen name="Home" component={LiquidRadialHomeScreen} />


        <Stack.Screen
          name="Editor"
          component={EffectsEditorScreen}
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />

        <Stack.Screen
          name="Export"
          component={ExportScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: true,
          }}
        />

        {/* Modal Screens */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="RecentProjects" component={RecentProjectsScreen} />
          <Stack.Screen name="Mixes" component={MixesScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="ImagePicker" component={ImagePickerScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
