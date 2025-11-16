"use client";

import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '@/entities/project';
import { useIssueStore } from '@/entities/issue';
import { Issue, IssueStatus, UpdateIssueData } from '@/entities/issue';
import { fetchIssues, submitCreateIssue, submitChangeIssueStatus, submitUpdateIssue, submitDeleteIssue } from '@/features/issue-management';
import { UpdateIssueRequest } from '@/features/issue-management';
import { CreateIssueRequest } from '@/features/issue-management';
import { Plus, AlertCircle } from 'lucide-react';
import CreateIssueModal from './CreateIssueModal';
import EditIssueModal from './EditIssueModal';
import Toast from '@/shared/ui/Toast';
import { logger } from '@/shared/utils/logger';
import KanbanColumn from './components/KanbanColumn';
import { TIME_INTERVALS, ERROR_MESSAGES, ISSUE_STATUS } from '@/shared/constants';

export default function KanbanBoard() {
  const { selectedProject } = useProjectStore();
  const {
    issues,
    setIssues,
    removeIssue
  } = useIssueStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Array<{ id: string; message: string }>>([]);

  // Функция для добавления ошибки (максимум 3 одновременно)
  const addError = useCallback((message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setErrors(prev => {
      const newErrors = [...prev, { id, message }];
      return newErrors.slice(-3);
    });
  }, []);

  // Функция для удаления ошибки
  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const loadIssues = useCallback(async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      const issuesData = await fetchIssues(selectedProject.id);
      
      // Обновляем fullName для assignee и creator из данных проекта
      const enrichedIssues = issuesData.map(issue => {
        const enrichedIssue = { ...issue };
        
        // Обновляем ФИО исполнителя из проекта
        if (issue.assignee?.email) {
          const assigneeMember = selectedProject.members?.find(m => m.email === issue.assignee?.email);
          const assigneeAdmin = selectedProject.admin.email === issue.assignee.email ? selectedProject.admin : null;
          const assigneeData = assigneeMember || assigneeAdmin;
          
          if (assigneeData && enrichedIssue.assignee) {
            enrichedIssue.assignee = {
              ...enrichedIssue.assignee,
              fullName: assigneeData.fullName
            };
          }
        }
        
        // Обновляем ФИО создателя из проекта
        if (issue.creator?.email) {
          const creatorMember = selectedProject.members?.find(m => m.email === issue.creator?.email);
          const creatorAdmin = selectedProject.admin.email === issue.creator.email ? selectedProject.admin : null;
          const creatorData = creatorMember || creatorAdmin;
          
          if (creatorData) {
            enrichedIssue.creator = {
              ...enrichedIssue.creator,
              fullName: creatorData.fullName
            };
          }
        }
        
        return enrichedIssue;
      });
      
      setIssues(enrichedIssues);
    } catch (err) {
      addError(err instanceof Error ? err.message : "Ошибка загрузки задач");
    } finally {
      setLoading(false);
    }
  }, [selectedProject, setIssues, addError]);

  useEffect(() => {
    if (selectedProject) {
      loadIssues();
    }
  }, [selectedProject, loadIssues]);

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Выберите проект</h2>
        <p className="text-gray-500">Для просмотра задач необходимо выбрать проект в боковой панели</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="text-gray-600 mt-4">Загрузка задач...</p>
      </div>
    );
  }

  const allIssues = issues;

  const issuesByStatus = {
    [ISSUE_STATUS.OPEN]: allIssues.filter((issue: Issue) => issue.status === ISSUE_STATUS.OPEN),
    [ISSUE_STATUS.IN_PROGRESS]: allIssues.filter((issue: Issue) => issue.status === ISSUE_STATUS.IN_PROGRESS),
    [ISSUE_STATUS.TESTING]: allIssues.filter((issue: Issue) => issue.status === ISSUE_STATUS.TESTING),
    [ISSUE_STATUS.DONE]: allIssues.filter((issue: Issue) => issue.status === ISSUE_STATUS.DONE),
  };

  const handleCreateIssue = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedIssue(null);
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsEditModalOpen(true);
  };

  const handleDropIssue = async (issueId: number, newStatus: IssueStatus) => {
    if (!selectedProject) return;

    try {
      // Определяем действие на основе нового статуса
      let action: 'test' | 'progress' | 'done' | 'open';
      switch (newStatus) {
        case ISSUE_STATUS.IN_PROGRESS:
          action = 'progress';
          break;
        case ISSUE_STATUS.TESTING:
          action = 'test';
          break;
        case ISSUE_STATUS.DONE:
          action = 'done';
          break;
        case ISSUE_STATUS.OPEN:
          action = 'open';
          break;
        default:
          return;
      }

      await submitChangeIssueStatus(selectedProject.id, issueId, action);
      await loadIssues(); // Перезагружаем данные
    } catch (err) {
      addError(err instanceof Error ? err.message : "Ошибка изменения статуса");
    }
  };

  const handleDeleteIssue = async (issueId: number) => {
    if (!selectedProject) {
      addError("Проект не выбран");
      return;
    }

    try {
      const projectId = Number(selectedProject.id);
      const parsedIssueId = Number(issueId);

      if (isNaN(projectId) || isNaN(parsedIssueId)) {
        throw new Error(`Некорректные ID: projectId=${projectId}, issueId=${parsedIssueId}`);
      }

      // Удаляем задачу на сервере
      await submitDeleteIssue(projectId, parsedIssueId);
      
      // Удаляем из локального состояния
      removeIssue(parsedIssueId);
      
      // Перезагружаем список задач для синхронизации
      await loadIssues();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка удаления задачи";
      addError(errorMessage);
      logger.error("Ошибка удаления задачи", {
        projectId: selectedProject?.id,
        issueId,
        error: err
      });
    }
  };

  const handleSubmitIssue = async (issueData: CreateIssueRequest) => {
    if (!selectedProject) return;

    try {
      await submitCreateIssue(selectedProject.id, issueData);
      await loadIssues(); // Перезагружаем данные
      handleCloseCreateModal();
    } catch (err) {
      addError(err instanceof Error ? err.message : "Ошибка создания задачи");
    }
  };

  const handleUpdateIssue = async (issueData: UpdateIssueData) => {
    if (!selectedProject) {
      addError("Проект не выбран");
      return;
    }

    // Проверяем корректность ID
    if (!issueData.id || !selectedProject.id) {
      addError(`${ERROR_MESSAGES.INVALID_IDS}: projectId=${selectedProject.id}, issueId=${issueData.id}`);
      logger.error("Некорректные ID при обновлении задачи", {
        projectId: selectedProject.id,
        issueId: issueData.id,
        selectedIssue: selectedIssue
      });
      return;
    }

    try {
      // Убеждаемся, что ID являются числами
      const projectId = Number(selectedProject.id);
      const issueId = Number(issueData.id);

      if (isNaN(projectId) || isNaN(issueId)) {
        throw new Error(`Некорректные ID: projectId=${projectId}, issueId=${issueId}`);
      }

      // Находим существующую задачу, чтобы сохранить все её данные
      // Используем selectedIssue, если он есть (более актуальные данные), иначе ищем в списке
      let existingIssue = selectedIssue && selectedIssue.id === issueId 
        ? selectedIssue 
        : issues.find(i => i.id === issueId);
      
      if (!existingIssue) {
        // Попробуем перезагрузить задачи, возможно данные устарели
        logger.warn("Задача не найдена в локальном списке, перезагружаем данные...");
        await loadIssues();
        existingIssue = issues.find(i => i.id === issueId);
        if (!existingIssue) {
          throw new Error(`Задача с ID ${issueId} не найдена в проекте ${projectId}. Возможно, она была удалена.`);
        }
      }

      // Формируем объект обновления с сохранением всех существующих данных
      const updateData: UpdateIssueRequest = {
        title: issueData.title.trim(),
        description: issueData.description.trim(),
        type: issueData.type,
        status: issueData.status,
        // Сохраняем существующие данные, которые не редактируются в модалке
        priority: existingIssue.priority,
      };

      // Используем assigneeEmail из формы, если он указан, иначе сохраняем существующий или не указываем
      if (issueData.assigneeEmail !== undefined) {
        // Если assigneeEmail пустая строка или null, не добавляем поле (оставляем без исполнителя)
        if (issueData.assigneeEmail && issueData.assigneeEmail.trim() !== '') {
          updateData.assigneeEmail = issueData.assigneeEmail.trim();
        }
        // Если issueData.assigneeEmail пустое или undefined, не добавляем поле в updateData
        // Это позволит серверу обработать удаление назначения, если API поддерживает
      } else if (existingIssue.assignee?.email) {
        // Если в форме не указан новый исполнитель, сохраняем существующего
        updateData.assigneeEmail = existingIssue.assignee.email;
      }

      // Сохраняем даты из существующей задачи, если они есть и не пустые
      if (existingIssue.startDate && existingIssue.startDate.trim() !== '') {
        updateData.startDate = existingIssue.startDate.trim();
      }
      if (existingIssue.endDate && existingIssue.endDate.trim() !== '') {
        updateData.endDate = existingIssue.endDate.trim();
      }

      // Добавляем sprintId если он указан (из формы или из существующей задачи)
      const sprintId = issueData.sprintId !== undefined ? issueData.sprintId : existingIssue.sprint?.id;
      if (sprintId !== undefined && sprintId !== null && !isNaN(Number(sprintId))) {
        updateData.sprintId = Number(sprintId);
      }

      logger.debug("Обновление задачи - детали", {
        projectId,
        issueId,
        selectedProject: {
          id: selectedProject.id,
          name: selectedProject.name
        },
        existingIssue: {
          id: existingIssue.id,
          title: existingIssue.title,
          assignee: existingIssue.assignee?.email,
          priority: existingIssue.priority,
          sprintId: existingIssue.sprint?.id,
          status: existingIssue.status,
          startDate: existingIssue.startDate,
          endDate: existingIssue.endDate
        },
        updateData,
        url: `PUT /api/projects/${projectId}/issues/${issueId}`
      });

      await submitUpdateIssue(projectId, issueId, updateData);
      await loadIssues(); // Перезагружаем данные
      handleCloseEditModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка обновления задачи";
      addError(errorMessage);
      logger.error("Ошибка обновления задачи", {
        projectId: selectedProject.id,
        issueId: issueData.id,
        error: err
      });
    }
  };

  return (
    <div className="space-y-6">
      {errors.map((error, index) => (
        <Toast
          key={error.id}
          message={error.message}
          type="error"
          duration={TIME_INTERVALS.TOAST_DURATION}
          onClose={() => removeError(error.id)}
          offset={index * 80} // Смещение для каждого тоста (80px между тостами)
        />
      ))}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
        </div>
        <button
          onClick={() => handleCreateIssue()}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Создать задачу
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KanbanColumn
          title="К выполнению"
          issues={issuesByStatus[ISSUE_STATUS.OPEN]}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="В работе"
          issues={issuesByStatus[ISSUE_STATUS.IN_PROGRESS]}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="На тестировании"
          issues={issuesByStatus[ISSUE_STATUS.TESTING]}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="Выполнено"
          issues={issuesByStatus[ISSUE_STATUS.DONE]}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
      </div>

      {/* Модальные окна */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        projectId={selectedProject.id}
        onSubmit={handleSubmitIssue}
      />

      <EditIssueModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        issue={selectedIssue}
        onUpdateIssue={handleUpdateIssue}
      />
    </div>
  );
}
