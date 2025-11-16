import { Calendar } from 'lucide-react';
import { formatDateWithStatus } from '@/shared/utils/dateUtils';

interface DateDisplayProps {
  date?: string;
  label?: string;
}

export default function DateDisplay({ date, label }: DateDisplayProps) {
  if (!date) return null;

  const dateInfo = formatDateWithStatus(date);
  if (!dateInfo) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      {label && <span>{label}:</span>}
      <div className="flex items-center gap-1 text-xs">
        <Calendar className="w-3 h-3 text-gray-400" />
        <span className="text-gray-600">{dateInfo.formattedDate}</span>
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${dateInfo.statusClass}`}>
          {dateInfo.statusText}
        </span>
      </div>
    </div>
  );
}

