// Color palette for Artifex - Dark mode first design

export const Colors = {
  // Base Colors
  backgrounds: {
    primary: '#0F0F12', // Near black, slight blue tint
    secondary: '#1A1A1D', // Elevated surfaces
    tertiary: '#2A2A2E', // Cards, inputs, buttons
    overlay: 'rgba(0,0,0,0.6)', // Modals, alerts
  },

  // Content Colors
  text: {
    primary: '#FFFFFF', // Headings, important text
    secondary: '#A0A0A0', // Body text, labels
    tertiary: '#808080', // Placeholder, disabled
    subtle: '#606060', // Captions, metadata
  },

  // Accent & Brand
  accent: {
    primary: '#D4AF37', // Gold - CTAs, active states, Pro indicators
    hover: '#C5A028', // Darker gold for gradients
    secondary: '#0A84FF', // Blue - Selection, links, iOS native
  },

  // Semantic Colors
  semantic: {
    success: '#34C759', // Confirmations, success states
    error: '#FF3B30', // Destructive actions, errors
    warning: '#FF9500', // Cautions, alerts
    info: '#0A84FF', // Informational messages
  },

  // Transparent Overlays
  overlays: {
    light: 'rgba(255,255,255,0.1)', // Hover states
    dark: 'rgba(0,0,0,0.4)', // Dimming backgrounds
    blur: 'rgba(26,26,29,0.85)', // Modals with blur
  },
} as const;

// Gradients
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

// Shadow presets
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
