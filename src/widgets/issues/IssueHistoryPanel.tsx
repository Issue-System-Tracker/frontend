"use client";

import { Clock, User } from 'lucide-react';
import { IssueHistory } from '@/features/issue-management';
import { normalizeIso, formatDate } from '@/shared/utils/dateUtils';
import { getChangeTypeLabel } from '@/shared/utils/issueUtils';

interface IssueHistoryPanelProps {
  history: IssueHistory[];
  loading: boolean;
  error: string | null;
}

export default function IssueHistoryPanel({ history, loading, error }: IssueHistoryPanelProps) {
    return (
        <div className="w-1/2 flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">История изменений</h3>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-3 text-gray-600">Загрузка истории...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">История изменений пока пуста</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[...history]
                            .sort((a, b) => {
                                const da = new Date(normalizeIso(a.changeDate)).getTime();
                                const db = new Date(normalizeIso(b.changeDate)).getTime();
                                return db - da;
                            })
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-4 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex-col items-start justify-between mb-2">
                                        <div className="flex justify-between">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User size={16} className="text-gray-500" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {item.changedBy.fullName}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {item.changedBy.email}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-800 mb-1">
                                                {getChangeTypeLabel(item.changeType)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {formatDate(item.changeDate)}
                                            </span>
                                        </div>
                                    </div>
                                    {(item.oldValue || item.newValue) && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs font-medium text-gray-500 mb-1 block">
                                                        Было:
                                                    </span>
                                                    <span className="text-sm text-gray-700 bg-red-50 px-2 py-1 rounded">
                                                        {item.oldValue || '—'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-medium text-gray-500 mb-1 block">
                                                        Стало:
                                                    </span>
                                                    <span className="text-sm text-gray-700 bg-green-50 px-2 py-1 rounded">
                                                        {item.newValue || '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}


