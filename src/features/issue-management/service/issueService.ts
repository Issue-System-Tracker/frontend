import { 
  createIssue as createIssueApi,
  getIssues as getIssuesApi,
  getIssuesBySprint as getIssuesBySprintApi,
  updateIssue as updateIssueApi,
  deleteIssue as deleteIssueApi,
  changeIssueStatus as changeIssueStatusApi,
  searchIssues as searchIssuesApi,
  getIssueHistory as getIssueHistoryApi
} from "../api/issueApi";
import { 
  CreateIssueRequest, 
  UpdateIssueRequest, 
  SearchIssuesRequest,
  Issue,
  IssueHistory,
  IssueApiResponse
} from "../model/issueTypes";
import { logger } from "@/shared/utils/logger";

// Создание задачи
export async function submitCreateIssue(projectId: number, data: CreateIssueRequest): Promise<void> {
  try {
    await createIssueApi(projectId, data);
    logger.success("Задача успешно создана", { projectId, title: data.title });
  } catch (err: unknown) {
    logger.error("Ошибка создания задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Маппинг API ответа в формат Issue
// Согласно документации, API возвращает sprintId (число или null), а не объект sprint
function mapIssueResponse(issue: IssueApiResponse): Issue {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type || 'BUG', // Если type null, используем BUG по умолчанию
    status: issue.status,
    priority: issue.priority,
    // Создаем assignee из assigneeEmail
    assignee: issue.assigneeEmail ? {
      id: issue.assigneeEmail,
      email: issue.assigneeEmail,
      fullName: issue.assigneeEmail.split('@')[0]
    } : undefined,
    // Создаем creator из authorEmail
    creator: {
      id: issue.authorEmail,
      email: issue.authorEmail,
      fullName: issue.authorEmail.split('@')[0]
    },
    startDate: issue.startDate,
    endDate: issue.endDate,
    // Создаем объект sprint из sprintId (имя будет обновлено позже, когда загрузятся спринты)
    sprint: issue.sprintId ? {
      id: issue.sprintId,
      name: `Sprint ${issue.sprintId}` // Временное имя, будет заменено при загрузке спринтов
    } : undefined
  };
}

// Получение задач проекта
export async function fetchIssues(projectId: number): Promise<Issue[]> {
  try {
    const issues = await getIssuesApi(projectId);
    
    // Маппинг API ответа в формат Issue
    const mappedIssues = issues.map(mapIssueResponse);
    
    logger.success("Задачи успешно загружены", { projectId, count: mappedIssues.length });
    return mappedIssues;
  } catch (err: unknown) {
    logger.error("Ошибка загрузки задач", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Получение задач проекта по спринту
export async function fetchIssuesBySprint(projectId: number, sprintId: number): Promise<Issue[]> {
  try {
    const issues = await getIssuesBySprintApi(projectId, sprintId);
    
    // Маппинг API ответа в формат Issue
    const mappedIssues = issues.map(mapIssueResponse);
    
    logger.success("Задачи по спринту успешно загружены", { projectId, sprintId, count: mappedIssues.length });
    return mappedIssues;
  } catch (err: unknown) {
    logger.error("Ошибка загрузки задач по спринту", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Обновление задачи
export async function submitUpdateIssue(projectId: number, issueId: number, data: UpdateIssueRequest): Promise<void> {
  try {
    await updateIssueApi(projectId, issueId, data);
    logger.success("Задача успешно обновлена", { projectId, issueId });
  } catch (err: unknown) {
    logger.error("Ошибка обновления задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Удаление задачи
export async function submitDeleteIssue(projectId: number, issueId: number): Promise<void> {
  try {
    await deleteIssueApi(projectId, issueId);
    logger.success("Задача успешно удалена", { projectId, issueId });
  } catch (err: unknown) {
    logger.error("Ошибка удаления задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Изменение статуса задачи
export async function submitChangeIssueStatus(
  projectId: number, 
  issueId: number, 
  action: 'test' | 'progress' | 'done' | 'open'
): Promise<void> {
  try {
    await changeIssueStatusApi(projectId, issueId, action);
    logger.success("Статус задачи успешно изменен", { projectId, issueId, action });
  } catch (err: unknown) {
    logger.error("Ошибка изменения статуса задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Поиск задач
export async function submitSearchIssues(projectId: number, data: SearchIssuesRequest): Promise<Issue[]> {
  try {
    const issues = await searchIssuesApi(projectId, data);
    logger.success("Поиск задач выполнен", { projectId, count: issues.length });
    return issues;
  } catch (err: unknown) {
    logger.error("Ошибка поиска задач", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Тип для нового формата истории с сервера
interface IssueHistoryApiResponse {
  id?: number;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedAt?: string;
  description?: string;
}

// Получение истории задачи
export async function fetchIssueHistory(projectId: number, issueId: number): Promise<IssueHistory[]> {
  try {
    const raw = await getIssueHistoryApi(projectId, issueId);

    // Унификация ответа: поддерживаем как старый формат, так и новый (fieldName/changedAt/changedBy as string)
    const mapped: IssueHistory[] = (raw as (IssueHistory | IssueHistoryApiResponse)[]).map((item: IssueHistory | IssueHistoryApiResponse, idx: number) => {
      // Новый формат
      if (item && typeof item === 'object' && 'fieldName' in item) {
        const newFormatItem = item as IssueHistoryApiResponse;
        const email: string = String(newFormatItem.changedBy || 'unknown@example.com');
        const fullName = email.includes('@') ? email.split('@')[0] : email;
        return {
          id: newFormatItem.id ?? idx + 1,
          issueId: issueId,
          changedBy: {
            id: email,
            email,
            fullName,
          },
          changeType: String(newFormatItem.fieldName || ''),
          oldValue: String(newFormatItem.oldValue ?? ''),
          newValue: String(newFormatItem.newValue ?? ''),
          changeDate: String(newFormatItem.changedAt ?? ''),
          description: String(newFormatItem.description ?? ''),
        } as IssueHistory;
      }
      // Старый формат соответствует IssueHistory
      return item as IssueHistory;
    });

    logger.success("История задачи загружена", { projectId, issueId, count: mapped.length });
    return mapped;
  } catch (err: unknown) {
    logger.error("Ошибка загрузки истории задачи", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}
