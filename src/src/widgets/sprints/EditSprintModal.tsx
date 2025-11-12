"use client";

import { useState, useEffect } from 'react';
import { Sprint } from '@/entities/sprint';
import { X } from 'lucide-react';

interface EditSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprint: Sprint | null;
  onUpdateSprint: (sprintData: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export default function EditSprintModal({
  isOpen,
  onClose,
  sprint,
  onUpdateSprint
}: EditSprintModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Обновляем форму при изменении sprint
  useEffect(() => {
    if (sprint) {
      setName(sprint.name);
      setStartDate(sprint.startDate);
      setEndDate(sprint.endDate);
    }
  }, [sprint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprint || !name.trim() || !startDate || !endDate) return;

    onUpdateSprint({
      id: sprint.id,
      name: name.trim(),
      startDate,
      endDate
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !sprint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Блюр фона */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Редактировать спринт</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название спринта *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите название спринта"
              required
            />
          </div>

          {/* Дата начала */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата начала *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Дата окончания */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата окончания *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Проект (только для отображения) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Проект
            </label>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
              {sprint.project.name}
            </div>
          </div>

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
  );
}
