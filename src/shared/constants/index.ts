/**
 * Константы приложения
 */

// Интервалы времени (в миллисекундах)
export const TIME_INTERVALS = {
  AUTO_SLIDER_INTERVAL: 5000, // Интервал автопрокрутки слайдера
  ANIMATION_TIMEOUT: 500, // Таймаут анимации
  TOAST_DURATION: 5000, // Длительность показа Toast
  SOUND_TIMEOUT: 2000, // Максимальная задержка для звука
} as const;

// Статусы задач
export const ISSUE_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  TESTING: 'TESTING',
  DONE: 'DONE',
} as const;

// Типы задач
export const ISSUE_TYPE = {
  BUG: 'BUG',
  FEATURE: 'FEATURE',
} as const;

// Приоритеты задач
export const PRIORITY = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

// Цвета для статусов задач
export const STATUS_COLORS = {
  DONE: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  TESTING: 'bg-yellow-100 text-yellow-800',
  OPEN: 'bg-gray-100 text-gray-800',
} as const;

// Цвета для приоритетов
export const PRIORITY_COLORS = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
} as const;

// Тексты ошибок
export const ERROR_MESSAGES = {
  PROJECT_NOT_SELECTED: 'Проект не выбран',
  INVALID_IDS: 'Некорректные ID',
  ISSUE_NOT_FOUND: 'Задача не найдена',
  LOAD_ERROR: 'Ошибка загрузки данных',
  SAVE_ERROR: 'Ошибка сохранения данных',
  DELETE_ERROR: 'Ошибка удаления',
} as const;

