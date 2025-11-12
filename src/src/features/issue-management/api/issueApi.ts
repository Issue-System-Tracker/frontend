import { ENDPOINTS } from "@/shared/config/api";
import { apiFetch } from "@/shared/services/apiClient";
import { logger } from "@/shared/utils/logger";
import { handleApiError } from "@/shared/utils/errorHandler";
import { 
  Issue, 
  CreateIssueRequest, 
  UpdateIssueRequest, 
  SearchIssuesRequest, 
  IssueHistory,
  IssueApiResponse,
  IssueType
} from "../model/issueTypes";

// Создание задачи
export async function createIssue(projectId: number, data: CreateIssueRequest): Promise<void> {
  try {
    const res = await apiFetch(ENDPOINTS.issues.create(projectId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка создания задачи");
      throw new Error(errorMessage);
    }
    
    logger.success("Задача успешно создана", { projectId, title: data.title });
  } catch (error) {
    logger.error("Ошибка при создании задачи", error);
    throw error;
  }
}

// Получение задач проекта по спринту
export async function getIssuesBySprint(projectId: number, sprintId: number): Promise<IssueApiResponse[]> {
  try {
    const res = await apiFetch(ENDPOINTS.issues.bySprint(projectId, sprintId), {
      method: "GET",
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка получения задач по спринту");
      throw new Error(errorMessage);
    }

    const issues = await res.json();
    logger.success("Задачи по спринту успешно загружены", { projectId, sprintId, count: issues.length });
    return issues;
  } catch (error) {
    logger.error("Ошибка при получении задач по спринту", error);
    throw error;
  }
}

// Получение всех задач проекта
export async function getIssues(projectId: number): Promise<IssueApiResponse[]> {
  try {
    const res = await apiFetch(ENDPOINTS.issues.list(projectId), {
      method: "GET",
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка получения задач");
      throw new Error(errorMessage);
    }

    const issues = await res.json();
    logger.success("Задачи успешно загружены", { projectId, count: issues.length });
    return issues;
  } catch (error) {
    logger.error("Ошибка при получении задач", error);
    throw error;
  }
}

// Обновление задачи
export async function updateIssue(projectId: number, issueId: number, data: UpdateIssueRequest): Promise<void> {
  const url = ENDPOINTS.issues.update(projectId, issueId);
  
  // Проверяем, что ID валидны
  if (!projectId || !issueId) {
    throw new Error(`Некорректные ID: projectId=${projectId}, issueId=${issueId}`);
  }

  // Валидация обязательных полей
  if (!data.title || !data.description || !data.type) {
    throw new Error("Обязательные поля не заполнены: title, description, type");
  }

  // Удаляем пустые строки и undefined значения из данных
  const cleanData: Partial<UpdateIssueRequest> & { title: string; description: string; type: IssueType } = {
    title: data.title.trim(),
    description: data.description.trim(),
    type: data.type,
  };

  if (data.status) {
    cleanData.status = data.status;
  }
  if (data.priority) {
    cleanData.priority = data.priority;
  }
  if (data.assigneeEmail && data.assigneeEmail.trim() !== '') {
    cleanData.assigneeEmail = data.assigneeEmail.trim();
  }
  if (data.startDate && data.startDate.trim() !== '') {
    cleanData.startDate = data.startDate.trim();
  }
  if (data.endDate && data.endDate.trim() !== '') {
    cleanData.endDate = data.endDate.trim();
  }
  if (data.sprintId !== undefined && data.sprintId !== null && !isNaN(Number(data.sprintId))) {
    cleanData.sprintId = Number(data.sprintId);
  }

  logger.info("Обновление задачи", { 
    url, 
    projectId, 
    issueId, 
    originalData: data,
    cleanData 
  });

  try {
    const res = await apiFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cleanData),
    });

    if (!res.ok) {
      let errorMessage = await handleApiError(res, "Ошибка обновления задачи");
      let errorBody = null;
      
      // Специальная обработка для 404
      if (res.status === 404) {
        try {
          errorBody = await res.clone().json();
        } catch {
          try {
            const text = await res.clone().text();
            if (text) {
              errorBody = { raw: text };
              if (text.toLowerCase().includes('user')) {
                errorMessage = `Пользователь не найден. ${text}`;
              } else {
                errorMessage = `Задача с ID ${issueId} не найдена в проекте ${projectId}. Возможно, она была удалена или не существует.`;
              }
            }
          } catch {
            errorMessage = `Задача с ID ${issueId} не найдена в проекте ${projectId}. Возможно, она была удалена или не существует.`;
          }
        }
        
        if (errorBody?.message) {
          errorMessage = errorBody.message;
        }
      }
      
      logger.error("Ошибка обновления задачи", { 
        status: res.status, 
        statusText: res.statusText,
        url,
        projectId,
        issueId,
        requestData: cleanData,
        errorBody
      });
      
      throw new Error(errorMessage);
    }
    
    logger.success("Задача успешно обновлена", { projectId, issueId });
  } catch (error) {
    logger.error("Ошибка при обновлении задачи", error);
    throw error;
  }
}

