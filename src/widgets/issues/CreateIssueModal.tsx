"use client";

import { useState, useEffect } from "react";
import { useProjectStore } from "@/entities/project";
import { CreateIssueRequest, IssueType, Priority } from "@/features/issue-management";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import TextInput from "@/shared/ui/inputs/TextInput";
import CustomSelect, { SelectOption } from "@/shared/ui/inputs/CustomSelect";
import { useSprints } from "@/entities/sprint/hooks/useSprints";
import { ISSUE_TYPE, PRIORITY } from "@/shared/constants";
import { logger } from "@/shared/utils/logger";

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIssueRequest) => void;
  projectId: number;
}

export default function CreateIssueModal({ isOpen, onClose, onSubmit }: CreateIssueModalProps) {
  const { selectedProject } = useProjectStore();
  const [formData, setFormData] = useState<CreateIssueRequest>({
    title: "",
    description: "",
    type: ISSUE_TYPE.BUG,
    priority: PRIORITY.MEDIUM,
    startDate: "",
    endDate: "",
    sprintId: undefined,
    assigneeEmail: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { sprints, loading: sprintsLoading } = useSprints(selectedProject?.id);

  // Отладочный лог для проверки загрузки спринтов
  useEffect(() => {
    logger.info("Состояние спринтов в CreateIssueModal", { 
      count: sprints.length, 
      sprints: sprints,
      sprintsLoading,
      selectedProjectId: selectedProject?.id
    });
  }, [sprints, sprintsLoading, selectedProject?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Заполните все обязательные поля");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Очищаем данные от undefined значений
      const submitData: CreateIssueRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        priority: formData.priority,
      };
      
      // Добавляем только если есть значения
      if (formData.startDate) {
        submitData.startDate = formData.startDate;
      }
      if (formData.endDate) {
        submitData.endDate = formData.endDate;
      }
      if (formData.sprintId) {
        // Используем ID напрямую - API должен возвращать ID согласно документации
        submitData.sprintId = formData.sprintId;
        const selectedSprint = sprints.find(s => s.id === formData.sprintId);
        logger.info("Привязка issue к спринту", { 
          sprintId: formData.sprintId,
          sprintName: selectedSprint?.name || "не найден"
        });
      }
      if (formData.assigneeEmail) {
        submitData.assigneeEmail = formData.assigneeEmail;
      }
      
      logger.info("Отправляем данные задачи", submitData);
      
      await onSubmit(submitData);
      setFormData({
        title: "",
        description: "",
        type: ISSUE_TYPE.BUG,
        priority: PRIORITY.MEDIUM,
        startDate: "",
        endDate: "",
        sprintId: undefined,
        assigneeEmail: undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания задачи");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Создать задачу</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Название задачи"
              value={formData.title}
              onChange={(value) => setFormData(prev => ({ ...prev, title: value as string }))}
              placeholder="Введите название задачи"
              required
              minLength={3}
              maxLength={100}
            />
            
            <CustomSelect<IssueType>
              label="Тип задачи"
              value={formData.type}
              options={[
                { value: ISSUE_TYPE.BUG, label: "Ошибка" },
                { value: ISSUE_TYPE.FEATURE, label: "Функция" },
              ]}
              onChange={(value) => setFormData(prev => ({ ...prev, type: value as IssueType }))}
              required
            />
          </div>

          <TextInput
            label="Описание задачи"
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value as string }))}
            placeholder="Введите описание задачи"
            required
            minLength={5}
            maxLength={1000}
            multiline
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CustomSelect<Priority>
              label="Приоритет"
              value={formData.priority}
              options={[
                { value: PRIORITY.HIGH, label: "Высокий" },
                { value: PRIORITY.MEDIUM, label: "Средний" },
                { value: PRIORITY.LOW, label: "Низкий" },
              ]}
              onChange={(value) => setFormData(prev => ({ ...prev, priority: value as Priority }))}
            />
            
            <TextInput
              label="Дата начала"
              type="date"
              value={formData.startDate || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, startDate: value as string }))}
            />
            
            <TextInput
              label="Дата окончания"
              type="date"
              value={formData.endDate || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, endDate: value as string }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect<string>
              label="Исполнитель (необязательно)"
              value={formData.assigneeEmail || null}
              options={selectedProject ? [
                { value: selectedProject.admin.email, label: `${selectedProject.admin.fullName} (Админ)` },
                ...(selectedProject.members
                  ?.filter((member) => member.email !== selectedProject.admin.email)
                  .map((member) => ({
                    value: member.email,
                    label: member.fullName,
                  })) || []),
              ] : []}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                assigneeEmail: value || undefined 
              }))}
              emptyOptionLabel="Не назначен"
              placeholder="Выберите исполнителя"
            />
            
            <div>
              <CustomSelect<number>
                label="Спринт (необязательно)"
                value={formData.sprintId || null}
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
                  const sprintIdValue = value || undefined;
                  logger.info("Выбран спринт", { sprintIdValue, formData: { ...formData, sprintId: sprintIdValue } });
                  setFormData(prev => ({ 
                    ...prev, 
                    sprintId: sprintIdValue
                  }));
                }}
                disabled={sprintsLoading}
                emptyOptionLabel="Не выбран"
                placeholder={sprintsLoading ? "Загрузка спринтов..." : "Выберите спринт"}
              />
              {sprints.length === 0 && !sprintsLoading && (
                <p className="text-xs text-gray-500 mt-1">В проекте пока нет спринтов</p>
              )}
              {formData.sprintId && (
                <p className="text-xs text-green-600 mt-1">
                  Выбран спринт: {sprints.find(s => s.id === formData.sprintId)?.name || `ID: ${formData.sprintId}`}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <UniversalButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </UniversalButton>
            <UniversalButton
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
            >
              {loading ? "Создание..." : "Создать задачу"}
            </UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}