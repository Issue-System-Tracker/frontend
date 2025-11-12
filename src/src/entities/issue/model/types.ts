// Типы задач
export type IssueType = "BUG" | "FEATURE";
export type IssueStatus = "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

// Базовые типы для связанных сущностей
export interface IssueUser {
  id: string;
  email: string;
  fullName: string;
}

export interface IssueSprint {
  id: number;
  name: string;
}

// Основная модель задачи
export interface Issue {
  id: number;
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

// Запросы для работы с задачами
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

export interface SearchIssuesRequest {
  status?: IssueStatus;
  assigneeEmail?: string;
  sprintId?: number;
}

// История изменений задачи
export interface IssueHistory {
  id: number;
  issueId: number;
  changedBy: IssueUser;
  changeType: string;
  oldValue: string;
  newValue: string;
  changeDate: string;
  description: string;
}