import { Issue, IssueStatus } from "@/entities/issue";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import { Calendar, User, Flag, Bug, Zap } from "lucide-react";

interface IssueCardProps {
  issue: Issue;
  onEdit?: (issue: Issue) => void;
  onDelete?: (issueId: number) => void;
  onChangeStatus?: (issueId: number, action: 'test' | 'progress' | 'done' | 'open') => void;
}

const statusColors = {
  OPEN: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  TESTING: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
};

const priorityColors = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
};

const typeIcons = {
  BUG: Bug,
  FEATURE: Zap,
};

export default function IssueCard({ issue, onEdit, onDelete, onChangeStatus }: IssueCardProps) {
  const TypeIcon = typeIcons[issue.type];

  const getStatusActions = (status: IssueStatus) => {
    switch (status) {
      case 'OPEN':
        return [{ action: 'progress' as const, label: 'В работу', color: 'bg-blue-500' }];
      case 'IN_PROGRESS':
        return [{ action: 'test' as const, label: 'На тест', color: 'bg-yellow-500' }];
      case 'TESTING':
        return [
          { action: 'done' as const, label: 'Завершить', color: 'bg-green-500' },
          { action: 'open' as const, label: 'Открыть', color: 'bg-gray-500' }
        ];
      case 'DONE':
        return [{ action: 'open' as const, label: 'Открыть', color: 'bg-gray-500' }];
      default:
        return [];
    }
  };

  const statusActions = getStatusActions(issue.status);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeIcon size={16} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">{issue.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[issue.status]}`}>
            {issue.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[issue.priority]}`}>
            {issue.priority}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        {issue.assignee && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>{issue.assignee.fullName}</span>
          </div>
        )}
        {issue.startDate && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(issue.startDate).toLocaleDateString()}</span>
          </div>
        )}
        {issue.sprint && (
          <div className="flex items-center gap-1">
            <Flag size={12} />
            <span>{issue.sprint.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Создатель: {issue.creator?.fullName || 'Не указан'}
        </div>
        
        <div className="flex items-center gap-2">
          {statusActions.map(({ action, label, color }) => (
            <UniversalButton
              key={action}
              onClick={() => onChangeStatus?.(issue.id, action)}
              variant="outline"
              className={`text-xs ${color} border-0 text-white`}
            >
              {label}
            </UniversalButton>
          ))}
          
          {onEdit && (
            <UniversalButton
              onClick={() => onEdit(issue)}
              variant="outline"
              className="text-xs"
            >
              Редактировать
            </UniversalButton>
          )}
          
          {onDelete && (
            <UniversalButton
              onClick={() => onDelete(issue.id)}
              variant="outline"
              className="text-xs text-red-600 border-red-300 hover:bg-red-50"
            >
              Удалить
            </UniversalButton>
          )}
        </div>
      </div>
    </div>
  );
}
