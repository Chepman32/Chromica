// Global app state using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';
import { Platform, NativeModules } from 'react-native';
import { Language } from '../localization';

// Function to detect device language
const detectDeviceLanguage = (): Language => {
  try {
    let deviceLanguage: string | undefined;
    
    // For iOS, try to get the preferred language
    if (Platform.OS === 'ios') {
      // Try Settings.AppleLanguages first
      const appleLanguages = NativeModules.Settings?.AppleLanguages || 
                           NativeModules.Settings?.settings?.AppleLanguages;
      
      if (appleLanguages && appleLanguages.length > 0) {
        deviceLanguage = appleLanguages[0];
        console.log('iOS AppleLanguages[0]:', deviceLanguage);
      }
      
      // Fallback: try to get from device locale
      if (!deviceLanguage) {
        deviceLanguage = 'en'; // Hardcoded fallback for testing
      }
    } 
    // For Android
    else if (Platform.OS === 'android') {
      deviceLanguage = NativeModules.I18nManager?.localeIdentifier;
      console.log('Android localeIdentifier:', deviceLanguage);
      
      if (!deviceLanguage) {
        deviceLanguage = 'en'; // Hardcoded fallback for testing
      }
    }
    
    if (deviceLanguage) {
      // Extract language code (handle formats like 'en-US', 'en_US', 'en')
      const langCode = deviceLanguage.split('-')[0].split('_')[0].toLowerCase();
      console.log('Extracted language code:', langCode);
      
      const mappedLanguage = mapLanguageCode(langCode);
      console.log('Final mapped language:', mappedLanguage);
      return mappedLanguage;
    }
  } catch (error) {
    console.warn('Failed to detect device language:', error);
  }
  
  console.log('Using fallback language: en');
  return 'en'; // Fallback to English
};

const mapLanguageCode = (langCode: string): Language => {
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

  // Actions
  setOnboardingSeen: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasSeenOnboarding: false,
      preferences: {
        defaultExportFormat: 'png',
        defaultExportQuality: 100,
        autoSaveProjects: true,
        hapticFeedback: true,
        colorScheme: 'auto',
        theme: 'dark',
        soundEnabled: true,
        language: detectDeviceLanguage(), // Auto-detect language on first launch
      },

      setOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      updatePreferences: prefs =>
        set(state => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      resetOnboarding: () => {
        const detectedLanguage = detectDeviceLanguage();
        console.log('Reset onboarding - detected language:', detectedLanguage);
        set({ 
          hasSeenOnboarding: false,
          preferences: {
            ...get().preferences,
            language: detectedLanguage, // Reset to detected language
          }
        });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
