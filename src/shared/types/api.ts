// Общие типы для API
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

// Базовые типы для сущностей
export interface BaseEntity {
  id: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BaseUser {
  id: string;
  email: string;
  name: string;
}

// Типы для аутентификации
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface AuthUser extends BaseUser {
  roles: string[];
  accessToken?: string;
  refreshToken?: string;
}

// Типы для проектов
export interface ProjectMember extends BaseUser {
  roles: string[];
  projects: Project[];
}

export interface Project extends BaseEntity {
  name: string;
  adminEmail: string;
  members: ProjectMember[];
  isAdmin: boolean;
}

// Типы для задач
export type IssueType = "BUG" | "FEATURE";
export type IssueStatus = "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface IssueUser extends BaseUser {
  fullName: string;
}

export interface IssueSprint {
  id: number;
  name: string;
}

export interface Issue extends BaseEntity {
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  assignee?: IssueUser;
  creator: IssueUser;
  startDate?: string;
  endDate?: string;
  sprint?: IssueSprint;
}

// Типы для спринтов
export interface Sprint extends BaseEntity {
  name: string;
  startDate: string;
  endDate: string;
  projectId: number;
}

// Запросы для создания/обновления
export interface CreateProjectRequest {
  name: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  type: IssueType;
  priority?: Priority;
  startDate?: string;
  endDate?: string;
  sprintId?: number;
}

export interface UpdateIssueRequest {
  title: string;
  description: string;
  type: IssueType;
  status?: IssueStatus;
  priority?: Priority;
  assigneeEmail?: string;
  startDate?: string;
  endDate?: string;
  sprintId?: number;
}

export interface CreateSprintRequest {
  name: string;
  startDate: string;
  endDate: string;
  projectId: number;
}

// Формы
export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  passwordConfirm: string;
  fullName: string;
}
