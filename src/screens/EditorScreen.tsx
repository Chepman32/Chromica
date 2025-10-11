// Editor screen - Main canvas for photo annotation

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  FlatList,
  Keyboard,
} from 'react-native';

// Toolbar icons are loaded directly with require() in the render calls
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEditorStore } from '../stores/editorStore';
import { SkiaCanvas } from '../components/SkiaCanvas';

import { StickerPickerModal } from '../components/modals/StickerPickerModal';
import { StampsPickerModal } from '../components/modals/StampsPickerModal';
import { ExportModal } from '../components/modals/ExportModal';
import { WatermarkToolModal } from '../components/modals/WatermarkToolModal';
import { LayersModal } from '../components/modals/LayersModal';

import { SizeSlider } from '../components/SizeSlider';
import { createStickerElement } from '../utils/canvasElements';
import { rasterizeTextElementToWatermark } from '../utils/textRasterizer';
import { WatermarkManager } from '../utils/watermarkManager';
import { WatermarkPreset } from '../types/watermark';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface EditorRouteParams {
  projectId?: string;
  imageUri?: string;
  imageDimensions?: { width: number; height: number };
}

type TextStylingOverrides = {
  fontFamily?: string;
  color?: string;
  textEffect?: 'none' | 'neon' | 'glow' | 'shadow' | 'outline';
  textBackground?: string | null;
};

// Filters data
const FILTERS = [
  {
    id: 'none',
    name: 'Original',
    icon: require('../assets/icons/filters/original.png'),
    color: '#666666',
  },
  {
    id: 'bw',
    name: 'B&W',
    icon: require('../assets/icons/filters/bw.png'),
    color: '#888888',
  },
  {
    id: 'sepia',
    name: 'Sepia',
    icon: require('../assets/icons/filters/sepia.png'),
    color: '#D2B48C',
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: require('../assets/icons/filters/vintage.png'),
    color: '#F4A460',
  },
  {
    id: 'cool',
    name: 'Cool',
    icon: require('../assets/icons/filters/cool.png'),
    color: '#87CEEB',
  },
  {
    id: 'warm',
    name: 'Warm',
    icon: require('../assets/icons/filters/warm.png'),
    color: '#FFB347',
  },
  {
    id: 'juno',
    name: 'Juno',
    icon: require('../assets/icons/filters/original.png'),
    color: '#FF6B9D',
  },
  {
    id: 'gingham',
    name: 'Gingham',
    icon: require('../assets/icons/filters/original.png'),
    color: '#B4E7CE',
  },
  {
    id: 'clarendon',
    name: 'Clarendon',
    icon: require('../assets/icons/filters/original.png'),
    color: '#FFD700',
  },
  {
    id: 'lark',
    name: 'Lark',
    icon: require('../assets/icons/filters/original.png'),
    color: '#A8D8EA',
  },
  {
    id: 'ludwig',
    name: 'Ludwig',
    icon: require('../assets/icons/filters/original.png'),
    color: '#FFA07A',
  },
  {
    id: 'xproii',
    name: 'X-Pro II',
    icon: require('../assets/icons/filters/original.png'),
    color: '#8B4513',
  },
  {
    id: 'lofi',
    name: 'Lo-Fi',
    icon: require('../assets/icons/filters/original.png'),
    color: '#696969',
  },
  {
    id: 'mayfair',
    name: 'Mayfair',
    icon: require('../assets/icons/filters/original.png'),
    color: '#FFB6C1',
  },
  {
    id: 'sierra',
    name: 'Sierra',
    icon: require('../assets/icons/filters/original.png'),
    color: '#DDA15E',
  },
  {
    id: 'tattoo',
    name: 'Tattoo',
    icon: require('../assets/icons/filters/original.png'),
    color: '#4A4A4A',
  },
  {
    id: 'inkwell',
    name: 'Inkwell',
    icon: require('../assets/icons/filters/bw.png'),
    color: '#000000',
  },
  {
    id: 'rise',
    name: 'Rise',
    icon: require('../assets/icons/filters/original.png'),
    color: '#FFE4B5',
  },
];

