# Canvas Bounds Constraint Fix

## Problem

Objects (stickers, stamps, watermarks, text) could be dragged outside the canvas boundaries, making them partially or completely invisible and difficult to recover.

## Solution

Implemented boundary clamping in the gesture system to keep all elements within canvas bounds.

### 1. Updated `useCanvasGestures` Hook (`src/hooks/useCanvasGestures.ts`)

#### Added New Props

- `elementWidth`: Width of the element being dragged
- `elementHeight`: Height of the element being dragged
- `canvasBounds`: Canvas dimensions `{ width, height }`

#### Added Clamping Function

```typescript
const clampPosition = (x: number, y: number, currentScale: number) => {
  if (!canvasBounds) return { x, y };

  // Calculate element dimensions with current scale
  const scaledWidth = elementWidth * currentScale;
  const scaledHeight = elementHeight * currentScale;

  // Keep element center within canvas
  const minX = scaledWidth / 2;
  const maxX = canvasBounds.width - scaledWidth / 2;
  const minY = scaledHeight / 2;
  const maxY = canvasBounds.height - scaledHeight / 2;

  return {
    x: Math.max(minX, Math.min(x, maxX)),
    y: Math.max(minY, Math.min(y, maxY)),
  };
};
```

#### Updated Pan Gesture

- Clamps position during drag to prevent elements from leaving canvas
- Takes into account element scale when calculating bounds

### 2. Updated Element Components

#### TextElement (`src/components/canvas/TextElement.tsx`)

- Added `canvasBounds` prop
- Estimates text dimensions based on text length and font size
- Passes dimensions and bounds to `useCanvasGestures`

#### StickerElement (`src/components/canvas/StickerElement.tsx`)

- Added `canvasBounds` prop
- Uses actual sticker width/height
- Passes dimensions and bounds to `useCanvasGestures`

#### SkiaTextElement (`src/components/canvas/SkiaTextElement.tsx`)

- Added `canvasBounds` prop
- Estimates text dimensions based on text length and font size
- Passes dimensions and bounds to `useCanvasGestures`

### 3. Updated SkiaCanvas (`src/components/SkiaCanvas.tsx`)

- Passes `canvasBounds={{ width: canvasWidth, height: canvasHeight }}` to all element components
- Canvas dimensions already available as props

## Result

- Elements cannot be dragged outside canvas boundaries
- Clamping accounts for element size and scale
- Element center stays within canvas bounds
- Works for all element types: text, stickers, stamps, and watermarks
- Smooth dragging experience with no jarring stops
