// Project Gallery state management

import { create } from 'zustand';
import { Project } from '../types';
import { ProjectDatabase } from '../database/ProjectDatabase';

interface ProjectGalleryState {
  projects: Project[];
  selectionMode: boolean;
  selectedIds: Set<string>;
  sortOrder: 'newest' | 'oldest' | 'alphabetical';
  isLoading: boolean;

  // Actions
  loadProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  deleteProjects: (ids: string[]) => Promise<void>;
  duplicateProject: (id: string) => Promise<void>;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleSelection: (id: string) => void;
  setSortOrder: (order: 'newest' | 'oldest' | 'alphabetical') => void;
}

const sortProjects = (
  projects: Project[],
  order: 'newest' | 'oldest' | 'alphabetical',
): Project[] => {
  const sorted = [...projects];

  switch (order) {
    case 'newest':
      return sorted.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    case 'oldest':
      return sorted.sort(
        (a, b) => a.updatedAt.getTime() - b.updatedAt.getTime(),
      );
    case 'alphabetical':
      return sorted.sort((a, b) => a.id.localeCompare(b.id));
    default:
      return sorted;
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useProjectGalleryStore = create<ProjectGalleryState>(
  (set, get) => ({
    projects: [],
    selectionMode: false,
    selectedIds: new Set(),
    sortOrder: 'newest',
    isLoading: false,

    loadProjects: async () => {
      set({ isLoading: true });
      try {
        const projects = await ProjectDatabase.getAll();
        const sorted = sortProjects(projects, get().sortOrder);
        set({ projects: sorted, isLoading: false });
      } catch (error) {
        console.error('Failed to load projects:', error);
        set({ isLoading: false });
      }
    },

    addProject: project =>
      set(state => ({
        projects: [project, ...state.projects],
      })),

    deleteProjects: async ids => {
      try {
        await ProjectDatabase.deleteMany(ids);
        set(state => ({
          projects: state.projects.filter(p => !ids.includes(p.id)),
          selectedIds: new Set(),
          selectionMode: false,
        }));
      } catch (error) {
        console.error('Failed to delete projects:', error);
      }
    },

    duplicateProject: async id => {
      const original = get().projects.find(p => p.id === id);
      if (!original) return;

      const duplicate: Project = {
        ...original,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await ProjectDatabase.save(duplicate);
        set(state => ({ projects: [duplicate, ...state.projects] }));
      } catch (error) {
        console.error('Failed to duplicate project:', error);
      }
    },

    enterSelectionMode: () => set({ selectionMode: true }),
    exitSelectionMode: () =>
      set({ selectionMode: false, selectedIds: new Set() }),

    toggleSelection: id =>
      set(state => {
        const newSelected = new Set(state.selectedIds);
        if (newSelected.has(id)) {
          newSelected.delete(id);
        } else {
          newSelected.add(id);
        }
        return { selectedIds: newSelected };
      }),

    setSortOrder: order => {
      set({ sortOrder: order });
      const sorted = sortProjects(get().projects, order);
      set({ projects: sorted });
    },
  }),
);
