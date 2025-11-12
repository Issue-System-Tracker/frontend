"use client";

import { useProjectStore } from '@/entities/project';
import { fetchProjects } from '@/features/project-management';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Project } from '@/entities/project';
import { logger } from '@/shared/utils/logger';

export default function ProjectSelector() {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData);
      } catch (error) {
        logger.error('Ошибка загрузки проектов', error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            {selectedProject ? selectedProject.name : 'Выберите проект'}
          </span>
          {selectedProject && (
            <span className="text-xs text-gray-500">
              {selectedProject.members.length} участников
            </span>
          )}
        </div>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          {loading ? (
            <div className="p-3 text-center text-gray-500">Загрузка...</div>
          ) : projects.length === 0 ? (
            <div className="p-3 text-center text-gray-500">Нет доступных проектов</div>
          ) : (
            projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectSelect(project)}
              className="w-full p-3 text-left hover:bg-gray-800 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">{project.name}</span>
                <span className="text-xs text-gray-500">
                  {project.members.length} участников
                </span>
              </div>
            </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
