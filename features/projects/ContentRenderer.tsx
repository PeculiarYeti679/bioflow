// features/projects/ContentRenderer.tsx
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

// Accept either flat image payload OR nested under `data`
type ImagePayload = {
  url?: string;          // full http(s) URL
  path?: string;         // storage path inside bucket
  bucket?: string;       // defaults to "images"
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
};
type ImageBlock =
  | (BaseContent & { type: "IMAGE"; data: ImagePayload })
  | (BaseContent & { type: "IMAGE"; data: { data: ImagePayload } });

export type ContentData = TextBlock | ImageBlock | CodeBlock;

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
function asImagePayload(input: ImageBlock["data"]): ImagePayload {
  const payload = (input as any)?.data ? (input as any).data : (input as any);
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


function ContentText({ title, subtitle, data }: Extract<ContentData, { type: "TEXT" }>) {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
      {title && <h2 className="mb-1">{title}</h2>}
      {subtitle && <p className="mt-0 -mb-2 text-base text-muted-foreground">{subtitle}</p>}
      <p className="mt-4">{data.text}</p>
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
  const { title } = props;
  const { url, path, bucket = "images", alt = "", caption, width = 1600, height = 900 } =
    React.useMemo(() => asImagePayload(props.data), [props.data]);

  const [src, setSrc] = React.useState<string | null>(isHttpUrl(url) ? (url as string) : null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isHttpUrl(url)) {
        if (!cancelled) setSrc(url as string);
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

export default function ContentRenderer({
  items,
  className,
}: {
  items: ContentData[] | ContentData;
  className?: string;
}) {
  const list = Array.isArray(items) ? items : [items];

  return (
    <div className={`mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0 mt-10 ${className ?? ""}`}>
      <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm shadow-lg dark:gray-950/80">
        <div className="p-6 md:p-8 space-y-8 prose-trim">
          {list.map((block, i) => (
            <ContentBlock key={i} {...block} />
          ))}
        </div>
      </div>
    </div>
  );
}