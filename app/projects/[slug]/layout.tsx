// /app/projects/[slug]/layout.tsx
"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ProjectSidebar from "@/components/ProjectSideBar";
import PageScroller from "@/components/PageScroller";
import "../../globals.css";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const { slug } = useParams() as { slug: string };

  const routes = [
    `/projects/${slug}`,
    `/projects/${slug}/methodology`,
    `/projects/${slug}/testing`,
    `/projects/${slug}/data-analysis`,
    `/projects/${slug}/findings`,
  ];

  return (
    <SidebarProvider>
      {/* Scroll-driven routing across section pages */}
      <PageScroller routes={routes} />

      {/* No h-screen here; let RootLayout control height/footer */}
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