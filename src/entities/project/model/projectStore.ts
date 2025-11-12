import { create } from 'zustand';
import { Project } from './types';
import { StorageService } from '@/shared/services/storageService';
import { logger } from '@/shared/utils/logger';

type ProjectState = {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  hydrateFromStorage: () => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => {
    set({ selectedProject: project });
    if (project) {
      StorageService.setSelectedProject(project);
      logger.info("Проект сохранен в localStorage", { projectId: project.id, projectName: project.name });
    } else {
      StorageService.clearSelectedProject();
      logger.info("Проект удален из localStorage");
    }
  },
  hydrateFromStorage: () => {
    try {
      logger.info("Загружаем проект из localStorage");
      
      const project = StorageService.getSelectedProject() as Project | null;
      
      if (project) {
        logger.success("Проект успешно загружен из localStorage", { projectId: project.id, projectName: project.name });
        set({ selectedProject: project });
      } else {
        logger.info("Проект не найден в localStorage");
      }
    } catch (error) {
      logger.error("Ошибка загрузки проекта из localStorage", error);
      logger.info("Очищаем поврежденные данные проекта");
      StorageService.clearSelectedProject();
      set({ selectedProject: null });
    }
  },
}));
