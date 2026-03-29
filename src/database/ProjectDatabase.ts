// Project database using AsyncStorage for compatibility

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project } from '../types';
import { logger } from '../utils/logger';

const PROJECT_PREFIX = 'corivo_project_';
const METADATA_KEY = 'corivo_project_ids';

// Initialize AsyncStorage to ensure it's ready
let isInitialized = false;
const initializeStorage = async (): Promise<void> => {
  if (isInitialized) return;
  
  try {
    // Try to access AsyncStorage to trigger initialization
    await AsyncStorage.getItem('init_check');
    isInitialized = true;
  } catch (error) {
    logger.warn('AsyncStorage initialization failed, retrying...', error);
    // Wait a bit and retry
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    try {
      await AsyncStorage.getItem('init_check');
      isInitialized = true;
    } catch (retryError) {
      console.error('AsyncStorage initialization completely failed:', retryError);
      // Try a different approach - set a dummy item to force initialization
      try {
        await AsyncStorage.setItem('init_check', 'true');
        await AsyncStorage.removeItem('init_check');
        isInitialized = true;
      } catch (fallbackError) {
        console.error('Fallback initialization also failed:', fallbackError);
        // Check if it's a manifest.json issue and handle it specifically
        const errorMsg = fallbackError instanceof Error ? fallbackError.message : '';
        if (errorMsg.includes('manifest.json') || errorMsg.includes('NSCocoaErrorDomain') || errorMsg.includes('No such file or directory')) {
          await forceReinitializeStorage();
          isInitialized = true;
        } else {
          throw new Error('AsyncStorage could not be initialized');
        }
      }
    }
  }
};

// Separate function for force reinitialization to avoid circular dependency
const forceReinitializeStorage = async (): Promise<void> => {
  try {
    // Clear any existing data that might be corrupted
    try {
      await AsyncStorage.clear();
    } catch (clearError) {
      logger.warn('Could not clear AsyncStorage:', clearError);
    }

    // Wait a moment for the clear to complete
    await new Promise<void>(resolve => setTimeout(resolve, 300));

    // Multiple attempts to ensure manifest directory is created
    let success = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!success && attempts < maxAttempts) {
      attempts++;
      try {
        // Set a test item to verify it works and create manifest
        await AsyncStorage.setItem('test_key', 'test_value');
        const testValue = await AsyncStorage.getItem('test_key');
        await AsyncStorage.removeItem('test_key');

        if (testValue === 'test_value') {
          success = true;
        } else {
          throw new Error('AsyncStorage reinitialization verification failed');
        }
      } catch (attemptError) {
        logger.warn(`AsyncStorage reinitialization attempt ${attempts} failed:`, attemptError);
        if (attempts >= maxAttempts) {
          throw attemptError;
        }
        // Wait before retry
        await new Promise<void>(resolve => setTimeout(resolve, 200));
      }
    }
  } catch (error) {
    console.error('Failed to force reinitialize AsyncStorage:', error);
    throw new Error('AsyncStorage reinitialization failed');
  }
};

export class ProjectDatabase {
  // Save or update a project
  static async save(project: Project): Promise<void> {
    try {
      // Ensure AsyncStorage is initialized
      await initializeStorage();
      
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

    } catch (error) {
      console.error('Failed to save project:', error);

      // Check if it's a manifest/directory issue
      const errorMsg = error instanceof Error ? error.message : '';
      const isManifestIssue = errorMsg.includes('manifest.json') ||
                             errorMsg.includes('NSCocoaErrorDomain') ||
                             errorMsg.includes('No such file or directory') ||
                             errorMsg.includes('folder') ||
                             errorMsg.includes('directory');

      if (isManifestIssue) {
        try {
          // Force reinitialize AsyncStorage
          await this.forceReinitialize();

          // Retry the save operation
          const projectData = {
            ...project,
            updatedAt: new Date(),
          };
          await AsyncStorage.setItem(
            PROJECT_PREFIX + project.id,
            JSON.stringify(projectData),
          );
          await this.updateProjectList(project.id);
          return;
        } catch (retryError) {
          console.error('Reinitialization retry failed:', retryError);
          // If reinitialization still fails, try one more time with a fresh approach
          try {
            isInitialized = false;
            await initializeStorage();

            const finalProjectData = {
              ...project,
              updatedAt: new Date(),
            };
            await AsyncStorage.setItem(
              PROJECT_PREFIX + project.id,
              JSON.stringify(finalProjectData),
            );
            await this.updateProjectList(project.id);
            return;
          } catch (finalError) {
            console.error('Final recovery failed:', finalError);
          }
        }
      }

      throw new Error('Failed to save project');
    }
  }

  // Get project by ID
  static async getById(id: string): Promise<Project | null> {
    try {
      await initializeStorage();
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
    } catch (error) {
      console.error('Failed to delete projects:', error);
      throw new Error('Failed to delete projects');
    }
  }

  // Alias for deleteMultiple to match store usage
  static async deleteMany(ids: string[]): Promise<void> {
    return this.deleteMultiple(ids);
  }

  // Update project name
  static async updateName(id: string, name: string): Promise<void> {
    try {
      const project = await this.getById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      project.name = name;
      project.updatedAt = new Date();
      await this.save(project);
    } catch (error) {
      console.error('Failed to update project name:', error);
      throw new Error('Failed to update project name');
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.save(project);
    return project;
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
    } catch (error) {
      console.error('Failed to clear projects:', error);
      throw new Error('Failed to clear projects');
    }
  }

  // Force reinitialize AsyncStorage (for fixing manifest issues)
  static async forceReinitialize(): Promise<void> {
    try {
      isInitialized = false;

      // Clear any existing data that might be corrupted
      try {
        await AsyncStorage.clear();
      } catch (clearError) {
        logger.warn('Could not clear AsyncStorage:', clearError);
      }
      
      // Wait a moment for the clear to complete
      await new Promise<void>(resolve => setTimeout(resolve, 300));
      
      // Use the dedicated reinitialization function
      await forceReinitializeStorage();
      
      // Reinitialize the main storage
      await initializeStorage();
    } catch (error) {
      console.error('Failed to force reinitialize AsyncStorage:', error);
      throw new Error('AsyncStorage reinitialization failed');
    }
  }

  // Private helper methods
  private static async getProjectIds(): Promise<string[]> {
    try {
      await initializeStorage();
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
