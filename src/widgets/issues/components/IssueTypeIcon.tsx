import { Bug, Zap } from 'lucide-react';
import { IssueType } from '@/entities/issue';
import { ISSUE_TYPE } from '@/shared/constants';

interface IssueTypeIconProps {
  type: IssueType;
  size?: number;
  className?: string;
}

export default function IssueTypeIcon({ type, size = 16, className = '' }: IssueTypeIconProps) {
  switch (type) {
    case ISSUE_TYPE.BUG:
      return <Bug size={size} className={`text-red-500 ${className}`} />;
    case ISSUE_TYPE.FEATURE:
      return <Zap size={size} className={`text-blue-500 ${className}`} />;
    default:
      return <Zap size={size} className={className} />;
  }
}

