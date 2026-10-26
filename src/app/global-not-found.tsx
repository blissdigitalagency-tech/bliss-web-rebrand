// 404 for addresses outside /en and /id that the proxy doesn't redirect
// (e.g. a missing file). It skips the site layout, so it brings its own
// <html>, styles and fonts.
import type { Metadata } from "next";
import "./globals.css";
import { jakarta, fragment } from "./fonts";
import { getDictionary, defaultLocale } from "@/i18n/config";
import { NotFoundView } from "@/components/NotFoundView";

export const metadata: Metadata = { title: "Page not found — Bliss Digital", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${jakarta.variable} ${fragment.variable}`}>
      <body>
        <main>
          <NotFoundView lang={defaultLocale} t={getDictionary(defaultLocale).notFound} />
        </main>
      </body>
    </html>
  );
}
