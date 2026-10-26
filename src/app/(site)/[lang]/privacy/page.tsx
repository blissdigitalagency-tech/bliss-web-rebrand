import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { rich } from "@/components/Rich";
import { Eyebrow } from "@/components/sections";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.privacy;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/privacy" });
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).privacy;

  return (
    <article className="page" aria-labelledby="page-title">
      <header className="article__head">
        <Eyebrow end>{t.eyebrow}</Eyebrow>
        <h1 className="article__title" id="page-title" data-reveal>
          {t.title}
        </h1>
        <p className="article__lede" data-reveal>
          {t.lede}
        </p>
        <p className="article__meta" data-reveal>
          {t.updated} {rich(t.updatedValue)}
        </p>
        <span className="sample-note" data-reveal>
          {t.draft}
        </span>
      </header>

      <div className="prose prose--policy">
        {t.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((para, i) =>
              Array.isArray(para) ? (
                <ul key={i}>
                  {para.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : (
                <p key={i}>{rich(para)}</p>
              ),
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
