"use server";

import { prisma } from "@/lib/prisma"; 

 type ProjectPreview = {
  slug: string;
  title: string;
  description: string | null;
};

export async function getAllProjects(): Promise<ProjectPreview[]> {
  return await prisma.project.findMany({
    select: {
      slug: true,
      title: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectBySlug(slug: string): Promise<ProjectPreview | null> {
  return await prisma.project.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          contentItems: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}
