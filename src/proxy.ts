// Sends addresses without a language (/, /about, /blog/...) to /en or /id,
// based on the visitor's browser language. Indonesian browsers get /id;
// everyone else gets English.
import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

function preferred(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) {
    // "in" is the old code for Indonesian that some devices still send
    const code = lang === "in" ? "id" : lang;
    if ((locales as readonly string[]).includes(code)) return code as Locale;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;
  request.nextUrl.pathname = `/${preferred(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals, the API, the Keystatic editor and any file with an extension
  matcher: ["/((?!_next|api|keystatic|.*\\..*).*)"],
};
