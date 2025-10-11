# Phase 2: Connect Effects to Canvas - Next Steps

## Current Status

✅ App launches successfully  
✅ Splash screen works  
✅ Gallery loads photos  
✅ Editor displays images  
✅ Effects can be selected  
❌ Effects don't render yet (shaders not connected)

## Why Effects Don't Work Yet

The effects are defined and the UI is ready, but the shader rendering pipeline needs to be completed. Here's what's needed:

### 1. Shader Rendering Pipeline

The current code has the structure but needs proper implementation:

```typescript
// Current (incomplete):
<SkiaImage image={image}>
  <Shader source={Skia.RuntimeEffect.Make(shaderSource)} />
</SkiaImage>

// What's needed:
// 1. Load shader source from ShaderManager
// 2. Compile RuntimeEffect with proper uniforms
// 3. Pass parameters to shader
// 4. Apply to image
```

### 2. Quick Win: Add Visual Feedback

To show that effects are working, add a simple visual indicator:

```typescript
// In EffectsEditorScreen.tsx, update the canvas:
<SkiaImage
  image={image}
  fit="contain"
  x={0}
  y={0}
  width={SCREEN_WIDTH}
  height={SCREEN_HEIGHT * 0.5}
  opacity={selectedEffectId ? 0.8 : 1.0} // Dim when effect selected
/>;

// Add text overlay
{
  selectedEffectId && (
    <Text
      x={20}
      y={40}
      text={`Effect: ${currentEffect?.name}`}
      color="white"
      fontSize={20}
    />
  );
}
```

### 3. Implement Simple Effect First

Start with the simplest effect - just changing opacity or color:

```typescript
// Add to EffectsEditorScreen:
import { ColorMatrix } from '@shopify/react-native-skia';

// In canvas:
<SkiaImage image={image} fit="contain" x={0} y={0} width={W} height={H}>
  {selectedEffectId === 'grayscale' && (
    <ColorMatrix
      matrix={[
        0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0,
        0, 0, 0, 1, 0,
      ]}
    />
  )}
</SkiaImage>;
```

### 4. Full Shader Implementation

For custom shaders like Pixelate, you need:

```typescript
// 1. Get shader source
const shaderSource = ShaderManager.loadShader('cellular/pixelate.sksl');

// 2. Create runtime effect
const runtimeEffect = Skia.RuntimeEffect.Make(shaderSource);

// 3. Create shader with uniforms
const shader = runtimeEffect.makeShader([
  SCREEN_WIDTH,  // resolution.x
  SCREEN_HEIGHT, // resolution.y
  currentParams.cellSize || 10, // cellSize parameter
]);

// 4. Apply to image
<SkiaImage image={image} ...>
  <Paint>
    <Shader source={shader} />
  </Paint>
</SkiaImage>
```

## Recommended Approach

### Step 1: Add Visual Feedback (5 minutes)

Show that effects are being selected:

```typescript
// Add after the image in Canvas:
{
  selectedEffectId && (
    <Group>
      <Rect
        x={10}
        y={10}
        width={200}
        height={40}
        color="rgba(0,0,0,0.7)"
        rx={8}
      />
      <Text
        x={20}
        y={35}
        text={`Active: ${currentEffect?.name || 'None'}`}
        color="white"
        fontSize={16}
      />
    </Group>
  );
}
```

### Step 2: Add Built-in Filters (15 minutes)

Use Skia's built-in filters that don't require custom shaders:

```typescript
import { Blur, ColorMatrix, Saturate } from '@shopify/react-native-skia';

// Map effect IDs to built-in filters:
const renderEffect = () => {
  switch (selectedEffectId) {
    case 'blur':
      return <Blur blur={10} />;
    case 'grayscale':
      return <ColorMatrix matrix={grayscaleMatrix} />;
    case 'saturate':
      return <Saturate amount={2} />;
    default:
      return null;
  }
};

// In canvas:
<SkiaImage image={image} ...>
  {renderEffect()}
</SkiaImage>
```

### Step 3: Implement Custom Shaders (1-2 hours)

Follow the IMPLEMENTATION_GUIDE.md Phase 2 instructions to:

1. Fix ShaderManager to return shader source strings
2. Create proper uniform builders
3. Test each shader individually
4. Add parameter controls

## Quick Test

To verify the system is working, add this temporary code:

```typescript
// In EffectsEditorScreen, add:
const testShader = Skia.RuntimeEffect.Make(`
  uniform shader image;
  uniform float2 resolution;

  half4 main(float2 coord) {
    half4 color = image.eval(coord);
    // Invert colors as a test
    return half4(1.0 - color.r, 1.0 - color.g, 1.0 - color.b, color.a);
  }
`);

// In canvas:
{selectedEffectId && testShader && (
  <SkiaImage image={image} ...>
    <Paint>
      <Shader source={testShader.makeShader([SCREEN_WIDTH, SCREEN_HEIGHT])} />
    </Paint>
  </SkiaImage>
)}
```

If this inverts the colors, your shader pipeline is working!

## Files to Modify

1. `src/screens/EffectsEditorScreen.tsx` - Add effect rendering
2. `src/domain/shader-manager/ShaderManager.ts` - Fix shader loading
3. `src/domain/effects/registry.ts` - Add built-in filter effects

## Resources

- [Skia Shaders Documentation](https://shopify.github.io/react-native-skia/docs/shaders/overview)
- [Runtime Effects](https://shopify.github.io/react-native-skia/docs/shaders/runtime-effects)
- [Image Filters](https://shopify.github.io/react-native-skia/docs/image-filters/overview)

---

**Current Priority**: Add visual feedback to show effects are being selected, then implement built-in filters before tackling custom shaders.
