
"use server";

import { prisma } from "@/lib/prisma"; // adjust the path as needed

export async function getAllProjects() {
  return await prisma.project.findMany({
    select: {
      slug: true,
      title: true,
      description: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectBySlug(slug: string) {
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
