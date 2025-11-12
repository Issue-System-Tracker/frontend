import { Project } from "@/entities/project";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function ProjectList({ projects, onSelectProject }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg w-full">
        <p className="text-gray-500">Проекты не найдены</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="space-y-3 max-h-96 overflow-y-auto w-full">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors w-full"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {project.name}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Администратор: {project.admin?.fullName || "Не указан"}</p>
                  <p>Участников: {project.members?.length || 0}</p>
                </div>
              </div>
              <UniversalButton
                onClick={() => onSelectProject(project)}
                variant="primary"
                className="ml-4 bg-black text-white hover:opacity-90"
              >
                Выбрать
              </UniversalButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

