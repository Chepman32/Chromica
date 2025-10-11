# Theming and Localization Implementation

## Overview

This document describes the theming and localization system implemented for Artifex.

## Features Implemented

### 1. Theme System

Four themes are available:

- **Light**: Clean white background with dark text
- **Dark**: Dark background with light text (default)
- **Solar**: Warm yellow/orange tones for a sunny aesthetic
- **Mono**: Grayscale monochrome theme

### 2. Localization

Support for 10 languages:

- English (en)
- Russian (ru)
- Spanish (es)
- German (de)
- French (fr)
- Portuguese (pt)
- Japanese (ja)
- Chinese (zh)
- Korean (ko)
- Ukrainian (uk)

### 3. Settings Screen

Enhanced settings screen with:

- Theme selector with modal picker
- Language selector with modal picker
- Sound toggle
- Haptics toggle
- All existing settings preserved

## File Structure

```
src/
├── constants/
│   └── themes.ts              # Theme definitions
├── localization/
│   ├── index.ts               # Main localization export
│   ├── translations.ts        # Translation types
│   └── languages/
│       ├── en.ts              # English translations
│       ├── ru.ts              # Russian translations
│       ├── es.ts              # Spanish translations
│       ├── de.ts              # German translations
│       ├── fr.ts              # French translations
│       ├── pt.ts              # Portuguese translations
│       ├── ja.ts              # Japanese translations
│       ├── zh.ts              # Chinese translations
│       ├── ko.ts              # Korean translations
│       └── uk.ts              # Ukrainian translations
├── hooks/
│   ├── useTheme.ts            # Hook to access current theme
│   └── useTranslation.ts      # Hook to access translations
├── screens/
│   └── SettingsScreen.tsx     # Updated settings screen
└── stores/
    └── appStore.ts            # Updated with theme/language preferences
```

## Usage

### Using Themes in Components

```typescript
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.backgrounds.primary }}>
      <Text style={{ color: theme.text.primary }}>Hello</Text>
    </View>
  );
};
```

### Using Translations in Components

```typescript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const t = useTranslation();

  return <Text>{t.settings.title}</Text>;
};
```

### Changing Theme

```typescript
import { useAppStore } from '../stores/appStore';

const { updatePreferences } = useAppStore();
updatePreferences({ theme: 'solar' });
```

### Changing Language

```typescript
import { useAppStore } from '../stores/appStore';

const { updatePreferences } = useAppStore();
updatePreferences({ language: 'es' });
```

## Theme Properties

Each theme includes:

- `backgrounds`: primary, secondary, tertiary, overlay
- `text`: primary, secondary, tertiary, subtle
- `accent`: primary, hover, secondary
- `semantic`: success, error, warning, info
- `overlays`: light, dark, blur
- `statusBar`: 'light-content' | 'dark-content'

## Adding New Translations

1. Add the translation key to `src/localization/translations.ts`
2. Add translations to all language files in `src/localization/languages/`
3. Use the translation in your component with `t.section.key`

## Adding New Themes

1. Add theme type to `ThemeType` in `src/constants/themes.ts`
2. Define theme colors in the `themes` object
3. Add theme name translation to all language files
4. Update theme selector in `SettingsScreen.tsx`

## Persistence

Theme and language preferences are automatically persisted using Zustand with AsyncStorage. They will be restored when the app restarts.

## Best Practices

1. Always use `useTheme()` hook instead of importing colors directly
2. Always use `useTranslation()` hook for user-facing text
3. Test all themes to ensure proper contrast and readability
4. Keep translation keys organized by feature/screen
5. Use semantic color names (e.g., `theme.semantic.error`) for consistent meaning across themes
