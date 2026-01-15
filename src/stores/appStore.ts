// Global app state using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';
import { Language } from '../localization';

// Function to detect device language using react-native-localize
export const detectDeviceLanguage = (): Language => {
  try {
    // Lazy require to safely handle when native module isn't available
    const RNLocalize = require('react-native-localize');

    // Get device locales (returns array of {languageTag, languageCode, countryCode, ...})
    const locales = RNLocalize.getLocales();
    console.log('Device locales:', JSON.stringify(locales));

    if (locales && locales.length > 0) {
      const langCode = locales[0].languageCode?.toLowerCase();
      console.log('Device language code:', langCode);

      if (langCode) {
        const mappedLanguage = mapLanguageCode(langCode);
        console.log('Final mapped language:', mappedLanguage);
        return mappedLanguage;
      }
    }
  } catch (error) {
    console.warn('Failed to detect device language:', error);
  }

  console.log('Using fallback language: en');
  return 'en'; // Fallback to English
};

export const mapLanguageCode = (langCode: string): Language => {
  const supportedLanguages: Record<string, Language> = {
    'en': 'en',
    'ru': 'ru', 
    'es': 'es',
    'de': 'de',
    'fr': 'fr',
    'pt': 'pt',
    'ja': 'ja',
    'zh': 'zh',
    'ko': 'ko',
    'uk': 'uk',
    'ar': 'ar',
    'cs': 'cs',
    'da': 'da',
    'el': 'el',
    'fi': 'fi',
    'tl': 'fil', // Filipino language code
    'he': 'he',
    'hi': 'hi',
    'hu': 'hu',
    'id': 'id',
    'it': 'it',
    'ms': 'ms',
    'nl': 'nl',
    'no': 'no',
    'pl': 'pl',
    'ro': 'ro',
    'sv': 'sv',
    'th': 'th',
    'tr': 'tr',
    'vi': 'vi'
  };
  
  return supportedLanguages[langCode] || 'en';
};

interface AppState {
  hasSeenOnboarding: boolean;
  preferences: UserPreferences;
  _languageVersion: number; // Force re-render when language changes

  // Actions
  setOnboardingSeen: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasSeenOnboarding: false,
      _languageVersion: 0,
      preferences: {
        defaultExportFormat: 'png',
        defaultExportQuality: 100,
        autoSaveProjects: true,
        hapticFeedback: true,
        colorScheme: 'auto',
        theme: 'dark',
        soundEnabled: true,
        confirmDelete: true, // Default: confirm before deleting projects
        language: 'en', // Default to English, will be updated after app initialization
      },

      setOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      updatePreferences: prefs =>
        set(state => ({
          preferences: { ...state.preferences, ...prefs },
          _languageVersion: state._languageVersion + 1, // Increment version to force re-render
        })),
      resetOnboarding: () => {
        const detectedLanguage = detectDeviceLanguage();
        console.log('Reset onboarding - detected language:', detectedLanguage);
        set({ 
          hasSeenOnboarding: false,
          preferences: {
            ...get().preferences,
            language: detectedLanguage, // Reset to detected language
          },
          _languageVersion: get()._languageVersion + 1,
        });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
