// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";


export default async function ProjectOverviewPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug((await params).slug);
  if (!project) return notFound();

  return (
    <article className="prose mx-auto py-12">
      <h1 className="text-4xl font-bold">{project.title}</h1>
      <p className="mt-4 text-lg">{project.description}</p>
      <nav className="mt-8 flex gap-4">
     Here will be an overview of the project, including its goals, methodology, and key findings.
     
      </nav>
    </article>
  );
}
