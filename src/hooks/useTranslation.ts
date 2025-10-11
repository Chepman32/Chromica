// Translation hook for accessing current language translations

import { useAppStore } from '../stores/appStore';
import { translations } from '../localization';

export const useTranslation = () => {
  const language = useAppStore(state => state.preferences?.language || 'en');
  return translations[language];
};