const selectAllIcon = require('../assets/icons/select all - light theme.png');

type FilterOption = (typeof FILTERS)[number];

const EditorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as EditorRouteParams;

  const {
    canvasElements,
    selectedElementId,
    selectedElementIds,
    sourceImagePath,
    sourceImageDimensions,
    appliedFilter, // Used in SkiaCanvas via store and filter toolbar
    canUndo,
    canRedo,
    undo,
    redo,
    loadProject,
    initializeProject,
    saveProject,
    addElement,
    addElements,
    updateElement,
    updateElementWithoutHistory,
    deleteElement,
    selectElement,
    selectAllElements,
    applyFilter,
    removeFilter,
  } = useEditorStore();

  const [activeToolbar, setActiveToolbar] = useState<
    'watermark' | 'sticker' | 'stamps' | 'filter' | 'layers' | null
  >(null);
  const hasSelection = selectedElementIds.length > 0;
  const hasSingleSelection = selectedElementIds.length === 1;
  const isAllSelected =
    hasSelection && selectedElementIds.length === canvasElements.length;
  const singleSelectedElementId = hasSingleSelection
    ? selectedElementIds[0]
    : null;
  const sliderVisible = hasSingleSelection || isAllSelected;

  // Animated values for toolbar
  const activeToolIndex = useSharedValue(-1); // No tool selected by default
  const filterToolbarHeight = useSharedValue(48); // Default toolbar height
  const filterListOpacity = useSharedValue(0); // Filter list opacity
  const [showCanvasTextInput, setShowCanvasTextInput] = useState(false);
  const [stickerModalVisible, setStickerModalVisible] = useState(false);
  const [stampsModalVisible, setStampsModalVisible] = useState(false);
  const [watermarkModalVisible, setWatermarkModalVisible] = useState(false);
  const [layersModalVisible, setLayersModalVisible] = useState(false);

  const [exportModalVisible, setExportModalVisible] = useState(false);

  useEffect(() => {
    console.log('EditorScreen received params:', params);

    if (params?.projectId) {
      // Load existing project
      console.log('Loading existing project:', params.projectId);
      loadProject(params.projectId);
    } else if (params?.imageUri && params?.imageDimensions) {
      // Initialize new project
      console.log('Initializing new project with image:', params.imageUri);
      initializeProject(params.imageUri, params.imageDimensions);
    } else {
      console.log('No valid params received');
    }
  }, [initializeProject, loadProject, params]);

  const handleBack = async () => {
    // Check if there are unsaved changes
    if (canvasElements.length > 0) {
      Alert.alert(
        'Save Changes?',
        'You have unsaved changes. Do you want to save this project before leaving?',
        [
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Save',
            onPress: async () => {
              await saveProject(canvasSize);
              navigation.goBack();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  const handleExport = () => {
    setExportModalVisible(true);
  };

  const handleDeleteElement = () => {
    if (!hasSelection) {
      return;
    }

    const idsToDelete =
      selectedElementIds.length > 0
        ? [...selectedElementIds]
        : selectedElementId
        ? [selectedElementId]
        : [];

    idsToDelete.forEach(id => {
      deleteElement(id);
    });
  };

  const handleSelectAll = () => {
    if (canvasElements.length === 0) {
      return;
    }
    selectAllElements();
  };

  const handleToolSelect = (tool: typeof activeToolbar) => {
    if (tool === 'filter' && activeToolbar === 'filter') {
      closeFilterToolbar();
      return;
    }

    setActiveToolbar(tool);

    // Update animated indicator position
    const toolIndex = tool
      ? ['watermark', 'sticker', 'stamps', 'filter', 'layers'].indexOf(tool)
      : -1;
    activeToolIndex.value = withSpring(toolIndex, {
      damping: 15.0,
      stiffness: 150.0,
    });

    // Animate filter toolbar height and opacity
    if (tool === 'filter') {
      filterToolbarHeight.value = withSpring(120, {
        damping: 20.0,
        stiffness: 180.0,
      });
      filterListOpacity.value = withSpring(1, {
        damping: 20.0,
        stiffness: 180.0,
      });
    } else {
      filterToolbarHeight.value = withSpring(48, {
        damping: 20.0,
        stiffness: 180.0,
      });
      filterListOpacity.value = withSpring(0, {
        damping: 20.0,
        stiffness: 180.0,
      });
    }

    // Add element to canvas based on tool type
    switch (tool) {
      case 'watermark':
        setWatermarkModalVisible(true);
        break;
      case 'sticker':
        setStickerModalVisible(true);
        break;
      case 'stamps':
        setStampsModalVisible(true);
        break;
      case 'filter':
        // Filter tool shows horizontal scrolling toolbar - no modal needed
        break;
      case 'layers':
        setLayersModalVisible(true);
        break;
    }
  };

  function closeFilterToolbar() {
    setActiveToolbar(null);
    activeToolIndex.value = withSpring(-1, {
      damping: 15.0,
      stiffness: 150.0,
    });
    filterToolbarHeight.value = withSpring(48, {
      damping: 20.0,
      stiffness: 180.0,
    });
    filterListOpacity.value = withSpring(0, {
      damping: 20.0,
      stiffness: 180.0,
    });
  }

  const [canvasTextValue, setCanvasTextValue] = useState('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const submissionRef = useRef(false);
  const textInputRef = useRef<TextInput>(null);
  const keepKeyboardAliveRef = useRef(false);

  const selectedElement = singleSelectedElementId
    ? canvasElements.find(el => el.id === singleSelectedElementId)
    : undefined;
  const selectedTextElementId =
    selectedElement && selectedElement.type === 'text'
      ? selectedElement.id
      : null;

  // Text styling state
  const [textFont, setTextFont] = useState('System');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textEffect, setTextEffect] = useState<
    'none' | 'neon' | 'glow' | 'shadow' | 'outline'
  >('none');
  const [textBackground, setTextBackground] = useState<string | null>(null);

  // Update text element in real-time as user types
  const updateLiveText = useCallback(
    (text: string) => {
      if (editingTextId) {
        updateElement(editingTextId, {
          textContent: text || ' ', // Use space if empty to keep element visible
        });
      }
    },
    [editingTextId, updateElement],
  );

  // Update text styling in real-time
  const updateLiveTextStyling = useCallback(
    (overrides: TextStylingOverrides = {}) => {
      const targetId = editingTextId ?? selectedTextElementId;
      if (!targetId) {
        return;
      }

      const nextBackground = Object.prototype.hasOwnProperty.call(
        overrides,
        'textBackground',
      )
        ? overrides.textBackground ?? null
        : textBackground;

      updateElement(targetId, {
        fontFamily: overrides.fontFamily ?? textFont,
        color: overrides.color ?? textColor,
        textEffect: overrides.textEffect ?? textEffect,
        textBackground: nextBackground,
      });
    },
    [
      editingTextId,
      selectedTextElementId,
      textFont,
      textColor,
      textEffect,
      textBackground,
      updateElement,
    ],
  );

  // Update text in real-time when value changes
  useEffect(() => {
    if (showCanvasTextInput && editingTextId) {
      updateLiveText(canvasTextValue);
    }
  }, [canvasTextValue, showCanvasTextInput, editingTextId, updateLiveText]);

  // Keep keyboard open when text input is active
  useEffect(() => {
    if (showCanvasTextInput) {
      keepKeyboardAliveRef.current = true;

      // Ensure TextInput is focused
      const focusTimeout = setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);

      // Prevent keyboard from dismissing unless explicitly finalized
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          if (keepKeyboardAliveRef.current && textInputRef.current) {
            console.log('Keyboard closed, refocusing...');
            setTimeout(() => {
              textInputRef.current?.focus();
            }, 50);
          }
        },
      );

      return () => {
        keepKeyboardAliveRef.current = false;
        clearTimeout(focusTimeout);
        keyboardDidHideListener.remove();
      };
    }

    keepKeyboardAliveRef.current = false;
  }, [showCanvasTextInput]);

  const handleCanvasTextSubmit = () => {
    if (submissionRef.current) {
      return; // Prevent double submission
    }

    submissionRef.current = true;
    keepKeyboardAliveRef.current = false;
    Keyboard.dismiss();

    if (editingTextId) {
      if (!canvasTextValue.trim()) {
        // Delete element if text is empty
        deleteElement(editingTextId);
      }
      // Text element already exists and is updated, just finalize
      console.log('Finalizing text with styling:', {
        font: textFont,
        color: textColor,
        effect: textEffect,
        background: textBackground,
      });
    }

    // Clear text editing state
    setCanvasTextValue('');
    setShowCanvasTextInput(false);
    setEditingTextId(null);

    // Deactivate text tool after editing
    setActiveToolbar(null);
    activeToolIndex.value = withSpring(-1, {
      damping: 15.0,
      stiffness: 150.0,
    });

    // Reset flag after component updates
    setTimeout(() => {
      submissionRef.current = false;
    }, 50);
  };

  const handleCanvasBackgroundTap = () => {
    if (showCanvasTextInput) {
      handleCanvasTextSubmit();
    } else {
      Keyboard.dismiss();
    }

    if (activeToolbar === 'filter') {
      closeFilterToolbar();
    }
  };

  const handleTextElementEdit = (elementId: string, currentText: string) => {
    console.log('handleTextElementEdit called:', elementId, currentText);

    // Set the text tool as active when editing existing text
    setActiveToolbar('text');
    activeToolIndex.value = withSpring(1, {
      // Text tool is at index 1
      damping: 15.0,
      stiffness: 150.0,
    });

    // Load existing text element properties
    const element = canvasElements.find(el => el.id === elementId);
    if (element && element.type === 'text') {
      setTextFont(element.fontFamily || 'System');
      setTextColor(element.color || '#FFFFFF');
      setTextEffect(element.textEffect || 'none');
      setTextBackground(element.textBackground || null);
    }

    // Set up editing state - element already exists, just edit it
    setEditingTextId(elementId);
    setCanvasTextValue(currentText);
    setShowCanvasTextInput(true);
    keepKeyboardAliveRef.current = true;
  };

  const handleAddSticker = (
    source: string | any,
    width: number,
    height: number,
  ) => {
    const canvasSize = calculateCanvasSize();

    // Handle both URI strings and require() results
    let stickerUri: string;
    if (typeof source === 'string') {
      stickerUri = source;
    } else {
      // Convert require object to URI string
      const resolvedAsset = Image.resolveAssetSource(source);
      stickerUri = resolvedAsset.uri;
    }

    const element = createStickerElement(
      stickerUri,
      canvasSize.width / 2 - width / 2,
      canvasSize.height / 2 - height / 2,
      width,
      height,
    );
    addElement(element);
  };

  const handleAddStamp = (stampRequire: any) => {
    const canvasSize = calculateCanvasSize();
    // Default stamp size
    const stampSize = 80;

    // Convert require object to URI string
    const resolvedAsset = Image.resolveAssetSource(stampRequire);
    const stampUri = resolvedAsset.uri;

    const element = createStickerElement(
      stampUri,
      canvasSize.width / 2 - stampSize / 2,
      canvasSize.height / 2 - stampSize / 2,
      stampSize,
      stampSize,
    );
    addElement(element);

    // Deactivate stamps tool after adding
    setActiveToolbar(null);
    activeToolIndex.value = withSpring(-1, {
      damping: 15.0,
      stiffness: 150.0,
    });
  };

  const handleStampSelect = (
    stampUri: string,
    width: number,
    height: number,
  ) => {
    const canvasSize = calculateCanvasSize();

    const element = createStickerElement(
      stampUri,
      canvasSize.width / 2 - width / 2,
      canvasSize.height / 2 - height / 2,
      width,
      height,
    );
    addElement(element);
  };

  const handleFilterSelect = (filterId: string) => {
    console.log('Filter selected:', filterId);

    const isFilterAlreadyActive =
      filterId === 'none' ? !appliedFilter : appliedFilter?.id === filterId;

    if (isFilterAlreadyActive) {
      closeFilterToolbar();
      return;
    }

    if (filterId === 'none') {
      removeFilter();
      console.log('Filter removed');
      return;
    }

    const filter = {
      id: filterId,
      name: filterId,
      intensity: 1,
      type: filterId as any,
    };
    applyFilter(filter);
    console.log('Filter applied:', filter);
  };

  const renderFilterItem = ({ item }: { item: FilterOption }) => {
    const isActive = appliedFilter?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => handleFilterSelect(item.id)}
        activeOpacity={0.7}
      >
        <Image
          source={item.icon}
          style={styles.filterIcon}
          resizeMode="contain"
        />
        <Text style={styles.filterName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const handleApplyWatermarkPreset = async (
    preset: WatermarkPreset,
    text: string,
    settings: { opacity: number; scale: number; rotation: number },
  ) => {
    const canvasSize = calculateCanvasSize();

    // Generate watermark instances from preset
    let watermarkInstances = WatermarkManager.applyPreset(
      preset,
      canvasSize,
      text,
      'text',
    );

    // Apply global settings
    watermarkInstances = WatermarkManager.applyGlobalSettings(
      watermarkInstances,
      settings,
    );

    // Convert to canvas elements
    const watermarkElements = WatermarkManager.toCanvasElements(
      watermarkInstances,
      canvasSize,
    );

    // Rasterize text-based watermark elements to image-based 'watermark' elements
    const rasterized = await Promise.all(
      watermarkElements.map(async el => {
        if (el.type === 'text') {
          return rasterizeTextElementToWatermark(el);
        }
        return el;
      }),
    );

    addElements(rasterized);

    console.log(
      `Applied ${preset.name} preset with ${watermarkElements.length} watermarks`,
    );
  };

  const sizeChangeStateRef = useRef<{
    elements: { id: string; initialScale: number }[];
    referenceScale: number;
  } | null>(null);

  // Live preview during drag (no history)
  const handleSizeChange = (newScale: number) => {
    if (!sliderVisible) {
      return;
    }

    // Initialize tracking on first change
    if (!sizeChangeStateRef.current) {
      const activeElementIds =
        hasSingleSelection && singleSelectedElementId
          ? [singleSelectedElementId]
          : isAllSelected
          ? [...selectedElementIds]
          : [];

      const elements = activeElementIds
        .map(id => {
          const element = canvasElements.find(el => el.id === id);
          if (!element) return null;
          return {
            id,
            initialScale: element.scale ?? 1,
          };
        })
        .filter(Boolean) as { id: string; initialScale: number }[];

      if (elements.length === 0) {
        return;
      }

      sizeChangeStateRef.current = {
        elements,
        referenceScale: elements[0].initialScale || 1,
      };
    }

    const { elements, referenceScale } = sizeChangeStateRef.current!;

    const computeScale = (initialScale: number) => {
      if (elements.length === 1) {
        return newScale;
      }
      if (referenceScale === 0) {
        return newScale;
      }
      return initialScale * (newScale / referenceScale);
    };

    elements.forEach(({ id, initialScale }) => {
      const nextScale = computeScale(initialScale);
      updateElementWithoutHistory(id, { scale: nextScale });
    });
  };

  // Save to history when drag ends
  const handleSizeChangeEnd = (newScale: number) => {
    const state = sizeChangeStateRef.current;
    if (!state) {
      return;
    }

    const { elements, referenceScale } = state;

    const computeScale = (initialScale: number) => {
      if (elements.length === 1) {
        return newScale;
      }
      if (referenceScale === 0) {
        return newScale;
      }
      return initialScale * (newScale / referenceScale);
    };

    const editorState = useEditorStore.getState();
    const {
      history,
      historyIndex,
      canvasElements: latestElements,
    } = editorState;
    const newHistory = history.slice(0, historyIndex + 1);
    let historyAdded = false;

    elements.forEach(({ id, initialScale }) => {
      const element = latestElements.find(el => el.id === id);
      if (!element) {
        return;
      }

      const finalScale = computeScale(initialScale);
      if (initialScale === finalScale) {
        return;
      }

      newHistory.push({
        action: 'update',
        elementId: id,
        oldState: { ...element, scale: initialScale },
        newState: { ...element, scale: finalScale },
        timestamp: Date.now(),
      });
      historyAdded = true;
    });

    if (historyAdded) {
      useEditorStore.setState({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    }

    sizeChangeStateRef.current = null;
  };

  const representativeElement = hasSingleSelection
    ? selectedElement
    : isAllSelected
    ? canvasElements[0]
    : undefined;

  const currentScale = representativeElement?.scale || 1;

  useEffect(() => {
    sizeChangeStateRef.current = null;
  }, [sliderVisible, JSON.stringify(selectedElementIds)]);

  const calculateCanvasSize = () => {
    if (!sourceImageDimensions) return { width: screenWidth, height: 300 };

    const availableHeight = screenHeight - 200; // Account for top bar and toolbar
    const aspectRatio =
      sourceImageDimensions.width / sourceImageDimensions.height;

    let canvasWidth = screenWidth;
    let canvasHeight = canvasWidth / aspectRatio;

    if (canvasHeight > availableHeight) {
      canvasHeight = availableHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }

    return { width: canvasWidth, height: canvasHeight };
  };

  const canvasSize = calculateCanvasSize();

  // Debug: Log current text styling state
  console.log('Current text styling:', {
    font: textFont,
    color: textColor,
    effect: textEffect,
    background: textBackground,
    toolbarActive: activeToolbar === 'text',
    inputVisible: showCanvasTextInput,
  });

  // Animated style for the active indicator
  const indicatorStyle = useAnimatedStyle(() => {
    const positions = [0, 1, 2, 3, 4].map(
      i => (screenWidth / 5) * i + screenWidth / 10 - 14,
    );
    const translateX = interpolate(
      activeToolIndex.value,
      [-1, 0, 1, 2, 3, 4],
      [
        -100,
        positions[0],
        positions[1],
        positions[2],
        positions[3],
        positions[4],
      ],
    );
    return {
      transform: [{ translateX }],
      opacity: activeToolIndex.value === -1 ? 0 : 1,
    };
  });

  // Animated style for the toolbar
  const toolbarAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: filterToolbarHeight.value,
    };
  });

  // Animated style for the filter list
  const filterListAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: filterListOpacity.value,
    };
  });

  const renderToolIcon = (
    tool: typeof activeToolbar,
    iconSource: any,
    _label: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.toolButton,
        activeToolbar === tool && styles.toolButtonActive,
      ]}
      onPress={() => handleToolSelect(tool)}
    >
      <Image
        source={iconSource}
        style={[
          styles.toolIcon,
          activeToolbar === tool && styles.toolIconActive,
        ]}
        resizeMode="contain"
        fadeDuration={0}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.historyButton,
              !canUndo() && styles.historyButtonDisabled,
            ]}
            onPress={undo}
            disabled={!canUndo()}
          >
            <Text style={styles.historyIcon}>↶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.historyButton,
              !canRedo() && styles.historyButtonDisabled,
            ]}
            onPress={redo}
            disabled={!canRedo()}
          >
            <Text style={styles.historyIcon}>↷</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.historyButton,
              canvasElements.length === 0 && styles.historyButtonDisabled,
            ]}
            onPress={handleSelectAll}
            disabled={canvasElements.length === 0}
          >
            <Image
              source={selectAllIcon}
              style={styles.actionIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Delete button - only visible when at least one element is selected */}
          {hasSelection && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteElement}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Canvas Container */}
        <View style={styles.canvasContainer}>
          {sourceImagePath ? (
            <View style={styles.canvasWrapper}>
              <SkiaCanvas
                sourceImageUri={sourceImagePath}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
                onTextEdit={handleTextElementEdit}
                onCanvasBackgroundTap={handleCanvasBackgroundTap}
              />

              {/* Hidden TextInput for keyboard input */}
              {showCanvasTextInput && (
                <TextInput
                  ref={textInputRef}
                  style={styles.hiddenTextInput}
                  value={canvasTextValue}
                  onChangeText={setCanvasTextValue}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleCanvasTextSubmit}
                  multiline
                  placeholder=""
                  keyboardType="default"
                  blurOnSubmit={false}
                />
              )}
            </View>
          ) : (
            <View
              style={[
                styles.canvas,
                { width: canvasSize.width, height: canvasSize.height },
              ]}
            >
              <View style={styles.emptyCanvas}>
                <Text style={styles.emptyCanvasText}>No image loaded</Text>
                <Text style={styles.emptyCanvasText}>
                  Params: {JSON.stringify(params)}
                </Text>
              </View>
            </View>
          )}

          {/* Size Slider - appears when a single element or the entire canvas is selected */}
          <SizeSlider
            visible={sliderVisible}
            initialValue={currentScale}
            onValueChange={handleSizeChange}
            onChangeEnd={handleSizeChangeEnd}
            position={{
              x: -canvasSize.width / 2.3,
              y: -canvasSize.height / 7,
            }}
          />
        </View>

        {/* Text Toolbar - appears when text tool is active */}
        {activeToolbar === 'text' && (
          <TextToolbar
            onFontSelect={font => {
              console.log('Font selected:', font);
              setTextFont(font);
              updateLiveTextStyling({ fontFamily: font });
              if (showCanvasTextInput) {
                // Refocus text input after selection when actively editing
                setTimeout(() => {
                  console.log('Refocusing after font selection');
                  textInputRef.current?.focus();
                }, 100);
              }
            }}
            onColorSelect={color => {
              console.log('Color selected:', color);
              setTextColor(color);
              updateLiveTextStyling({ color });
              if (showCanvasTextInput) {
                // Refocus text input after selection when actively editing
                setTimeout(() => {
                  textInputRef.current?.focus();
                }, 50);
              }
            }}
            onEffectSelect={effect => {
              console.log('Effect selected:', effect);
              setTextEffect(effect as any);
              updateLiveTextStyling({ textEffect: effect as any });
              if (showCanvasTextInput) {
                // Refocus text input after selection when actively editing
                setTimeout(() => {
                  textInputRef.current?.focus();
                }, 50);
              }
            }}
            onBackgroundSelect={bg => {
              console.log('Background selected:', bg);
              setTextBackground(bg);
              updateLiveTextStyling({ textBackground: bg });
              if (showCanvasTextInput) {
                // Refocus text input after selection when actively editing
                setTimeout(() => {
                  textInputRef.current?.focus();
                }, 50);
              }
            }}
            selectedFont={textFont}
            selectedColor={textColor}
            selectedEffect={textEffect}
            selectedBackground={textBackground}
          />
        )}

        {/* Tool Toolbar - will be pushed above keyboard by KeyboardAvoidingView */}
        <Animated.View style={[styles.toolbar, toolbarAnimatedStyle]}>
          {activeToolbar === 'filter' ? (
            // Filters horizontal scrolling toolbar
            <Animated.View style={[{ flex: 1 }, filterListAnimatedStyle]}>
              <FlatList
                data={FILTERS}
                horizontal
                keyExtractor={item => item.id}
                renderItem={renderFilterItem}
                extraData={appliedFilter?.id}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.filtersScrollContainer}
                style={styles.filtersScrollView}
                overScrollMode="never"
                directionalLockEnabled
                alwaysBounceVertical={false}
                bounces={false}
              />
            </Animated.View>
          ) : (
            // Regular tool icons
            <>
              <View style={styles.toolContainer}>
                {renderToolIcon(
                  'watermark',
                  require('../assets/icons/toolbar/watermark.png'),
                  'Watermark',
                )}
                {renderToolIcon(
                  'sticker',
                  require('../assets/icons/toolbar/sticker.png'),
                  'Sticker',
                )}
                {renderToolIcon(
                  'stamps',
                  require('../assets/icons/toolbar/2471542.png'),
                  'Stamps',
                )}
                {renderToolIcon(
                  'filter',
                  require('../assets/icons/toolbar/filters.png'),
                  'Filter',
                )}
                {renderToolIcon(
                  'layers',
                  require('../assets/icons/toolbar/layers.png'),
                  'Layers',
                )}
              </View>

              {/* Active indicator */}
              <Animated.View style={[styles.activeIndicator, indicatorStyle]} />
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Sticker Picker Modal */}
      <StickerPickerModal
        visible={stickerModalVisible}
        onClose={() => {
          setStickerModalVisible(false);
          setActiveToolbar(null);
          activeToolIndex.value = withSpring(-1, {
            damping: 15.0,
            stiffness: 150.0,
          });
        }}
        onSelect={handleAddSticker}
      />

      {/* Stamps Picker Modal */}
      <StampsPickerModal
        visible={stampsModalVisible}
        onClose={() => {
          setStampsModalVisible(false);
          setActiveToolbar(null);
          activeToolIndex.value = withSpring(-1, {
            damping: 15.0,
            stiffness: 150.0,
          });
        }}
        onSelect={handleStampSelect}
      />

      {/* Watermark Tool Modal */}
      <WatermarkToolModal
        visible={watermarkModalVisible}
        onClose={() => {
          setWatermarkModalVisible(false);
          setActiveToolbar(null);
          activeToolIndex.value = withSpring(-1, {
            damping: 15.0,
            stiffness: 150.0,
          });
        }}
        onApplyPreset={handleApplyWatermarkPreset}
      />

      {/* Layers Modal */}
      <LayersModal
        visible={layersModalVisible}
        onClose={() => {
          setLayersModalVisible(false);
          setActiveToolbar(null);
          activeToolIndex.value = withSpring(-1, {
            damping: 15.0,
            stiffness: 150.0,
          });
        }}
      />

      {/* Export Modal */}
      <ExportModal
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
        canvasDimensions={canvasSize}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgrounds.primary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.m,
    height: 56,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text.primary,
    marginRight: 4,
  },
  backText: {
    ...Typography.body.regular,
    color: Colors.text.primary,
  },
  historyButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  historyButtonDisabled: {
    opacity: 0.3,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#FF4444',
  },
  historyIcon: {
    fontSize: 20,
    color: Colors.text.primary,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.text.primary,
  },
  exportButton: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
  },
  exportText: {
    ...Typography.body.regular,
    color: Colors.accent.primary,
    fontWeight: '600',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.m,
  },
  canvasWrapper: {
    position: 'relative',
  },
  canvas: {
    backgroundColor: Colors.backgrounds.secondary,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  emptyCanvas: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    width: 200,
    alignItems: 'center',
  },
  emptyCanvasText: {
    ...Typography.body.regular,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  hiddenTextInput: {
    position: 'absolute',
    top: -1000, // Hide off-screen
    left: 0,
    width: 1,
    height: 1,
    opacity: 0,
  },
  toolbar: {
    height: 48,
    backgroundColor: Colors.backgrounds.secondary,
    paddingHorizontal: Spacing.m,
    justifyContent: 'center',
  },
  filterToolbar: {
    height: 120,
    paddingVertical: Spacing.s,
    justifyContent: 'flex-start',
  },
  toolContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolButton: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: Spacing.xs,
    minWidth: 50,
  },
  toolButtonActive: {
    // Active state styling will be handled by indicator
  },
  toolIcon: {
    width: 32,
    height: 32,
    opacity: 0.8,
  },
  toolIconActive: {
    opacity: 1,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 28,
    height: 3,
    backgroundColor: Colors.accent.primary,
    borderRadius: 1.5,
  },

  filtersScrollView: {
    flex: 1,
  },
  filtersScrollContainer: {
    paddingHorizontal: Spacing.m,
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.s,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.s,
    minWidth: 70,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },

  filterIcon: {
    width: 64,
    height: 64,
    marginBottom: 6,
    borderRadius: 12,
  },
  filterName: {
    ...Typography.body.caption,
    color: Colors.text.primary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});

export default EditorScreen;
