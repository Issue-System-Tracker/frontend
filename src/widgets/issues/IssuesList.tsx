"use client";

import { useProjectStore } from '@/entities/project';
import { useIssueStore } from '@/entities/issue';
import { Issue, IssueStatus, IssueType, Priority } from '@/entities/issue';
import { Plus, Bug, Zap, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const getStatusIcon = (status: IssueStatus) => {
  switch (status) {
    case "OPEN":
      return <AlertCircle size={16} className="text-red-500" />;
    case "IN_PROGRESS":
      return <Clock size={16} className="text-yellow-500" />;
    case "TESTING":
      return <Clock size={16} className="text-blue-500" />;
    case "DONE":
      return <CheckCircle size={16} className="text-green-500" />;
    default:
      return <AlertCircle size={16} />;
  }
};

const getTypeIcon = (type: IssueType) => {
  switch (type) {
    case "BUG":
      return <Bug size={16} className="text-red-500" />;
    case "FEATURE":
      return <Zap size={16} className="text-blue-500" />;
    default:
      return <Zap size={16} />;
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "HIGH":
      return 'text-red-600 bg-red-100';
    case "MEDIUM":
      return 'text-yellow-600 bg-yellow-100';
    case "LOW":
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusColor = (status: IssueStatus) => {
  switch (status) {
    case "OPEN":
      return 'text-red-600 bg-red-100';
    case "IN_PROGRESS":
      return 'text-yellow-600 bg-yellow-100';
    case "TESTING":
      return 'text-blue-600 bg-blue-100';
    case "DONE":
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const IssueCard = ({ issue }: { issue: Issue }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        {getTypeIcon(issue.type)}
        <h3 className="font-semibold text-gray-900">{issue.title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {getStatusIcon(issue.status)}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
          {issue.status}
        </span>
      </div>
    </div>
    
    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{issue.description}</p>
    
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
          {issue.priority}
        </span>
        {issue.sprint && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {issue.sprint.name}
          </span>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        {issue.assignee ? `Назначен: ${issue.assignee.fullName}` : 'Не назначен'}
      </div>
    </div>
  </div>
);

export default function IssuesList() {
  const { selectedProject } = useProjectStore();
  const { issues } = useIssueStore();
  
  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Выберите проект</h2>
        <p className="text-gray-500">Для просмотра задач необходимо выбрать проект в боковой панели</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Задачи</h1>
          <p className="text-gray-600">Проект: {selectedProject.name}</p>
        </div>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Plus size={20} />
          Создать задачу
        </button>
      </div>

      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <AlertCircle size={48} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Нет задач</h2>
          <p className="text-gray-500 mb-4">В этом проекте пока нет задач</p>
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Plus size={20} />
            Создать первую задачу
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
