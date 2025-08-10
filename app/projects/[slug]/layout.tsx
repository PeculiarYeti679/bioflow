import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/ProjectSideBar";
import "../../globals.css";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* No h-screen here */}
      <div className="flex min-h-0">
        <ProjectSidebar />
        <main className="flex-1 p-6 min-w-0">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
