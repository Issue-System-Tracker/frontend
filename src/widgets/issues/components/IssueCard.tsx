import { Issue, IssueStatus } from '@/entities/issue';
import { Trash2 } from 'lucide-react';
import DateDisplay from './DateDisplay';
import IssueTypeIcon from './IssueTypeIcon';
import PriorityIndicator from './PriorityIndicator';

interface IssueCardProps {
  issue: Issue;
  onClick: (issue: Issue) => void;
  onDelete: (issueId: number) => void;
  status: IssueStatus;
}

export default function IssueCard({ issue, onClick, onDelete, status }: IssueCardProps) {
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
      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer group opacity-100 bg-white"
      onClick={() => onClick(issue)}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <IssueTypeIcon type={issue.type} />
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

      <div className="mt-3 flex items-center justify-between">
        <PriorityIndicator priority={issue.priority} />
      </div>
    </div>
  );
}

