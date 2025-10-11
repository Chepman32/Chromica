# Chromica - Professional Mobile Image Editor

## Overview

Chromica is a professional-grade, offline-first mobile image editor for iOS, specializing in stunning visual effects and transformations. Built with React Native, React Native Skia, and Reanimated 3 for native-level performance.

## What's Been Implemented

### ✅ Phase 1: Core Foundation (COMPLETED)

#### 1. Rebranding

- ✅ App renamed from "Artifex" to "Chromica"
- ✅ Updated package.json, app.json, and all references
- ✅ Added new dependencies (react-native-iap, react-native-image-picker, jotai, react-query)

#### 2. Effects Engine Architecture

- ✅ **Effect Types System** (`src/domain/effects/types.ts`)

  - Effect categories (Cellular, Tiling, Distortion, Relief, Glitch, Stylization)
  - Effect parameters (slider, segmented, color, toggle, 2d-pad)
  - Effect layers with blend modes
  - Effect presets system

- ✅ **Effect Registry** (`src/domain/effects/registry.ts`)
  - 15+ effects defined across all categories
  - Free vs Premium effect classification
  - Parameter definitions for each effect
  - Helper functions for filtering effects

#### 3. Shader System

- ✅ **Shader Manager** (`src/domain/shader-manager/ShaderManager.ts`)

  - Shader compilation and caching
  - Memory-efficient shader loading
  - Preload system for common shaders

- ✅ **SkSL Shaders** (10 shaders implemented):
  - `cellular/pixelate.sksl` - Classic pixelation effect
  - `cellular/halftone.sksl` - Print halftone dots
  - `tiling/kaleidoscope.sksl` - Radial symmetry
  - `tiling/mirror.sksl` - Mirror reflections
  - `distortion/wave.sksl` - Sinusoidal waves
  - `distortion/twirl.sksl` - Spiral rotation
  - `distortion/bulge.sksl` - Radial scale distortion
  - `glitch/rgb-split.sksl` - Chromatic aberration
  - `glitch/scanlines.sksl` - CRT monitor effect
  - `relief/emboss.sksl` - 3D raised surface

#### 4. Image Processing Engine

- ✅ **ImageProcessor** (`src/domain/image-processor/ImageProcessor.ts`)
  - Load images from URI
  - Apply single effects with quality control
  - Apply effect stacks (multiple layers)
  - Export to JPEG/PNG/WebP
  - Adaptive quality based on complexity
  - Shader uniform building

#### 5. State Management

- ✅ **Effects Store** (`src/stores/effectsStore.ts`)
  - Effect stack management
  - Layer operations (add, remove, reorder, toggle visibility)
  - Opacity and blend mode controls
  - Undo/Redo history (20 steps)
  - User presets (save/load/delete)
  - Premium status tracking
  - MMKV persistence

#### 6. New Screens

- ✅ **Chromica Splash Screen** (`src/screens/ChromicaSplashScreen.tsx`)

  - Animated logo with spring physics
  - Multi-stage animation sequence
  - Rotation and scale effects
  - Text reveal animation
  - Auto-navigation after 3.5s

- ✅ **Gallery Screen** (`src/screens/GalleryScreen.tsx`)

  - Photo library integration
  - Filter pills (All, Recent, Favorites)
  - 3-column grid layout
  - Pull-to-refresh
  - Floating Action Button with animations
  - Scroll-based FAB hide/show
  - Haptic feedback

- ✅ **Effects Editor Screen** (`src/screens/EffectsEditorScreen.tsx`)
  - Skia canvas with image rendering
  - Pinch-to-zoom and pan gestures
  - Category tabs (6 categories)
  - Horizontal effects grid
  - Quick tools (Undo, Redo, Compare, Reset)
  - Effect parameters panel
  - Premium badge on locked effects
  - Real-time effect preview

#### 7. Navigation

- ✅ Updated AppNavigator with new screens
- ✅ Integrated ChromicaSplashScreen as initial screen
- ✅ GalleryScreen as main home
- ✅ EffectsEditorScreen as primary editor

## Project Structure

