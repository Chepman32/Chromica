// Theme definitions for Artifex

export type ThemeType = 'light' | 'dark' | 'solar' | 'mono';

export interface Theme {
  backgrounds: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    subtle: string;
  };
  accent: {
    primary: string;
    hover: string;
    secondary: string;
  };
  semantic: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  overlays: {
    light: string;
    dark: string;
    blur: string;
  };
  statusBar: 'light-content' | 'dark-content';
}

export const themes: Record<ThemeType, Theme> = {
  dark: {
    backgrounds: {
      primary: '#0F0F12',
      secondary: '#1A1A1D',
      tertiary: '#2A2A2E',
      overlay: 'rgba(0,0,0,0.6)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
      tertiary: '#808080',
      subtle: '#606060',
    },
    accent: {
      primary: '#D4AF37',
      hover: '#C5A028',
      secondary: '#0A84FF',
    },
    semantic: {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#0A84FF',
    },
    overlays: {
      light: 'rgba(255,255,255,0.1)',
      dark: 'rgba(0,0,0,0.4)',
      blur: 'rgba(26,26,29,0.85)',
    },
    statusBar: 'light-content',
  },
  light: {
    backgrounds: {
      primary: '#FFFFFF',
      secondary: '#F5F5F7',
      tertiary: '#E8E8ED',
      overlay: 'rgba(0,0,0,0.3)',
    },
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#8E8E93',
      subtle: '#C7C7CC',
    },
    accent: {
      primary: '#D4AF37',
      hover: '#C5A028',
      secondary: '#007AFF',
    },
    semantic: {
      success: '#34C759',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#007AFF',
    },
    overlays: {
      light: 'rgba(0,0,0,0.05)',
      dark: 'rgba(0,0,0,0.2)',
      blur: 'rgba(255,255,255,0.85)',
    },
    statusBar: 'dark-content',
  },
  solar: {
    backgrounds: {
      primary: '#FFF9E6',
      secondary: '#FFF4D1',
      tertiary: '#FFEDB8',
      overlay: 'rgba(255,243,204,0.6)',
    },
    text: {
      primary: '#3D2800',
      secondary: '#6B4A00',
      tertiary: '#997000',
      subtle: '#C79600',
    },
    accent: {
      primary: '#FF9500',
      hover: '#E68600',
      secondary: '#FF6B00',
    },
    semantic: {
      success: '#52C41A',
      error: '#F5222D',
      warning: '#FA8C16',
      info: '#1890FF',
    },
    overlays: {
      light: 'rgba(255,243,204,0.3)',
      dark: 'rgba(61,40,0,0.2)',
      blur: 'rgba(255,249,230,0.85)',
    },
    statusBar: 'dark-content',
  },
  mono: {
    backgrounds: {
      primary: '#1C1C1E',
      secondary: '#2C2C2E',
      tertiary: '#3A3A3C',
      overlay: 'rgba(28,28,30,0.6)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#AEAEB2',
      tertiary: '#8E8E93',
      subtle: '#636366',
    },
    accent: {
      primary: '#FFFFFF',
      hover: '#E5E5EA',
      secondary: '#C7C7CC',
    },
    semantic: {
      success: '#FFFFFF',
      error: '#8E8E93',
      warning: '#AEAEB2',
      info: '#C7C7CC',
    },
    overlays: {
      light: 'rgba(255,255,255,0.1)',
      dark: 'rgba(0,0,0,0.4)',
      blur: 'rgba(44,44,46,0.85)',
    },
    statusBar: 'light-content',
  },
};

export const Gradients = {
  gold: {
    start: '#D4AF37',
    end: '#C5A028',
    angle: 135,
  },
  background: {
    home: {
      start: '#0F0F12',
      end: '#1A1A1D',
    },
    onboarding: {
      start: '#0F0F12',
      end: '#1A1A1D',
    },
  },
} as const;

export const Shadows = {
  level0: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  level1: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowColor: '#000000',
    elevation: 2,
  },
  level2: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowColor: '#000000',
    elevation: 4,
  },
  level3: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowColor: '#000000',
    elevation: 8,
  },
  goldGlow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    shadowColor: '#D4AF37',
    elevation: 8,
  },
} as const;
