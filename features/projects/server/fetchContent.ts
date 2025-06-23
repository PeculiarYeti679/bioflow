import { supabase } from "@/lib/supabaseClient";

export async function fetchSectionContent(slug: string, sectionTitle: string) {
  const { data: project } = await supabase
    .from("Project")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!project) return null;

  const { data: section } = await supabase
    .from("Section")
    .select("id, title")
    .eq("projectId", project.id)
    .eq("title", sectionTitle)
    .single();

  if (!section) return null;

  const { data: items } = await supabase
    .from("ContentItem")
    .select("*")
    .eq("sectionId", section.id)
    .order("order", { ascending: true });

  return { section, items };
}
