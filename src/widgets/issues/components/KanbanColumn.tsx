import { Issue, IssueStatus } from '@/entities/issue';
import IssueCard from './IssueCard';
import { ISSUE_STATUS } from '@/shared/constants';

interface KanbanColumnProps {
  title: string;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onDeleteIssue: (issueId: number) => void;
  onDrop: (issueId: number, newStatus: IssueStatus) => void;
}

const getStatusFromTitle = (title: string): IssueStatus => {
  switch (title) {
    case 'К выполнению':
      return ISSUE_STATUS.OPEN;
    case 'В работе':
      return ISSUE_STATUS.IN_PROGRESS;
    case 'На тестировании':
      return ISSUE_STATUS.TESTING;
    case 'Выполнено':
      return ISSUE_STATUS.DONE;
    default:
      return ISSUE_STATUS.OPEN;
  }
};

export default function KanbanColumn({
  title,
  issues,
  onIssueClick,
  onDeleteIssue,
  onDrop
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const issueId = parseInt(e.dataTransfer.getData('text/plain'));
    const newStatus = getStatusFromTitle(title);
    onDrop(issueId, newStatus);
  };

  return (
    <div
      className="bg-gray-50 rounded-lg p-4 min-h-[600px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
            {issues.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onClick={onIssueClick}
            onDelete={onDeleteIssue}
            status={getStatusFromTitle(title)}
          />
        ))}
      </div>
    </div>
  );
}

