// Базовые типы для связанных сущностей (избегаем циклических зависимостей)
export interface IssueHistoryBaseIssue {
  id: number;
  title: string;
  description: string;
}

export interface IssueHistoryBaseUser {
  id: string;
  email: string;
  name: string;
}

// Типы данных истории изменений задач
export interface IssueHistory {
  id: number;
  issue: IssueHistoryBaseIssue;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: string;
  changedBy: IssueHistoryBaseUser;
}

// Запросы для работы с историей
export interface IssueHistoryRequest {
  issueId: number;
  field: string;
  oldValue: string;
  newValue: string;
}

// Ответы для истории
export interface IssueHistoryResponse {
  histories: IssueHistory[];
  totalCount: number;
}

// Импорты удалены для избежания циклических зависимостей
// Используются базовые типы BaseIssue, BaseUser
