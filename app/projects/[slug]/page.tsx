// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/features/projects/server/fetchProjectList";
import ContentRenderer from "@/features/projects/ContentRenderer";
import { fetchSectionContent } from  "@/features/projects/server/fetchContent";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return notFound();
 const overviewSection = await fetchSectionContent(slug, "Overview");
 console.log("Overview Section:", overviewSection);

  return (
    <article className="prose mx-auto py-12">
      <h1 className="text-4xl font-bold">{project.title}</h1>
      <p className="mt-4 text-lg">{project.description}</p>

      <hr className="my-8" />

      {overviewSection?.items?.map((item) => (
        <ContentRenderer key={item.id} type={item.type} data={item.data} title={item.title}/>
      ))}
    </article>
  );
}

