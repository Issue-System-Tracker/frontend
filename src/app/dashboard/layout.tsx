import ProjectGuard from "@/widgets/project-guard/ProjectGuard";
import Sidebar from "@/widgets/sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectGuard>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProjectGuard>
  );
}
