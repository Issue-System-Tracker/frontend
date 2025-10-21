"use client";

import { useRouter } from "next/navigation";
import React, { CSSProperties } from "react";

interface ButtonProps {
  text: string;
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
  style?: CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  text,
  href,
  variant = "primary",
  className = "",
  style = {},
}) => {
  const router = useRouter();

  const baseClasses = "px-5 py-2 rounded-md text-sm transition-colors";

  const classes =
    variant === "primary"
      ? `${baseClasses} bg-white text-black hover:bg-gray-200 ${className}`
      : `${baseClasses} border border-white text-white hover:bg-white/10 ${className}`;

  return (
    <button onClick={() => router.push(href)} className={classes} style={style}>
      {text}
    </button>
  );
};

export default Button;
