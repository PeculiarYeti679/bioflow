"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function ProjectSidebar() {
  const { slug } = useParams();
  if (!slug) return null;

  const sections = [
    { label: "Overview", href: `/projects/${slug}` },
    { label: "Methodology", href: `/projects/${slug}/methodology` },
    { label: "Testing", href: `/projects/${slug}/testing` },
    { label: "Data Analysis", href: `/projects/${slug}/data-analysis` },
    { label: "Findings", href: `/projects/${slug}/findings` },
  ];

  return (
    <aside className="w-64 p-4 border-r bg-background">
      <Card className="p-4 space-y-4 shadow-md">
        <h2 className="text-xl font-semibold capitalize tracking-tight">
          {typeof slug === "string"
            ? slug.replace(/-/g, " ")
            : Array.isArray(slug)
              ? slug.join("-").replace(/-/g, " ")
              : ""}
        </h2>
        <ul className="space-y-2">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
