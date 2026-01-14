// Global app state using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';

interface AppState {
  hasSeenOnboarding: boolean;
  preferences: UserPreferences;

  // Actions
  setOnboardingSeen: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      hasSeenOnboarding: false,
      preferences: {
        defaultExportFormat: 'png',
        defaultExportQuality: 100,
        autoSaveProjects: true,
        hapticFeedback: true,
        colorScheme: 'auto',
        theme: 'dark',
        soundEnabled: true,
        language: 'en',
      },

      setOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      updatePreferences: prefs =>
        set(state => ({
          preferences: { ...state.preferences, ...prefs },
        })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
