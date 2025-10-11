// Skia-based text element with advanced effects

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  Canvas,
  Group,
  Text as SkText,
  BlurMask,
  useFont,
} from '@shopify/react-native-skia';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';

interface SkiaTextElementProps {
  id: string;
  text: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textEffect?: 'none' | 'neon' | 'glow' | 'shadow' | 'outline';
  textBackground?: string | null;
  isSelected: boolean;
  canvasBounds?: { width: number; height: number };
  onSelect: () => void;
  onUpdate: (transform: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }) => void;
  onEdit?: () => void;
}

export const SkiaTextElement: React.FC<SkiaTextElementProps> = ({
  text,
  x,
  y,
  scale = 1,
  rotation = 0,
  fontSize = 24,
  fontFamily = 'System',
  color = '#FFFFFF',
  textEffect = 'none',
  textBackground = null,
  isSelected,
  canvasBounds,
  onSelect,
  onUpdate,
  onEdit,
}) => {
  // Estimate text dimensions (rough approximation)
  const estimatedWidth = text.length * fontSize * 0.6;
  const estimatedHeight = fontSize * 1.2;

  const { gesture, animatedStyle } = useCanvasGestures({
    initialX: x,
    initialY: y,
    initialScale: scale,
    initialRotation: rotation,
    elementWidth: estimatedWidth,
    elementHeight: estimatedHeight,
    canvasBounds,
    onUpdate,
    onSelect,
    onEdit,
  });

  // Load font - try custom font first, fallback to null for system font
  const customFont = useFont(
    require(`../../assets/fonts/${getFontPath(fontFamily)}`),
    fontSize,
  );

  const font = customFont;

  // Calculate text dimensions for canvas size
  const textWidth = font
    ? font.measureText(text).width
    : text.length * fontSize * 0.6;
  const canvasWidth = textWidth + 100; // Extra space for effects
  const canvasHeight = fontSize * 3; // Extra space for effects
  const baselineY = canvasHeight / 2 + fontSize / 3;
  const textX = canvasWidth / 2 - textWidth / 2;

  // Render text with effects
  const renderTextWithEffect = () => {
    if (!font) return null;

    switch (textEffect) {
      case 'neon':
        return (
          <Group>
            {/* Outer glow: largest blur */}
            <Group>
              <BlurMask blur={fontSize * 0.8} style="outer" />
              <SkText
                text={text}
                x={textX}
                y={baselineY}
                font={font}
                color={color}
              />
            </Group>

            {/* Middle glow: medium blur */}
            <Group>
              <BlurMask blur={fontSize * 0.5} style="outer" />
              <SkText
                text={text}
                x={textX}
                y={baselineY}
                font={font}
                color={color}
              />
            </Group>

            {/* Inner glow: small blur */}
            <Group>
              <BlurMask blur={fontSize * 0.25} style="outer" />
              <SkText
                text={text}
                x={textX}
                y={baselineY}
                font={font}
                color={color}
              />
            </Group>

            {/* Core text */}
            <SkText
              text={text}
              x={textX}
              y={baselineY}
              font={font}
              color={color}
            />
          </Group>
        );

      case 'glow':
        return (
          <Group>
            {/* Glow layer */}
            <Group>
              <BlurMask blur={fontSize * 0.4} style="outer" />
              <SkText
                text={text}
                x={textX}
                y={baselineY}
                font={font}
                color={color}
              />
            </Group>

            {/* Core text */}
            <SkText
              text={text}
              x={textX}
              y={baselineY}
              font={font}
              color={color}
            />
          </Group>
        );

      case 'shadow':
        return (
          <Group>
            {/* Shadow layer */}
            <Group>
              <BlurMask blur={fontSize * 0.2} style="normal" />
              <SkText
                text={text}
                x={textX + fontSize * 0.15}
                y={baselineY + fontSize * 0.15}
                font={font}
                color="rgba(0, 0, 0, 0.75)"
              />
            </Group>

            {/* Main text */}
            <SkText
              text={text}
              x={textX}
              y={baselineY}
              font={font}
              color={color}
            />
          </Group>
        );

      case 'outline':
        return (
          <Group>
            {/* Outline layers - multiple shadows to create outline effect */}
            {[-1, 1].map(dx =>
              [-1, 1].map(dy => (
                <SkText
                  key={`${dx}-${dy}`}
                  text={text}
                  x={textX + dx * 2}
                  y={baselineY + dy * 2}
                  font={font}
                  color="#000000"
                />
              )),
            )}

            {/* Main text */}
            <SkText
              text={text}
              x={textX}
              y={baselineY}
              font={font}
              color={color}
            />
          </Group>
        );

      default:
        return (
          <SkText
            text={text}
            x={textX}
            y={baselineY}
            font={font}
            color={color}
          />
        );
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {textBackground && (
          <View
            style={[
              styles.textBackground,
              {
                backgroundColor: textBackground,
                width: textWidth + 16,
                height: fontSize * 1.5,
              },
            ]}
          />
        )}
        <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
          {renderTextWithEffect()}
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
};

// Helper function to get font file path
function getFontPath(fontFamily: string): string {
  switch (fontFamily) {
    case 'ArchivoBlack-Regular':
      return 'Archivo_Black/ArchivoBlack-Regular.ttf';
    case 'BitcountInk':
      return 'Bitcount_Ink/BitcountInk-VariableFont_CRSV,ELSH,ELXP,SZP1,SZP2,XPN1,XPN2,YPN1,YPN2,slnt,wght.ttf';
    case 'FiraSans-Regular':
      return 'Fira_Sans/FiraSans-Regular.ttf';
    case 'HomemadeApple-Regular':
      return 'Homemade_Apple/HomemadeApple-Regular.ttf';
    default:
      return 'Fira_Sans/FiraSans-Regular.ttf'; // Fallback
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBackground: {
    position: 'absolute',
    borderRadius: 4,
    zIndex: -1,
  },
});
