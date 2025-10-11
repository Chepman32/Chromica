# Testing Guide - Text Toolbar Features

## Quick Test Checklist

### 1. Font Selection Test

- [ ] Open app and select Text tool (T icon)
- [ ] Tap "Aa" tab in TextToolbar
- [ ] Tap each font option:
  - [ ] System font displays
  - [ ] Archivo font displays (bold)
  - [ ] Bitcount font displays (modern)
  - [ ] Fira Sans font displays (clean)
  - [ ] Homemade font displays (handwritten)
- [ ] Selected font shows visual feedback (highlighted)
- [ ] Type text and verify font applies

### 2. Color Selection Test

- [ ] Tap color wheel tab (🎨)
- [ ] Tap each color:
  - [ ] White (#FFFFFF)
  - [ ] Black (#000000)
  - [ ] Red (#FF3B30)
  - [ ] Orange (#FF9500)
  - [ ] Yellow (#FFCC00)
  - [ ] Green (#34C759)
  - [ ] Blue (#007AFF)
  - [ ] Purple (#AF52DE)
  - [ ] Pink (#FF2D55)
- [ ] Selected color shows visual feedback
- [ ] Type text and verify color applies

### 3. Text Effects Test

#### Neon Effect

- [ ] Tap "//A" tab
- [ ] Select "Neon" effect
- [ ] Type text (use bright color like cyan or yellow)
- [ ] Verify bright glowing effect visible
- [ ] Check multiple glow layers render
- [ ] Test with different font sizes

#### Glow Effect

- [ ] Select "Glow" effect
- [ ] Type text (use white or bright color)
- [ ] Verify soft glow around text
- [ ] Compare with Neon (should be softer)

#### Shadow Effect

- [ ] Select "Shadow" effect
- [ ] Type text (any color)
- [ ] Verify dark shadow below and right of text
- [ ] Check shadow has blur
- [ ] Test on light and dark backgrounds

#### Outline Effect

- [ ] Select "Outline" effect
- [ ] Type text (use bright color)
- [ ] Verify black border around text
- [ ] Test over complex background image
- [ ] Verify readability improved

#### None Effect

- [ ] Select "None" effect
- [ ] Type text
- [ ] Verify plain text with no effects

### 4. Background Test

- [ ] Tap "A in box" tab
- [ ] Select each background:
  - [ ] None (transparent)
  - [ ] Black
  - [ ] White
  - [ ] Gray
  - [ ] Red
  - [ ] Blue
- [ ] Verify background appears behind text
- [ ] Check rounded corners visible
- [ ] Verify proper padding around text

### 5. Combination Tests

#### Test 1: Neon + Black Background

- [ ] Font: Archivo
- [ ] Color: Cyan (#00E5FF)
- [ ] Effect: Neon
- [ ] Background: Black
- [ ] Expected: Authentic neon sign look

#### Test 2: Outline + No Background

- [ ] Font: Fira Sans
- [ ] Color: White
- [ ] Effect: Outline
- [ ] Background: None
- [ ] Expected: High contrast text over image

#### Test 3: Glow + White Background

- [ ] Font: Homemade
- [ ] Color: Purple
- [ ] Effect: Glow
- [ ] Background: White
- [ ] Expected: Elegant, soft appearance

#### Test 4: Shadow + Gray Background

- [ ] Font: System
- [ ] Color: Black
- [ ] Effect: Shadow
- [ ] Background: Gray
- [ ] Expected: Classic depth effect

### 6. Edit Existing Text Test

- [ ] Create text with specific styling
- [ ] Double-tap the text element
- [ ] Verify TextToolbar appears
- [ ] Verify current styling is loaded:
  - [ ] Font tab shows selected font
  - [ ] Color tab shows selected color
  - [ ] Effect tab shows selected effect
  - [ ] Background tab shows selected background
- [ ] Change font → verify update
- [ ] Change color → verify update
- [ ] Change effect → verify update
- [ ] Change background → verify update
- [ ] Edit text content → verify update

### 7. State Persistence Test

- [ ] Set font to Archivo
- [ ] Set color to Red
- [ ] Set effect to Neon
- [ ] Set background to Black
- [ ] Create first text element
- [ ] Without changing settings, create second text
- [ ] Verify second text has same styling
- [ ] Change settings
- [ ] Create third text
- [ ] Verify third text has new styling

### 8. Performance Test

- [ ] Create text with Neon effect (4 layers)
- [ ] Create text with Outline effect (9 layers)
- [ ] Create text with Glow effect (2 layers)
- [ ] Create text with Shadow effect (2 layers)
- [ ] Create 5+ text elements with different effects
- [ ] Verify smooth interaction
- [ ] Verify no lag when dragging/scaling
- [ ] Check memory usage is reasonable

### 9. Font Size Scaling Test

- [ ] Create text with Neon effect
- [ ] Use size slider to increase size
- [ ] Verify glow scales proportionally
- [ ] Decrease size
- [ ] Verify glow scales down
- [ ] Test with all effects
- [ ] Verify effects scale with font size

### 10. Edge Cases

#### Very Long Text

- [ ] Type 50+ characters
- [ ] Verify text wraps or extends properly
- [ ] Verify effects still render correctly

#### Special Characters

- [ ] Type emojis: 🎨 ✨ 💫
- [ ] Type symbols: @#$%^&\*
- [ ] Type accented characters: àéîôû
- [ ] Verify all render correctly

#### Rapid Changes

- [ ] Quickly switch between fonts
- [ ] Quickly switch between colors
- [ ] Quickly switch between effects
- [ ] Verify no crashes or glitches

#### Multiple Text Elements

- [ ] Create 10+ text elements
- [ ] Each with different styling
- [ ] Select and edit different elements
- [ ] Verify correct element is edited
- [ ] Verify styling doesn't mix between elements

### 11. UI/UX Test

- [ ] TextToolbar appears when Text tool selected
- [ ] TextToolbar hides when other tool selected
- [ ] Tab switching is smooth
- [ ] Scrolling in each tab is smooth
- [ ] Selected options are clearly highlighted
- [ ] Icons are clear and understandable
- [ ] Layout looks good on different screen sizes

### 12. Integration Test

- [ ] Create text element
- [ ] Add sticker
- [ ] Add stamp
- [ ] Apply filter
- [ ] Verify all elements work together
- [ ] Export image
- [ ] Verify text effects visible in export

## Bug Report Template

If you find issues, report using this format:

```
**Issue**: [Brief description]
**Steps to Reproduce**:
1.
2.
3.

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Device**: [iOS/Android]
**Version**: [App version]
**Screenshots**: [If applicable]
```

## Performance Benchmarks

Expected performance:

- Text creation: < 100ms
- Effect rendering: < 50ms per frame
- Font switching: < 200ms
- Color change: Instant
- Effect change: < 100ms

## Known Limitations

1. **Outline Effect**: Uses 8-direction approximation (not perfect circle)
2. **Font Loading**: May require app restart after first installation
3. **Effect Intensity**: Fixed based on font size (not adjustable)
4. **Text Shadows**: Limited by React Native capabilities

## Success Criteria

All tests pass when:

- ✅ All fonts load and display correctly
- ✅ All colors apply correctly
- ✅ All effects render as expected
- ✅ All backgrounds work properly
- ✅ Editing preserves and updates styling
- ✅ No crashes or errors
- ✅ Smooth performance
- ✅ Good user experience

## Next Steps After Testing

1. Report any bugs found
2. Suggest improvements
3. Test on different devices
4. Test with real-world use cases
5. Gather user feedback

Happy testing! 🧪
