// Editor state management for canvas operations

import { create } from 'zustand';
import {
  CanvasElement,
  EditorHistory,
  ExportOptions,
  ImageFilter,
} from '../types';
import { ProjectDatabase } from '../database/ProjectDatabase';

interface EditorState {
  canvasElements: CanvasElement[];
  selectedElementId: string | null;
  selectedElementIds: string[];
  history: EditorHistory[];
  historyIndex: number;
  currentProjectId: string | null;
  sourceImagePath: string | null;
  sourceImageDimensions: { width: number; height: number } | null;
  canvasSize: { width: number; height: number } | null;
  appliedFilter: ImageFilter | null;

  // Element manipulation
  addElement: (element: CanvasElement) => void;
  addElements: (elements: CanvasElement[]) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  updateElementWithoutHistory: (
    id: string,
    updates: Partial<CanvasElement>,
  ) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  deselectElement: () => void;
  selectAllElements: () => void;

  // History management
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Filter management
  applyFilter: (filter: ImageFilter) => void;
  removeFilter: () => void;

  // Project management
  loadProject: (projectId: string) => Promise<void>;
  saveProject: (canvasSize?: {
    width: number;
    height: number;
  }) => Promise<void>;
  exportProject: (options: ExportOptions) => Promise<string>;

  // Layer management
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;

  // Initialize new project
  initializeProject: (
    imageUri: string,
    dimensions: { width: number; height: number },
  ) => void;

