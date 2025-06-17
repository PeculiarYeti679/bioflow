export function titleFromSlug(slug: string | string[] | undefined): string {
    const str =
        typeof slug === "string"
            ? slug
            : Array.isArray(slug)
                ? slug.join("-")
                : "";
    return str
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}