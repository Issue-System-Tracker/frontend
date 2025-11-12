"use client";

import { useState } from 'react';
import { useProjectStore } from '@/entities/project';
import { useSprintStore } from '@/entities/sprint';
import { useIssueStore } from '@/entities/issue';
import { Sprint } from '@/entities/sprint';
import { Plus, Calendar, Users, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import CreateSprintModal from './CreateSprintModal';
import EditSprintModal from './EditSprintModal';

const SprintCard = ({ 
  sprint, 
  onEdit, 
  onDelete 
}: { 
  sprint: Sprint; 
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprintId: number) => void;
}) => {
  const { issues } = useIssueStore();
  const sprintIssues = issues.filter(issue => issue.sprint?.id === sprint.id);
  const completedIssues = sprintIssues.filter(issue => issue.status === 'DONE').length;
  const totalIssues = sprintIssues.length;
  const progress = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;

  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const isCompleted = now > endDate;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить этот спринт?')) {
      onDelete(sprint.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{sprint.name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{startDate.toLocaleDateString('ru-RU')} - {endDate.toLocaleDateString('ru-RU')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{totalIssues} задач</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : isActive ? (
            <Clock size={20} className="text-blue-500" />
          ) : (
            <Clock size={20} className="text-gray-400" />
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isCompleted 
              ? 'text-green-600 bg-green-100' 
              : isActive 
                ? 'text-blue-600 bg-blue-100' 
                : 'text-gray-600 bg-gray-100'
          }`}>
            {isCompleted ? 'Завершен' : isActive ? 'Активен' : 'Запланирован'}
          </span>
        </div>
      </div>

      {totalIssues > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Прогресс</span>
            <span>{completedIssues}/{totalIssues} задач</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {Math.round(progress)}% выполнено
          </div>
        </div>
      )}

      {/* Кнопки управления */}
      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(sprint)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          <Edit size={14} />
          Редактировать
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          <Trash2 size={14} />
          Удалить
        </button>
      </div>
    </div>
  );
};

export default function SprintsList() {
  const { selectedProject } = useProjectStore();
  const { 
    sprints, 
    addSprint, 
    updateSprint, 
    removeSprint 
  } = useSprintStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  
  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Calendar size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Выберите проект</h2>
        <p className="text-gray-500">Для просмотра спринтов необходимо выбрать проект в боковой панели</p>
      </div>
    );
  }

  const projectSprints = sprints.filter(sprint => sprint.project.id === selectedProject.id);

  const handleCreateSprint = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSprint(null);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setIsEditModalOpen(true);
  };

  const handleDeleteSprint = (sprintId: number) => {
    removeSprint(sprintId);
  };

  const handleSubmitSprint = (sprintData: {
    name: string;
    startDate: string;
    endDate: string;
  }) => {
    addSprint({
      ...sprintData,
      project: selectedProject,
      id: Date.now() // Временный ID
    } as Sprint);
    handleCloseCreateModal();
  };

  const handleUpdateSprint = (sprintData: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  }) => {
    updateSprint({
      id: sprintData.id,
      name: sprintData.name,
      startDate: sprintData.startDate,
      endDate: sprintData.endDate,
      project: selectedProject
    });
    handleCloseEditModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Спринты</h1>
          <p className="text-gray-600">Проект: {selectedProject.name}</p>
        </div>
        <button 
          onClick={handleCreateSprint}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          Создать спринт
        </button>
      </div>

      {projectSprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <Calendar size={48} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Нет спринтов</h2>
          <p className="text-gray-500 mb-4">В этом проекте пока нет спринтов</p>
          <button 
            onClick={handleCreateSprint}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Создать первый спринт
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projectSprints.map((sprint: Sprint) => (
            <SprintCard 
              key={sprint.id} 
              sprint={sprint} 
              onEdit={handleEditSprint}
              onDelete={handleDeleteSprint}
            />
          ))}
        </div>
      )}

      {/* Модальные окна */}
      <CreateSprintModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmitSprint}
      />
      
      <EditSprintModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        sprint={selectedSprint}
        onUpdateSprint={handleUpdateSprint}
      />
    </div>
  );
}
