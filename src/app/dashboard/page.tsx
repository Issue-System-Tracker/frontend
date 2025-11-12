import ProjectInfo from "@/widgets/project-members/ProjectInfo";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="mb-3">
        <a href="/project-selector" className="flex items-center group">
          {/* <ChevronLeft className="w-7 h-7 text-gray-900 text-bold ml-1 group-hover:-translate-x-1 group-hover:text-blue-600 transition-all duration-200"/> */}
          <h1 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer relative">
          ‹ Проекты
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
          </h1>
        </a>
      </div>
      
      <ProjectInfo />
    </div>
  );
}