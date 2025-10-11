# Running Artifex App

## Current Status

We've temporarily disabled Reanimated animations to fix the initialization issue. The app should now run with basic functionality.

## Steps to Run:

1. **Start Metro Bundler** (in Terminal 1):

   ```bash
   yarn start
   ```

2. **Run iOS App** (in Terminal 2):
   ```bash
   yarn ios
   ```

## What We Fixed:

- Added `import 'react-native-reanimated';` at the top of App.tsx
- Temporarily disabled animations in:
  - SplashScreen
  - OnboardingScreen
  - HomeScreen FAB
- Cleaned and rebuilt iOS dependencies
- Removed problematic dependencies (Skia, IAP, Share, Vision Camera)

## Next Steps After App Runs:

1. Re-enable Reanimated animations one by one
2. Add back the removed dependencies gradually
3. Test each component individually

## If Still Getting Reanimated Errors:

1. Clean build: `rm -rf ios/build`
2. Reset Metro cache: `yarn start --reset-cache`
3. Reinstall pods: `cd ios && bundle exec pod install`
