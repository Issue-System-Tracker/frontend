// Базовые типы для связанных сущностей (избегаем циклических зависимостей)
export interface ProjectBaseUser {
  id: string;
  email: string;
  name: string;
}

// Типы данных проектов
export interface Project {
  id: number;
  name: string;
  admin: ProjectBaseUser;
  members: ProjectBaseUser[];
}

// Запросы для работы с проектами
export interface CreatingProjectRequest {
  name: string;
}

export interface EditingProjectRequest {
  name?: string;
  adminId?: number;
  memberIds?: number[];
}

// Импорты удалены для избежания циклических зависимостей
// Используется базовый тип BaseUser
