# Artifex - Offline Photo Annotation App

Artifex is a premium iOS photo annotation app built with React Native, designed to provide an elegant, gesture-driven interface for adding watermarks, text, stickers, and stamps to photos. The app operates completely offline, ensuring user privacy and reliability.

## 🎯 Key Features

### Core Functionality

- **Offline-First Architecture**: All features work without internet connection
- **Gesture-Driven Editing**: Pinch, rotate, and drag elements with natural physics
- **Professional Export**: High-resolution PNG/JPG export with customizable quality
- **Privacy-Focused**: No data collection, no tracking, no cloud dependencies

### Free Tier

- ✅ Unlimited text, stickers, watermarks, and stamps
- ✅ 8 fonts, 30 stickers, 10 watermark templates, 8 stamps
- ✅ Full gesture editing capabilities
- ✅ Unlimited project saves
- ⚠️ Exported photos include small "Made with Artifex" watermark

### Pro Tier ($9.99 one-time purchase)

- ✅ 30+ premium fonts
- ✅ 100+ premium stickers
- ✅ 40+ professional watermark templates
- ✅ Custom watermark uploads
- ✅ Advanced photo filters
- ✅ No export watermark
- ✅ Priority support

## 🏗 Architecture

### Technology Stack

- **React Native 0.81+** - Cross-platform framework
- **React Native Reanimated 3.6+** - 60/120fps animations on UI thread
- **React Native Skia 1.0+** - High-performance 2D graphics rendering
- **Zustand 4.5+** - Lightweight state management
- **MMKV 2.11+** - Fast, synchronous local storage
- **TypeScript 5.3+** - Type safety and better DX

### Key Design Principles

1. **Dark Mode First**: Optimized for OLED displays and reduced eye strain
2. **8pt Grid System**: Consistent spacing and visual hierarchy
3. **60fps Minimum**: All animations run on UI thread via Reanimated worklets
4. **Accessibility**: WCAG AA compliance, VoiceOver support, Dynamic Type
5. **Privacy by Design**: No network requests except for IAP

### Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/          # Colors, typography, spacing
├── database/           # Local storage (MMKV)
├── navigation/         # React Navigation setup
├── screens/           # Main app screens
├── stores/            # Zustand state management
├── types/             # TypeScript definitions
└── utils/             # Helper functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- React Native development environment
- iOS development setup (Xcode, iOS Simulator)
- Yarn package manager

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd Artifex
yarn install
```

2. **iOS Setup:**

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

3. **Start Metro bundler:**

```bash
yarn start
```

4. **Run on iOS:**

```bash
yarn ios
```

### Development Dependencies

The app requires several native dependencies that need proper linking:

```bash
# Core dependencies (already in package.json)
yarn add react-native-reanimated
yarn add react-native-gesture-handler
yarn add @shopify/react-native-skia
yarn add react-native-mmkv
yarn add @react-native-camera-roll/camera-roll
yarn add react-native-vision-camera
yarn add react-native-fast-image
yarn add react-native-iap
yarn add react-native-share
yarn add react-native-fs
yarn add react-native-haptic-feedback
```

**Note**: Some dependencies may require additional native configuration. Refer to each library's documentation for iOS setup instructions.

## 📱 App Flow

### User Journey

1. **Splash Screen** (2.8s) - Physics-based logo animation
2. **Onboarding** (First launch) - 3-panel carousel explaining features
3. **Home Screen** - Project gallery with FAB for new projects
4. **Image Picker** - Custom photo selection with camera integration
5. **Editor** - Main canvas with gesture-driven editing
6. **Export** - High-resolution rendering with format options

### State Management

- **App Store**: Global settings, Pro status, onboarding state
- **Project Gallery Store**: Project list, selection mode, sorting
- **Editor Store**: Canvas elements, history, undo/redo

## 🎨 Design System

### Color Palette

- **Primary Background**: `#0F0F12` (Near black with blue tint)
- **Secondary Background**: `#1A1A1D` (Elevated surfaces)
- **Accent Gold**: `#D4AF37` (CTAs, Pro indicators)
- **Text Primary**: `#FFFFFF` (Headings, important text)
- **Text Secondary**: `#A0A0A0` (Body text, labels)

### Typography

- **Font Family**: SF Pro (Apple's system font)
- **Scale**: Hero (36pt) → H1 (32pt) → H2 (28pt) → Body (17pt) → Caption (13pt)
- **Dynamic Type**: Supports iOS accessibility text scaling

### Spacing

- **Base Unit**: 8pt grid system
- **Scale**: 4pt → 8pt → 12pt → 16pt → 24pt → 32pt → 48pt → 64pt

## 🔧 Development

### Running Tests

```bash
# Unit tests
yarn test

# E2E tests (requires setup)
yarn test:e2e
```

### Code Quality

```bash
# Linting
yarn lint

# Type checking
yarn type-check

# Format code
yarn format
```

### Performance Monitoring

- Use Flipper for debugging
- Monitor with Xcode Instruments for performance profiling
- Test on physical devices for accurate performance metrics

## 📦 Build & Release

### iOS Build

```bash
# Development build
yarn ios --configuration Debug

# Release build
yarn ios --configuration Release
```

### App Store Submission

1. Update version in `package.json` and iOS project
2. Generate release build with proper signing
3. Upload to App Store Connect
4. Submit for review with metadata from SDD

## 🔒 Privacy & Security

### Data Handling

- **No Analytics**: No Firebase, Mixpanel, or tracking SDKs
- **Local Storage**: All data stored on device using iOS encryption
- **Photos Access**: Minimal permissions, user controls access
- **No Servers**: Completely offline operation

### Permissions

- **Photos**: Read access for image selection, write access for saving
- **Camera**: Optional, only when user taps camera button
- **No Other Permissions**: No location, contacts, microphone, etc.

## 🛣 Roadmap

### Version 1.1 (Q2 2025)

- Light mode support
- Additional export formats (HEIC)
- More free tier assets

### Version 1.2 (Q3 2025)

- iPad optimization
- Multi-select and group manipulation
- Custom font installation

### Version 2.0 (2026)

- Optional cloud sync (encrypted)
- Collaboration features
- AI-powered features

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a commercial project. For bug reports or feature requests, please contact support@artifex.app.

## 📞 Support

- **Email**: support@artifex.app
- **Privacy Policy**: artifex.app/privacy
- **Terms of Service**: artifex.app/terms

---

Built with ❤️ using React Native

TODO: add feeling/resizing button ![alt text](image.png)
TODO: watermark modal's slider gestures
TODO: fix - watermarks are not visible on the exported image
TODO: fix - the exported image with sepia filter is broken
TODO: fix - Myafair and Rise filters have wrong effect
TODO: add opacity slider for watermarks
Make the Stamps and Stickers assets categorized
TODO: fix - Lo-Fi filter effect should be stronger
TODO: replace emojis