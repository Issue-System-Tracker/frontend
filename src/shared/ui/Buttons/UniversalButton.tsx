import React from "react";
import Link from "next/link";
import { UniversalButtonClient } from "./UniversalButtonClient";

interface UniversalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string; // Опциональная ссылка для навигации
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  // Кастомные цвета
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
}

export default function UniversalButton({
  children,
  onClick,
  href,
  type = "button",
  disabled = false,
  variant = "primary",
  className = "",
  backgroundColor,
  textColor,
  borderColor,
  hoverBackgroundColor,
  hoverTextColor,
}: UniversalButtonProps) {
  const baseClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-blue-500 text-white hover:opacity-95 disabled:opacity-50",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50",
    outline: "border border-gray-300 text-gray-700 hover:opacity-90 disabled:opacity-50"
  };

  // Создаем кастомные стили если переданы цвета
  const customStyles: React.CSSProperties = {};
  if (backgroundColor) customStyles.backgroundColor = backgroundColor;
  if (textColor) customStyles.color = textColor;
  if (borderColor) customStyles.borderColor = borderColor;

  // Создаем кастомные классы для hover эффектов
  const customHoverClasses = [];
  if (hoverBackgroundColor) {
    customHoverClasses.push(`hover:bg-[${hoverBackgroundColor}]`);
  }
  if (hoverTextColor) {
    customHoverClasses.push(`hover:text-[${hoverTextColor}]`);
  }

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${customHoverClasses.join(' ')} ${className}`;

  // Если есть href и нет onClick, используем Next.js Link для серверного рендеринга
  if (href && !onClick) {
    return (
      <Link
        href={href}
        className={buttonClasses}
        style={customStyles}
      >
        {children}
      </Link>
    );
  }

  // Если есть onClick или type submit, используем клиентский компонент
  return (
    <UniversalButtonClient
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={buttonClasses}
      style={customStyles}
    >
      {children}
    </UniversalButtonClient>
  );
}
