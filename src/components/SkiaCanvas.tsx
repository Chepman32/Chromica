// Main interactive canvas component using Skia for high-performance rendering

import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import {
  Canvas,
  Image as SkiaImage,
  useImage,
  ColorMatrix,
} from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useEditorStore } from '../stores/editorStore';
import { TextElement } from './canvas/TextElement';
import { StickerElement } from './canvas/StickerElement';
import { Colors } from '../constants/colors';
import { getFilterColorMatrix } from '../utils/colorMatrix';

const { width: screenWidth } = Dimensions.get('window');

// Fallback overlay styles for photo URIs (ph://) that don't support Skia
const getImageOverlayStyle = (filter: any) => {
  switch (filter.type) {
    case 'bw':
      return {
        backgroundColor: `rgba(128, 128, 128, 0.9)`,
        mixBlendMode: 'color' as any,
      };
    case 'sepia':
      return {
        backgroundColor: `rgba(196, 154, 108, 0.8)`,
        mixBlendMode: 'color' as any,
      };
    case 'vintage':
      return {
        backgroundColor: `rgba(180, 140, 90, 0.85)`,
        mixBlendMode: 'color' as any,
      };
    case 'cool':
      return {
        backgroundColor: `rgba(100, 180, 255, 0.5)`,
        mixBlendMode: 'multiply' as any,
      };
    case 'warm':
      return {
        backgroundColor: `rgba(255, 179, 71, 0.35)`,
        mixBlendMode: 'multiply' as any,
      };
    case 'juno':
      return {
        backgroundColor: `rgba(255, 107, 157, 0.25)`,
        mixBlendMode: 'screen' as any,
      };
    case 'gingham':
      return {
        backgroundColor: `rgba(180, 231, 206, 0.3)`,
        mixBlendMode: 'lighten' as any,
      };
    case 'clarendon':
      return {
        backgroundColor: `rgba(255, 215, 0, 0.2)`,
        mixBlendMode: 'overlay' as any,
      };
    case 'lark':
      return {
        backgroundColor: `rgba(168, 216, 234, 0.3)`,
        mixBlendMode: 'lighten' as any,
      };
    case 'ludwig':
      return {
        backgroundColor: `rgba(255, 160, 122, 0.3)`,
        mixBlendMode: 'multiply' as any,
      };
    case 'xproii':
      return {
        backgroundColor: `rgba(139, 69, 19, 0.4)`,
        mixBlendMode: 'overlay' as any,
      };
    case 'lofi':
      return {
        backgroundColor: `rgba(105, 105, 105, 0.3)`,
        mixBlendMode: 'overlay' as any,
      };
    case 'mayfair':
      return {
        backgroundColor: `rgba(255, 182, 193, 0.3)`,
        mixBlendMode: 'screen' as any,
      };
    case 'sierra':
      return {
        backgroundColor: `rgba(221, 161, 94, 0.25)`,
        mixBlendMode: 'multiply' as any,
      };
    case 'tattoo':
      return {
        backgroundColor: `rgba(74, 74, 74, 0.3)`,
        mixBlendMode: 'overlay' as any,
      };
    case 'inkwell':
      return {
        backgroundColor: `rgba(0, 0, 0, 0.9)`,
        mixBlendMode: 'color' as any,
      };
    case 'rise':
      return {
        backgroundColor: `rgba(255, 228, 181, 0.3)`,
        mixBlendMode: 'screen' as any,
      };
    default:
      return {};
  }
};

interface SkiaCanvasProps {
  sourceImageUri: string;
  canvasWidth: number;
  canvasHeight: number;
  onTextEdit?: (elementId: string, currentText: string) => void;
  onCanvasBackgroundTap?: () => void;
}

