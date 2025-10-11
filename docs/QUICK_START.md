# Artifex - Quick Start Guide

## 🚀 Running the App

```bash
# 1. Install dependencies (if not done)
yarn install
cd ios && pod install && cd ..

# 2. Start Metro bundler
yarn start --reset-cache

# 3. Run on iOS (in another terminal)
yarn ios
```

## 🎯 What's Working Now

### ✅ Fully Functional
- Animated splash screen
- Onboarding carousel with parallax
- Home screen (project gallery)
- Image picker
- **Editor with interactive canvas** ⭐
  - Add text elements
  - Drag, pinch, rotate gestures
  - Undo/redo
- Text tool modal
- Settings screen
- Paywall screen

### 🔧 How to Use the Editor

1. **Add Text**:
   - Tap "T" icon in bottom toolbar
   - Enter text in modal
   - Choose font, size, color
   - Tap "Add to Canvas"

2. **Manipulate Elements**:
   - **Drag**: One finger pan
   - **Scale**: Pinch with two fingers
   - **Rotate**: Two finger rotation
   - **Select**: Tap element
   - **Deselect**: Tap empty area

3. **Undo/Redo**:
   - Tap ↶ icon to undo
   - Tap ↷ icon to redo

## 📂 Project Structure

```
src/
├── components/
│   ├── canvas/              # Canvas elements
│   │   ├── TextElement.tsx
│   │   └── StickerElement.tsx
│   ├── modals/              # Bottom sheets
│   │   ├── BottomSheet.tsx
│   │   └── TextToolModal.tsx
│   └── SkiaCanvas.tsx       # Main canvas
├── constants/               # Design system
├── hooks/
│   └── useCanvasGestures.ts # Gesture logic
├── screens/                 # Main screens
├── stores/                  # Zustand state
├── types/                   # TypeScript types
└── utils/                   # Helpers
    ├── canvasElements.ts    # Element factories
    ├── animations.ts
    └── haptics.ts
```

## 🎨 Key Features

### Animations
- All animations use Reanimated 3 (UI thread)
- 60fps guaranteed for gestures
- Spring physics for natural feel

### Gestures
- Multi-touch support
- Simultaneous gestures
- Snap-to-angle rotation
- Haptic feedback

### State Management
- Zustand for app state
- History system for undo/redo
- Project persistence with MMKV

## 📝 Next Tasks

1. **Sticker Picker Modal** - Grid view with assets
2. **Watermark Tool Modal** - Templates + custom
3. **Export System** - Skia rendering to image
4. **More Animations** - Home screen entrance, etc.

## 🐛 Troubleshooting

### Metro bundler not starting
```bash
yarn start --reset-cache
```

### iOS build fails
```bash
cd ios
rm -rf build
pod install
cd ..
yarn ios
```

### Reanimated error
- Check `babel.config.js` has `react-native-reanimated/plugin`
- Check `App.tsx` imports `'react-native-reanimated'` first
- Clean and rebuild

## 📚 Docs

- **[LATEST_UPDATES.md](LATEST_UPDATES.md)** - Detailed progress report
- **[IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)** - Full roadmap
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development guide

---

Happy coding! 🎉
