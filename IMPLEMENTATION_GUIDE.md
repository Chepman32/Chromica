# Chromica Implementation Guide

## Quick Start

### 1. Install New Dependencies

```bash
yarn install
cd ios && pod install && cd ..
```

### 2. Update iOS Bundle ID (Required)

Edit `ios/Chromica/Info.plist`:

```xml
<key>CFBundleIdentifier</key>
<string>com.yourcompany.chromica</string>
```

Edit `ios/Chromica.xcodeproj/project.pbxproj`:

- Search for old bundle ID and replace with `com.yourcompany.chromica`

### 3. Update Android Package Name (Required)

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.yourcompany.chromica"
    // ...
}
```

Rename package directories:

```bash
cd android/app/src/main/java/com/
mv chromica chromica
```

Update package declarations in all Java/Kotlin files.

## Phase 2: Complete Core Functionality

### Priority 1: Connect Shaders to Canvas

**File**: `src/screens/EffectsEditorScreen.tsx`

Current issue: Canvas shows image but doesn't apply effects.

**Solution**:

```typescript
// In EffectsEditorScreen.tsx, update Canvas rendering:

import { ImageProcessor } from '../domain/image-processor/ImageProcessor';
import { getEffectById } from '../domain/effects/registry';

// Add state for processed image
const [processedImage, setProcessedImage] = useState<SkImage | null>(null);

// Process image when effect changes
useEffect(() => {
  if (!image || effectStack.length === 0) {
    setProcessedImage(null);
    return;
  }

  const processImage = async () => {
    const effects = effectStack.map(layer => getEffectById(layer.effectId)!);
    const result = ImageProcessor.applyEffectStack(
      image,
      effectStack,
      effects,
      PreviewQuality.HIGH,
    );
    setProcessedImage(result);
  };

  processImage();
}, [image, effectStack]);

// Update Canvas to show processed image
<Canvas style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.5 }}>
  {(processedImage || image) && (
    <SkiaImage
      image={processedImage || image}
      fit="contain"
      x={0}
      y={0}
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT * 0.5}
    />
  )}
