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
    <>
      <h1 className="text-2xl font-bold mb-4">{sectionContent.section.title}</h1>
      {(sectionContent.items ?? []).map((item) => (
        <ContentRenderer key={item.id} type={item.type} data={item.data} title={item.title}/>
      ))}
    </>
  );
}
