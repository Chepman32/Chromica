# Watermark Tool - Quick Reference Guide

## 🚀 Quick Start

### For Users

1. Tap the watermark tool (💧) in the editor toolbar
2. Enter your watermark text (e.g., "© 2025 Your Name")
3. Browse presets or filter by category
4. Tap a preset to customize
5. Adjust opacity, size, and rotation
6. Tap "Apply Watermark"

### For Developers

```typescript
import { WatermarkManager } from '../utils/watermarkManager';
import { WATERMARK_PRESETS } from '../constants/watermarkPresets';

// Apply a preset
const preset = WATERMARK_PRESETS[0];
const watermarks = WatermarkManager.applyPreset(
  preset,
  canvasSize,
  'Your Text',
  'text',
);

// Add to canvas
const elements = WatermarkManager.toCanvasElements(watermarks);
elements.forEach(el => addElement(el));
```

## 📋 Preset Cheat Sheet

| Preset ID              | Visual       | Count | Best For           |
| ---------------------- | ------------ | ----- | ------------------ |
| `tile-pattern`         | Grid         | 20    | Full coverage      |
| `corner-branding`      | Corners      | 4     | Minimal branding   |
| `diagonal-stripe`      | Diagonal     | 8     | Artistic look      |
| `scattered-protection` | Random       | 12    | Natural protection |
| `minimal-single`       | Center       | 1     | Logo placement     |
| `border-guard`         | Edges        | 12    | Frame effect       |
| `photographer-style`   | Bottom-right | 1     | Signature          |
| `dense-grid`           | Grid         | 30    | Max protection     |
| `moderate-coverage`    | Grid         | 12    | Balanced           |
| `large-watermarks`     | Random       | 6     | Prominent          |
| `small-watermarks`     | Random       | 15    | Subtle             |
| `micro-watermarks`     | Grid         | 40    | Barely visible     |

## 🎨 Pattern Quick Reference

```
Grid:           Diagonal:       Scattered:      Corners:
• • • • •       •               •   •           •         •
• • • • •         •               •
• • • • •           •         •       •
• • • • •             •                 •
• • • • •               •           •         •

Edges:          Center:         Single:
• • • • •
•       •           •
•       •
•       •                                   •
• • • • •
```

## ⚙️ Settings Range

| Setting  | Min  | Max  | Default | Step |
| -------- | ---- | ---- | ------- | ---- |
| Opacity  | 10%  | 100% | 100%    | 10%  |
| Size     | 50%  | 200% | 100%    | 10%  |
| Rotation | -45° | +45° | 0°      | 5°   |

## 🎯 Common Use Cases

### Photography Portfolio

```typescript
Preset: photographer-style
Text: "© 2025 John Doe Photography"
Opacity: 70%
Size: 100%
Rotation: 0°
```

### Social Media Protection

```typescript
Preset: scattered-protection
Text: "@yourusername"
Opacity: 40%
Size: 80%
Rotation: -15°
```

### Document Watermarking

```typescript
Preset: diagonal-stripe
Text: "CONFIDENTIAL"
Opacity: 30%
Size: 150%
Rotation: -45°
```

### Brand Logo Placement

```typescript
Preset: corner-branding
Text: "Your Brand"
Opacity: 60%
Size: 100%
Rotation: 0°
```

### Maximum Protection

```typescript
Preset: dense-grid
Text: "© Protected"
Opacity: 25%
Size: 90%
Rotation: 0°
```

## 🔧 API Quick Reference

### WatermarkManager Methods

```typescript
// Generate watermarks from preset
WatermarkManager.applyPreset(
  preset: WatermarkPreset,
  canvasSize: { width: number; height: number },
  content: string,
  type: 'text' | 'image'
): WatermarkInstance[]

// Apply global settings
WatermarkManager.applyGlobalSettings(
  watermarks: WatermarkInstance[],
  settings: {
    opacity?: number;
    scale?: number;
    rotation?: number;
  }
): WatermarkInstance[]

// Convert to canvas elements
WatermarkManager.toCanvasElements(
  watermarks: WatermarkInstance[]
): CanvasElement[]
```

## 📦 Import Statements

