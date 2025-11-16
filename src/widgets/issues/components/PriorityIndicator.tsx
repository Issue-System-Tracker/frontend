import { Priority } from '@/entities/issue';
import { PRIORITY_COLORS } from '@/shared/constants';

interface PriorityIndicatorProps {
  priority: Priority;
  className?: string;
}

export default function PriorityIndicator({ priority, className = '' }: PriorityIndicatorProps) {
  const colorClass = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
  return <div className={`w-full h-1 rounded-full ${colorClass} ${className}`}></div>;
}

