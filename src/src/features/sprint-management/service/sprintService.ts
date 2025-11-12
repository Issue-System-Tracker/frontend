import { 
  createSprint as createSprintApi,
  getSprints as getSprintsApi,
  updateSprint as updateSprintApi,
  deleteSprint as deleteSprintApi
} from "../api/sprintApi";
import { 
  CreateSprintRequest, 
  UpdateSprintRequest,
  Sprint 
} from "@/entities/sprint";
import { logger } from "@/shared/utils/logger";

// Создание спринта
export async function submitCreateSprint(projectId: number, data: CreateSprintRequest): Promise<void> {
  try {
    await createSprintApi(projectId, data);
    logger.success("Спринт успешно создан", { name: data.name, projectId });
  } catch (err: unknown) {
    logger.error("Ошибка создания спринта", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Получение спринтов проекта
export async function fetchSprints(projectId: number): Promise<Sprint[]> {
  try {
    const sprints = await getSprintsApi(projectId);
    logger.success("Спринты успешно загружены", { projectId, count: sprints.length });
    return sprints;
  } catch (err: unknown) {
    logger.error("Ошибка загрузки спринтов", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Обновление спринта
export async function submitUpdateSprint(projectId: number, sprintId: number, data: UpdateSprintRequest): Promise<void> {
  try {
    await updateSprintApi(projectId, sprintId, data);
    logger.success("Спринт успешно обновлен", { projectId, sprintId });
  } catch (err: unknown) {
    logger.error("Ошибка обновления спринта", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Удаление спринта
export async function submitDeleteSprint(projectId: number, sprintId: number): Promise<void> {
  try {
    await deleteSprintApi(projectId, sprintId);
    logger.success("Спринт успешно удален", { projectId, sprintId });
  } catch (err: unknown) {
    logger.error("Ошибка удаления спринта", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}
