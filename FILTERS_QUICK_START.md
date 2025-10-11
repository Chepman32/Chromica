# Filters Quick Start Guide

## 🚀 Quick Overview

The filter system is now fully functional with 14 color filters that apply GPU-accelerated ColorMatrix transformations to images in real-time.

## 📁 Key Files

```
src/
├── domain/effects/
│   ├── filters.ts                    # Filter definitions & ColorMatrix generators
│   └── __tests__/filters.test.ts     # Unit tests
├── components/
│   ├── effects/
│   │   └── FilterRenderer.tsx        # Skia filter rendering component
│   └── modals/
│       └── FilterToolModal.tsx       # Filter selection UI (updated)
├── utils/
│   └── colorMatrix.ts                # ColorMatrix utilities (enhanced)
└── components/
    └── SkiaCanvas.tsx                # Main canvas (already integrated)
```

## 🎨 Using Filters

### In Code

```typescript
import { COLOR_FILTERS, getFilterById } from '../domain/effects/filters';

// Get a filter
const filter = getFilterById('sepia');

// Generate color matrix at 80% intensity
const matrix = filter.getColorMatrix(0.8);

// Apply in Skia
<ColorMatrix matrix={matrix}>
  <SkiaImage image={myImage} />
</ColorMatrix>;
```

### In Editor

1. Open image in editor
2. Tap **Filters** button in toolbar
3. Select filter from grid
4. Adjust intensity (30%, 50%, 70%, 100%)
5. Tap **Apply Filter**

## 🔓 Free vs Premium

### Free (6 filters)

- Original, Black & White, Sepia, Vintage, Cool, Warm

### Premium (8 filters)

- Cinematic, Film, HDR, Portrait, Landscape, Neon, Cyberpunk, Retro

Premium filters show 🔒 icon and navigate to paywall when tapped by free users.

## 🧪 Testing

```bash
# Run filter tests
npm test -- filters.test.ts

# Test in app
1. Open any image
2. Apply each filter
3. Verify visual appearance
4. Test intensity levels
5. Export and verify
```

## ➕ Adding a New Filter

### 1. Add to `filters.ts`

```typescript
{
  id: 'myfilter',
  name: 'My Filter',
  isPro: false,
  getColorMatrix: (intensity: number) => {
    const myMatrix = [
      1.2, 0, 0, 0, 0,    // Boost red
      0, 1.0, 0, 0, 0,    // Keep green
      0, 0, 0.8, 0, 0,    // Reduce blue
      0, 0, 0, 1, 0,      // Keep alpha
    ];
    return lerpMatrix(identity(), myMatrix, intensity);
  },
}
```

### 2. Add to `colorMatrix.ts`

```typescript
myfilter: composeMatrices(
  saturationMatrix(1.1),
  contrastMatrix(1.05),
  rgbScaleMatrix(1.2, 1.0, 0.8),
),
```

### 3. Add preview color to `FilterToolModal.tsx`

```typescript
case 'myfilter':
  return { backgroundColor: '#FF8C00' };
```

### 4. Update TypeScript types in `types/index.ts`

```typescript
type: 'none' | 'bw' | ... | 'myfilter'
```

Done! Your filter is now available in the app.

## 🎯 ColorMatrix Basics

A ColorMatrix transforms RGBA values:

```
[R']   [a00 a01 a02 a03 a04]   [R]
[G'] = [a10 a11 a12 a13 a14] × [G]
[B']   [a20 a21 a22 a23 a24]   [B]
[A']   [a30 a31 a32 a33 a34]   [A]
                                [1]
```

### Common Operations

**Grayscale:**

```typescript
[
  0.299,
  0.587,
  0.114,
  0,
  0, // R' = luminance
  0.299,
  0.587,
  0.114,
  0,
  0, // G' = luminance
  0.299,
  0.587,
  0.114,
  0,
  0, // B' = luminance
  0,
  0,
  0,
  1,
  0,
]; // A' = A
```

**Boost Red:**

```typescript
[
  1.5,
  0,
  0,
  0,
  0, // R' = 1.5 * R
  0,
  1,
  0,
  0,
  0, // G' = G
  0,
  0,
  1,
  0,
  0, // B' = B
  0,
  0,
  0,
  1,
  0,
]; // A' = A
```

**Add Warmth:**

```typescript
[
  1,
  0,
  0,
  0,
  0.1, // R' = R + 0.1
  0,
  1,
  0,
  0,
  0.05, // G' = G + 0.05
  0,
  0,
  1,
  0,
  0, // B' = B
  0,
  0,
  0,
  1,
  0,
]; // A' = A
```

## 🐛 Troubleshooting

### Filter not applying?

```typescript
// Check store
const { appliedFilter } = useEditorStore();
console.log('Filter:', appliedFilter);

// Check matrix
const matrix = getFilterColorMatrix(appliedFilter);
console.log('Matrix:', matrix);
```

### Premium filters not locked?

```typescript
// Check pro status
const isProUser = useAppStore(state => state.isProUser);
console.log('Is Pro:', isProUser);
```

### Export missing filter?

Filters are automatically included in exports via the Skia canvas rendering.

## 📚 Documentation

- **Full Guide**: `FILTER_IMPLEMENTATION.md`
- **Summary**: `FILTER_IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `FILTERS_QUICK_START.md`

## 💡 Tips

1. **Performance**: ColorMatrix is GPU-accelerated, so even complex filters run at 60 FPS
2. **Intensity**: Always use 0-1 range for smooth interpolation
3. **Composition**: Use `composeMatrices()` to combine multiple transformations
4. **Testing**: Test filters on various image types (portraits, landscapes, low-light)
5. **Tuning**: Adjust matrix values incrementally to avoid over-processing

## 🎉 You're Ready!

The filter system is production-ready. Start applying beautiful color transformations to your images!

For questions or issues, refer to the full documentation in `FILTER_IMPLEMENTATION.md`.
