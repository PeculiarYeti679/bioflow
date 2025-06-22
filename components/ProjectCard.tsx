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
      className="block transition-transform hover:scale-[1.01]"
    >
      <div className="card-wrapper">
        <Card className="card-content border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}