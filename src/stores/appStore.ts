// Global app state using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';

interface AppState {
  isProUser: boolean;
  hasSeenOnboarding: boolean;
  preferences: UserPreferences;

  // Actions
  setProUser: (isPro: boolean) => void;
  setOnboardingSeen: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      isProUser: false,
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

      setProUser: isPro => set({ isProUser: isPro }),
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
