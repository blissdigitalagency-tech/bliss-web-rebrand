import { en } from "./en";
import { id } from "./id";

export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

const dictionaries = { en, id };
export const getDictionary = (locale: Locale) => dictionaries[locale];

// <html lang> and hreflang values
export const htmlLang: Record<Locale, string> = { en: "en", id: "id" };
export const ogLocale: Record<Locale, string> = { en: "en_US", id: "id_ID" };

// The live site's address, for canonical links, the sitemap and social
// previews. Set NEXT_PUBLIC_SITE_URL on the host; the fallback is the domain
// in the current site's llms.txt.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://blissdigital.id").replace(/\/$/, "");

/** A path inside a locale: href(locale, "/about") → "/en/about" */
export const href = (locale: Locale, path = "") => `/${locale}${path === "/" ? "" : path}`;
