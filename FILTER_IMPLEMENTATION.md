# Filter Implementation Guide

## Overview

The filter system has been fully implemented with 14 color filters (6 free + 8 premium) using Skia ColorMatrix transformations for high-performance, GPU-accelerated image processing.

## Architecture

### 1. Filter Definitions (`src/domain/effects/filters.ts`)

This module defines all available color filters with their ColorMatrix transformations:

**Free Filters:**

- **Original** - No filter applied
- **Black & White** - Grayscale conversion using luminance weights
- **Sepia** - Classic sepia tone effect
- **Vintage** - Reduced contrast with warm tones
- **Cool** - Boosted blues, reduced reds
- **Warm** - Boosted reds/yellows, reduced blues

**Premium Filters:**

- **Cinematic** - Teal shadows, orange highlights (film look)
- **Film Grain** - Slightly desaturated with lifted blacks
- **HDR** - Enhanced contrast and saturation
- **Portrait** - Warm skin tones, soft contrast
- **Landscape** - Vibrant greens and blues
- **Neon** - High saturation, vibrant colors
- **Cyberpunk** - Cyan and magenta tones
- **Retro Wave** - Pink and purple tones

### 2. Color Matrix Utility (`src/utils/colorMatrix.ts`)

Enhanced with new filter matrices that compose:

- Saturation adjustments
- Contrast modifications
- Brightness offsets
- RGB channel scaling
- Channel offsets for color shifts

Each filter is carefully tuned to stay within Skia's expected range to avoid clipping during export.

### 3. Filter Renderer (`src/components/effects/FilterRenderer.tsx`)

A dedicated Skia component that:

- Takes a filter ID and intensity (0-1)
- Generates the appropriate ColorMatrix
- Applies it to the image using Skia's Paint system
- Supports real-time preview with adjustable intensity

### 4. Filter Modal (`src/components/modals/FilterToolModal.tsx`)

Updated UI that:

- Displays all 14 filters in a 3-column grid
- Shows visual previews with color-coded backgrounds
- Locks premium filters for free users
- Provides intensity controls (30%, 50%, 70%, 100%)
- Includes haptic feedback for better UX
- Links to paywall for premium filter access

## How Filters Work

### ColorMatrix Transformation

A ColorMatrix is a 5x4 matrix (20 values) that transforms RGBA color values:

```
[R']   [a00 a01 a02 a03 a04]   [R]
[G'] = [a10 a11 a12 a13 a14] × [G]
[B']   [a20 a21 a22 a23 a24]   [B]
[A']   [a30 a31 a32 a33 a34]   [A]
                                [1]
```

### Example: Black & White Filter

```typescript
const grayscale = [
  0.299,
  0.587,
  0.114,
  0,
  0, // R' = 0.299R + 0.587G + 0.114B
  0.299,
  0.587,
  0.114,
  0,
  0, // G' = 0.299R + 0.587G + 0.114B
  0.299,
  0.587,
  0.114,
  0,
  0, // B' = 0.299R + 0.587G + 0.114B
  0,
  0,
  0,
  1,
  0, // A' = A (preserve alpha)
];
```

### Intensity Blending

Filters support intensity from 0-1, which linearly interpolates between the identity matrix (no effect) and the full filter matrix:

```typescript
result = identity * (1 - intensity) + filterMatrix * intensity;
```

## Integration Points

### 1. Editor Screen (`src/screens/EditorScreen.tsx`)

The editor already has filter support through:

- `appliedFilter` state in `useEditorStore`
- `applyFilter(filter)` action
- Filter selection UI with horizontal scroll

### 2. Skia Canvas (`src/components/SkiaCanvas.tsx`)

The canvas applies filters using:

```typescript
const colorMatrix = appliedFilter ? getFilterColorMatrix(appliedFilter) : null;

// In render:
{
  colorMatrix ? (
    <ColorMatrix matrix={colorMatrix}>
      <SkiaImage image={sourceImage} />
    </ColorMatrix>
  ) : (
    <SkiaImage image={sourceImage} />
  );
}
```