  // Reset
  reset: () => void;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const applyReverseAction = (action: EditorHistory, set: any, get: any) => {
  const { canvasElements } = get();

  switch (action.action) {
    case 'add':
      if (action.element) {
        const newElements = canvasElements.filter(
          (el: CanvasElement) => el.id !== action.element!.id,
        );
        set({
          canvasElements: newElements,
          selectedElementId: null,
          selectedElementIds: [],
        });
      }
      break;
    case 'batchAdd':
      if (action.elements) {
        const elementIds = new Set(action.elements.map(el => el.id));
        const newElements = canvasElements.filter(
          (el: CanvasElement) => !elementIds.has(el.id),
        );
        set({
          canvasElements: newElements,
          selectedElementId: null,
          selectedElementIds: [],
        });
      }
      break;
    case 'delete':
      if (action.element) {
        const newElements = [
          ...canvasElements,
          action.element as CanvasElement,
        ];
        set({ canvasElements: newElements });
      }
      break;
    case 'update':
      if (action.elementId && action.oldState) {
        const index = canvasElements.findIndex(
          (el: CanvasElement) => el.id === action.elementId,
        );
        if (index !== -1) {
          const newElements = [...canvasElements];

          newElements[index] = { ...newElements[index], ...action.oldState };
          set({ canvasElements: newElements });
        }
      }
      break;
    case 'filter':
      set({ appliedFilter: action.oldFilter ?? null });
      break;
    case 'reorder':
      if (action.oldState && action.oldState.canvasElements) {
        set({ canvasElements: action.oldState.canvasElements });
      }
      break;
  }
};

const applyAction = (action: EditorHistory, set: any, get: any) => {
  const { canvasElements } = get();

  switch (action.action) {
    case 'add':
      if (action.element) {
        const newElements = [
          ...canvasElements,
          action.element as CanvasElement,
        ];
        set({
          canvasElements: newElements,
          selectedElementId: action.element.id,
          selectedElementIds: [action.element.id],
        });
      }
      break;
    case 'batchAdd':
      if (action.elements) {
        const newElements = [
          ...canvasElements,
          ...(action.elements as CanvasElement[]),
        ];
        const lastElement = action.elements[action.elements.length - 1];
        set({
          canvasElements: newElements,
          selectedElementId: lastElement.id,
          selectedElementIds: [lastElement.id],
        });
      }
      break;
    case 'delete':
      if (action.element) {
        const newElements = canvasElements.filter(
          (el: CanvasElement) => el.id !== action.element!.id,
        );
        set({
          canvasElements: newElements,
          selectedElementId: null,
          selectedElementIds: [],
        });
      }
      break;
    case 'update':
      if (action.elementId && action.newState) {
        const index = canvasElements.findIndex(
          (el: CanvasElement) => el.id === action.elementId,
        );
        if (index !== -1) {
          const newElements = [...canvasElements];
          newElements[index] = { ...newElements[index], ...action.newState };
          set({ canvasElements: newElements });
        }
      }
      break;
    case 'filter':
      set({ appliedFilter: action.newFilter ?? null });
      break;
    case 'reorder':
      if (action.newState && action.newState.canvasElements) {
        set({ canvasElements: action.newState.canvasElements });
      }
      break;
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  canvasElements: [],
  selectedElementId: null,
  selectedElementIds: [],
  history: [],
  historyIndex: -1,
  currentProjectId: null,
  sourceImagePath: null,
  sourceImageDimensions: null,
  canvasSize: null,
  appliedFilter: null,

  addElement: element => {
    const { canvasElements, history, historyIndex } = get();
    const newElements = [...canvasElements, element];

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'add',
      element: element,
      timestamp: Date.now(),
    });

    set({
      canvasElements: newElements,
      selectedElementId: element.id,
      selectedElementIds: [element.id],
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  addElements: elements => {
    if (elements.length === 0) return;

    const { canvasElements, history, historyIndex } = get();
    const newElements = [...canvasElements, ...elements];

    // Add all elements as a single batch history entry
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'batchAdd',
      elements: elements,
      timestamp: Date.now(),
    });

    set({
      canvasElements: newElements,
      selectedElementId: elements[elements.length - 1].id,
      selectedElementIds: [elements[elements.length - 1].id],
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateElement: (id, updates) => {
    const { canvasElements, history, historyIndex } = get();
    const index = canvasElements.findIndex(el => el.id === id);
    if (index === -1) return;

    const oldElement = canvasElements[index];
    const newElement = { ...oldElement, ...updates };
    const newElements = [...canvasElements];
    newElements[index] = newElement;

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'update',
      elementId: id,
      oldState: oldElement,
      newState: newElement,
      timestamp: Date.now(),
    });

    set({
      canvasElements: newElements,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateElementWithoutHistory: (id, updates) => {
    const { canvasElements } = get();
    const index = canvasElements.findIndex(el => el.id === id);
    if (index === -1) return;

    const newElements = [...canvasElements];
    newElements[index] = { ...newElements[index], ...updates };

    set({ canvasElements: newElements });
  },

  deleteElement: id => {
    const { canvasElements, history, historyIndex } = get();
    const element = canvasElements.find(el => el.id === id);
    if (!element) return;

    const newElements = canvasElements.filter(el => el.id !== id);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'delete',
      element: element,
      timestamp: Date.now(),
    });

    set({
      canvasElements: newElements,
      selectedElementId: null,
      selectedElementIds: [],
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  selectElement: id =>
    set({
      selectedElementId: id,
      selectedElementIds: id ? [id] : [],
    }),
  deselectElement: () =>
    set({
      selectedElementId: null,
      selectedElementIds: [],
    }),
  selectAllElements: () => {
    const { canvasElements } = get();
    if (canvasElements.length === 0) {
      set({
        selectedElementId: null,
        selectedElementIds: [],
      });
      return;
    }

    set({
      selectedElementId: null,
      selectedElementIds: canvasElements.map(element => element.id),
    });
  },

  moveElementUp: (id: string) => {
    const { canvasElements, history, historyIndex } = get();
    const currentIndex = canvasElements.findIndex(el => el.id === id);

    if (currentIndex < canvasElements.length - 1) {
      const oldElements = [...canvasElements];
      const newElements = [...canvasElements];
      const element = newElements.splice(currentIndex, 1)[0];
      newElements.splice(currentIndex + 1, 0, element);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        action: 'reorder' as any,
        oldState: { canvasElements: oldElements } as any,
        newState: { canvasElements: newElements } as any,
        timestamp: Date.now(),
      });

      set({
        canvasElements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    }
  },

  moveElementDown: (id: string) => {
    const { canvasElements, history, historyIndex } = get();
    const currentIndex = canvasElements.findIndex(el => el.id === id);

    if (currentIndex > 0) {
      const oldElements = [...canvasElements];
      const newElements = [...canvasElements];
      const element = newElements.splice(currentIndex, 1)[0];
      newElements.splice(currentIndex - 1, 0, element);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        action: 'reorder' as any,
        oldState: { canvasElements: oldElements } as any,
        newState: { canvasElements: newElements } as any,
        timestamp: Date.now(),
      });

      set({
        canvasElements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < 0) return;

    const action = history[historyIndex];

    applyReverseAction(action, set, get);

    set({ historyIndex: historyIndex - 1 });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;

    const action = history[historyIndex + 1];
    applyAction(action, set, get);

    set({ historyIndex: historyIndex + 1 });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  loadProject: async projectId => {
    try {
      const project = await ProjectDatabase.getById(projectId);
      if (!project) return;

      set({
        canvasElements: project.elements as CanvasElement[],
        selectedElementId: null,
        selectedElementIds: [],
        history: [],
        historyIndex: -1,
        currentProjectId: projectId,
        sourceImagePath: project.sourceImagePath,
        sourceImageDimensions: project.sourceImageDimensions,
        canvasSize: project.canvasSize || null,
      });
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  },

  saveProject: async (canvasSize?: { width: number; height: number }) => {
    const {
      canvasElements,
      currentProjectId,
      sourceImagePath,
      sourceImageDimensions,
    } = get();
    if (!currentProjectId || !sourceImagePath || !sourceImageDimensions) return;

    const project = {
      id: currentProjectId,
      sourceImagePath,
      sourceImageDimensions,
      canvasSize, // Store canvas size for proper export scaling
      thumbnailPath: '', // Will be generated
      elements: canvasElements,
      createdAt: new Date(), // Will be preserved if existing
      updatedAt: new Date(),
    };

    try {
      await ProjectDatabase.save(project);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  },

  exportProject: async options => {
    // This will be implemented with the ImageExporter
    // For now, return a placeholder
    return Promise.resolve('exported-image-path');
  },

  initializeProject: (imageUri, dimensions) => {
    const projectId = generateId();
    set({
      currentProjectId: projectId,
      sourceImagePath: imageUri,
      sourceImageDimensions: dimensions,
      canvasSize: null, // Will be set on first save
      canvasElements: [],
      selectedElementId: null,
      selectedElementIds: [],
      history: [],
      historyIndex: -1,
    });
  },

  applyFilter: (filter: ImageFilter) => {
    const { appliedFilter, history, historyIndex } = get();

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'filter',
      oldFilter: appliedFilter,
      newFilter: filter,
      timestamp: Date.now(),
    });

    set({
      appliedFilter: filter,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  removeFilter: () => {
    const { appliedFilter, history, historyIndex } = get();

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      action: 'filter',
      oldFilter: appliedFilter,
      newFilter: null,
      timestamp: Date.now(),
    });

    set({
      appliedFilter: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  reset: () =>
    set({
      canvasElements: [],
      selectedElementId: null,
      selectedElementIds: [],
      history: [],
      historyIndex: -1,
      currentProjectId: null,
      sourceImagePath: null,
      sourceImageDimensions: null,
      canvasSize: null,
      appliedFilter: null,
    }),
}));
