"use client";

import { useProjectStore } from "@/entities/project";
import KanbanBoard from "@/widgets/issues/KanbanBoard";

export default function IssuesPage() {
  const { selectedProject } = useProjectStore();

  if (!selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Проект не выбран</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}