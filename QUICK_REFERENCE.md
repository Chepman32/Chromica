# Chromica - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install & Run
yarn install
cd ios && pod install && cd ..
yarn ios
```

## 📱 App Flow

```
Splash (3.5s)
  ↓
Gallery (select photo)
  ↓
Editor (apply effects)
  ↓
Export (save/share)
```

## 🎨 Working Effects

| Effect           | Parameters                   | Performance  |
| ---------------- | ---------------------------- | ------------ |
| **Pixelate**     | Cell Size (2-100)            | ⚡ Excellent |
| **Kaleidoscope** | Segments (2-24), Angle, Zoom | ⚡ Excellent |
| **RGB Split**    | Offset X/Y (-50 to 50)       | ⚡ Excellent |

## 🔧 Key Files

| File                      | Purpose              |
| ------------------------- | -------------------- |
| `EffectRenderer.tsx`      | GPU shader rendering |
| `EffectSlider.tsx`        | Parameter controls   |
| `EffectsEditorScreen.tsx` | Main editor          |
| `ExportScreen.tsx`        | Save & share         |
| `effectsStore.ts`         | State management     |
| `registry.ts`             | Effect definitions   |

## ➕ Adding New Effects

### 1. Define Effect (registry.ts)

```typescript
{
  id: 'my-effect',
  name: 'My Effect',
  category: EffectCategory.CELLULAR,
  parameters: [
    { name: 'intensity', label: 'Intensity', type: 'slider', min: 0, max: 100, default: 50 }
  ],
}
```

### 2. Add Shader (EffectRenderer.tsx)

```typescript
case 'my-effect': {
  const intensity = params.intensity || 50;
  const source = `
    uniform shader image;
    uniform float intensity;

    half4 main(float2 coord) {
      half4 color = image.eval(coord);
      // Your effect logic here
      return color;
    }
  `;

  const runtimeEffect = Skia.RuntimeEffect.Make(source);
  if (runtimeEffect) {
    return runtimeEffect.makeShaderWithChildren([intensity], [image]);
  }
  break;
}
```

### 3. Test

- Select effect in editor
- Adjust parameters
- Verify real-time rendering

## 🐛 Troubleshooting

### Image Not Loading

```bash
# Check console for URI format
# Should be: file:///path/to/image.jpg
```

### Effect Not Rendering

```typescript
// Check EffectRenderer console logs
// Verify shader compiles without errors
```

### MMKV Errors

```bash
# Use Flipper debugger instead of Chrome
# Or test on real device
```

### Build Errors

```bash
# Clean and rebuild
rm -rf ios/build
cd ios && pod install && cd ..
yarn ios
```

## 📊 Performance Tips

1. **Shader Complexity**: Keep shaders simple for 60fps
2. **Image Size**: Downscale large images before processing
3. **Parameter Updates**: Debounced at 16ms for smooth interaction
4. **Memory**: Clear cache if memory warnings occur

## 🎯 Common Tasks

### Change App Name

```
1. Update app.json: "displayName": "NewName"
2. Update Info.plist: CFBundleDisplayName
3. Clean and rebuild
```

### Add Haptic Feedback

```typescript
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

ReactNativeHapticFeedback.trigger('impactLight');
// Options: impactLight, impactMedium, impactHeavy, notificationSuccess
```

### Add New Screen

```typescript
// 1. Create screen component
// 2. Add to RootStackParamList in AppNavigator.tsx
// 3. Add Stack.Screen in navigator
// 4. Navigate: navigation.navigate('ScreenName')
```

## 📦 Dependencies

### Core

- react-native: 0.81.4
- @shopify/react-native-skia: ^2.3.0
- react-native-reanimated: ^3.6.0

### State

- zustand: ^4.5.0
- react-native-mmkv: ^2.11.0

### Media

- @react-native-camera-roll/camera-roll: ^7.4.0
- react-native-image-picker: ^7.1.0
- react-native-share: ^10.0.2

### UI

- react-native-gesture-handler: ^2.14.0
- react-native-haptic-feedback: ^2.2.0

## 🔐 Permissions (iOS)

Add to Info.plist:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Chromica needs access to your photos</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Chromica needs permission to save photos</string>

<key>NSCameraUsageDescription</key>
<string>Chromica needs camera access</string>
```

## 🎨 Design Tokens

```typescript
// Colors
primary: '#6366F1'      // Indigo
secondary: '#EC4899'    // Pink
background: '#0F0F1E'   // Dark
surface: '#1F1F2E'      // Dark Gray

// Spacing
xs: 4, sm: 8, md: 16, lg: 24, xl: 32

// Typography
h1: 32px/700, h2: 28px/700, body: 16px/400
```

## 🚢 Release Checklist

- [ ] Update version in package.json
- [ ] Test all effects
- [ ] Test export functionality
- [ ] Test on real device
- [ ] Check memory usage
- [ ] Verify IAP (if implemented)
- [ ] Update screenshots
- [ ] Write release notes
- [ ] Build release version
- [ ] Submit to App Store

## 📞 Support

- Check COMPLETE_IMPLEMENTATION_SUMMARY.md for details
- See PHASE2_NEXT_STEPS.md for enhancements
- Review IMPLEMENTATION_GUIDE.md for architecture

---

**Quick Tip**: The app is fully functional! Just select a photo, tap an effect, adjust parameters, and export. All core features work out of the box.
