// Типы для управления задачами
export type IssueType = "BUG" | "FEATURE";
export type IssueStatus = "OPEN" | "IN_PROGRESS" | "TESTING" | "DONE";
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface IssueUser {
  id: string;
  email: string;
  fullName: string;
}

export interface IssueSprint {
  id: number;
  name: string;
}

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

export interface CreateIssueRequest {
  title: string;
  description: string;
  type: IssueType;
  priority?: Priority;
  assigneeEmail?: string;
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
  sprintId?: number | null;
}

export interface SearchIssuesRequest {
  status?: IssueStatus;
  assigneeEmail?: string;
  sprintId?: number;
}

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

// API ответ для задач (реальная структура с сервера согласно документации)
export interface IssueApiResponse {
  id: number;
  title: string;
  description: string;
  type: IssueType | null;
  status: IssueStatus;
  priority: Priority;
  assigneeEmail?: string | null;
  authorEmail: string;
  startDate?: string;
  endDate?: string;
  sprintId?: number | null;
  projectId?: number;
}
