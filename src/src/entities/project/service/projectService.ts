import { Project } from "../model/types";
import { useProjectStore } from "../model/projectStore";

// Хелперы для работы со стором проекта
// Не содержат бизнес-логику, только работа со стором
export function selectProject(project: Project): void {
  useProjectStore.getState().setSelectedProject(project);
}

export function getSelectedProject(): Project | null {
  return useProjectStore.getState().selectedProject;
}

export function clearSelectedProject(): void {
  useProjectStore.getState().setSelectedProject(null);
}
