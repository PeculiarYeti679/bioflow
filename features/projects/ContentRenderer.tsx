"use client";

import Image from "next/image";
import * as React from "react";
import { createClient } from "@supabase/supabase-js";



const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


type BaseContent = { title?: string; subtitle?: string };

type TextBlock = BaseContent & { type: "TEXT"; data: { text: string } };
type CodeBlock = BaseContent & { type: "CODE"; data: { code: string; language?: string } };

export type ImagePayload = {
  url?: string;     // full http(s) URL
  path?: string;    // storage path inside bucket
  bucket?: string;  // defaults to "images"
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};

type ImageBlock = BaseContent & { type: "IMAGE"; data: ImagePayload };

export type ContentData = TextBlock | CodeBlock | ImageBlock;


type NormalizedText = {
  type: "TEXT";
  title?: string | null;
  subtitle?: string | null;
  data: { text: string };
  [k: string]: unknown;
};

type NormalizedCode = {
  type: "CODE";
  title?: string | null;
  subtitle?: string | null;
  data: { code: string; language?: string | null };
  [k: string]: unknown;
};

type NormalizedImage = {
  type: "IMAGE";
  title?: string | null;
  subtitle?: string | null;
  data: ImagePayload | { data: ImagePayload };
  [k: string]: unknown;
};

type NormalizedItem = NormalizedText | NormalizedCode | NormalizedImage;


function isHttpUrl(v?: string): v is string {
  return !!v && /^https?:\/\//i.test(v);
}

function stripAccidentalSuffix(url?: string) {
  return typeof url === "string" ? url.replace(/\$0$/, "").trim() : url;
}

async function getPublicUrl(bucket: string, path: string): Promise<string | null> {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data) {
    console.warn(`[ContentRenderer] getPublicUrl error for ${bucket}/${path}:`);
    return null;
  }
  return data?.publicUrl ?? null;
}

/** Accept flat or nested payload and apply sane defaults. */
function asImagePayload(input: ImagePayload | { data: ImagePayload }): ImagePayload {
  const payload =
    typeof (input as { data?: ImagePayload }).data !== "undefined"
      ? (input as { data: ImagePayload }).data
      : (input as ImagePayload);

  return {
    url: stripAccidentalSuffix(payload?.url),
    path: payload?.path,
    bucket: payload?.bucket ?? "images",
    alt: payload?.alt,
    caption: payload?.caption,
    width: typeof payload?.width === "number" ? payload.width : 1600,
    height: typeof payload?.height === "number" ? payload.height : 900,
  };
}


function normalizeItems(items: Array<ContentData | NormalizedItem>): ContentData[] {
  return items
    .map((it) => {
      const base = {
        title: (it as ContentData).title ?? undefined,
        subtitle: (it as ContentData).subtitle ?? undefined,
      };

      switch (it.type) {
        case "TEXT":
          return {
            ...base,
            type: "TEXT",
            data: { text: (it as TextBlock).data?.text ?? "" },
          } as TextBlock;

        case "CODE":
          return {
            ...base,
            type: "CODE",
            data: {
              code: (it as CodeBlock).data?.code ?? "",
              language: (it as CodeBlock).data?.language ?? undefined,
            },
          } as CodeBlock;

        case "IMAGE": {
          const payload = asImagePayload((it as NormalizedImage | ImageBlock).data);
          return { ...base, type: "IMAGE", data: payload } as ImageBlock;
        }

        default:
          // Unknown block type — skip
          return null as unknown as ContentData;
      }
    })
    .filter(Boolean);
}



function ContentText({ title, subtitle, data }: Extract<ContentData, { type: "TEXT" }>) {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
      {title && <h2 className="mb-1">{title}</h2>}
      {subtitle && <p className="mt-0 -mb-2 text-base text-muted-foreground">{subtitle}</p>}
      <p className="mt-4 whitespace-pre-wrap">{data.text}</p>
    </article>
  );
}

function ContentCode({ title, data }: Extract<ContentData, { type: "CODE" }>) {
  const { code, language } = data;
  return (
    <div>
      {title && <h3 className="text-base font-semibold mb-2">{title}</h3>}
      <pre
        aria-label={language ? `${language} code block` : "code block"}
        className="rounded-lg border bg-zinc-950 text-zinc-50 p-4 overflow-x-auto text-sm leading-relaxed"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ContentImage(props: Extract<ContentData, { type: "IMAGE" }>) {
  const { title, data } = props;
  const { url, path, bucket = "images", alt = "", caption, width = 1600, height = 900 } =
    React.useMemo(() => asImagePayload(data), [data]);

  const [src, setSrc] = React.useState<string | null>(isHttpUrl(url) ? url : null);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (isHttpUrl(url)) {
        if (!cancelled) setSrc(url);
        return;
      }
      if (path) {
        const publicUrl = await getPublicUrl(bucket, path);
        if (!cancelled) setSrc(publicUrl);
        return;
      }
      console.warn("[ContentRenderer] IMAGE missing both url and path", { title, bucket, path, url });
      if (!cancelled) setSrc(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [url, path, bucket, title]);

  if (!src) {
    return (
      <figure>
        {title && <figcaption className="mb-2 text-sm font-medium">{title}</figcaption>}
        <div className="rounded-xl border bg-muted/40 text-muted-foreground p-8 text-sm">
          <p>Image unavailable.</p>
          <p className="mt-1">{path ? `Tried: ${bucket}/${path}` : "No url or path provided."}</p>
        </div>
        {caption && <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>}
      </figure>
    );
  }

  return (
    <figure>
      {title && <figcaption className="mb-2 text-sm font-medium">{title}</figcaption>}
      <div className="rounded-xl overflow-hidden border">
        <Image
          src={src}
          alt={alt || ""}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 800px, 100vw"
          className="h-auto w-full object-contain"
        />
      </div>
      {caption && <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

export function ContentBlock(props: ContentData) {
  switch (props.type) {
    case "TEXT":
      return <ContentText {...props} />;
    case "IMAGE":
      return <ContentImage {...props} />;
    case "CODE":
      return <ContentCode {...props} />;
    default:
      return null;
  }
}



type ItemsProp =
  | ContentData
  | ContentData[]
  | NormalizedItem
  | NormalizedItem[];

export default function ContentRenderer({
  items,
  className,
}: {
  items: ItemsProp;
  className?: string;
}) {
  const list = React.useMemo(
    () => (Array.isArray(items) ? items : [items]),
    [items]
  );


  const normalized = React.useMemo(
    () => normalizeItems(list as Array<ContentData | NormalizedItem>),
    [list]
  );

  return (
    <div className={`mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0 mt-10 ${className ?? ""}`}>
      <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm shadow-lg dark:gray-950/80">
        <div className="p-6 md:p-8 space-y-8 prose-trim">
          {normalized.map((block, i) => (
            <ContentBlock key={i} {...block} />
          ))}
        </div>
      </div>
    </div>
  );
}