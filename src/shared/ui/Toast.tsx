"use client";

import { useEffect, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { logger } from '@/shared/utils/logger';
import { TIME_INTERVALS } from '@/shared/constants';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  offset?: number; // Смещение сверху для нескольких тостов
}

export default function Toast({ message, type = 'error', duration = 5000, onClose, offset = 0 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, TIME_INTERVALS.ANIMATION_TIMEOUT); // Время анимации исчезания (должно совпадать с duration в transition)
  }, [onClose]);

  useEffect(() => {
    // Воспроизведение звука для ошибок
    if (type === 'error') {
      const errorSound = new Audio('/sounds/error-sound.mp3');
      errorSound.volume = 0.5; // Уменьшаем громкость
      errorSound.play().catch(err => {
        logger.warn('Не удалось воспроизвести звук ошибки', err);
      });
    }

    // Анимация появления с небольшой задержкой
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Автоматическое закрытие
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(showTimer);
    };
  }, [duration, handleClose, type]);

  const icons = {
    error: <AlertCircle className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
        isVisible && !isExiting
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-full'
      }`}
      style={{ top: `${16 + offset}px` }}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[500px] ${styles[type]}`}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

