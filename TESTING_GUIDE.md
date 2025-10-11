# Chromica - Testing Guide

## ✅ Complete Testing Checklist

### 1. App Launch (30 seconds)

- [ ] App launches without crashes
- [ ] Splash screen displays with animation
- [ ] Logo rotates smoothly
- [ ] "CHROMICA" text appears
- [ ] Transitions to gallery after 3.5s

### 2. Gallery Screen (1 minute)

- [ ] Photos load from library
- [ ] Grid displays correctly (3 columns)
- [ ] Filter pills work (All, Recent, Favorites)
- [ ] Scroll is smooth
- [ ] FAB button visible (bottom-right)
- [ ] Tap photo opens image picker
- [ ] Selected image navigates to editor

### 3. Editor Screen - Basic (2 minutes)

- [ ] Image displays correctly
- [ ] Top bar shows filename
- [ ] Back button works
- [ ] Share button visible
- [ ] Quick tools bar present (Undo, Redo, Compare, Reset)
- [ ] Category tabs visible at bottom
- [ ] Effects grid scrolls horizontally

### 4. Editor Screen - Gestures (1 minute)

- [ ] Pinch to zoom works
- [ ] Pan to move image works
- [ ] Double-tap to reset zoom (if implemented)
- [ ] Gestures are smooth (60fps)

### 5. Effects - Pixelate (2 minutes)

- [ ] Tap "Cellular" category
- [ ] Tap "Pixelate" effect
- [ ] Effect label appears on image ("Effect: Pixelate")
- [ ] Parameter panel appears below canvas
- [ ] "Cell Size" slider visible
- [ ] Drag slider left/right
- [ ] **Image pixelates in real-time** ⭐
- [ ] Value updates as you drag
- [ ] Haptic feedback on drag
- [ ] Effect renders smoothly

### 6. Effects - Kaleidoscope (2 minutes)

- [ ] Tap "Tiling" category
- [ ] Tap "Kaleidoscope" effect
- [ ] Effect label updates
- [ ] Three sliders appear:
  - [ ] Segments (2-24)
  - [ ] Rotation (0-360)
  - [ ] Zoom (0.5-3)
- [ ] Adjust "Segments" slider
- [ ] **Image shows kaleidoscope pattern** ⭐
- [ ] Adjust "Rotation" slider
- [ ] Pattern rotates in real-time
- [ ] Adjust "Zoom" slider
- [ ] Pattern zooms smoothly

### 7. Effects - RGB Split (2 minutes)

- [ ] Tap "Glitch" category
- [ ] Tap "RGB Split" effect
- [ ] Two sliders appear:
  - [ ] Offset X (-50 to 50)
  - [ ] Offset Y (-50 to 50)
- [ ] Adjust "Offset X" slider
- [ ] **RGB channels split horizontally** ⭐
- [ ] Adjust "Offset Y" slider
- [ ] RGB channels split vertically
- [ ] Effect renders in real-time

### 8. Undo/Redo (1 minute)

- [ ] Apply an effect
- [ ] Tap "Undo" button
- [ ] Effect removed
- [ ] Tap "Redo" button
- [ ] Effect reapplied
- [ ] Buttons disable when no history

### 9. Reset (30 seconds)

- [ ] Apply multiple effects
- [ ] Long press "Reset" button
- [ ] All effects cleared
- [ ] Image returns to original

### 10. Export Screen (2 minutes)

- [ ] Tap share button (↗️) in top-right
- [ ] Export screen opens
- [ ] Preview shows image with effect
- [ ] Format buttons visible (JPG, PNG)
- [ ] Tap "PNG" - button highlights
- [ ] Quality buttons visible (Low, Medium, High, Max)
- [ ] Tap "High" - button highlights
- [ ] "Save to Photos" button visible
- [ ] "Share" button visible

### 11. Save to Photos (1 minute)

- [ ] Tap "Save to Photos"
- [ ] Loading indicator appears
- [ ] Success alert shows
- [ ] Tap "OK"
- [ ] Returns to editor
- [ ] Check Photos app - image saved

### 12. Share (1 minute)

- [ ] Return to export screen
- [ ] Tap "Share" button
- [ ] iOS share sheet appears
- [ ] Options visible (Messages, Mail, etc.)
- [ ] Cancel or share successfully

### 13. Navigation (1 minute)

- [ ] Back button from editor → gallery
- [ ] Back button from export → editor
- [ ] All transitions smooth
- [ ] No crashes during navigation

### 14. Performance (2 minutes)

- [ ] All animations at 60fps
- [ ] No lag when adjusting sliders
- [ ] Effects render instantly
- [ ] App feels responsive
- [ ] No memory warnings
- [ ] Battery usage reasonable

### 15. Error Handling (2 minutes)

- [ ] Try selecting corrupted image (if any)
- [ ] App handles gracefully
- [ ] Error messages clear
- [ ] No crashes
- [ ] Can recover and continue

## 🎯 Critical Tests (Must Pass)

### ⭐ Core Functionality

1. **Image loads in editor** - Without this, nothing works
2. **Pixelate effect renders** - Proves shader system works
3. **Sliders adjust parameters** - Proves interactivity works
4. **Export saves image** - Proves output works

### ⚡ Performance

1. **60fps animations** - Use Xcode FPS counter
2. **Real-time effect rendering** - No lag when adjusting
3. **Smooth gestures** - Pinch/pan feels native

### 🎨 UX

1. **Visual feedback** - Haptics, animations, indicators
2. **Clear navigation** - Easy to understand flow
3. **Error recovery** - Graceful handling of issues

## 🐛 Common Issues & Solutions

### Issue: Image doesn't load

**Check**: Console logs for URI format
**Solution**: Should see "file://" prefix in logs

### Issue: Effect doesn't render

**Check**: EffectRenderer console logs
**Solution**: Verify shader compiles without errors

### Issue: Sliders don't work

**Check**: Parameter panel visible?
**Solution**: Ensure effect is selected first

### Issue: Export fails

**Check**: Photo library permissions
**Solution**: Check Settings → Chromica → Photos

### Issue: App crashes

**Check**: Console for error messages
**Solution**: Clear cache and rebuild

## 📊 Performance Benchmarks

### Expected Performance

- **App Launch**: < 2 seconds
- **Image Load**: < 500ms
- **Effect Apply**: Instant (< 16ms)
- **Parameter Adjust**: 60fps (16.67ms per frame)
- **Export**: < 1 second for HD image

### Measuring Performance

```bash
# Use Xcode Instruments
# Profile → Time Profiler
# Check for:
# - Main thread usage
# - GPU usage
# - Memory allocation
```

## 🎬 Demo Script

Perfect for showing off the app:

1. **Launch** - "Watch the animated splash screen"
2. **Gallery** - "Browse your photo library"
3. **Select** - "Tap any photo to edit"
4. **Pixelate** - "Apply pixelate effect, adjust cell size"
5. **Kaleidoscope** - "Create symmetrical patterns"
6. **RGB Split** - "Add glitch effects"
7. **Zoom** - "Pinch to zoom, pan to move"
8. **Export** - "Save or share your creation"

## ✅ Sign-Off Criteria

App is ready for release when:

- [ ] All critical tests pass
- [ ] No crashes in 30-minute session
- [ ] Performance meets benchmarks
- [ ] Export functionality works
- [ ] UI/UX feels polished
- [ ] Error handling is graceful

## 🎉 Success!

If all tests pass, congratulations! You have a fully functional professional image editor with real-time GPU-accelerated effects.

---

**Testing Time**: ~20 minutes for complete test
**Critical Tests**: ~5 minutes
**Demo**: ~2 minutes
