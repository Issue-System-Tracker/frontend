"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Issue, UpdateIssueData, IssueType, IssueStatus } from '@/entities/issue';
import { useProjectStore } from '@/entities/project';
import { fetchIssueHistory } from '@/features/issue-management';
import { IssueHistory } from '@/features/issue-management';
import { X, Clock } from 'lucide-react';
import IssueHistoryPanel from './IssueHistoryPanel';
import { useSprints } from '@/entities/sprint/hooks/useSprints';
import { ISSUE_TYPE, ISSUE_STATUS } from '@/shared/constants';
import { logger } from '@/shared/utils/logger';
import CustomSelect from '@/shared/ui/inputs/CustomSelect';
import { IssueDescriptionEditor } from '@/shared/ui/rich-text';
import { isRichTextEmpty } from '@/shared/utils/htmlUtils';

interface EditIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  projectName?: string;
  externalUpdateInfo?: {
    changedBy?: string;
    hasNonStatusChanges: boolean;
    status?: IssueStatus;
  } | null;
  onUpdateIssue: (issueData: UpdateIssueData) => void;
}


export default function EditIssueModal({
  isOpen,
  onClose,
  issue,
  projectName,
  externalUpdateInfo,
  onUpdateIssue
}: EditIssueModalProps) {
  const { selectedProject } = useProjectStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>(ISSUE_TYPE.FEATURE);
  const [status, setStatus] = useState<IssueStatus>(ISSUE_STATUS.OPEN);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<IssueHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sprintId, setSprintId] = useState<number | null | undefined>(undefined);
  const [assigneeEmail, setAssigneeEmail] = useState<string | undefined>(undefined);
  const [statusOnlyWarning, setStatusOnlyWarning] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [initializedIssueId, setInitializedIssueId] = useState<number | null>(null);
  const [dirtyFields, setDirtyFields] = useState({
    title: false,
    description: false,
    type: false,
    status: false,
    sprintId: false,
    assigneeEmail: false,
  });
  const lastServerIssueRef = useRef<Issue | null>(null);
  
  const { sprints, loading: sprintsLoading } = useSprints(selectedProject?.id);

  // Отладочный лог для проверки загрузки спринтов
  useEffect(() => {
    logger.info("Состояние спринтов в EditIssueModal", { 
      count: sprints.length, 
      sprints: sprints,
      sprintsLoading,
      selectedProjectId: selectedProject?.id,
      currentSprintId: sprintId
    });
  }, [sprints, sprintsLoading, selectedProject?.id, sprintId]);

  // Инициализируем форму только при открытии новой задачи.
  // Это защищает ввод пользователя от перезаписи при внешних апдейтах.
  useEffect(() => {
    if (issue && isOpen && initializedIssueId !== issue.id) {
      setTitle(issue.title);
      setDescription(issue.description);
      setType(issue.type);
      setStatus(issue.status);
      setSprintId(issue.sprint?.id);
      setAssigneeEmail(issue.assignee?.email);
      setStatusOnlyWarning(null);
      setConflictWarning(null);
      setDirtyFields({
        title: false,
        description: false,
        type: false,
        status: false,
        sprintId: false,
        assigneeEmail: false,
      });
      lastServerIssueRef.current = issue;
      setInitializedIssueId(issue.id);
    }
  }, [issue, isOpen, initializedIssueId]);

  useEffect(() => {
    if (!isOpen || !issue || initializedIssueId !== issue.id || !lastServerIssueRef.current) {
      return;
    }

    const previous = lastServerIssueRef.current;
    const statusChanged = previous.status !== issue.status;
    const nonStatusChanged = previous.title !== issue.title
      || previous.description !== issue.description
      || previous.type !== issue.type
      || previous.priority !== issue.priority
      || (previous.assignee?.email ?? null) !== (issue.assignee?.email ?? null)
      || (previous.sprint?.id ?? null) !== (issue.sprint?.id ?? null);

    if (statusChanged && !dirtyFields.status) {
      setStatus(issue.status);
    }

    if (nonStatusChanged) {
      setConflictWarning("Задача была изменена другим пользователем в других полях. Ваш черновик сохранен локально, при сохранении вы можете перезаписать изменения.");
      setStatusOnlyWarning(null);
    } else if (statusChanged) {
      setStatusOnlyWarning("Статус задачи был изменен другим пользователем. Ваши введенные данные в форме сохранены.");
      setConflictWarning(null);
    }

    lastServerIssueRef.current = issue;
  }, [issue, isOpen, initializedIssueId, dirtyFields.status]);

  useEffect(() => {
    if (!isOpen || !externalUpdateInfo) {
      return;
    }

    const changedByText = externalUpdateInfo.changedBy
      ? ` (${externalUpdateInfo.changedBy})`
      : "";

    if (externalUpdateInfo.status && !dirtyFields.status) {
      setStatus(externalUpdateInfo.status);
    }
    if (externalUpdateInfo.hasNonStatusChanges) {
      setConflictWarning(`Задача была изменена другим пользователем${changedByText}. Ваши изменения сохранены локально, при сохранении можно перезаписать внешние правки.`);
      setStatusOnlyWarning(null);
    } else {
      setStatusOnlyWarning(`Статус задачи был изменен другим пользователем${changedByText}. Остальные введенные вами данные сохранены в форме.`);
    }
  }, [externalUpdateInfo, isOpen, dirtyFields.status]);


  const loadHistory = useCallback(async () => {
    if (!selectedProject || !issue) return;

    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const historyData = await fetchIssueHistory(selectedProject.id, issue.id);
      setHistory(historyData);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Ошибка загрузки истории");
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedProject, issue]);

  // Загрузка истории при открытии панели истории
  useEffect(() => {
    if (showHistory && selectedProject && issue) {
      loadHistory();
    }
  }, [showHistory, selectedProject, issue, loadHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !title.trim() || isRichTextEmpty(description)) return;

    if (conflictWarning) {
      const shouldSave = window.confirm(
        "Пока вы редактировали, другой пользователь изменил не только статус. Сохранить ваши изменения поверх текущих?"
      );
      if (!shouldSave) {
        return;
      }
    }

    onUpdateIssue({
      id: issue.id,
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      sprintId: sprintId === undefined ? undefined : (sprintId === null ? null : sprintId),
      assigneeEmail: assigneeEmail
    });

    handleClose();
  };

  const handleClose = () => {
    setInitializedIssueId(null);
    setStatusOnlyWarning(null);
    setConflictWarning(null);
    setDirtyFields({
      title: false,
      description: false,
      type: false,
      status: false,
      sprintId: false,
      assigneeEmail: false,
    });
    lastServerIssueRef.current = null;
    onClose();
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Блюр фона */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Модальное окно */}
      <div className={`relative bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-hidden flex transition-all duration-500 ease-in-out ${
        showHistory ? 'max-w-5xl w-full' : 'max-w-2xl w-full'
      }`}>
        {/* Основная часть формы */}
        <div className={`flex-shrink-0 transition-all duration-500 ease-in-out ${
          showHistory ? 'w-1/2 border-r border-gray-200' : 'w-full'
        }`}>
          {/* Заголовок */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Редактировать задачу</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  showHistory 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="История изменений"
              >
                <Clock size={18} />
                История
              </button>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Контент формы */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {statusOnlyWarning && !conflictWarning && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {statusOnlyWarning}
            </div>
          )}

          {conflictWarning && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {conflictWarning}
            </div>
          )}

          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название задачи *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirtyFields((prev) => ({ ...prev, title: true }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите название задачи"
              required
            />
          </div>

          {/* Описание (rich text + таблицы) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <IssueDescriptionEditor
              key={issue ? `issue-desc-${issue.id}` : 'closed'}
              value={description}
              onChange={(html) => {
                setDescription(html);
                setDirtyFields((prev) => ({ ...prev, description: true }));
              }}
              placeholder="Форматирование, списки и таблицы"
            />
          </div>

          {/* Тип */}
          <CustomSelect<IssueType>
            label="Тип задачи"
            value={type}
            options={[
              { value: ISSUE_TYPE.FEATURE, label: "Feature" },
              { value: ISSUE_TYPE.BUG, label: "Bug" },
            ]}
            onChange={(value) => {
              setType(value as IssueType);
              setDirtyFields((prev) => ({ ...prev, type: true }));
            }}
          />

          {/* Статус */}
          <CustomSelect<IssueStatus>
            label="Статус"
            value={status}
            options={[
              { value: ISSUE_STATUS.OPEN, label: "Open" },
              { value: ISSUE_STATUS.IN_PROGRESS, label: "In Progress" },
              { value: ISSUE_STATUS.TESTING, label: "Testing" },
              { value: ISSUE_STATUS.DONE, label: "Done" },
            ]}
            onChange={(value) => {
              setStatus(value as IssueStatus);
              setDirtyFields((prev) => ({ ...prev, status: true }));
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Исполнитель */}
            <CustomSelect<string>
              label="Исполнитель (необязательно)"
              value={assigneeEmail || null}
              options={selectedProject ? [
                { value: selectedProject.admin.email, label: `${selectedProject.admin.fullName} (Админ)` },
                ...(selectedProject.members
                  ?.filter((member) => member.email !== selectedProject.admin.email)
                  .map((member) => ({
                    value: member.email,
                    label: member.fullName,
                  })) || []),
              ] : []}
              onChange={(value) => {
                setAssigneeEmail(value || undefined);
                setDirtyFields((prev) => ({ ...prev, assigneeEmail: true }));
              }}
              emptyOptionLabel="Не назначен"
              placeholder="Выберите исполнителя"
            />

            {/* Спринт */}
            <div>
              <CustomSelect<number>
                label="Спринт (необязательно)"
                value={sprintId || null}
                options={sprints
                  .filter((sprint) => {
                    if (!sprint || !sprint.name) {
                      logger.warn("Пропущен спринт с некорректными данными", { sprint });
                      return false;
                    }
                    if (sprint.id === undefined || sprint.id === null) {
                      logger.error("У спринта нет ID! API должен возвращать ID согласно документации", { 
                        sprint,
                        allSprintKeys: Object.keys(sprint || {})
                      });
                      return false;
                    }
                    return true;
                  })
                  .map((sprint) => ({
                    value: sprint.id!,
                    label: sprint.name!,
                  }))}
                onChange={(value) => {
                  const sprintIdValue = value || null;
                  logger.info("Выбран спринт в EditIssueModal", { sprintIdValue, issueId: issue?.id });
                  setSprintId(sprintIdValue);
                  setDirtyFields((prev) => ({ ...prev, sprintId: true }));
                }}
                disabled={sprintsLoading}
                emptyOptionLabel="Не выбран"
                placeholder={sprintsLoading ? "Загрузка спринтов..." : "Выберите спринт"}
              />
              {sprints.length === 0 && !sprintsLoading && (
                <p className="text-xs text-gray-500 mt-1">В проекте пока нет спринтов</p>
              )}
              {sprintId && (
                <p className="text-xs text-green-600 mt-1">
                  Выбран спринт: {sprints.find(s => s.id === sprintId)?.name || `ID: ${sprintId}`}
                </p>
              )}
            </div>
          </div>

          {/* Проект (только для отображения) */}
          {projectName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Проект
              </label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
                {projectName}
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
        </div>
        </div>

        {/* Панель истории справа */}
        {showHistory && (
          <IssueHistoryPanel history={history} loading={historyLoading} error={historyError} />
        )}
      </div>
    </div>
  );
}
