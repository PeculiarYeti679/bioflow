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
    <div className="flex h-screen relative">
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