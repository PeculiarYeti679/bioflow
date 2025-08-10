// features/projects/ContentRenderer.tsx
"use client";

import Image from "next/image";
import * as React from "react";

type BaseContent = { title?: string; subtitle?: string };

export type ContentData =
  | (BaseContent & { type: "TEXT"; data: { text: string } })
  | (BaseContent & {
      type: "IMAGE";
      data: { url: string; alt?: string; caption?: string; width?: number; height?: number };
    })
  | (BaseContent & { type: "CODE"; data: { code: string; language?: string } });

export function ContentBlock({ type, data, title, subtitle }: ContentData) {
  switch (type) {
    case "TEXT":
      return (
        <article className="prose prose-lg dark:prose-invert max-w-none leading-relaxed">
          {title && <h2 className="mb-1">{title}</h2>}
          {subtitle && (
            <p className="mt-0 -mb-2 text-base text-muted-foreground">{subtitle}</p>
          )}
          <p className="mt-4">{data.text}</p>
        </article>
      );

    case "IMAGE": {
      const { url, alt = "", caption, width = 1600, height = 900 } = data;
      return (
        <figure>
          {title && <figcaption className="mb-2 text-sm font-medium">{title}</figcaption>}
          <div className="rounded-xl overflow-hidden border">
            <Image
              src={url}
              alt={alt}
              width={width}
              height={height}
              sizes="(min-width: 1024px) 800px, 100vw"
              className="h-auto w-full object-contain"
            />
          </div>
          {caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
          )}
        </figure>
      );
    }

    case "CODE": {
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
    <div className={`mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-0 mt-10${className ?? ""}`}>
      <div className="
        rounded-2xl
        border border-border/80
        bg-card/70
        backdrop-blur-sm
        shadow-lg
        dark:gray-950/80
      ">
         <div className="p-6 md:p-8 space-y-8 prose-trim">
          {list.map((block, i) => (
            <ContentBlock key={i} {...block} />
          ))}
        </div>
      </div>
    </div>
  );
}