// Удаление задачи
export async function deleteIssue(projectId: number, issueId: number): Promise<void> {
  // Проверяем, что ID валидны
  if (!projectId || !issueId || isNaN(projectId) || isNaN(issueId)) {
    throw new Error(`Некорректные ID: projectId=${projectId}, issueId=${issueId}`);
  }

  const url = ENDPOINTS.issues.delete(projectId, issueId);
  logger.info("Удаление задачи", { url, projectId, issueId });

  try {
    const res = await apiFetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка удаления задачи");
      
      logger.error("Ошибка удаления задачи", { 
        status: res.status, 
        statusText: res.statusText,
        url,
        projectId,
        issueId
      });
      
      throw new Error(errorMessage);
    }
    
    logger.success("Задача успешно удалена", { projectId, issueId });
  } catch (error) {
    logger.error("Ошибка при удалении задачи", error);
    throw error;
  }
}

// Изменение статуса задачи
export async function changeIssueStatus(
  projectId: number, 
  issueId: number, 
  action: 'test' | 'progress' | 'done' | 'open'
): Promise<void> {
  try {
    const res = await apiFetch(ENDPOINTS.issues.changeStatus(projectId, issueId, action), {
      method: "PUT",
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка изменения статуса задачи");
      throw new Error(errorMessage);
    }
    
    logger.success("Статус задачи успешно изменен", { projectId, issueId, action });
  } catch (error) {
    logger.error("Ошибка при изменении статуса задачи", error);
    throw error;
  }
}

// Поиск задач
export async function searchIssues(projectId: number, data: SearchIssuesRequest): Promise<Issue[]> {
  try {
    const queryParams = new URLSearchParams();
    if (data.status) queryParams.append('status', data.status);
    if (data.assigneeEmail) queryParams.append('assigneeEmail', data.assigneeEmail);
    if (data.sprintId) queryParams.append('sprintId', data.sprintId.toString());

    const res = await apiFetch(ENDPOINTS.issues.search(projectId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка поиска задач");
      throw new Error(errorMessage);
    }

    const issues = await res.json();
    logger.success("Поиск задач выполнен", { projectId, count: issues.length });
    return issues;
  } catch (error) {
    logger.error("Ошибка при поиске задач", error);
    throw error;
  }
}

// Получение истории изменений задачи
export async function getIssueHistory(projectId: number, issueId: number): Promise<IssueHistory[]> {
  const url = ENDPOINTS.issues.history(projectId, issueId);
  logger.info("Запрос истории задачи", { url, projectId, issueId });

  try {
    const res = await apiFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка получения истории задачи");
      
      logger.error("Ошибка получения истории", { 
        status: res.status, 
        statusText: res.statusText,
        projectId, 
        issueId,
        url 
      });
      
      throw new Error(errorMessage);
    }

    const history = await res.json();
    logger.success("История задачи загружена", { projectId, issueId, count: history.length });
    return history;
  } catch (error) {
    logger.error("Ошибка при получении истории задачи", error);
    throw error;
  }
}