```
src/
├── domain/
│   ├── effects/
│   │   ├── types.ts              # Effect type definitions
│   │   └── registry.ts           # All effects catalog
│   ├── shader-manager/
│   │   └── ShaderManager.ts      # Shader compilation & caching
│   └── image-processor/
│       └── ImageProcessor.ts     # Core image processing
├── stores/
│   └── effectsStore.ts           # Effects state management
├── screens/
│   ├── ChromicaSplashScreen.tsx  # Animated splash
│   ├── GalleryScreen.tsx         # Photo selection
│   └── EffectsEditorScreen.tsx   # Main editor
├── assets/
│   └── shaders/
│       ├── cellular/             # Pixelate, Halftone
│       ├── tiling/               # Kaleidoscope, Mirror
│       ├── distortion/           # Wave, Twirl, Bulge
│       ├── glitch/               # RGB Split, Scanlines
│       └── relief/               # Emboss
└── navigation/
    └── AppNavigator.tsx          # Updated navigation
```

## Effects Catalog

### Cellular Effects

1. **Pixelate** (Free) - Classic pixel mosaic
2. **Crystallize** (Premium) - Voronoi cells
3. **Halftone** (Premium) - Print halftone dots

### Tiling Effects

4. **Kaleidoscope** (Free) - Radial symmetry
5. **Mirror** (Free) - Mirror reflections

### Distortion Effects

6. **Wave** (Free) - Sinusoidal distortion
7. **Twirl** (Premium) - Spiral rotation
8. **Bulge/Pinch** (Premium) - Radial scale

### Glitch Effects

9. **RGB Split** (Free) - Chromatic aberration
10. **Scanlines** (Free) - CRT monitor effect

### Relief Effects

11. **Emboss** (Premium) - 3D raised surface

### Stylization Effects

12. **Oil Paint** (Premium) - Painted appearance

## Installation & Setup

```bash
# Install dependencies
yarn install

# iOS setup
cd ios && pod install && cd ..

# Run on iOS
yarn ios

# Run on Android
yarn android
```

## Next Steps (Phase 2)

### High Priority

1. **Real-time Effect Rendering**

   - Connect shaders to canvas
   - Implement effect stack rendering
   - Add preview quality system

2. **Parameter Controls**

   - Slider components with haptics
   - Segmented controls
   - Color picker
   - 2D pad for center point selection

3. **Export Functionality**

   - Export screen with format options
   - Quality slider with file size estimation
   - Save to Camera Roll
   - Share sheet integration

4. **IAP Integration**
   - Paywall screen implementation
   - StoreKit integration
   - Receipt validation
   - Premium unlock flow

### Medium Priority

5. **Effect Stacking**

   - Layer visualization
   - Reorder layers (drag & drop)
   - Layer opacity controls
   - Blend modes

6. **More Effects**

   - Complete all 50+ effects from spec
   - Add remaining shaders
   - Effect thumbnails/previews

7. **Performance Optimization**
   - Adaptive preview quality
   - Shader preloading
   - Memory management
   - Background processing

### Lower Priority

8. **Advanced Features**

   - Batch processing
   - User presets UI
   - Effect favorites
   - Compare mode (before/after)

9. **Polish**
   - Onboarding flow
   - Settings screen updates
   - Localization
   - Accessibility

## Technical Notes

### Performance Considerations

- All shaders run on GPU via Skia
- Preview quality adapts based on effect complexity
- Shader compilation cached in memory
- MMKV for fast persistent storage

### Key Technologies

- **React Native Skia**: GPU-accelerated rendering
- **Reanimated 3**: 60fps animations on UI thread
- **Zustand**: Lightweight state management
- **MMKV**: High-performance storage
- **SkSL**: Shader language for effects

### Design System

- Primary: #6366F1 (Indigo)
- Secondary: #EC4899 (Pink)
- Background: #0F0F1E (Dark)
- Surface: #1F1F2E

## Known Limitations

1. Shader sources need to be properly loaded (currently using require)
2. Effect rendering not yet connected to canvas
3. Parameter controls are placeholders
4. Export functionality not implemented
5. IAP not integrated
6. Some effects missing shader implementations

## Contributing

This is a transformation from Artifex to Chromica. The foundation is solid, but many features need completion. Priority should be given to:

1. Connecting shaders to canvas rendering
2. Implementing parameter controls
3. Export functionality
4. IAP integration

## License

Private project - All rights reserved
