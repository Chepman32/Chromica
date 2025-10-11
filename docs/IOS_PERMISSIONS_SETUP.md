# iOS Permissions Setup for Photo Gallery Access

## Required Info.plist Entries

Add these entries to your `ios/Artifex/Info.plist` file:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Artifex needs access to your photo library to let you select images for editing.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>Artifex needs permission to save your edited photos to your photo library.</string>
```

## Location in File

Add these entries inside the `<dict>` section of your Info.plist file, typically after other permission entries.

## Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Other existing entries -->

    <!-- Photo Library Permissions -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Artifex needs access to your photo library to let you select images for editing.</string>

    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>Artifex needs permission to save your edited photos to your photo library.</string>

    <!-- Other existing entries -->
</dict>
</plist>
```

## After Adding Permissions

1. Clean and rebuild the iOS project:

   ```bash
   cd ios && xcodebuild clean && cd ..
   yarn ios
   ```

2. The app will now properly request photo library permissions on first use.

## Testing

1. Tap the + FAB button on the home screen
2. The ImagePicker modal should open
3. On first use, iOS will show a permission dialog
4. After granting permission, you'll see your actual photos from the gallery
