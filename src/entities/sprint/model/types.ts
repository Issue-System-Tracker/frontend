// Типы спринтов
export interface SprintProject {
  id: number;
  name: string;
}

// Основная модель спринта
export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  project: SprintProject;
}

// Запросы для работы со спринтами
export interface CreateSprintRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintRequest {
  name: string;
  startDate: string;
  endDate: string;
}
