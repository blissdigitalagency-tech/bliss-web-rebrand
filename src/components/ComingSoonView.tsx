import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import type { ComingSoonSection } from "@/lib/launch";
import { pageMetadata } from "@/lib/seo";
import { rich } from "./Rich";

const PATHS: Record<ComingSoonSection, string> = { cases: "/case-studies", blog: "/blog" };

/** Page details while a section is a placeholder: the section's own title, not indexed. */
export function comingSoonMetadata(lang: Locale, section: ComingSoonSection): Metadata {
  const t = getDictionary(lang);
  const meta = t.meta[section];
  return {
    ...pageMetadata({ locale: lang, title: meta.title, description: t.comingSoon[section].text, paths: PATHS[section] }),
    robots: { index: false, follow: true },
  };
}

/** Placeholder for a section that isn't ready yet (laid out like the 404 page). */
export function ComingSoonView({ lang, section }: { lang: Locale; section: ComingSoonSection }) {
  const t = getDictionary(lang).comingSoon;
  return (
    <section className="lost lost--soon" aria-labelledby="soon-title">
      <div className="lost__inner">
        <p className="lost__badge">
          <span className="eyebrow__dot" aria-hidden="true" />
          {t.badge}
        </p>
        <h1 className="lost__title" id="soon-title">
          {rich(t[section].title)}
        </h1>
        <p>{t[section].text}</p>
        <div className="lost__actions">
          <Link className="btn btn--solid" href={`/${lang}/contact`}>
            {t.contact}
          </Link>
          <Link className="btn btn--outline" href={`/${lang}`}>
            {t.home}
          </Link>
        </div>
      </div>
    </section>
  );
}
