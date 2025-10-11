/**
 * Effects state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { EffectLayer, EffectPreset, BlendMode } from '../domain/effects/types';

const storage = new MMKV({ id: 'effects-store' });

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
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

  // Actions
  addEffect: (effectId: string, params: Record<string, any>) => void;
  updateEffectParams: (layerId: string, params: Record<string, any>) => void;
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
      isPremium: false,

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
