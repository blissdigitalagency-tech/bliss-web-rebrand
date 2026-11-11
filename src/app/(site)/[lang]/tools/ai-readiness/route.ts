// The AI Readiness Check page at /{lang}/tools/ai-readiness: plain HTML built
// from ai-readiness/page/ by src/lib/ai-readiness-page.ts, once per language
// at build time. The check itself answers at /tools/ai-readiness/api/scan.
import type { Locale } from "@/i18n/config";
import { TOOL_LOCALES, buildToolPage } from "@/lib/ai-readiness-page";

export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => TOOL_LOCALES.map((lang) => ({ lang }));

export async function GET(_request: Request, { params }: RouteContext<"/[lang]/tools/ai-readiness">) {
  const { lang } = await params;
  const { html, csp } = buildToolPage(lang as Locale);
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": csp },
  });
}
