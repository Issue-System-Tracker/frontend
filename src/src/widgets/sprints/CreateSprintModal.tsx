"use client";

import { useState } from "react";
import { CreateSprintRequest } from "@/entities/sprint";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import TextInput from "@/shared/ui/inputs/TextInput";
import { logger } from "@/shared/utils/logger";

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSprintRequest) => void;
}

export default function CreateSprintModal({ isOpen, onClose, onSubmit }: CreateSprintModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.startDate || !formData.endDate) {
      setError("Заполните все обязательные поля");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("Дата окончания должна быть позже даты начала");
      return;
    }

    // Диагностика данных
    logger.debug("CreateSprintModal: Данные формы", {
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      nameTrimmed: formData.name.trim()
    });

    try {
      setLoading(true);
      setError("");
      
      const sprintData = {
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      
      logger.debug("CreateSprintModal: Отправляем данные", sprintData);
      
      await onSubmit(sprintData);
      
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания спринта");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Создать спринт</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Название спринта"
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value as string }))}
            placeholder="Введите название спринта"
            required
            minLength={3}
            maxLength={100}
          />
          
          <TextInput
            label="Дата начала"
            type="date"
            value={formData.startDate}
            onChange={(value) => setFormData(prev => ({ ...prev, startDate: value as string }))}
            required
          />
          
          <TextInput
            label="Дата окончания"
            type="date"
            value={formData.endDate}
            onChange={(value) => setFormData(prev => ({ ...prev, endDate: value as string }))}
            required
          />
          
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
              disabled={loading || !formData.name.trim() || !formData.startDate || !formData.endDate}
            >
              {loading ? "Создание..." : "Создать спринт"}
            </UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}