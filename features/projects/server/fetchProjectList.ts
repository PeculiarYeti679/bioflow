"use server"

import {supabase} from "@/lib/supabaseClient";
import {ProjectPreview} from "@/lib/types/projectPreview";

export async function getAllProjects(): Promise<ProjectPreview[]> {
  const { data, error } = await supabase
      .from("Project")
      .select("slug, title, description")
      .order("createdAt", { ascending: false })

  if (error) throw new Error(error.message)
  return data as ProjectPreview[]
}

export async function getProjectBySlug(slug: string): Promise<ProjectPreview | null> {
  const { data, error } = await supabase
      .from("Project")
      .select(`
    slug,
    title,
    description,
    Section (
      id,
      title,
      order,
      ContentItem (
        id,
        "order",
        type,
        data
      )
    )
  `)
      .eq("slug", slug)
      .single()

  if (error) {
    if (error.code === "PGRST116") return null // not found
    throw new Error(error.message)
  }

  return data as ProjectPreview
}