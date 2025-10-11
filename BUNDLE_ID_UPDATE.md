# Bundle ID Update Guide

## Why This Is Required

The app is currently configured with the old "Artifex" bundle identifier. You must update it to "Chromica" before building.

## iOS Configuration

### 1. Update Info.plist

**File**: `ios/Chromica/Info.plist`

Find and update:

```xml
<key>CFBundleIdentifier</key>
<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>

<key>CFBundleDisplayName</key>
<string>Chromica</string>

<key>CFBundleName</key>
<string>Chromica</string>
```

### 2. Update Xcode Project

**Option A: Using Xcode (Recommended)**

1. Open `ios/Chromica.xcworkspace` in Xcode
2. Select project in navigator
3. Select "Chromica" target
4. Go to "Signing & Capabilities" tab
5. Update "Bundle Identifier" to: `com.yourcompany.chromica`

**Option B: Manual Edit**
Edit `ios/Chromica.xcodeproj/project.pbxproj`:

```
Search for: PRODUCT_BUNDLE_IDENTIFIER
Replace all instances with: com.yourcompany.chromica
```

### 3. Update Scheme (if needed)

If you renamed the app folder:

1. In Xcode: Product → Scheme → Manage Schemes
2. Rename scheme from "Artifex" to "Chromica"

### 4. Clean Build

```bash
cd ios
rm -rf build
rm -rf Pods
pod install
cd ..
```

## Android Configuration

### 1. Update build.gradle

**File**: `android/app/build.gradle`

Find and update:

```gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.chromica"
        // ... rest of config
    }
}
```

### 2. Update strings.xml

**File**: `android/app/src/main/res/values/strings.xml`

```xml
<resources>
    <string name="app_name">Chromica</string>
</resources>
```

### 3. Rename Package Directories (Optional but Recommended)

If you want to match package structure to bundle ID:

```bash
cd android/app/src/main/java/com/

# If current structure is com/artifex
mv artifex chromica

# Update package declarations in all Java/Kotlin files
# In MainActivity.java:
package com.yourcompany.chromica;

# In MainApplication.java:
package com.yourcompany.chromica;
```

### 4. Update AndroidManifest.xml

**File**: `android/app/src/main/AndroidManifest.xml`

Verify package attribute:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourcompany.chromica">
```

### 5. Clean Build

```bash
cd android
./gradlew clean
cd ..
```

## Verification

### iOS

```bash
# Build and check
yarn ios

# Or with specific simulator
yarn ios --simulator="iPhone 15 Pro"
```

### Android

```bash
# Build and check
yarn android

# Or with specific device
yarn android --deviceId=<device-id>
```

## Common Issues

### Issue: "No bundle URL present"

**Cause**: Metro bundler not running
**Fix**:

```bash
yarn start --reset-cache
```

### Issue: "Could not find or load main class"

**Cause**: Package name mismatch
**Fix**: Ensure all package declarations match new bundle ID

### Issue: "Signing for 'Chromica' requires a development team"

**Cause**: No signing certificate
**Fix**: In Xcode, select your development team in Signing & Capabilities

### Issue: Build fails with "duplicate symbols"

**Cause**: Old build artifacts
**Fix**:

```bash
# iOS
cd ios && rm -rf build && pod install && cd ..

# Android
cd android && ./gradlew clean && cd ..
```

## App Store Connect Setup (When Ready)

### 1. Create App in App Store Connect

- Bundle ID: `com.yourcompany.chromica`
- App Name: "Chromica"
- SKU: `chromica-ios`

### 2. Configure IAP Products

Create three products:

- `com.yourcompany.chromica.pro.monthly` - Monthly Subscription
- `com.yourcompany.chromica.pro.annual` - Annual Subscription
- `com.yourcompany.chromica.pro.lifetime` - One-Time Purchase

### 3. Update IAP Product IDs

**File**: `src/utils/iapManager.ts`

```typescript
const PRODUCT_IDS = {
  monthly: 'com.yourcompany.chromica.pro.monthly',
  annual: 'com.yourcompany.chromica.pro.annual',
  lifetime: 'com.yourcompany.chromica.pro.lifetime',
};
```

## Google Play Console Setup (When Ready)

### 1. Create App

- Package name: `com.yourcompany.chromica`
- App name: "Chromica"

### 2. Configure In-App Products

Create matching products with same IDs as iOS

## Testing Bundle ID Change

### Checklist

- [ ] iOS app builds successfully
- [ ] Android app builds successfully
- [ ] App name shows as "Chromica" on home screen
- [ ] No signing errors
- [ ] Can install on device
- [ ] App launches without crashes
- [ ] Previous app data cleared (fresh install)

### Test Commands

```bash
# Check iOS bundle ID
/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" ios/Chromica/Info.plist

# Check Android package
grep "applicationId" android/app/build.gradle
```

## Rollback (If Needed)

If you need to revert:

### iOS

```bash
git checkout ios/Chromica/Info.plist
git checkout ios/Chromica.xcodeproj/project.pbxproj
cd ios && pod install && cd ..
```

### Android

```bash
git checkout android/app/build.gradle
git checkout android/app/src/main/AndroidManifest.xml
cd android && ./gradlew clean && cd ..
```

## Next Steps

After bundle ID is updated:

1. ✅ Test build on both platforms
2. ✅ Verify app name displays correctly
3. ✅ Continue with Phase 2 implementation
4. ⏳ Configure App Store Connect (when ready for release)
5. ⏳ Configure Google Play Console (when ready for release)

---

**Important**: Keep your bundle ID consistent across all platforms and configurations. Changing it later requires users to reinstall the app.
