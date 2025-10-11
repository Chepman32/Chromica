// Interactive text element on canvas

import React from 'react';
import { StyleSheet, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface TextElementProps {
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
  opacity?: number;
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

export const TextElement: React.FC<TextElementProps> = ({
  text,
  x,
  y,
  scale = 1,
  rotation = 0,
  fontSize = 24,
  fontFamily = 'System',
  color = Colors.text.primary,
  textEffect = 'none',
  textBackground = null,
  opacity = 1,
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

  // Render text with effects using multiple layers
  const renderTextWithEffect = () => {
    const baseStyle: TextStyle = {
      fontSize,
      color,
    };

    if (fontFamily && fontFamily !== 'System') {
      baseStyle.fontFamily = fontFamily;
      baseStyle.fontWeight = 'normal' as const;
    }

    switch (textEffect) {
      case 'neon':
        // Neon effect with multiple glow layers
        return (
          <>
            {/* Outer glow */}
            <Animated.Text
              style={[
                styles.text,
                styles.effectLayer,
                baseStyle,
                {
                  textShadowColor: color,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: fontSize * 0.8,
                  opacity: 0.8,
                },
              ]}
            >
              {text}
            </Animated.Text>
            {/* Middle glow */}
            <Animated.Text
              style={[
                styles.text,
                styles.effectLayer,
                baseStyle,
                {
                  textShadowColor: color,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: fontSize * 0.5,
                  opacity: 0.9,
                },
              ]}
            >
              {text}
            </Animated.Text>
            {/* Core text */}
            <Animated.Text style={[styles.text, baseStyle]}>
              {text}
            </Animated.Text>
          </>
        );

      case 'glow':
        // Soft glow effect
        return (
          <>
            <Animated.Text
              style={[
                styles.text,
                styles.effectLayer,
                baseStyle,
                {
                  textShadowColor: color,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: fontSize * 0.4,
                  opacity: 0.8,
                },
              ]}
            >
              {text}
            </Animated.Text>
            <Animated.Text style={[styles.text, baseStyle]}>
              {text}
            </Animated.Text>
          </>
        );

      case 'shadow':
        // Drop shadow effect
        return (
          <>
            <Animated.Text
              style={[
                styles.text,
                styles.effectLayer,
                baseStyle,
                {
                  color: 'rgba(0, 0, 0, 0.75)',
                  textShadowColor: 'rgba(0, 0, 0, 0.5)',
                  textShadowOffset: {
                    width: fontSize * 0.15,
                    height: fontSize * 0.15,
                  },
                  textShadowRadius: fontSize * 0.2,
                },
              ]}
            >
              {text}
            </Animated.Text>
            <Animated.Text style={[styles.text, baseStyle]}>
              {text}
            </Animated.Text>
          </>
        );

      case 'outline':
        // Outline effect using multiple shadows
        return (
          <>
            {/* Create outline with multiple text layers */}
            {[-1, 0, 1].map(dx =>
              [-1, 0, 1].map(dy => {
                if (dx === 0 && dy === 0) return null;
                return (
                  <Animated.Text
                    key={`${dx}-${dy}`}
                    style={[
                      styles.text,
                      styles.effectLayer,
                      baseStyle,
                      {
                        color: '#000000',
                        transform: [
                          { translateX: dx * 2 },
                          { translateY: dy * 2 },
                        ],
                      },
                    ]}
                  >
                    {text}
                  </Animated.Text>
                );
              }),
            )}
            <Animated.Text style={[styles.text, baseStyle]}>
              {text}
            </Animated.Text>
          </>
        );

      default:
        return (
          <Animated.Text style={[styles.text, baseStyle]}>{text}</Animated.Text>
        );
    }
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.container,
          animatedStyle,
          { opacity: Math.max(0, Math.min(opacity, 1)) },
        ]}
      >
        {textBackground && (
          <Animated.View
            style={[
              styles.textBackground,
              {
                backgroundColor: textBackground,
              },
            ]}
          />
        )}
        {renderTextWithEffect()}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBackground: {
    position: 'absolute',
    top: -4,
    left: -8,
    right: -8,
    bottom: -4,
    borderRadius: 4,
    zIndex: -1,
  },
  text: {
    ...Typography.body.regular,
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  effectLayer: {
    position: 'absolute',
  },
});
