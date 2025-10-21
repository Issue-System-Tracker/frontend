import Sidebar from "@/widgets/sidebar/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-white text-black p-6">{children}</main>
    </div>
  );
}
