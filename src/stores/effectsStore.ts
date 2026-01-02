/**
 * Effects state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { EffectLayer, EffectPreset, BlendMode } from '../domain/effects/types';

// Safe MMKV initialization
let storage: MMKV | null = null;

try {
  storage = new MMKV({ id: 'effects-store' });
} catch (error) {
  console.warn('MMKV initialization failed, using in-memory storage:', error);
}

const mmkvStorage = {
  getItem: (name: string) => {
    if (!storage) return null;
    try {
      const value = storage.getString(name);
      return value ?? null;
    } catch (error) {
      console.warn('MMKV getItem error:', error);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (!storage) return;
    try {
      storage.set(name, value);
    } catch (error) {
      console.warn('MMKV setItem error:', error);
    }
  },
  removeItem: (name: string) => {
    if (!storage) return;
    try {
      storage.delete(name);
    } catch (error) {
      console.warn('MMKV removeItem error:', error);
    }
  },
};

interface EffectsState {
  // Current editing session
  effectStack: EffectLayer[];
  currentLayerId: string | null;
  isStackMode: boolean;

  // History
  history: EffectLayer[][];
  historyIndex: number;

  // User presets
  presets: EffectPreset[];

  // Premium status
  isPremium: boolean;

  // Session parameter cache (not persisted)
  parameterCache: Record<string, Record<string, any>>;

  // Actions
  addEffect: (effectId: string, params: Record<string, any>) => void;
  updateEffectParams: (layerId: string, params: Record<string, any>) => void;
  updateEffectParamsNoHistory: (layerId: string, params: Record<string, any>) => void;
  commitEffectParamsToHistory: (layerId: string) => void;
  removeEffect: (layerId: string) => void;
  reorderEffects: (fromIndex: number, toIndex: number) => void;
  toggleEffectVisibility: (layerId: string) => void;
  setEffectOpacity: (layerId: string, opacity: number) => void;
  setEffectBlendMode: (layerId: string, blendMode: BlendMode) => void;
  clearEffects: () => void;

  // Stack mode
  setStackMode: (enabled: boolean) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Presets
  savePreset: (
    name: string,
    effectId: string,
    params: Record<string, any>,
  ) => void;
  deletePreset: (presetId: string) => void;
  applyPreset: (presetId: string) => void;

  // Premium
  setPremium: (isPremium: boolean) => void;

  // Cache management
  getCachedParams: (effectId: string) => Record<string, any> | null;
  cacheEffectParams: (effectId: string, params: Record<string, any>) => void;
  clearEffectCache: (effectId: string) => void;
  clearAllCaches: () => void;
}

export const useEffectsStore = create<EffectsState>()(
  persist(
    (set, get) => ({
      effectStack: [],
      currentLayerId: null,
      isStackMode: false,
      history: [[]],
      historyIndex: 0,
      presets: [],
      isPremium: true, // Disabled paywall for development
      parameterCache: {},

      addEffect: (effectId, params) => {
        set(state => {
          const newLayer: EffectLayer = {
            id: `layer_${Date.now()}`,
            effectId,
            params,
            opacity: 1,
            visible: true,
            blendMode: BlendMode.NORMAL,
          };

          const newStack = state.isStackMode
            ? [...state.effectStack, newLayer]
            : [newLayer];

          // Add to history
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newStack);

          return {
            effectStack: newStack,
            currentLayerId: newLayer.id,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      updateEffectParams: (layerId, params) => {
        set(state => {
          const newStack = state.effectStack.map(layer =>
            layer.id === layerId
              ? { ...layer, params: { ...layer.params, ...params } }
              : layer,
          );

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newStack);

          return {
            effectStack: newStack,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      updateEffectParamsNoHistory: (layerId, params) => {
        set(state => {
          let updatedCache = state.parameterCache;

          const newStack = state.effectStack.map(layer => {
            if (layer.id === layerId) {
              const updatedParams = { ...layer.params, ...params };

              // Auto-cache updated params for this effect
              updatedCache = {
                ...state.parameterCache,
                [layer.effectId]: updatedParams
              };

              return { ...layer, params: updatedParams };
            }
            return layer;
          });

          return {
            effectStack: newStack,
            parameterCache: updatedCache,
          };
        });
      },

      commitEffectParamsToHistory: (layerId) => {
        set(state => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push([...state.effectStack]);

          return {
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      removeEffect: layerId => {
        set(state => {
          const newStack = state.effectStack.filter(
            layer => layer.id !== layerId,
          );

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newStack);

          return {
            effectStack: newStack,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      reorderEffects: (fromIndex, toIndex) => {
        set(state => {
          const newStack = [...state.effectStack];
          const [removed] = newStack.splice(fromIndex, 1);
          newStack.splice(toIndex, 0, removed);

          return { effectStack: newStack };
        });
      },

      toggleEffectVisibility: layerId => {
        set(state => ({
          effectStack: state.effectStack.map(layer =>
            layer.id === layerId
              ? { ...layer, visible: !layer.visible }
              : layer,
          ),
        }));
      },

      setEffectOpacity: (layerId, opacity) => {
        set(state => ({
          effectStack: state.effectStack.map(layer =>
            layer.id === layerId ? { ...layer, opacity } : layer,
          ),
        }));
      },

      setEffectBlendMode: (layerId, blendMode) => {
        set(state => ({
          effectStack: state.effectStack.map(layer =>
            layer.id === layerId ? { ...layer, blendMode } : layer,
          ),
        }));
      },

      clearEffects: () => {
        set(state => {
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push([]);

          return {
            effectStack: [],
            currentLayerId: null,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      setStackMode: enabled => {
        set({ isStackMode: enabled });
      },

      undo: () => {
        set(state => {
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            return {
              effectStack: state.history[newIndex],
              historyIndex: newIndex,
            };
          }
          return state;
        });
      },

      redo: () => {
        set(state => {
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            return {
              effectStack: state.history[newIndex],
              historyIndex: newIndex,
            };
          }
          return state;
        });
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().history.length - 1,

      savePreset: (name, effectId, params) => {
        set(state => ({
          presets: [
            ...state.presets,
            {
              id: `preset_${Date.now()}`,
              name,
              effectId,
              params,
              createdAt: Date.now(),
            },
          ],
        }));
      },

      deletePreset: presetId => {
        set(state => ({
          presets: state.presets.filter(p => p.id !== presetId),
        }));
      },

      applyPreset: presetId => {
        const preset = get().presets.find(p => p.id === presetId);
        if (preset) {
          get().addEffect(preset.effectId, preset.params);
        }
      },

      setPremium: isPremium => {
        set({ isPremium });
      },

      getCachedParams: (effectId) => {
        const cache = get().parameterCache;
        return cache[effectId] || null;
      },

      cacheEffectParams: (effectId, params) => {
        set(state => ({
          parameterCache: {
            ...state.parameterCache,
            [effectId]: { ...params }
          }
        }));
      },

      clearEffectCache: (effectId) => {
        set(state => {
          const newCache = { ...state.parameterCache };
          delete newCache[effectId];
          return { parameterCache: newCache };
        });
      },

      clearAllCaches: () => {
        set({ parameterCache: {} });
      },
    }),
    {
      name: 'effects-storage',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: state => ({
        presets: state.presets,
        isPremium: state.isPremium,
      }),
    },
  ),
);
