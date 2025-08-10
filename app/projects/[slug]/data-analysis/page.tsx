import { fetchSectionContent } from  "@/features/projects/server/fetchContent";
import { notFound } from "next/navigation";
import ContentRenderer from "@/features/projects/ContentRenderer";

export default async function DataAnalysisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sectionContent = await fetchSectionContent(slug, "Data Analysis");
  if (!sectionContent) return notFound();

  return (
    <div className="reader">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {sectionContent.section.title}
        </h1>
      </header>
  
      <div className="reader-flow">
        <ContentRenderer items={sectionContent.items ?? []} />
      </div>
    </div>
  );
  }