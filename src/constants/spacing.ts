// Spacing system based on 8pt grid

export const Spacing = {
  // Base spacing scale (multiples of 8pt)
  xxs: 4, // Tight spacing, inline elements
  xs: 8, // Base unit, minimal separation
  s: 12, // Compact grouping
  m: 16, // Standard spacing, most common
  l: 24, // Section separation
  xl: 32, // Major section breaks
  xxl: 48, // Screen-level spacing
  xxxl: 64, // Hero spacing

  // Layout margins
  screen: 16, // Default horizontal margin
  card: 16, // Internal padding for cards/containers
  fullBleed: 0, // Edge-to-edge content

  // Component padding
  button: {
    horizontal: 16,
    vertical: 12,
  },
  input: {
    all: 16,
  },
  listItem: {
    horizontal: 16,
    vertical: 12,
  },
  modal: {
    all: 24,
  },

  // Vertical rhythm
  smallGap: 8, // Related items
  mediumGap: 16, // Sections within a card
  largeGap: 24, // Distinct sections
} as const;

// Component dimensions
export const Dimensions = {
  // Top bars
  topBar: 56,

  // Toolbars
  toolbar: 72,

  // Buttons
  button: {
    height: 56,
    cornerRadius: 16,
  },

  // Input fields
  input: {
    height: 48,
    cornerRadius: 12,
  },

  // FAB
  fab: {
    size: 64,
    cornerRadius: 32,
  },

  // Tap targets
  minTapTarget: 44,

  // Grid
  gridGutter: 16,

  // Corner radius
  cornerRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
  },
} as const;
