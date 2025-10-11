// Typography system for Artifex using SF Pro

export const Typography = {
  // Display Text (Headlines, Titles)
  display: {
    hero: {
      fontFamily: 'SF Pro Display',
      fontSize: 36,
      fontWeight: '700' as const, // Bold
      letterSpacing: -1.0,
      lineHeight: 40,
    },
    h1: {
      fontFamily: 'SF Pro Display',
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      lineHeight: 35,
    },
    h2: {
      fontFamily: 'SF Pro Display',
      fontSize: 28,
      fontWeight: '600' as const, // Semibold
      letterSpacing: -0.3,
      lineHeight: 31,
    },
    h3: {
      fontFamily: 'SF Pro Display',
      fontSize: 24,
      fontWeight: '600' as const,
      letterSpacing: 0,
      lineHeight: 26,
    },
    h4: {
      fontFamily: 'SF Pro Display',
      fontSize: 20,
      fontWeight: '500' as const, // Medium
      letterSpacing: 0,
      lineHeight: 22,
    },
  },

  // Body Text
  body: {
    large: {
      fontFamily: 'SF Pro Text',
      fontSize: 18,
      fontWeight: '400' as const, // Regular
      letterSpacing: 0,
      lineHeight: 27, // 1.5x
    },
    regular: {
      fontFamily: 'SF Pro Text',
      fontSize: 17,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 26,
    },
    small: {
      fontFamily: 'SF Pro Text',
      fontSize: 15,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 23,
    },
    caption: {
      fontFamily: 'SF Pro Text',
      fontSize: 13,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 20,
    },
    finePrint: {
      fontFamily: 'SF Pro Text',
      fontSize: 11,
      fontWeight: '400' as const,
      letterSpacing: 0.2,
      lineHeight: 17,
    },
  },

  // UI Elements
  ui: {
    button: {
      fontFamily: 'SF Pro Text',
      fontSize: 18,
      fontWeight: '600' as const, // Semibold
      letterSpacing: 0.3,
      lineHeight: 22,
    },
    tabBar: {
      fontFamily: 'SF Pro Text',
      fontSize: 16,
      fontWeight: '500' as const, // Medium
      letterSpacing: 0,
      lineHeight: 19,
    },
    input: {
      fontFamily: 'SF Pro Text',
      fontSize: 17,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 20,
    },
    label: {
      fontFamily: 'SF Pro Text',
      fontSize: 15,
      fontWeight: '500' as const,
      letterSpacing: 0,
      lineHeight: 18,
    },
  },
} as const;

// Font weights mapping
export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Available fonts for text tool
export const AvailableFonts = {
  free: [
    'SF Pro Display',
    'Helvetica Neue',
    'Georgia',
    'Courier New',
    'Arial Rounded MT Bold',
    'Verdana',
    'Trebuchet MS',
    'Impact',
  ],
  pro: [
    'Playfair Display',
    'Montserrat',
    'Lora',
    'Raleway',
    'Oswald',
    'Merriweather',
    'Open Sans',
    'Roboto Slab',
    'Bebas Neue',
    'Pacifico',
    'Dancing Script',
    'Lobster',
    'Josefin Sans',
    'Abril Fatface',
    'Cinzel',
    'Anton',
    'Permanent Marker',
    'Satisfy',
    'Great Vibes',
    'Righteous',
    // ... 10 more premium fonts
  ],
} as const;
