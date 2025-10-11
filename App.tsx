/**
 * Chromica - Professional Mobile Image Editor
 * Main application entry point
 */

import 'react-native-reanimated';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppStore } from './src/stores/appStore';
import { themes } from './src/constants/themes';

function App(): React.JSX.Element {
  const preferences = useAppStore(state => state.preferences);
  const theme = themes[preferences?.theme || 'dark'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme.statusBar}
          backgroundColor={theme.backgrounds.primary}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
