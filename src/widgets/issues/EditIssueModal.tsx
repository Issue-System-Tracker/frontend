"use client";

import { useState, useEffect, useCallback } from 'react';
import { Issue, UpdateIssueData, IssueType, IssueStatus } from '@/entities/issue';
import { useProjectStore } from '@/entities/project';
import { fetchIssueHistory } from '@/features/issue-management';
import { IssueHistory } from '@/features/issue-management';
import { X, Clock } from 'lucide-react';
import IssueHistoryPanel from './IssueHistoryPanel';
import { logger } from '@/shared/utils/logger';
import { useSprints } from '@/entities/sprint/hooks/useSprints';
import { ISSUE_TYPE, ISSUE_STATUS } from '@/shared/constants';

interface EditIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  projectName?: string;
  onUpdateIssue: (issueData: UpdateIssueData) => void;
}


export default function EditIssueModal({
  isOpen,
  onClose,
  issue,
  projectName,
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
  const [sprintId, setSprintId] = useState<number | undefined>(undefined);
  const [assigneeEmail, setAssigneeEmail] = useState<string | undefined>(undefined);
  
  const { sprints } = useSprints(selectedProject?.id);

  // Обновляем форму при изменении issue
  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setType(issue.type);
      setStatus(issue.status);
      setSprintId(issue.sprint?.id);
      setAssigneeEmail(issue.assignee?.email);
    }
  }, [issue]);


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
    if (!issue || !title.trim() || !description.trim()) return;

    onUpdateIssue({
      id: issue.id,
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      sprintId: sprintId,
      assigneeEmail: assigneeEmail
    });

    onClose();
  };

  const handleClose = () => {
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
        showHistory ? 'max-w-5xl w-full' : 'max-w-md w-full'
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
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название задачи *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите название задачи"
              required
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Опишите задачу подробно"
              required
            />
          </div>

          {/* Тип */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип задачи
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IssueType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={ISSUE_TYPE.FEATURE}>Feature</option>
              <option value={ISSUE_TYPE.BUG}>Bug</option>
            </select>
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={ISSUE_STATUS.OPEN}>Open</option>
              <option value={ISSUE_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={ISSUE_STATUS.TESTING}>Testing</option>
              <option value={ISSUE_STATUS.DONE}>Done</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Исполнитель */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Исполнитель <br /> (необязательно)
              </label>
              <select
                value={assigneeEmail || ""}
                onChange={(e) => setAssigneeEmail(e.target.value ? e.target.value : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Не назначен</option>
                {selectedProject && (
                  <>
                    <option value={selectedProject.admin.email}>
                      {selectedProject.admin.fullName} (Админ)
                    </option>
                    {selectedProject.members?.map((member) => (
                      <option key={member.email} value={member.email}>
                        {member.fullName}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Спринт */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Спринт <br /> (необязательно)
              </label>
              <select
                value={sprintId || ""}
                onChange={(e) => setSprintId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Не выбран</option>
                {sprints.map((sprint, index) => (
                  <option key={`sprint-${sprint.id}-${index}`} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
              {sprints.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">В проекте пока нет спринтов</p>
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
