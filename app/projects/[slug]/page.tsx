// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";
import Link from "next/link";

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
        <Link
          href={`/projects/${project.slug}/methodology`}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Methodology
        </Link>
        <Link
          href={`/projects/${project.slug}/data-analysis`}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Data Analysis
        </Link>
      </nav>
    </article>
  );
}
