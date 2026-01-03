// Main app navigation structure

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../stores/appStore';

// Screens
import SplashScreen from '../screens/SplashScreen';
import { ChromicaSplashScreen } from '../screens/ChromicaSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import { LiquidRadialHomeScreen } from '../screens/LiquidRadialHomeScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { RecentProjectsScreen } from '../screens/RecentProjectsScreen';
import EditorScreen from '../screens/EditorScreen';
import { EffectsEditorScreen } from '../screens/EffectsEditorScreen';
import { ExportScreen } from '../screens/ExportScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import ImagePickerScreen from '../screens/ImagePickerScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  LiquidHome: undefined;
  Gallery: undefined;
  RecentProjects: undefined;
  Editor: {
    projectId?: string;
    imageUri?: string;
    imageDimensions?: { width: number; height: number };
  };
  EffectsEditor: {
    imageUri: string;
  };
  Export: {
    imageUri: string;
    effectId?: string;
    params?: Record<string, any>;
  };
  Settings: undefined;
  Paywall: undefined;
  ImagePicker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const hasSeenOnboarding = useAppStore(state => state.hasSeenOnboarding);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Splash screen duration matches animation (2.8 seconds)
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <ChromicaSplashScreen onFinish={() => setShowSplash(false)} />;
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

        <Stack.Screen name="Gallery" component={GalleryScreen} />

        <Stack.Screen name="RecentProjects" component={RecentProjectsScreen} />

        <Stack.Screen
          name="EffectsEditor"
          component={EffectsEditorScreen}
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />

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
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{
              gestureEnabled: false, // Prevent swipe dismiss
            }}
          />
          <Stack.Screen name="ImagePicker" component={ImagePickerScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
