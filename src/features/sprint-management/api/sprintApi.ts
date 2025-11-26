import { ENDPOINTS } from "@/shared/config/api";
import { apiFetch } from "@/shared/services/apiClient";
import { logger } from "@/shared/utils/logger";
import { handleApiError } from "@/shared/utils/errorHandler";
import {
  Sprint,
  CreateSprintRequest,
  UpdateSprintRequest
} from "../model/sprintTypes";

// Сырые данные спринта из API: могут содержать sprintId вместо id
type SprintApiRaw = Sprint & {
  sprintId?: number;
};

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

    const sprintsRaw = (await res.json()) as SprintApiRaw[];
    
    // Нормализуем структуру спринтов: API возвращает sprintId, преобразуем в id для внутреннего использования
    const sprints: Sprint[] = sprintsRaw.map((sprint) => {
      // API возвращает sprintId вместо id
      if (sprint.sprintId !== undefined && sprint.id === undefined) {
        return {
          ...sprint,
          id: sprint.sprintId,
          // Удаляем sprintId, оставляем только id
          sprintId: undefined
        };
      }
      // Если есть и id, и sprintId, приоритет у id
      if (sprint.id !== undefined) {
        return sprint;
      }
      // Если нет ни id, ни sprintId - это ошибка
      logger.error("Спринт без ID и sprintId!", { sprint });
      return sprint;
    });
    
    // Проверяем структуру ответа
    if (sprints.length > 0) {
      const firstSprint = sprints[0];
      logger.info("Структура спринтов с API", { 
        projectId, 
        count: sprints.length,
        firstSprint: firstSprint,
        firstSprintKeys: Object.keys(firstSprint || {}),
        firstSprintHasId: 'id' in (firstSprint || {}),
        // sprintId есть только в сыром ответе, поэтому отдельно не логируем его здесь
        firstSprintId: firstSprint?.id,
        allSprints: sprints
      });
      
      // Проверяем, что у всех спринтов есть ID
      const sprintsWithoutId = sprints.filter((s: Sprint) => !s.id && s.id !== 0);
      if (sprintsWithoutId.length > 0) {
        logger.error("Обнаружены спринты без ID после нормализации! API должен возвращать sprintId", {
          count: sprintsWithoutId.length,
          sprintsWithoutId: sprintsWithoutId
        });
      }
    }
    
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
