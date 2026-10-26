import type { MetadataRoute } from "next";
import { locales, siteUrl, type Locale } from "@/i18n/config";
import { getCaseStudies, getPosts, translations } from "@/lib/content";

// Every page in both languages, with links between the translations
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (paths: Partial<Record<Locale, string>>, lastModified?: string) => {
    const languages = Object.fromEntries(Object.entries(paths).map(([l, p]) => [l, `${siteUrl}/${l}${p}`]));
    return Object.entries(paths).map(([l, p]) => ({
      url: `${siteUrl}/${l}${p}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      alternates: { languages },
    }));
  };
  const everywhere = (path: string) => Object.fromEntries(locales.map((l) => [l, path]));

  const pages = ["", "/about", "/services", "/case-studies", "/blog", "/contact", "/privacy"].flatMap((p) => entry(everywhere(p)));

  // One entry per article, linked to its translation when there is one
  const articles = <T extends { slug: string; date: string; translationOf?: string }>(
    list: (l: Locale) => T[],
    base: string,
  ) => {
    const seen = new Set<string>();
    return locales.flatMap((l) =>
      list(l).flatMap((item) => {
        const key = `${l}:${item.slug}`;
        if (seen.has(key)) return [];
        const t = translations(list, l, item.slug);
        Object.entries(t).forEach(([tl, s]) => seen.add(`${tl}:${s}`));
        return entry(Object.fromEntries(Object.entries(t).map(([tl, s]) => [tl, `${base}/${s}`])), item.date);
      }),
    );
  };

  return [...pages, ...articles(getCaseStudies, "/case-studies"), ...articles(getPosts, "/blog")];
}
