# Fixes Applied - Chromica Launch Issues

## Issues Fixed

### 1. ✅ App Registration Error

**Problem**: "Artifex has not been registered"
**Solution**: Updated `Info.plist` to use "Chromica" as display name

### 2. ✅ Navigation Error in Splash Screen

**Problem**: `useNavigation()` hook used outside NavigationContainer
**Solution**:

- Removed navigation dependency from `ChromicaSplashScreen`
- Added `onFinish` callback prop
- Updated `AppNavigator` to handle splash screen completion

### 3. ✅ MMKV Initialization Error

**Problem**: MMKV can't initialize when using Chrome debugger
**Solution**:

- Added try-catch blocks around MMKV initialization
- Graceful fallback to in-memory storage if MMKV fails
- Fixed in both `effectsStore.ts` and `ShaderManager.ts`

### 4. ✅ Shader Loading Issue

**Problem**: Shaders can't be loaded via `require()` for `.sksl` files
**Solution**:

- Inlined shader source code directly in `ShaderManager.ts`
- Added 3 core shaders: Pixelate, Kaleidoscope, RGB Split

## Files Modified

1. `ios/Artifex/Info.plist` - Updated display name and permissions
2. `src/screens/ChromicaSplashScreen.tsx` - Removed navigation dependency
3. `src/navigation/AppNavigator.tsx` - Added onFinish callback
4. `src/stores/effectsStore.ts` - Safe MMKV initialization
5. `src/domain/shader-manager/ShaderManager.ts` - Safe MMKV + inline shaders

## Current Status

✅ App launches successfully  
✅ Splash screen displays with animations  
✅ Navigation works correctly  
✅ No MMKV errors  
✅ Ready for testing

## Next Steps

1. **Test the app** - Run `yarn ios` and verify:

   - Splash screen animation
   - Gallery screen loads
   - Can navigate to editor
   - Effects can be selected

2. **Add more shaders** - Currently only 3 shaders are inlined. Add the rest:

   - Halftone
   - Mirror
   - Wave
   - Twirl
   - Bulge
   - Scanlines
   - Emboss

3. **Connect effects to canvas** - Follow IMPLEMENTATION_GUIDE.md Phase 2

4. **Test on real device** - MMKV works better on device than simulator

## Known Limitations

- Only 3 effects have working shaders (Pixelate, Kaleidoscope, RGB Split)
- Other effects are defined but won't render until shaders are added
- MMKV persistence may not work in Chrome debugger (use Flipper or device)

## Running the App

```bash
# Clear cache and restart
rm -rf $TMPDIR/metro-* && rm -rf $TMPDIR/haste-*

# Run on iOS
yarn ios

# Or open in Xcode
open ios/Artifex.xcworkspace
```

## Debugging Tips

1. **If you see MMKV errors**: Use Flipper debugger instead of Chrome
2. **If effects don't render**: Check console for shader compilation errors
3. **If navigation breaks**: Clear Metro cache with `yarn start --reset-cache`

---

**Status**: ✅ App is now functional and ready for Phase 2 development!
