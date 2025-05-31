"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectCardProps {
  slug: string;
  title: string;
  description: string;
}

export function ProjectCard({ slug, title, description }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="hover:opacity-90 transition-opacity"
    >
      <div className="card-wrapper">
        <div className="card-content">
          <Card className="h-full bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{description}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Link>
  );
}
