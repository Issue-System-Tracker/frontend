import { IssueType, IssueStatus } from './types';

/**
 * Тип данных для обновления задачи
 * Используется в компонентах EditIssueModal и KanbanBoard
 */
export interface UpdateIssueData {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  sprintId?: number;
  assigneeEmail?: string;
}

