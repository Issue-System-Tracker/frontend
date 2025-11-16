/**
 * Получает локализованное название типа изменения задачи
 */
export const getChangeTypeLabel = (changeType: string): string => {
  const labels: Record<string, string> = {
    'STATUS_CHANGE': 'Изменение статуса',
    'TITLE_CHANGE': 'Изменение названия',
    'DESCRIPTION_CHANGE': 'Изменение описания',
    'PRIORITY_CHANGE': 'Изменение приоритета',
    'ASSIGNEE_CHANGE': 'Изменение исполнителя',
    'SPRINT_CHANGE': 'Изменение спринта',
  };
  return labels[changeType] || changeType;
};

