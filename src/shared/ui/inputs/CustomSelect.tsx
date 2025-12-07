"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption<T = string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface CustomSelectProps<T = string | number> {
  label?: string;
  value?: T | null | undefined;
  options: SelectOption<T>[];
  onChange: (value: T | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  emptyOptionLabel?: string;
}

export default function CustomSelect<T extends string | number = string | number>({
  label,
  value,
  options,
  onChange,
  placeholder = "Выберите значение",
  disabled = false,
  required = false,
  className = "",
  emptyOptionLabel = "Не выбрано",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Закрытие при нажатии Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : (value === null || value === undefined ? "" : String(value));

  const handleSelect = (optionValue: T | null) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          bg-white text-left
          flex items-center justify-between
          transition-colors
          ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:border-gray-400"}
          ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label || placeholder}
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Опция для очистки значения (если не required) */}
          {!required && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-gray-100 transition-colors
                ${value === null || value === undefined ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}
              `}
            >
              {emptyOptionLabel}
            </button>
          )}

          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isDisabled = option.disabled || false;

            return (
              <button
                key={`option-${String(option.value)}-${index}`}
                type="button"
                onClick={() => !isDisabled && handleSelect(option.value)}
                disabled={isDisabled}
                className={`
                  w-full px-3 py-2 text-left text-sm
                  transition-colors
                  ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100"}
                  ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                role="option"
                aria-selected={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