</Canvas>;
```

### Priority 2: Implement Parameter Controls

**Create**: `src/components/effects/EffectSlider.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface EffectSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export const EffectSlider: React.FC<EffectSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}) => {
  const position = useSharedValue(0);
  const SLIDER_WIDTH = 280;

  const gesture = Gesture.Pan().onUpdate(e => {
    const newPos = Math.max(0, Math.min(SLIDER_WIDTH, e.translationX));
    position.value = newPos;

    const newValue = min + (newPos / SLIDER_WIDTH) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;

    runOnJS(onChange)(steppedValue);
    runOnJS(ReactNativeHapticFeedback.trigger)('selection');
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>

      <GestureDetector gesture={gesture}>
        <View style={styles.track}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  track: {
    width: 280,
    height: 4,
    backgroundColor: '#1F1F2E',
    borderRadius: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    position: 'absolute',
    top: -8,
  },
});
```

**Usage in EffectsEditorScreen**:

```typescript
import { EffectSlider } from '../components/effects/EffectSlider';

// In parameters panel:
{
  selectedEffect.parameters.map(param => {
    if (param.type === 'slider') {
      const currentValue =
        effectStack[effectStack.length - 1]?.params[param.name] ??
        param.default;

      return (
        <EffectSlider
          key={param.name}
          label={param.label}
          value={currentValue}
          min={param.min!}
          max={param.max!}
          step={param.step}
          onChange={value => handleParameterChange(param.name, value)}
        />
      );
    }
  });
}
```

### Priority 3: Export Functionality

**Create**: `src/screens/ExportScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Share from 'react-native-share';
import { ImageProcessor } from '../domain/image-processor/ImageProcessor';

export const ExportScreen: React.FC = ({ route }) => {
  const { processedImage } = route.params;
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [quality, setQuality] = useState(80);
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    setExporting(true);
    try {
      const path = await ImageProcessor.exportImage(
        processedImage,
        format,
        quality,
      );
      if (path) {
        await CameraRoll.save(path, { type: 'photo' });
        // Show success toast
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    const path = await ImageProcessor.exportImage(
      processedImage,
      format,
      quality,
    );
    if (path) {
      await Share.open({ url: `file://${path}` });
    }
  };

  return (
    <View style={styles.container}>
      {/* Format selection, quality slider, save/share buttons */}
    </View>
  );
};
```

### Priority 4: IAP Integration

**Create**: `src/utils/iapManager.ts`

```typescript
import RNIap, {
  Product,
  Purchase,
  requestPurchase,
  getProducts,
} from 'react-native-iap';

const PRODUCT_IDS = {
  monthly: 'com.chromica.pro.monthly',
  annual: 'com.chromica.pro.annual',
  lifetime: 'com.chromica.pro.lifetime',
};

export class IAPManager {
  static async initialize() {
    try {
      await RNIap.initConnection();
      await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
    } catch (error) {
      console.error('IAP init error:', error);
    }
  }

  static async getProducts(): Promise<Product[]> {
    try {
      return await getProducts({ skus: Object.values(PRODUCT_IDS) });
    } catch (error) {
      console.error('Get products error:', error);
      return [];
    }
  }

  static async purchase(productId: string): Promise<boolean> {
    try {
      await requestPurchase({ sku: productId });
      return true;
    } catch (error) {
      console.error('Purchase error:', error);
      return false;
    }
  }

  static async restorePurchases(): Promise<boolean> {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      return purchases.length > 0;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  }
}
```

**Update PaywallScreen.tsx**:

```typescript
import { IAPManager } from '../utils/iapManager';
import { useEffectsStore } from '../stores/effectsStore';

const handlePurchase = async (productId: string) => {
  const success = await IAPManager.purchase(productId);
  if (success) {
    setPremium(true);
    navigation.goBack();
  }
};
```

## Testing Checklist

### Basic Functionality

- [ ] App launches with Chromica splash screen
- [ ] Gallery loads photos from camera roll
- [ ] Tapping photo opens editor
- [ ] Effects categories display correctly
- [ ] Tapping effect applies it to image
- [ ] Undo/Redo works
- [ ] Parameter sliders update effect in real-time

### Effects Testing

- [ ] Pixelate effect works
- [ ] Kaleidoscope effect works
- [ ] Wave effect works
- [ ] RGB Split effect works
- [ ] All shaders compile without errors

### Performance

- [ ] Smooth 60fps animations
- [ ] No lag when applying effects
- [ ] Memory usage stays reasonable
- [ ] App doesn't crash with large images

### IAP

- [ ] Paywall shows for premium effects
- [ ] Purchase flow works
- [ ] Premium status persists
- [ ] Restore purchases works

## Common Issues & Solutions

### Issue: Shaders not loading

**Solution**: Ensure shader files are included in bundle. Update metro.config.js:

```javascript
module.exports = {
  resolver: {
    assetExts: ['sksl', 'png', 'jpg'],
  },
};
```

### Issue: Effects not applying

**Solution**: Check shader uniforms match shader expectations. Add logging:

```typescript
console.log('Applying effect:', effect.id, 'with params:', params);
```

### Issue: Performance lag

**Solution**: Use adaptive quality:

```typescript
const quality = isInteracting ? PreviewQuality.LOW : PreviewQuality.HIGH;
```

### Issue: Memory warnings

**Solution**: Clear caches and limit history:

```typescript
// In effectsStore.ts, limit history to 10 steps
const MAX_HISTORY = 10;
if (newHistory.length > MAX_HISTORY) {
  newHistory.shift();
}
```

## Next Features to Add

1. **Effect Thumbnails**: Generate preview images for each effect
2. **Batch Processing**: Apply effects to multiple images
3. **Custom Presets**: UI for saving/loading user presets
4. **More Effects**: Implement remaining 40+ effects
5. **Advanced Editing**: Masking, selective effects
6. **Social Sharing**: Direct share to Instagram, etc.

## Resources

- [React Native Skia Docs](https://shopify.github.io/react-native-skia/)
- [Reanimated 3 Docs](https://docs.swmansion.com/react-native-reanimated/)
- [SkSL Language Reference](https://skia.org/docs/user/sksl/)
- [React Native IAP](https://github.com/dooboolab/react-native-iap)
