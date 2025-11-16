"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Project } from "@/entities/project";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import { TIME_INTERVALS } from "@/shared/constants";

interface ProjectSliderProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function ProjectSlider({ projects, onSelectProject }: ProjectSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    setTimeout(() => setIsTransitioning(false), TIME_INTERVALS.ANIMATION_TIMEOUT);
  }, [isTransitioning, projects.length]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % projects.length);
    setTimeout(() => setIsTransitioning(false), TIME_INTERVALS.ANIMATION_TIMEOUT);
  }, [isTransitioning, projects.length]);

  // Автопрокрутка
  useEffect(() => {
    if (projects.length <= 1) return;
    const interval = setInterval(() => {
      goToNext();
    }, TIME_INTERVALS.AUTO_SLIDER_INTERVAL);
    return () => clearInterval(interval);
  }, [projects.length, goToNext]);

  return (
    <div className="relative w-full">
      {/* Обёртка слайдера */}
      <div className="overflow-hidden bg-background">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {projects.map((project, index) => (
            <div
              key={project.id || index}
              className="w-full flex-shrink-0 h-64 flex items-center justify-center p-6"
            >
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">{project.name}</h3>
                <div className="text-start">
                  <p className="text-sm text-muted-foreground mb-1">
                    Администратор: {project.admin?.fullName || "Не указан"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Участников: {project.members?.length || 0}
                  </p>
                </div>
                 <UniversalButton
                   onClick={() => onSelectProject(project)}
                   variant="primary"
                   className="w-full bg-black text-white hover:opacity-90"
                 >
                   Выбрать проект
                 </UniversalButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки навигации */}
      {projects.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 transition-all"
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-all"
            disabled={isTransitioning}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Индикаторы */}
      {projects.length > 1 && (
        <div className="flex justify-center mt-3 space-x-2">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-all duration-700 ${currentIndex === index ? "bg-black w-4" : "bg-muted-foreground/40"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
