/**
 * Нормализует строку даты в ISO формат
 * Поддерживает различные форматы: числовые таймстемпы, строки с пробелами, без часового пояса
 */
export const normalizeIso = (value: string): string => {
  if (!value) return value;
  
  // Если это числовой таймстемп
  if (/^\d+$/.test(value)) {
    const num = Number(value);
    // Если похоже на секунды (10 знаков) — умножаем на 1000
    const ms = value.length <= 10 ? num * 1000 : num;
    return new Date(ms).toISOString();
  }
  
  let v = value.trim();
  
  // Заменяем пробел между датой и временем на 'T'
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(v)) {
    v = v.replace(' ', 'T');
  }
  
  // Если нет суффикса часового пояса, добавим 'Z'
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(v)) {
    v = `${v}Z`;
  }
  
  return v;
};

/**
 * Форматирует дату в локализованный формат
 * @param dateString - строка даты для форматирования
 * @param options - опции форматирования (по умолчанию: полная дата с временем)
 * @returns отформатированная строка даты или '—' если дата невалидна
 */
export const formatDate = (
  dateString: string,
  options?: {
    includeTime?: boolean;
    year?: 'numeric' | '2-digit';
  }
): string => {
  const normalized = normalizeIso(dateString);
  const date = new Date(normalized);
  
  if (isNaN(date.getTime())) return '—';
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: options?.year || 'numeric',
  };
  
  if (options?.includeTime !== false) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }
  
  return date.toLocaleDateString('ru-RU', formatOptions);
};

/**
 * Форматирует дату с индикатором статуса (просрочено, сегодня, скоро, в планах)
 * @param dateString - строка даты для форматирования
 * @param label - опциональная метка перед датой
 * @returns JSX элемент с датой и статусом
 */
export const formatDateWithStatus = (
  dateString: string,
  label?: string
): { formattedDate: string; statusClass: string; statusText: string } | null => {
  if (!dateString) return null;
  
  const normalized = normalizeIso(dateString);
  const date = new Date(normalized);
  
  if (isNaN(date.getTime())) return null;
  
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const formattedDate = date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
  
  let statusClass = '';
  let statusText = '';
  
  if (diffDays < 0) {
    statusClass = 'text-red-500 bg-red-50';
    statusText = 'Просрочено';
  } else if (diffDays === 0) {
    statusClass = 'text-orange-500 bg-orange-50';
    statusText = 'Сегодня';
  } else if (diffDays <= 3) {
    statusClass = 'text-yellow-500 bg-yellow-50';
    statusText = 'Скоро';
  } else {
    statusClass = 'text-green-500 bg-green-50';
    statusText = 'В планах';
  }
  
  return {
    formattedDate,
    statusClass,
    statusText,
  };
};

