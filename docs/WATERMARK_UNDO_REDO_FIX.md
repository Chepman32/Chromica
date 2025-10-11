# Watermark Undo/Redo Fix

## Problem 1: Batch Watermark Addition

Undo/redo wasn't working properly for watermarks. When applying a watermark preset (which creates multiple watermark elements), each watermark was added individually to the history. This meant users had to press undo multiple times to remove all watermarks from a preset application.

### Root Cause

The `handleApplyWatermarkPreset` function in `EditorScreen.tsx` was calling `addElement()` in a loop:

```typescript
watermarkElements.forEach(element => {
  addElement(element);
});
```

This created separate history entries for each watermark, making undo/redo tedious.

### Solution

Implemented batch operations for the editor store:

#### 1. Updated EditorHistory Type (`src/types/index.ts`)

- Added `'batchAdd'` action type
- Added `elements?: SerializedElement[]` field for batch operations

#### 2. Added `addElements` Method (`src/stores/editorStore.ts`)

- New method that adds multiple elements as a single history entry
- Creates one `batchAdd` history action containing all elements
- Allows undoing/redoing all watermarks from a preset in one operation

#### 3. Updated History Handlers (`src/stores/editorStore.ts`)

- `applyReverseAction`: Handles undoing batch additions by removing all elements at once
- `applyAction`: Handles redoing batch additions by adding all elements back at once

#### 4. Updated Watermark Application (`src/screens/EditorScreen.tsx`)

- Changed from `watermarkElements.forEach(element => addElement(element))`
- To `addElements(watermarkElements)`
- Now applies all watermarks as a single undoable action

## Problem 2: Size Slider Creating Too Many History Entries

When resizing a watermark using the size slider, undo didn't work properly because every frame of the drag gesture created a separate history entry.

### Root Cause

The `SizeSlider` component was calling `onValueChange` during every frame of the pan gesture, and `handleSizeChange` was calling `updateElement` which creates a history entry each time.

### Solution

Implemented a two-phase update pattern (similar to canvas gestures):

#### 1. Added `updateElementWithoutHistory` Method (`src/stores/editorStore.ts`)

- Updates element state without creating history entries
- Used for live preview during gestures

#### 2. Updated SizeSlider (`src/components/SizeSlider.tsx`)

- Added `onChangeEnd` callback prop
- `onValueChange` called during drag for live preview
- `onChangeEnd` called only when gesture ends

#### 3. Updated Size Change Handlers (`src/screens/EditorScreen.tsx`)

- `handleSizeChange`: Uses `updateElementWithoutHistory` for live preview
- `handleSizeChangeEnd`: Creates a single history entry with correct old/new states
- Tracks initial scale in a ref to ensure proper history entry

## Result

- Applying a watermark preset creates a single history entry
- One undo removes all watermarks from that preset application
- One redo restores all watermarks from that preset application
- Resizing a watermark creates only one history entry (when drag ends)
- Undo properly restores the original size before the drag started
- Maintains proper history tracking for all operations
