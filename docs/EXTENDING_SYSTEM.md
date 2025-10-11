# Extending the Theme & Localization System

## Adding a New Theme

### Step 1: Update Theme Type

In `src/constants/themes.ts`:

```typescript
export type ThemeType = 'light' | 'dark' | 'solar' | 'mono' | 'ocean'; // Add 'ocean'
```

### Step 2: Define Theme Colors

In `src/constants/themes.ts`:

```typescript
export const themes: Record<ThemeType, Theme> = {
  // ... existing themes
  ocean: {
    backgrounds: {
      primary: '#001F3F',
      secondary: '#003366',
      tertiary: '#004080',
      overlay: 'rgba(0,31,63,0.6)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0D4F1',
      tertiary: '#7FB3D5',
      subtle: '#5499C7',
    },
    accent: {
      primary: '#00CED1',
      hover: '#00B8BA',
      secondary: '#48D1CC',
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
      blur: 'rgba(0,31,63,0.85)',
    },
    statusBar: 'light-content',
  },
};
```

### Step 3: Add Translation Keys

In all language files (`src/localization/languages/*.ts`):

```typescript
settings: {
  // ... existing keys
  themeOcean: 'Ocean', // or translated version
}
```

### Step 4: Update Settings Screen

In `src/screens/SettingsScreen.tsx`, update the theme array:

```typescript
{(['light', 'dark', 'solar', 'mono', 'ocean'] as ThemeType[]).map(themeType => (
  // ... modal option
))}
```

And update the `getThemeName` function:

```typescript
const getThemeName = (themeType: ThemeType) => {
  switch (themeType) {
    // ... existing cases
    case 'ocean':
      return t.settings.themeOcean;
  }
};
```

## Adding a New Language

### Step 1: Update Language Type

In `src/localization/translations.ts`:

```typescript
export type Language =
  | 'en'
  | 'ru'
  | 'es'
  | 'de'
  | 'fr'
  | 'pt'
  | 'ja'
  | 'zh'
  | 'ko'
  | 'uk'
  | 'ar'; // Add 'ar'
```

### Step 2: Create Translation File

Create `src/localization/languages/ar.ts`:

```typescript
import { Translations } from '../translations';

export const ar: Translations = {
  common: {
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    close: 'إغلاق',
    done: 'تم',
    back: 'رجوع',
  },
  settings: {
    title: 'الإعدادات',
    theme: 'المظهر',
    // ... all other keys
  },
};
```

### Step 3: Export Translation

In `src/localization/index.ts`:

```typescript
import { ar } from './languages/ar';

export const translations: Record<Language, Translations> = {
  // ... existing languages
  ar,
};

export const languageNames: Record<Language, string> = {
  // ... existing names
  ar: 'العربية',
};
```

### Step 4: Update Type Definition

In `src/types/index.ts`:

```typescript
export interface UserPreferences {
  // ... other fields
  language:
    | 'en'
    | 'ru'
    | 'es'
    | 'de'
    | 'fr'
    | 'pt'
    | 'ja'
    | 'zh'
    | 'ko'
    | 'uk'
    | 'ar';
}
```

## Adding New Translation Keys

### Step 1: Update Translation Interface

In `src/localization/translations.ts`:

```typescript
export interface Translations {
  common: {
    // ... existing keys
  };
  settings: {
    // ... existing keys
  };
  editor: {
    // New section
    title: string;
    save: string;
    export: string;
    undo: string;
    redo: string;
  };
}
```

### Step 2: Add to All Language Files

Update all files in `src/localization/languages/`:

```typescript
export const en: Translations = {
  // ... existing sections
  editor: {
    title: 'Editor',
    save: 'Save',
    export: 'Export',
    undo: 'Undo',
    redo: 'Redo',
  },
};
```

### Step 3: Use in Components

```typescript
import { useTranslation } from '../hooks/useTranslation';

const EditorScreen = () => {
  const t = useTranslation();

  return (
    <View>
      <Text>{t.editor.title}</Text>
      <Button title={t.editor.save} />
    </View>
  );
};
```

## Updating Existing Screens to Use Themes

### Before:

```typescript
import { Colors } from '../constants/colors';

const MyScreen = () => {
  return (
    <View style={{ backgroundColor: Colors.backgrounds.primary }}>
      <Text style={{ color: Colors.text.primary }}>Hello</Text>
    </View>
  );
};
```

### After:

```typescript
import { useTheme } from '../hooks/useTheme';

const MyScreen = () => {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.backgrounds.primary }}>
      <Text style={{ color: theme.text.primary }}>Hello</Text>
    </View>
  );
};
```

## Best Practices

### Theme Colors

1. Always provide sufficient contrast (WCAG AA minimum)
2. Test all themes in both light and dark environments
3. Use semantic colors for consistent meaning
4. Consider colorblind users when choosing accent colors

### Translations

1. Keep keys organized by feature/screen
2. Use descriptive key names
3. Avoid concatenating translated strings
4. Consider text length variations across languages
5. Use placeholders for dynamic content

### Performance

1. Theme and language hooks use Zustand selectors for optimal re-renders
2. Translations are loaded once at app start
3. Theme changes are instant with no flicker
4. Preferences are persisted automatically

### Testing

1. Test all themes for visual consistency
2. Verify all translations are present
3. Check RTL languages if supported
4. Test theme switching during active use
5. Verify persistence after app restart

## Common Patterns

### Conditional Styling Based on Theme

```typescript
const theme = useTheme();
const isDark = theme.statusBar === 'light-content';

<View
  style={{
    backgroundColor: isDark
      ? theme.backgrounds.secondary
      : theme.backgrounds.primary,
  }}
/>;
```

### Dynamic Translation with Variables

```typescript
// In translations
welcome: 'Welcome, {name}!';

// In component
const t = useTranslation();
const message = t.common.welcome.replace('{name}', userName);
```

### Theme-Aware Icons

```typescript
const theme = useTheme();
<Icon name="star" color={theme.accent.primary} />;
```

### Responsive to System Theme

```typescript
import { useColorScheme } from 'react-native';

const systemTheme = useColorScheme();
// Use systemTheme to suggest initial theme
```
