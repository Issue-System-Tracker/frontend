// Базовые типы для связанных сущностей (избегаем циклических зависимостей)
export interface SprintBaseProject {
  id: number;
  name: string;
}

// Типы данных спринтов
export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  project: SprintBaseProject;
}

// Запросы для работы со спринтами
export interface SprintRequest {
  name: string;
  startDate: string;
  endDate: string;
  projectId: number;
}

export interface EditingSprintRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
}

// Импорты удалены для избежания циклических зависимостей
// Используется базовый тип BaseProject
