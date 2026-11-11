import "server-only";
import type { Locale } from "@/i18n/config";

// When the site was built. Every page is static, so this is the build time:
// each push to main refreshes it. Shown as "Last updated" in the footer, in a
// <time> element, so people, search engines and the AI Readiness Check see a
// current date on every page.
const builtAt = new Date();
const zone = "Asia/Jakarta";

export function lastUpdated(lang: Locale) {
  return {
    // "November 2026" in both languages; Indonesian month names where they differ
    label: new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", { month: "long", year: "numeric", timeZone: zone }).format(builtAt),
    // "2026-11", for the <time> element's datetime attribute
    iso: new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: zone }).format(builtAt),
  };
}
