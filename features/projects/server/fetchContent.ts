// features/projects/server/fetchContent.ts
import { supabase } from "@/lib/supabaseClient";

type RawContentItem = {
  id: string;
  type: string;
  data: unknown;          // may be stringified JSON
  order: number;
  sectionId: string;
  title?: string | null;
  subtitle?: string | null;
};

type SectionRow = { id: string; title: string };

type TextData = { text: string };
type ImageData = {
  url?: string;
  path?: string;
  bucket?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};
type CodeData = { code: string; language?: string };

type NormalizedItem =
  | {
      id: string;
      type: "TEXT";
      title?: string | null;
      subtitle?: string | null;
      order: number;
      sectionId: string;
      data: TextData;
    }
  | {
      id: string;
      type: "IMAGE";
      title?: string | null;
      subtitle?: string | null;
      order: number;
      sectionId: string;
      data: ImageData;
    }
  | {
      id: string;
      type: "CODE";
      title?: string | null;
      subtitle?: string | null;
      order: number;
      sectionId: string;
      data: CodeData;
    };

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
}

function stripAccidentalSuffix(url?: string): string | undefined {
  if (!url) return url;
  // common copy/paste artifacts like `$0` or spaces
  return url.replace(/\$0$/, "").trim();
}

function normalizeItem(raw: RawContentItem): NormalizedItem | null {
  // 1) Parse possible stringified JSON
  const parsed = typeof raw.data === "string" ? safeParse(raw.data) : (raw.data as Record<string, unknown>);

  // 2) Some shapes embed payload under `data`
  const payload = parsed?.data ?? parsed ?? {};

  // 3) Decide final type (prefer parsed.type when present)
  const t = (parsed?.type ?? raw.type)?.toUpperCase();

  const base = {
    id: raw.id,
    title: raw.title ?? parsed?.title ?? null,
    subtitle: raw.subtitle ?? parsed?.subtitle ?? null,
    order: raw.order,
    sectionId: raw.sectionId,
  };

  if (t === "TEXT") {
    const text = String(payload?.text ?? "");
    return { ...base, type: "TEXT", data: { text } };
  }

  if (t === "CODE") {
    const code = String(payload?.code ?? "");
    const language = payload?.language ? String(payload.language) : undefined;
    return { ...base, type: "CODE", data: { code, language } };
  }

  if (t === "IMAGE") {
    const url = stripAccidentalSuffix(payload?.url ? String(payload.url) : undefined);
    const path = payload?.path ? String(payload.path) : undefined;
    const bucket = payload?.bucket ? String(payload.bucket) : undefined;
    const alt = payload?.alt ? String(payload.alt) : undefined;
    const caption = payload?.caption ? String(payload.caption) : undefined;
    const width = toNumber(payload?.width) ?? 1600;
    const height = toNumber(payload?.height) ?? 900;

    return {
      ...base,
      type: "IMAGE",
      data: { url, path, bucket, alt, caption, width, height },
    };
  }

  // Unknown type — skip
  console.warn("[fetchSectionContent] Unknown content type:", raw.type, { raw });
  return null;
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    console.warn("[fetchSectionContent] Failed to parse ContentItem.data string:", s.slice(0, 120));
    return {};
  }
}

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
    .single<SectionRow>();

  if (!section) return null;

  const { data: items } = await supabase
    .from("ContentItem")
    .select("*")
    .eq("sectionId", section.id)
    .order("order", { ascending: true });

  const normalized =
    (items as RawContentItem[] | null)?.map(normalizeItem).filter(Boolean) as NormalizedItem[] | undefined;

  return { section, items: normalized ?? [] };
}