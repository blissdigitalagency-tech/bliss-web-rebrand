import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";

export function NotFoundView({ lang, t }: { lang: Locale; t: Dictionary["notFound"] }) {
  return (
    <section className="lost" aria-labelledby="lost-title">
      <div className="lost__inner">
        <p className="lost__code">
          4<em>0</em>4
        </p>
        <h1 className="lost__title" id="lost-title">
          {t.title}
        </h1>
        <p>{t.text}</p>
        <div className="lost__actions">
          <Link className="btn btn--solid" href={`/${lang}`}>
            {t.home}
          </Link>
          <Link className="btn btn--outline" href={`/${lang}/contact`}>
            {t.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
