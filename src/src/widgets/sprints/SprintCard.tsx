import { Sprint } from "@/entities/sprint";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import { Calendar, Flag } from "lucide-react";

interface SprintCardProps {
  sprint: Sprint;
  onEdit?: (sprint: Sprint) => void;
  onDelete?: (sprintId: number) => void;
  onSelect?: (sprint: Sprint) => void;
  onView?: (sprint: Sprint) => void;
}

export default function SprintCard({ sprint, onEdit, onDelete, onSelect, onView }: SprintCardProps) {
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const today = new Date();
  
  const isActive = today >= startDate && today <= endDate;
  const isPast = today > endDate;
  const isFuture = today < startDate;

  const getStatusColor = () => {
    if (isPast) return "bg-gray-100 text-gray-800";
    if (isActive) return "bg-green-100 text-green-800";
    if (isFuture) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = () => {
    if (isPast) return "Завершен";
    if (isActive) return "Активный";
    if (isFuture) return "Будущий";
    return "Неизвестно";
  };

  const handleCardClick = () => {
    if (onView) {
      onView(sprint);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">{sprint.name}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-500">
          Длительность: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} дней
        </div>
        
        <div className="flex items-center gap-2">
          {/* {onView && (
            <UniversalButton
              onClick={() => onView(sprint)}
              variant="outline"
              className="text-xs"
            >
              Просмотр
            </UniversalButton>
          )} */}
          
          {onSelect && (
            <UniversalButton
              onClick={() => onSelect(sprint)}
              variant="outline"
              className="text-xs"
            >
              Выбрать
            </UniversalButton>
          )}
          
          {onEdit && (
            <UniversalButton
              onClick={() => onEdit(sprint)}
              variant="outline"
              className="text-xs"
            >
              Редактировать
            </UniversalButton>
          )}
          
          {onDelete && (
            <UniversalButton
              onClick={() => onDelete(sprint.id)}
              variant="outline"
              className="text-xs text-red-600 border-red-300 hover:bg-red-50"
            >
              Удалить
            </UniversalButton>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>Начало: {startDate.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>Окончание: {endDate.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
