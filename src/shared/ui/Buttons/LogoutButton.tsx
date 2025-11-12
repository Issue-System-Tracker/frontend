"use client";
import { LogOut } from "lucide-react";
import { logout } from "@/features/auth";

interface LogoutButtonProps {
  className?: string;
  centered?: boolean;
}

export default function LogoutButton({ className = "", centered = false }: LogoutButtonProps) {
  return (
    <button
      onClick={() => logout()}
      className={`flex items-center ${centered ? 'justify-center' : ''} gap-3 p-2 rounded-lg transition-colors hover:opacity-90 ${className}`}
    >
      <LogOut size={24} />
      Выйти
    </button>
  );
}