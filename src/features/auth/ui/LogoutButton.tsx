"use client";
import { LogOut } from "lucide-react";
import { logout } from "@/entities/user";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 transition-colors text-black hover:bg-gray-300"
    >
      <LogOut size={24} />
      Выйти
    </button>
  );
}