export const SkiaCanvas: React.FC<SkiaCanvasProps> = ({
  sourceImageUri,
  canvasWidth,
  canvasHeight,
  onTextEdit,
  onCanvasBackgroundTap,
}) => {
  const {
    canvasElements,
    selectedElementIds,
    appliedFilter,
    selectElement,
    updateElement,
    deselectElement,
  } = useEditorStore();
  const selectedIds = useMemo(
    () => new Set(selectedElementIds),
    [selectedElementIds],
  );

  // Load source image for Skia rendering
  const sourceImage = useImage(sourceImageUri);

  // Handle tap outside to deselect
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(deselectElement)();
    if (onCanvasBackgroundTap) {
      runOnJS(onCanvasBackgroundTap)();
    }
  });

  const handleElementSelect = useCallback(
    (elementId: string) => {
      selectElement(elementId);

      if (onCanvasBackgroundTap) {
        const element = canvasElements.find(el => el.id === elementId);
        if (!element || element.type !== 'text') {
          onCanvasBackgroundTap();
        }
      }
    },
    [selectElement, onCanvasBackgroundTap, canvasElements],
  );

  const handleElementUpdate = useCallback(
    (
      elementId: string,
      transform: { x: number; y: number; scale: number; rotation: number },
    ) => {
      updateElement(elementId, {
        position: { x: transform.x, y: transform.y },
        scale: transform.scale,
        rotation: transform.rotation,
      });
    },
    [updateElement],
  );

  // Get color matrix for current filter
  const colorMatrix = appliedFilter
    ? getFilterColorMatrix(appliedFilter)
    : null;

  return (
    <View
      style={[styles.container, { width: canvasWidth, height: canvasHeight }]}
    >
      {/* Background image layer with filter effects */}
      {sourceImageUri.startsWith('ph://') ? (
        <View
          style={{
            position: 'relative',
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          {/* Base image */}
          <Image
            source={{ uri: sourceImageUri }}
            style={[
              styles.backgroundImage,
              { width: canvasWidth, height: canvasHeight },
            ]}
            resizeMode="contain"
          />

          {/* Filter overlay for photo URIs */}
          {appliedFilter && appliedFilter.type !== 'none' && (
            <View
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: canvasWidth,
                  height: canvasHeight,
                  zIndex: 1,
                },
                getImageOverlayStyle(appliedFilter),
              ]}
            />
          )}
        </View>
      ) : (
        <View
          style={{
            position: 'relative',
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          <Canvas
            style={[
              styles.skiaCanvas,
              { width: canvasWidth, height: canvasHeight },
            ]}
          >
            {sourceImage && (
              <SkiaImage
                image={sourceImage}
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fit="contain"
              >
                {colorMatrix && <ColorMatrix matrix={colorMatrix} />}
              </SkiaImage>
            )}
          </Canvas>
        </View>
      )}

      {/* Interactive overlay for canvas elements */}
      <GestureDetector gesture={tapGesture}>
        <View style={styles.overlay}>
          {canvasElements.map(element => {
            if (element.type === 'text') {
              return (
                <TextElement
                  key={element.id}
                  id={element.id}
                  text={element.textContent || 'Text'}
                  x={element.position.x}
                  y={element.position.y}
                  scale={element.scale}
                  rotation={element.rotation}
                  fontSize={element.fontSize}
                  fontFamily={element.fontFamily}
                  color={element.color}
                  textEffect={element.textEffect}
                  textBackground={element.textBackground}
                  opacity={element.opacity}
                  isSelected={selectedIds.has(element.id)}
                  canvasBounds={{ width: canvasWidth, height: canvasHeight }}
                  onSelect={() => handleElementSelect(element.id)}
                  onUpdate={transform =>
                    handleElementUpdate(element.id, transform)
                  }
                  onEdit={() =>
                    onTextEdit?.(element.id, element.textContent || '')
                  }
                />
              );
            }

            if (element.type === 'sticker') {
              return (
                <StickerElement
                  key={element.id}
                  id={element.id}
                  uri={element.assetPath || ''}
                  x={element.position.x}
                  y={element.position.y}
                  scale={element.scale}
                  rotation={element.rotation}
                  width={element.width}
                  height={element.height}
                  opacity={element.opacity}
                  isSelected={selectedIds.has(element.id)}
                  canvasBounds={{ width: canvasWidth, height: canvasHeight }}
                  onSelect={() => handleElementSelect(element.id)}
                  onUpdate={transform =>
                    handleElementUpdate(element.id, transform)
                  }
                />
              );
            }

            // Handle other element types (watermark, stamp)
            if (element.type === 'watermark' || element.type === 'stamp') {
              return (
                <StickerElement
                  key={element.id}
                  id={element.id}
                  uri={element.assetPath || ''}
                  x={element.position.x}
                  y={element.position.y}
                  scale={element.scale}
                  rotation={element.rotation}
                  width={element.width}
                  height={element.height}
                  opacity={element.opacity}
                  isSelected={selectedIds.has(element.id)}
                  onSelect={() => handleElementSelect(element.id)}
                  onUpdate={transform =>
                    handleElementUpdate(element.id, transform)
                  }
                />
              );
            }

            return null;
          })}
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  skiaCanvas: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10, // Above everything to ensure visibility
  },
});
