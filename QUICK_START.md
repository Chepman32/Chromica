# Chromica - Quick Start Checklist

## ✅ Pre-Flight Checklist

### 1. Install Dependencies (5 minutes)

```bash
# Install Node modules
yarn install

# Install iOS pods
cd ios && pod install && cd ..
```

### 2. Update Bundle Identifiers (10 minutes)

#### iOS

Edit `ios/Chromica/Info.plist`:

```xml
<key>CFBundleIdentifier</key>
<string>com.yourcompany.chromica</string>
<key>CFBundleDisplayName</key>
<string>Chromica</string>
```

#### Android

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.yourcompany.chromica"
    // ...
}
```

### 3. Test Build (2 minutes)

```bash
# iOS
yarn ios

# Android
yarn android
```

## 🎯 What You Should See

1. **Splash Screen** (3.5 seconds)

   - Animated logo with rotation
   - "CHROMICA" text reveal
   - Smooth transition

2. **Gallery Screen**

   - Your photos in 3-column grid
   - Filter pills at top
   - Floating + button bottom-right

3. **Editor Screen** (tap any photo)
   - Image displayed in canvas
   - Category tabs at bottom
   - Effects grid (horizontal scroll)
   - Quick tools (Undo, Redo, etc.)

## 🔧 Phase 2 Implementation Order

### Week 1: Core Functionality

#### Day 1-2: Connect Shaders to Canvas

**Goal**: Make effects actually render

**File**: `src/screens/EffectsEditorScreen.tsx`

**Add**:

```typescript
import {
  ImageProcessor,
  PreviewQuality,
} from '../domain/image-processor/ImageProcessor';
import { getEffectById } from '../domain/effects/registry';

const [processedImage, setProcessedImage] = useState<SkImage | null>(null);

useEffect(() => {
  if (!image || effectStack.length === 0) {
    setProcessedImage(null);
    return;
  }

  const effects = effectStack.map(layer => getEffectById(layer.effectId)!);
  const result = ImageProcessor.applyEffectStack(
    image,
    effectStack,
    effects,
    PreviewQuality.HIGH,
  );
  setProcessedImage(result);
}, [image, effectStack]);
```

**Test**: Apply Pixelate effect, should see pixelated image

---

#### Day 3-4: Parameter Controls

**Goal**: Add sliders to adjust effect parameters

**Create**: `src/components/effects/EffectSlider.tsx` (see IMPLEMENTATION_GUIDE.md)

**Test**: Adjust pixelate cell size, see real-time updates

---

#### Day 5: Export Functionality

**Goal**: Save edited images

**Create**: `src/screens/ExportScreen.tsx`

**Add to Editor**:

```typescript
const handleExport = async () => {
  const path = await ImageProcessor.exportImage(processedImage, 'jpeg', 80);
  await CameraRoll.save(path, { type: 'photo' });
};
```

**Test**: Export image, check camera roll

---

### Week 2: Premium Features

#### Day 6-7: IAP Integration

**Goal**: Unlock premium effects

**Setup**:

1. Create IAP products in App Store Connect
2. Implement `src/utils/iapManager.ts`
3. Update PaywallScreen
4. Test purchase flow (sandbox)

---

#### Day 8-9: More Effects

**Goal**: Implement 5-10 more effects

**Priority Effects**:

- Posterize (easy)
- Blur (medium)
- Sharpen (medium)
- Vignette (easy)
- Color Adjustment (medium)

---

#### Day 10: Polish & Testing

**Goal**: Bug fixes and optimization

**Tasks**:

- Test all effects
- Fix performance issues
- Add loading states
- Improve error handling

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Cannot find module 'shader.sksl'"

**Fix**: Update `metro.config.js`:

```javascript
module.exports = {
  resolver: {
    assetExts: ['sksl', 'png', 'jpg', 'jpeg'],
  },
};
```

### Issue: Effects not applying

**Fix**: Check console for shader compilation errors:

```typescript
const shader = ShaderManager.loadShader(effect.shaderPath);
if (!shader) {
  console.error('Shader failed to compile:', effect.shaderPath);
}
```

### Issue: App crashes with large images

**Fix**: Downscale images before processing:

```typescript
const MAX_SIZE = 2048;
if (image.width() > MAX_SIZE || image.height() > MAX_SIZE) {
  // Downscale image
}
```

### Issue: Slow performance

**Fix**: Use adaptive quality:

```typescript
const quality = isInteracting ? PreviewQuality.LOW : PreviewQuality.HIGH;
```

## 📱 Testing Checklist

### Basic Functionality

- [ ] App launches without crashes
- [ ] Splash animation plays smoothly
- [ ] Gallery loads photos
- [ ] Can select and open photo in editor
- [ ] Effects categories display
- [ ] Can tap effects (even if not rendering yet)
- [ ] Undo/Redo buttons work
- [ ] Can navigate back to gallery

### Effects (After Phase 2)

- [ ] Pixelate effect renders correctly
- [ ] Can adjust pixelate cell size
- [ ] Kaleidoscope effect works
- [ ] Wave effect works
- [ ] RGB Split effect works
- [ ] All effects render at 60fps

### Export (After Phase 2)

- [ ] Can export to camera roll
- [ ] Can share via share sheet
- [ ] Quality slider affects file size
- [ ] Format selection works

### IAP (After Phase 2)

- [ ] Paywall shows for premium effects
- [ ] Can purchase (sandbox)
- [ ] Premium status persists
- [ ] Restore purchases works

## 🎨 Design Tokens Reference

Quick reference for maintaining consistency:

```typescript
// Colors
const colors = {
  primary: '#6366F1', // Indigo
  secondary: '#EC4899', // Pink
  background: '#0F0F1E', // Dark
  surface: '#1F1F2E', // Dark Gray
  text: '#FFFFFF', // White
  textSecondary: '#9CA3AF', // Gray
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
};

// Spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Typography
const typography = {
  h1: { fontSize: 32, fontWeight: '700' },
  h2: { fontSize: 28, fontWeight: '700' },
  h3: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};
```

## 📞 Need Help?

1. **Check Documentation**:

   - CHROMICA_README.md - Project overview
   - IMPLEMENTATION_GUIDE.md - Detailed instructions
   - TRANSFORMATION_SUMMARY.md - What's been done

2. **Common Resources**:

   - [React Native Skia Docs](https://shopify.github.io/react-native-skia/)
   - [Reanimated 3 Docs](https://docs.swmansion.com/react-native-reanimated/)
   - [SkSL Reference](https://skia.org/docs/user/sksl/)

3. **Debug Tips**:
   - Enable Flipper for debugging
   - Check console for shader errors
   - Use `console.log` in effect processing
   - Test on real device for performance

## 🚀 Ready to Ship Checklist

Before submitting to App Store:

- [ ] All effects working
- [ ] IAP configured and tested
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] App icons created (all sizes)
- [ ] Screenshots prepared
- [ ] App Store description written
- [ ] TestFlight beta testing complete
- [ ] Performance optimized
- [ ] Crash-free for 7 days
- [ ] Memory leaks fixed
- [ ] Accessibility tested
- [ ] Dark mode tested

---

**You're all set!** Start with Phase 2, Day 1: Connect Shaders to Canvas.

Good luck! 🎉
