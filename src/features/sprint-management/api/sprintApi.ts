import { ENDPOINTS } from "@/shared/config/api";
import { apiFetch } from "@/shared/services/apiClient";
import { logger } from "@/shared/utils/logger";
import { handleApiError } from "@/shared/utils/errorHandler";
import { 
  Sprint, 
  CreateSprintRequest, 
  UpdateSprintRequest 
} from "../model/sprintTypes";

// Создание спринта
export async function createSprint(projectId: number, data: CreateSprintRequest): Promise<void> {
  try {
    const res = await apiFetch(ENDPOINTS.sprints.create(projectId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate
      }),
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка создания спринта");
      throw new Error(errorMessage);
    }
    
    logger.success("Спринт успешно создан", { name: data.name, projectId });
  } catch (error) {
    logger.error("Ошибка при создании спринта", error);
    throw error;
  }
}

// Получение спринтов проекта
export async function getSprints(projectId: number): Promise<Sprint[]> {
  try {
    const res = await apiFetch(ENDPOINTS.sprints.list(projectId), {
      method: "GET",
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка получения спринтов");
      throw new Error(errorMessage);
    }

    const sprints = await res.json();
    logger.success("Спринты успешно загружены", { projectId, count: sprints.length });
    return sprints;
  } catch (error) {
    logger.error("Ошибка при получении спринтов", error);
    throw error;
  }
}

// Обновление спринта
export async function updateSprint(projectId: number, sprintId: number, data: UpdateSprintRequest): Promise<void> {
  try {
    const res = await apiFetch(ENDPOINTS.sprints.update(projectId, sprintId), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка обновления спринта");
      throw new Error(errorMessage);
    }
    
    logger.success("Спринт успешно обновлен", { projectId, sprintId });
  } catch (error) {
    logger.error("Ошибка при обновлении спринта", error);
    throw error;
  }
}

// Удаление спринта
export async function deleteSprint(projectId: number, sprintId: number): Promise<void> {
  try {
    const res = await apiFetch(ENDPOINTS.sprints.delete(projectId, sprintId), {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorMessage = await handleApiError(res, "Ошибка удаления спринта");
      throw new Error(errorMessage);
    }
    
    logger.success("Спринт успешно удален", { projectId, sprintId });
  } catch (error) {
    logger.error("Ошибка при удалении спринта", error);
    throw error;
  }
}
