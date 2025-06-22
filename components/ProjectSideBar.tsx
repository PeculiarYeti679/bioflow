"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import {titleFromSlug} from "@/lib/functions/titleFromSlug";

export default function ProjectSidebar() {
    const {slug} = useParams();
    const pathname = usePathname();
    if (!slug) return null;

    const sections = [
        {label: "Overview", href: `/projects/${slug}`},
        {label: "Methodology", href: `/projects/${slug}/methodology`},
        {label: "Testing", href: `/projects/${slug}/testing`},
        {label: "Data Analysis", href: `/projects/${slug}/data-analysis`},
        {label: "Findings", href: `/projects/${slug}/findings`},
    ];
 const title = titleFromSlug(slug);
    return (
         <Sidebar
  variant="floating"
  collapsible="offcanvas"
  className={clsx(
    "fixed top-[6.5rem]  h-[calc(100vh-6.5rem)] w-64  md:flex"
  )}
>
                <SidebarContent >
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-muted-foreground mb-2 text-sm font-semibold">
                            {title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {sections.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton asChild>
                                            <Link
                                                href={item.href}
                                                className={clsx(
                                                    "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                                                    pathname === item.href &&
                                                    "bg-accent text-accent-foreground font-medium"
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
    );
}