// Базовые типы для связанных сущностей (избегаем циклических зависимостей)
export interface IssueBaseUser {
  id: string;
  email: string;
  name: string;
}

export interface IssueBaseSprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface IssueBaseProject {
  id: number;
  name: string;
}

// Типы данных задач
export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  author: IssueBaseUser;
  assignee?: IssueBaseUser;
  startDate?: string;
  endDate?: string;
  sprint?: IssueBaseSprint;
  project: IssueBaseProject;
}

// Типы задач
export enum IssueType {
  BUG = 'BUG',
  FEATURE = 'FEATURE'
}

// Статусы задач
export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  TESTING = 'TESTING',
  DONE = 'DONE'
}

// Приоритеты задач
export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// Запросы для работы с задачами
export interface CreatingIssueRequest {
  title: string;
  description: string;
  type: IssueType;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
  sprintId?: number;
}

export interface EditingIssueRequest {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
  priority?: Priority;
  assigneeId?: number;
  startDate?: string;
  endDate?: string;
  sprintId?: number;
}

export interface FilteringIssuesRequest {
  status?: IssueStatus;
  type?: IssueType;
  priority?: Priority;
  assigneeId?: number;
  sprintId?: number;
  projectId?: number;
}

// Ответы для задач
export interface IssueChangesResponse {
  issueId: number;
  changes: IssueChange[];
}

export interface IssueChange {
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
  changedBy: string;
}

// Импорты удалены для избежания циклических зависимостей
// Используются базовые типы BaseUser, BaseSprint, BaseProject
