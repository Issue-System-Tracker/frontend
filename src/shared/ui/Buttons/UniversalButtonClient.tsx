"use client";

import React from "react";

interface UniversalButtonClientProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function UniversalButtonClient({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  style,
}: UniversalButtonClientProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}

