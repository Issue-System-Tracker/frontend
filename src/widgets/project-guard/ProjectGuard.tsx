"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/entities/project";
import { StorageService } from "@/shared/services/storageService";
import { logger } from "@/shared/utils/logger";

interface ProjectGuardProps {
  children: React.ReactNode;
}

export default function ProjectGuard({ children }: ProjectGuardProps) {
  const { selectedProject, hydrateFromStorage } = useProjectStore();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Загружаем проект из localStorage
    logger.info("ProjectGuard: Загружаем проект из localStorage");
    
    try {
      hydrateFromStorage();
      logger.success("ProjectGuard: hydrateFromStorage выполнен успешно");
    } catch (error) {
      logger.error("ProjectGuard: Ошибка при загрузке проекта", error);
    }
    
    setIsHydrated(true);
  }, [hydrateFromStorage]);

  useEffect(() => {
    // Ждем, пока данные загрузятся из localStorage
    if (!isHydrated) return;
    
    // Проверяем проект через StorageService
    const storedProject = StorageService.getSelectedProject();
    
    logger.debug("ProjectGuard: Проверяем проект", {
      isHydrated,
      selectedProject: selectedProject?.id,
      storedProject: storedProject && typeof storedProject === 'object' && 'id' in storedProject ? storedProject.id : null
    });
    
    if (!storedProject && selectedProject === null) {
      logger.info("ProjectGuard: Проект не найден, перенаправляем на выбор");
      router.push("/project-selector");
    } else {
      logger.success("ProjectGuard: Проект найден, разрешаем доступ");
    }
  }, [selectedProject, router, isHydrated]);

  // Показываем загрузку, пока не загрузили данные из localStorage
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  // Если проект не выбран после загрузки, показываем загрузку
  if (selectedProject === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
