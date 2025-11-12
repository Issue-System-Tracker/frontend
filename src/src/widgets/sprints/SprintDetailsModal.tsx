import { Sprint } from '@/entities/sprint';
import { Issue } from '@/entities/issue'
import { X, Calendar, Users, Bug, Zap, AlertCircle } from 'lucide-react';

interface SprintDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprint: Sprint | null;
  issues: Issue[];
}

export default function SprintDetailsModal({
  isOpen,
  onClose,
  sprint,
  issues
}: SprintDetailsModalProps) {
  if (!isOpen || !sprint) return null;

  const sprintIssues = issues.filter(issue => issue.sprint?.id === sprint.id);
  const completedIssues = sprintIssues.filter(issue => issue.status === 'DONE').length;
  const inProgressIssues = sprintIssues.filter(issue => issue.status === 'IN_PROGRESS').length;
  const todoIssues = sprintIssues.filter(issue => issue.status === 'OPEN').length;
  const totalIssues = sprintIssues.length;
  const progress = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;

  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const now = new Date();
  const isActive = now >= startDate && now <= endDate;
  const isCompleted = now > endDate;

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case "BUG":
        return <Bug size={14} className="text-red-500" />;
      case "FEATURE":
        return <Zap size={14} className="text-blue-500" />;
      default:
        return <AlertCircle size={14} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "TESTING":
        return "bg-yellow-100 text-yellow-800";
      case "OPEN":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DONE":
        return "Выполнено";
      case "IN_PROGRESS":
        return "В работе";
      case "TESTING":
        return "На тестировании";
      case "OPEN":
        return "К выполнению";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Блюр фона */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{sprint.name}</h2>
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 space-y-6">
          {/* Информация о спринте */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} />
                <span>Период: {startDate.toLocaleDateString('ru-RU')} - {endDate.toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={16} />
                <span>Всего задач: {totalIssues}</span>
              </div>
              <div className="text-sm text-gray-500">
                Длительность: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} дней
              </div>
            </div>

            {/* Прогресс */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Прогресс выполнения</span>
                <span>{completedIssues}/{totalIssues} задач</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(progress)}% выполнено
              </div>
            </div>
          </div>

          {/* Статистика по статусам */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">{todoIssues}</div>
              <div className="text-sm text-gray-500">К выполнению</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressIssues}</div>
              <div className="text-sm text-blue-500">В работе</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sprintIssues.filter(issue => issue.status === 'TESTING').length}
              </div>
              <div className="text-sm text-yellow-500">На тестировании</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedIssues}</div>
              <div className="text-sm text-green-500">Выполнено</div>
            </div>
          </div>

          {/* Список задач */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Задачи спринта</h3>
            {sprintIssues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <p>В этом спринте пока нет задач</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {sprintIssues.map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getIssueTypeIcon(issue.type)}
                          <h4 className="font-medium text-gray-900">{issue.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{issue.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {issue.assignee && (
                            <span>Назначен: {issue.assignee.fullName}</span>
                          )}
                          {issue.priority && (
                            <span>Приоритет: {issue.priority}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {getStatusText(issue.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
