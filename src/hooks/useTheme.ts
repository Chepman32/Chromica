// Theme hook for accessing current theme

import { useAppStore } from '../stores/appStore';
import { themes } from '../constants/themes';

export const useTheme = () => {
  const themeType = useAppStore(state => state.preferences?.theme || 'dark');
  return themes[themeType];
};
