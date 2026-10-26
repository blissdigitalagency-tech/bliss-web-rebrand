import type { Metadata } from "next";
import { type Locale, locales, siteUrl, ogLocale, getDictionary } from "@/i18n/config";

/**
 * Page metadata with a canonical link and hreflang alternates.
 * `paths` gives this page's path in each language that has it, e.g.
 * { en: "/blog/check-tracking", id: "/blog/cek-tracking" }. Pages that exist
 * in every language can pass one path for all.
 */
export function pageMetadata({
  locale,
  title,
  description,
  paths,
  image,
  type = "website",
}: {
  locale: Locale;
  title?: string;
  description: string;
  paths: string | Partial<Record<Locale, string>>;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const byLocale: Partial<Record<Locale, string>> =
    typeof paths === "string" ? Object.fromEntries(locales.map((l) => [l, paths])) : paths;
  const url = (l: Locale) => `/${l}${byLocale[l] === "/" ? "" : byLocale[l]}`;
  const languages: Record<string, string> = {};
  for (const l of locales) if (byLocale[l] !== undefined) languages[l] = url(l);
  if (byLocale.en !== undefined) languages["x-default"] = url("en");
  const siteName = getDictionary(locale).meta.siteName;

  return {
    // Leaving the key out (rather than undefined) keeps the layout's default title
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url(locale), languages },
    openGraph: {
      type,
      siteName,
      locale: ogLocale[locale],
      url: url(locale),
      title: title ? `${title} — ${siteName}` : undefined,
      description,
      images: [{ url: image || `/og-${locale}.png`, width: image ? undefined : 1200, height: image ? undefined : 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const absolute = (path: string) => `${siteUrl}${path}`;
