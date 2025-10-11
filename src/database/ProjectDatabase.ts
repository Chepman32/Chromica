// Project database using AsyncStorage for compatibility

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, SerializedElement } from '../types';

const PROJECT_PREFIX = 'artifex_project_';
const METADATA_KEY = 'artifex_project_ids';

export class ProjectDatabase {
  // Save or update a project
  static async save(project: Project): Promise<void> {
    try {
      // Save project data
      const projectData = {
        ...project,
        updatedAt: new Date(),
      };

      await AsyncStorage.setItem(
        PROJECT_PREFIX + project.id,
        JSON.stringify(projectData),
      );

      // Update project list metadata
      await this.updateProjectList(project.id);

      console.log('Project saved:', project.id);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw new Error('Failed to save project');
    }
  }

  // Get project by ID
  static async getById(id: string): Promise<Project | null> {
    try {
      const projectData = await AsyncStorage.getItem(PROJECT_PREFIX + id);
      if (!projectData) return null;

      const project = JSON.parse(projectData);

      // Convert date strings back to Date objects
      project.createdAt = new Date(project.createdAt);
      project.updatedAt = new Date(project.updatedAt);

      return project;
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  // Get all projects (metadata only for performance)
  static async getAll(): Promise<Project[]> {
    try {
      const projectIds = await this.getProjectIds();
      const projects: Project[] = [];

      for (const id of projectIds) {
        const project = await this.getById(id);
        if (project) {
          projects.push(project);
        }
      }

      // Sort by updatedAt descending (newest first)
      return projects.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    } catch (error) {
      console.error('Failed to get all projects:', error);
      return [];
    }
  }

  // Delete project by ID
  static async delete(id: string): Promise<void> {
    try {
      // Remove project data
      await AsyncStorage.removeItem(PROJECT_PREFIX + id);

      // Update project list
      const projectIds = await this.getProjectIds();
      const updatedIds = projectIds.filter(projectId => projectId !== id);
      await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(updatedIds));

      console.log('Project deleted:', id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error('Failed to delete project');
    }
  }

  // Delete multiple projects
  static async deleteMultiple(ids: string[]): Promise<void> {
    try {
      // Remove project data
      const keys = ids.map(id => PROJECT_PREFIX + id);
      await AsyncStorage.multiRemove(keys);

      // Update project list
      const projectIds = await this.getProjectIds();
      const updatedIds = projectIds.filter(id => !ids.includes(id));
      await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(updatedIds));

      console.log('Projects deleted:', ids);
    } catch (error) {
      console.error('Failed to delete projects:', error);
      throw new Error('Failed to delete projects');
    }
  }

  // Duplicate a project
  static async duplicate(id: string): Promise<Project | null> {
    try {
      const originalProject = await this.getById(id);
      if (!originalProject) return null;

      const newProject: Project = {
        ...originalProject,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.save(newProject);
      return newProject;
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      return null;
    }
  }

  // Create new project
  static async create(
    sourceImagePath: string,
    sourceImageDimensions: { width: number; height: number },
    thumbnailPath?: string,
  ): Promise<Project> {
    const project: Project = {
      id: this.generateId(),
      sourceImagePath,
      sourceImageDimensions,
      thumbnailPath: thumbnailPath || '',
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.save(project);
    return project;
  }

  // Update project elements
  static async updateElements(
    id: string,
    elements: SerializedElement[],
  ): Promise<void> {
    try {
      const project = await this.getById(id);
      if (!project) throw new Error('Project not found');

      project.elements = elements;
      await this.save(project);
    } catch (error) {
      console.error('Failed to update project elements:', error);
      throw new Error('Failed to update project elements');
    }
  }

  // Get project count
  static async getProjectCount(): Promise<number> {
    const projectIds = await this.getProjectIds();
    return projectIds.length;
  }

  // Clear all projects (for debugging/reset)
  static async clearAll(): Promise<void> {
    try {
      const projectIds = await this.getProjectIds();
      const keys = projectIds.map(id => PROJECT_PREFIX + id);
      keys.push(METADATA_KEY);

      await AsyncStorage.multiRemove(keys);
      console.log('All projects cleared');
    } catch (error) {
      console.error('Failed to clear projects:', error);
      throw new Error('Failed to clear projects');
    }
  }

  // Private helper methods
  private static async getProjectIds(): Promise<string[]> {
    try {
      const idsData = await AsyncStorage.getItem(METADATA_KEY);
      return idsData ? JSON.parse(idsData) : [];
    } catch (error) {
      console.error('Failed to get project IDs:', error);
      return [];
    }
  }

  private static async updateProjectList(projectId: string): Promise<void> {
    try {
      const projectIds = await this.getProjectIds();
      if (!projectIds.includes(projectId)) {
        projectIds.push(projectId);
        await AsyncStorage.setItem(METADATA_KEY, JSON.stringify(projectIds));
      }
    } catch (error) {
      console.error('Failed to update project list:', error);
    }
  }

  private static generateId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export/Import functionality for backup
  static async exportAllProjects(): Promise<string> {
    try {
      const projects = await this.getAll();
      return JSON.stringify(projects, null, 2);
    } catch (error) {
      console.error('Failed to export projects:', error);
      throw new Error('Failed to export projects');
    }
  }

  static async importProjects(projectsJson: string): Promise<number> {
    try {
      const projects: Project[] = JSON.parse(projectsJson);
      let importedCount = 0;

      for (const project of projects) {
        // Generate new ID to avoid conflicts
        project.id = this.generateId();
        project.createdAt = new Date(project.createdAt);
        project.updatedAt = new Date(project.updatedAt);

        await this.save(project);
        importedCount++;
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import projects:', error);
      throw new Error('Failed to import projects');
    }
  }
}
