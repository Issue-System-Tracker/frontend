import { 
  createProject as createProjectApi,
  getProjects as getProjectsApi,
  addProjectMember as addProjectMemberApi,
  removeProjectMember as removeProjectMemberApi,
  deleteProject as deleteProjectApi
} from "../api/projectApi";
import { CreateProjectRequest, AddMemberRequest } from "../model/projectTypes";
import { Project } from "@/entities/project";
import { logger } from "@/shared/utils/logger";

// Создание проекта
export async function submitCreateProject(data: CreateProjectRequest): Promise<void> {
  try {
    await createProjectApi(data);
    logger.success("Проект успешно создан", { name: data.name });
  } catch (err: unknown) {
    logger.error("Ошибка создания проекта", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Получение списка проектов
export async function fetchProjects(): Promise<Project[]> {
  try {
    const projectResponses = await getProjectsApi();
    logger.success("Проекты успешно загружены", { count: projectResponses.length });
    // Маппинг ProjectResponse[] в доменную модель Project[]
    return projectResponses.map(response => ({
      id: response.id,
      name: response.name,
      admin: {
        id: response.adminEmail,
        email: response.adminEmail,
        fullName: response.adminEmail.split('@')[0],
        roles: response.isAdmin ? ['ADMIN'] : []
      },
      members: response.members.map(memberEmail => ({
        id: memberEmail,
        email: memberEmail,
        fullName: memberEmail.split('@')[0],
        roles: []
      }))
    }));
  } catch (err: unknown) {
    logger.error("Ошибка загрузки проектов", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Добавление участника в проект
export async function submitAddProjectMember(projectId: number, data: AddMemberRequest): Promise<void> {
  try {
    await addProjectMemberApi(projectId, data);
    logger.success("Участник успешно добавлен", { projectId, memberEmail: data.memberEmail });
  } catch (err: unknown) {
    logger.error("Ошибка добавления участника", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Удаление участника из проекта
export async function submitRemoveProjectMember(projectId: number, memberEmail: string): Promise<void> {
  try {
    await removeProjectMemberApi(projectId, memberEmail);
    logger.success("Участник успешно удален", { projectId, memberEmail });
  } catch (err: unknown) {
    logger.error("Ошибка удаления участника", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}

// Удаление проекта
export async function submitDeleteProject(projectId: number): Promise<void> {
  try {
    await deleteProjectApi(projectId);
    logger.success("Проект успешно удален", { projectId });
  } catch (err: unknown) {
    logger.error("Ошибка удаления проекта", err);
    if (err instanceof Error) throw err;
    throw new Error("Серверная ошибка, попробуйте позже");
  }
}
