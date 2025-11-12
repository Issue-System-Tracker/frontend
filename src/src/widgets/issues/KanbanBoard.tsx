"use client";

import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '@/entities/project';
import { useIssueStore } from '@/entities/issue';
import { Issue, IssueStatus, IssueType, Priority } from '@/entities/issue';
import { fetchIssues, submitCreateIssue, submitChangeIssueStatus, submitUpdateIssue, submitDeleteIssue } from '@/features/issue-management';
import { UpdateIssueRequest } from '@/features/issue-management';
import { CreateIssueRequest } from '@/features/issue-management';
import { Plus, Bug, Zap, AlertCircle, Trash2, Calendar } from 'lucide-react';
import CreateIssueModal from './CreateIssueModal';
import EditIssueModal from './EditIssueModal';
import Toast from '@/shared/ui/Toast';
import { logger } from '@/shared/utils/logger';

// Компонент для красивого отображения даты
const DateDisplay = ({ date, label }: { date?: string; label?: string }) => {
  if (!date) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });

    let statusClass = '';
    let statusText = '';

    if (diffDays < 0) {
      statusClass = 'text-red-500 bg-red-50';
      statusText = 'Просрочено';
    } else if (diffDays === 0) {
      statusClass = 'text-orange-500 bg-orange-50';
      statusText = 'Сегодня';
    } else if (diffDays <= 3) {
      statusClass = 'text-yellow-500 bg-yellow-50';
      statusText = 'Скоро';
    } else {
      statusClass = 'text-green-500 bg-green-50';
      statusText = 'В планах';
    }

    return (
      <div className="flex items-center gap-1 text-xs">
        <Calendar className="w-3 h-3 text-gray-400" />
        <span className="text-gray-600">{formattedDate}</span>
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
          {statusText}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      {label && <span>{label}:</span>}
      {formatDate(date)}
    </div>
  );
};

const getTypeIcon = (type: IssueType) => {
  switch (type) {
    case "BUG":
      return <Bug size={16} className="text-red-500" />;
    case "FEATURE":
      return <Zap size={16} className="text-blue-500" />;
    default:
      return <Zap size={16} />;
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "HIGH":
      return 'bg-red-500';
    case "MEDIUM":
      return 'bg-yellow-500';
    case "LOW":
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};


const IssueCard = ({
  issue,
  onClick,
  onDelete,
  status
}: {
  issue: Issue;
  onClick: (issue: Issue) => void;
  onDelete: (issueId: number) => void;
  status: IssueStatus;
}) => {
  // Определяем стили в зависимости от статуса
  const getStatusStyles = (status: IssueStatus) => {
    switch (status) {
      case "DONE":
        return "opacity-100 bg-white";
      case "IN_PROGRESS":
        return "opacity-100 bg-white";
      case "OPEN":
        return "opacity-100 bg-white";
      default:
        return "opacity-100 bg-white";
        // In Review
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', issue.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      onDelete(issue.id);
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group ${getStatusStyles(status)}`}
      onClick={() => onClick(issue)}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getTypeIcon(issue.type)}
          <h3 className="font-semibold text-gray-900 text-sm">{issue.title}</h3>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{issue.description}</p>

      <div className="mt-2 text-xs text-gray-500">
        {issue.assignee ? `Назначен: ${issue.assignee.fullName}` : 'Не назначен'}
      </div>

      <div className="mt-2 space-y-1">
        <DateDisplay date={issue.startDate} label="Начало" />
        <DateDisplay date={issue.endDate} label="Окончание" />
      </div>

      {/* Приоритет как цветной прямоугольник снизу */}
      <div className="mt-3 flex items-center justify-between">
        <div className={`w-full h-1 rounded-full ${getPriorityColor(issue.priority)}`}></div>
      </div>
    </div>
  );
};

const KanbanColumn = ({
  title,
  issues,
  onIssueClick,
  onDeleteIssue,
  onDrop
}: {
  title: string;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onDeleteIssue: (issueId: number) => void;
  onDrop: (issueId: number, newStatus: IssueStatus) => void;
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const issueId = parseInt(e.dataTransfer.getData('text/plain'));
    const newStatus = getStatusFromTitle(title);
    onDrop(issueId, newStatus);
  };

  const getStatusFromTitle = (title: string): IssueStatus => {
    switch (title) {
      case 'К выполнению':
        return "OPEN";
      case 'В работе':
        return "IN_PROGRESS";
      case 'На тестировании':
        return "TESTING";
      case 'Выполнено':
        return "DONE";
      default:
        return "OPEN";
    }
  };

  return (
    <div
      className="bg-gray-50 rounded-lg p-4 min-h-[600px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
            {issues.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={onIssueClick}
            onDelete={onDeleteIssue}
            status={getStatusFromTitle(title)}
          />
        ))}
      </div>
    </div>
  );
};

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
    "OPEN": allIssues.filter((issue: Issue) => issue.status === "OPEN"),
    "IN_PROGRESS": allIssues.filter((issue: Issue) => issue.status === "IN_PROGRESS"),
    "TESTING": allIssues.filter((issue: Issue) => issue.status === "TESTING"),
    "DONE": allIssues.filter((issue: Issue) => issue.status === "DONE"),
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
        case 'IN_PROGRESS':
          action = 'progress';
          break;
        case 'TESTING':
          action = 'test';
          break;
        case 'DONE':
          action = 'done';
          break;
        case 'OPEN':
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

  const handleUpdateIssue = async (issueData: {
    id: number;
    title: string;
    description: string;
    type: IssueType;
    status: IssueStatus;
    sprintId?: number;
    assigneeEmail?: string;
  }) => {
    if (!selectedProject) {
      addError("Проект не выбран");
      return;
    }

    // Проверяем корректность ID
    if (!issueData.id || !selectedProject.id) {
      addError(`Некорректные ID: projectId=${selectedProject.id}, issueId=${issueData.id}`);
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
          duration={5000}
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
          issues={issuesByStatus["OPEN"]}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="В работе"
          issues={issuesByStatus["IN_PROGRESS"]}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="На тестировании"
          issues={issuesByStatus["TESTING"]}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="Выполнено"
          issues={issuesByStatus["DONE"]}
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
