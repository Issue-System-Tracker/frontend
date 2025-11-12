"use client";

import { FolderOpen, Bug, Calendar } from "lucide-react";
import LogoutButton from "@/shared/ui/Buttons/LogoutButton";
import { useEffect } from "react";
import { useUser } from "@/entities/user";
import { useProjectStore } from "@/entities/project";

export default function Sidebar() {
  const { selectedProject, hydrateFromStorage: hydrateProject } = useProjectStore();
  
  const menuItems = [
    { label: "Задачи", icon: <Bug size={24} />, href: "/dashboard/issues" },
    { label: "Спринты", icon: <Calendar size={24} />, href: "/dashboard/sprints" }
  ];

  const { user, hydrateFromStorage, displayName, email } = useUser();
  useEffect(() => {
    if (!user) hydrateFromStorage();
    hydrateProject(); // Загружаем выбранный проект из localStorage
  }, [user, hydrateFromStorage, hydrateProject]);

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

        {/* Информация о проекте */}
        <div className="w-full">
          <span className="text-xs text-gray-500 mb-2 block">Текущий проект</span>
          <a 
              href="/dashboard"
              className="flex items-center gap-2 p-2 bg-blue-500 rounded-lg hover:opacity-95 transition-colors"
            >
              <FolderOpen size={16} className="text-white" />
              <span className="text-sm font-medium truncate">{selectedProject?.name}</span>
            </a>
        </div>

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
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-blue-500 transition-colors ${
                !selectedProject ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={(e) => {
                if (!selectedProject) {
                  e.preventDefault();
                }
              }}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </a>
          ))}
        </nav>

        <LogoutButton className="hover:bg-blue-500"/>
      </div>
    </div>
  );
}
