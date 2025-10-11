# Settings Screen Guide

## Screen Structure

```
┌─────────────────────────────────────┐
│  ✕        Settings            [ ]   │  ← Header
├─────────────────────────────────────┤
│                                     │
│  APPEARANCE                         │  ← Section 1
│  ┌───────────────────────────────┐ │
│  │ Theme              Dark     > │ │  ← Opens modal
│  │ Sound              On       ⚪ │ │  ← Toggle switch
│  │ Haptics            On       ⚪ │ │  ← Toggle switch
│  │ Language           English  > │ │  ← Opens modal
│  └───────────────────────────────┘ │
│                                     │
│  ACCOUNT                            │  ← Section 2
│  ┌───────────────────────────────┐ │
│  │ Restore Purchases          > │ │
│  │ Export All Projects        > │ │  (Pro only)
│  └───────────────────────────────┘ │
│                                     │
│  PREFERENCES                        │  ← Section 3
│  ┌───────────────────────────────┐ │
│  │ Default Export Format  PNG  > │ │
│  │ Default Export Quality 100% > │ │
│  │ Auto-Save Projects     On  ⚪ │ │
│  └───────────────────────────────┘ │
│                                     │
│  ABOUT                              │  ← Section 4
│  ┌───────────────────────────────┐ │
│  │ Version                1.0.0   │ │
│  │ Rate Artifex               >  │ │
│  │ Contact Support            >  │ │
│  │ Privacy Policy             >  │ │
│  │ Terms of Service           >  │ │
│  └───────────────────────────────┘ │
│                                     │
│  DANGER ZONE                        │  ← Section 5
│  ┌───────────────────────────────┐ │
│  │ Clear Cache                >  │ │
│  │ Delete All Projects        >  │ │  (Red text)
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

## Theme Modal

```
┌─────────────────────────────┐
│                             │
│         Theme               │
│                             │
├─────────────────────────────┤
│  Light                      │
├─────────────────────────────┤
│  Dark                    ✓  │  ← Selected
├─────────────────────────────┤
│  Solar                      │
├─────────────────────────────┤
│  Mono                       │
└─────────────────────────────┘
```

## Language Modal

```
┌─────────────────────────────┐
│                             │
│        Language             │
│                             │
├─────────────────────────────┤
│  English                 ✓  │  ← Selected
├─────────────────────────────┤
│  Русский                    │
├─────────────────────────────┤
│  Español                    │
├─────────────────────────────┤
│  Deutsch                    │
├─────────────────────────────┤
│  Français                   │
├─────────────────────────────┤
│  Português                  │
├─────────────────────────────┤
│  日本語                      │
├─────────────────────────────┤
│  中文                        │
├─────────────────────────────┤
│  한국어                      │
├─────────────────────────────┤
│  Українська                 │
└─────────────────────────────┘
```

## Theme Examples

### Light Theme

- Background: White (#FFFFFF)
- Text: Black (#000000)
- Accent: Gold (#D4AF37)
- Status Bar: Dark content

### Dark Theme (Default)

- Background: Near black (#0F0F12)
- Text: White (#FFFFFF)
- Accent: Gold (#D4AF37)
- Status Bar: Light content

### Solar Theme

- Background: Light yellow (#FFF9E6)
- Text: Dark brown (#3D2800)
- Accent: Orange (#FF9500)
- Status Bar: Dark content

### Mono Theme

- Background: Dark gray (#1C1C1E)
- Text: White (#FFFFFF)
- Accent: White (#FFFFFF)
- Status Bar: Light content

## Interaction Flow

1. **Theme Selection**

   - Tap "Theme" row
   - Modal appears with 4 options
   - Tap desired theme
   - Modal closes
   - Theme applies immediately
   - Haptic feedback (if enabled)

2. **Language Selection**

   - Tap "Language" row
   - Modal appears with 10 languages
   - Scroll to find language
   - Tap desired language
   - Modal closes
   - Language applies immediately
   - Haptic feedback (if enabled)

3. **Toggle Switches**
   - Tap switch to toggle
   - Immediate feedback
   - Haptic feedback (if enabled)
   - State saved automatically

## Accessibility

- All interactive elements have minimum 44pt touch target
- Clear visual hierarchy with sections
- Descriptive subtitles for complex settings
- Color contrast meets WCAG guidelines
- Haptic feedback for interactions
- Modal overlays are dismissible by tapping outside
