# Artifex Development Guide

This guide covers the development setup and workflow for the Artifex React Native app.

## 🛠 Development Environment Setup

### Prerequisites

1. **Node.js 20+** - Use nvm for version management
2. **Yarn** - Package manager (preferred over npm)
3. **Xcode 15+** - For iOS development
4. **iOS Simulator** - For testing
5. **Ruby & Bundler** - For CocoaPods management

### Initial Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
cd Artifex
```

2. **Install Node dependencies:**

```bash
yarn install
```

3. **Install iOS dependencies:**

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

4. **Start the development server:**

```bash
yarn start
```

5. **Run on iOS Simulator:**

```bash
yarn ios
```

## 📁 Project Structure

```
Artifex/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── constants/         # Design system constants
│   ├── database/          # Local storage layer
│   ├── navigation/        # Navigation configuration
│   ├── screens/          # Main app screens
│   ├── stores/           # Zustand state management
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
├── assets/               # Static assets
│   ├── fonts/           # Font files
│   ├── stickers/        # Sticker images
│   ├── watermarks/      # Watermark templates
│   └── stamps/          # Stamp designs
├── ios/                 # iOS native code
├── android/             # Android native code (future)
└── __tests__/           # Test files
```

## 🎨 Design System

### Colors

All colors are defined in `src/constants/colors.ts`:

- Dark mode first approach
- WCAG AA compliant contrast ratios
- Semantic color naming

### Typography

Typography system in `src/constants/typography.ts`:

- SF Pro font family (iOS system font)
- Consistent scale and line heights
- Dynamic Type support

### Spacing

8pt grid system in `src/constants/spacing.ts`:

- Consistent spacing scale
- Component dimensions
- Layout margins and padding

## 🏗 Architecture Patterns

### State Management (Zustand)

- **App Store**: Global app state (Pro status, preferences)
- **Project Gallery Store**: Project list management
- **Editor Store**: Canvas state and operations

### Navigation (React Navigation)

- Stack navigator for main flow
- Modal presentations for overlays
- Custom transitions for smooth UX

### Database (MMKV)

- Fast, synchronous key-value storage
- Project persistence
- User preferences storage

## 🔧 Development Workflow

### Code Style

```bash
# Linting
yarn lint

# Type checking
yarn type-check

# Format code
yarn format
```

### Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test --watch

# Coverage
yarn test --coverage
```

### Debugging

1. **React Native Debugger** - For Redux/state debugging
2. **Flipper** - For network, layout, and performance debugging
3. **Xcode Instruments** - For iOS performance profiling

## 📱 Platform-Specific Notes

### iOS Development

- Minimum iOS version: 14.0
- Uses native iOS components where possible
- Follows iOS Human Interface Guidelines
- Supports ProMotion displays (120fps)

### Performance Targets

- **App Launch**: <3 seconds
- **Screen Transitions**: 60fps minimum, 120fps on ProMotion
- **Gesture Response**: <16ms (60fps)
- **Image Export**: <2 seconds for 4K images

## 🚀 Build & Release

### Development Build

```bash
yarn ios --configuration Debug
```

### Release Build

```bash
yarn ios --configuration Release
```

### App Store Build

1. Update version numbers
2. Generate release build
3. Archive in Xcode
4. Upload to App Store Connect

## 🔍 Debugging Common Issues

### Metro Bundle Issues

```bash
# Clear Metro cache
yarn start --reset-cache

# Clear node modules
rm -rf node_modules && yarn install
```

### iOS Build Issues

```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && bundle exec pod install && cd ..
```

### Simulator Issues

```bash
# Reset iOS Simulator
xcrun simctl erase all
```

## 📊 Performance Monitoring

### Key Metrics to Monitor

1. **JavaScript Thread**: Should stay below 60% usage
2. **UI Thread**: Should maintain 60fps during animations
3. **Memory Usage**: Monitor for leaks during navigation
4. **Bundle Size**: Keep under 50MB for fast downloads

### Profiling Tools

- **Xcode Instruments**: CPU, Memory, Network profiling
- **React Native Performance Monitor**: JS thread monitoring
- **Flipper Performance Plugin**: Real-time performance metrics

## 🧪 Testing Strategy

### Unit Tests (60%)

- Business logic functions
- State management (Zustand stores)
- Utility functions

### Integration Tests (30%)

- Screen rendering with mocked stores
- Navigation flows
- Component interactions

### E2E Tests (10%)

- Critical user journeys
- Full app flows
- Device-specific testing

## 🔐 Security Considerations

### Data Protection

- All user data stored locally with iOS encryption
- No network requests except IAP
- Photos library access minimized

### Code Security

- No hardcoded secrets
- Obfuscated release builds
- Certificate pinning for IAP

## 📚 Resources

### Documentation

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Skia](https://shopify.github.io/react-native-skia/)

### Design Resources

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [Apple Design Resources](https://developer.apple.com/design/resources/)

## 🤝 Contributing

### Code Review Checklist

- [ ] Follows TypeScript best practices
- [ ] Includes appropriate tests
- [ ] Maintains 60fps performance
- [ ] Follows design system guidelines
- [ ] Includes accessibility support
- [ ] No console.log statements in production code

### Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run tests and linting
4. Create pull request
5. Code review and approval
6. Merge to `main`

---

Happy coding! 🚀
