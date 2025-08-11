import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/features/projects/server/fetchProjectList";
import ContentRenderer from "@/features/projects/ContentRenderer";
import { fetchSectionContent } from "@/features/projects/server/fetchContent";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await getProjectBySlug(slug);
  if (!project) return notFound();

  const overviewSection = await fetchSectionContent(slug, "Overview");
  const items = overviewSection?.items ?? [];

  return (
    <div className="reader py-12">
      <header className="mb-6 prose dark:prose-invert">
        <h1>{project.title}</h1>
        {project.description && <p className="lead">{project.description}</p>}
      </header>

      {items.length > 0 && (
        <>
          <hr className="my-8" />
          <ContentRenderer items={items} />
        </>
      )}
    </div>
  );
}