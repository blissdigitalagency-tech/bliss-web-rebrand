import type { Locale } from "@/i18n/config";

const formats: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }),
  id: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
};

/** "2026-10-14" → "Oct 14, 2026" (en) or "14 Okt 2026" (id) */
export const formatDate = (iso: string, locale: Locale) => (iso ? formats[locale].format(new Date(iso + "T00:00:00Z")) : "");