### 3. Export System

Filters are automatically included in exports because:

- The Skia canvas renders with filters applied
- The export system captures the rendered canvas
- ColorMatrix transformations are GPU-accelerated and fast

## Usage Example

```typescript
import { COLOR_FILTERS, getFilterById } from '../domain/effects/filters';

// Get a filter
const sepiaFilter = getFilterById('sepia');

// Generate color matrix at 80% intensity
const matrix = sepiaFilter.getColorMatrix(0.8);

// Apply in Skia
<ColorMatrix matrix={matrix}>
  <SkiaImage image={myImage} />
</ColorMatrix>;
```

## Performance Characteristics

- **GPU Accelerated**: All ColorMatrix operations run on GPU via Skia
- **Real-time Preview**: Filters update at 60fps during intensity adjustment
- **Zero Latency**: No async operations or network calls
- **Memory Efficient**: ColorMatrix is just 20 numbers (160 bytes)
- **Export Speed**: No additional processing time during export

## Testing Filters

1. **Visual Testing**:

   - Open any image in the editor
   - Tap the Filters button in the toolbar
   - Select different filters and adjust intensity
   - Verify visual appearance matches expectations

2. **Premium Lock Testing**:

   - Test as free user (premium filters should show lock icon)
   - Tap locked filter → should navigate to paywall
   - Test as premium user (all filters unlocked)

3. **Export Testing**:
   - Apply a filter
   - Export the image
   - Verify filter is preserved in exported file

## Extending the System

### Adding a New Filter

1. Add filter definition to `src/domain/effects/filters.ts`:

```typescript
{
  id: 'myfilter',
  name: 'My Filter',
  isPro: false,
  getColorMatrix: (intensity: number) => {
    const myMatrix = [
      // Your 20 matrix values
    ];
    return lerpMatrix(identity(), myMatrix, intensity);
  },
}
```

2. Add matrix to `src/utils/colorMatrix.ts`:

```typescript
myfilter: composeMatrices(
  saturationMatrix(1.2),
  contrastMatrix(1.1),
  rgbScaleMatrix(1.1, 1.0, 0.9),
),
```

3. Add preview style to `FilterToolModal.tsx`:

```typescript
case 'myfilter':
  return { backgroundColor: '#YOUR_COLOR' };
```

4. Update TypeScript types in `src/types/index.ts`:

```typescript
type: 'none' | 'bw' | ... | 'myfilter'
```

## Troubleshooting

### Filter Not Applying

1. Check that `appliedFilter` is set in store:

   ```typescript
   const { appliedFilter } = useEditorStore();
   console.log('Current filter:', appliedFilter);
   ```

2. Verify ColorMatrix is generated:

   ```typescript
   const matrix = getFilterColorMatrix(appliedFilter);
   console.log('Matrix:', matrix);
   ```

3. Ensure Skia image is loaded:
   ```typescript
   const image = useImage(imageUri);
   console.log('Image loaded:', !!image);
   ```

### Premium Filters Not Locked

Check `isProUser` state:

```typescript
const isProUser = useAppStore(state => state.isProUser);
```

### Export Missing Filter

Verify the export system captures the Skia canvas with filters applied. The `imageExporter.ts` should render the full canvas including ColorMatrix transformations.

## Future Enhancements

1. **Custom Filters**: Allow users to create and save custom filter presets
2. **Filter Presets**: Pre-configured intensity levels (Light, Medium, Strong)
3. **Filter Combinations**: Stack multiple filters with blend modes
4. **Live Camera Filters**: Apply filters to camera preview in real-time
5. **Filter Thumbnails**: Generate actual preview thumbnails instead of color swatches
6. **Animated Filters**: Time-based filter animations for video support

## References

- [Skia ColorMatrix Documentation](https://api.skia.org/classSkColorMatrix.html)
- [React Native Skia](https://shopify.github.io/react-native-skia/)
- [Color Theory for Filters](https://en.wikipedia.org/wiki/Color_grading)
