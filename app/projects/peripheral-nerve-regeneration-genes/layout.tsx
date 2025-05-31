import ProjectSidebar from "@/components/ProjectSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <ProjectSidebar /> {/* client component */}
        <main className="flex-1 p-6">
          {" "}
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
