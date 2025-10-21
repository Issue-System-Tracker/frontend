"use client";

import { LayoutList, UsersRound } from "lucide-react";
import LogoutButton from "@/features/auth/ui/LogoutButton";
import { useEffect } from "react";
import { useUser } from "@/entities/user";

export default function Sidebar() {
  const menuItems = [
    { label: "Issues", icon: <UsersRound size={24} />, href: "/dashboard" },
    { label: "Sprints", icon: <LayoutList size={24} />, href: "/users" },
  ];

  const { user, hydrateFromStorage, displayName, email, userRole } = useUser();
  useEffect(() => {
    if (!user) hydrateFromStorage();
  }, [user, hydrateFromStorage]);

  return (
    <div className="flex flex-col bg-black text-white min-h-screen py-4 px-4">
      {/* Блок с данными пользователя */}
      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{displayName || ""}</span>
          <span className="text-xs text-gray-500">{email || ""}</span>
        </div>

        {/* Разделитель */}
        <hr className="border-gray-700 w-full my-2" />

        <span className="text-xm text-white">Название проекта</span>
        <span className="text-sm text-white">{userRole}</span>

        {/* Ещё один разделитель перед меню */}
        <hr className="border-gray-700 w-full my-2" />
      </div>

      {/* Меню */}
      <div className="flex flex-col flex-1">
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </a>
          ))}
        </nav>

        <LogoutButton />
      </div>
    </div>
  );
}