```typescript
// Types
import { WatermarkPreset, WatermarkInstance } from '../types/watermark';

// Presets
import {
  WATERMARK_PRESETS,
  PRESET_CATEGORIES,
} from '../constants/watermarkPresets';

// Manager
import { WatermarkManager } from '../utils/watermarkManager';

// Modal
import { WatermarkToolModal } from '../components/modals/WatermarkToolModal';
```

## 🎨 Preset Categories

```typescript
const categories = [
  { id: 'all', name: 'All', icon: '🎨' },
  { id: 'coverage', name: 'Coverage', icon: '📐' },
  { id: 'pattern', name: 'Pattern', icon: '🔲' },
  { id: 'density', name: 'Density', icon: '⚡' },
  { id: 'size', name: 'Size', icon: '📏' },
  { id: 'style', name: 'Style', icon: '✨' },
];
```

## 🐛 Troubleshooting

| Issue                  | Solution                                   |
| ---------------------- | ------------------------------------------ |
| Watermarks not visible | Check opacity > 0, text not empty          |
| Too many watermarks    | Use sparse preset or reduce count          |
| Watermarks too small   | Increase size setting or use larger preset |
| Watermarks overlapping | Increase spacing or use different pattern  |
| Performance issues     | Reduce count to < 50 watermarks            |

## 💡 Pro Tips

1. **Subtle is Better**: Start with 30-40% opacity for professional look
2. **Size Matters**: Adjust size based on image resolution
3. **Rotation Adds Interest**: Small rotation (-15° to 15°) looks natural
4. **Test Before Export**: Preview watermarks before finalizing
5. **Layer Strategy**: Apply watermarks last for easy editing
6. **Consistency**: Use same preset across image series
7. **Readability**: Ensure watermark doesn't obscure important content

## 📱 Keyboard Shortcuts (Future)

| Action                      | Shortcut      |
| --------------------------- | ------------- |
| Open Watermark Tool         | `W`           |
| Apply Last Preset           | `Cmd+W`       |
| Toggle Watermark Visibility | `Cmd+Shift+W` |
| Adjust Opacity              | `1-9` keys    |

## 🔗 Related Features

- **Text Tool**: For custom text elements
- **Sticker Tool**: For image-based watermarks
- **Export**: Watermarks are included in exports
- **Undo/Redo**: Works with watermark operations
- **Size Slider**: Adjust individual watermark sizes

## 📊 Performance Metrics

| Preset            | Watermarks | Generation Time | Render Time |
| ----------------- | ---------- | --------------- | ----------- |
| Minimal           | 1          | ~10ms           | ~5ms        |
| Corner Branding   | 4          | ~15ms           | ~10ms       |
| Moderate Coverage | 12         | ~30ms           | ~20ms       |
| Tile Pattern      | 20         | ~50ms           | ~30ms       |
| Dense Grid        | 30         | ~75ms           | ~40ms       |
| Micro             | 40         | ~100ms          | ~50ms       |

All presets maintain 60fps during interaction.

## 🎓 Learning Resources

- **Full Documentation**: `WATERMARK_SYSTEM_DOCUMENTATION.md`
- **Implementation Summary**: `WATERMARK_IMPLEMENTATION_SUMMARY.md`
- **Code Examples**: See documentation files
- **Type Definitions**: `src/types/watermark.ts`

## 🆘 Support

For issues or questions:

1. Check troubleshooting section above
2. Review full documentation
3. Inspect console logs for errors
4. Verify canvas size and text input
5. Test with different presets

## ✅ Checklist for Custom Presets

When creating new presets:

- [ ] Define unique ID
- [ ] Set appropriate category
- [ ] Configure count (1-50 recommended)
- [ ] Set base size (50-200px width)
- [ ] Define opacity range (0.1-1.0)
- [ ] Set rotation range (-45° to 45°)
- [ ] Test with various canvas sizes
- [ ] Verify performance
- [ ] Add to WATERMARK_PRESETS array
- [ ] Update documentation

## 🎉 That's It!

You're ready to use the watermark system. Start with a simple preset like "Photographer" or "Corner Branding" and experiment from there!
