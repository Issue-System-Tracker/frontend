"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchProjects, submitCreateProject } from "@/features/project-management";
import { selectProject } from "@/entities/project";
import { Project } from "@/entities/project";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import TextInput from "@/shared/ui/inputs/TextInput";
import LogoutButton from "@/shared/ui/Buttons/LogoutButton";
import ProjectSlider from "@/widgets/project-selector/ProjectSlider";
import { Search, X } from "lucide-react";

export default function ProjectSelectorPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки проектов");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      setCreating(true);
      setError("");
      
      // Проверяем токен перед отправкой
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Токен авторизации не найден. Пожалуйста, войдите в систему заново.");
        return;
      }
      
      await submitCreateProject({ name: projectName.trim() });
      await loadProjects(); // Перезагружаем список проектов
      setProjectName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания проекта");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    if (!project.id) {
      setError("Ошибка: проект не имеет корректного ID");
      return;
    }
    selectProject(project);
    router.push("/dashboard");
  };

  // Фильтрация проектов по поисковому запросу
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка проектов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col justify-between">
        <div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Проекты
          </h1>
          <p className="text-gray-600">
            Выберите существующий проект или создайте новый
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-500 ease-in-out">
          {/* Создание нового проекта */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Создать новый проект
            </h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <TextInput
                label="Название проекта"
                value={projectName}
                onChange={(value) => setProjectName(value as string)}
                placeholder="Введите название проекта"
                required
                minLength={3}
                maxLength={100}
              />
              <UniversalButton
                type="submit"
                disabled={creating || !projectName.trim()}
                className="w-full"
              >
                {creating ? "Создание..." : "Создать проект"}
              </UniversalButton>
            </form>
          </div>

          {/* Список существующих проектов */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Мои проекты
              </h2>
            </div>
            
            {/* Поиск по проектам */}
            <div className="relative mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Поиск по названию проекта..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-md bg-gray-100 text-black transition-all duration-150 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Очистить поиск"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-500">
                  Найдено проектов: {filteredProjects.length}
                </p>
              )}
            </div>
            <div className="relative min-h-[400px] w-full overflow-hidden">
              {/* Контейнер с фиксированной шириной */}
              <div className="relative w-full max-w-xl mx-auto">
                <ProjectSlider 
                  projects={filteredProjects} 
                  onSelectProject={handleSelectProject}
                />
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Кнопка logout внизу страницы */}
        <div className="mt-8">
          <LogoutButton className="w-full bg-black text-white" centered={true} />
        </div>
      </div>
    </div>
  );
}
