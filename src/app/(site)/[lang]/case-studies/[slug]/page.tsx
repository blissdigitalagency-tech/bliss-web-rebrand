import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "@/i18n/config";
import { getCaseStudies, getCaseStudy, translations } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { BackLink, NextLink } from "@/components/sections";

export const dynamicParams = false;
export const generateStaticParams = () =>
  locales.flatMap((lang) => getCaseStudies(lang).map((c) => ({ lang, slug: c.slug })));

export async function generateMetadata({ params }: PageProps<"/[lang]/case-studies/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const c = getCaseStudy(lang, slug);
  if (!c) return {};
  const paths = Object.fromEntries(
    Object.entries(translations(getCaseStudies, lang, slug)).map(([l, s]) => [l, `/case-studies/${s}`]),
  );
  return pageMetadata({ locale: lang, title: c.title, description: c.excerpt, paths, image: c.image, type: "article" });
}

export default async function CaseStudyPage({ params }: PageProps<"/[lang]/case-studies/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const all = getCaseStudies(lang);
  const i = all.findIndex((c) => c.slug === slug);
  if (i < 0) notFound();
  const c = all[i];
  const next = all[(i + 1) % all.length];
  const t = getDictionary(lang).common;

  return (
    <article className="page">
      <header className="article__head">
        <p className="article__meta" data-reveal>
          <time dateTime={c.date}>{formatDate(c.date, lang)}</time> <i aria-hidden="true">·</i> {c.industry}
        </p>
        <h1 className="article__title" data-reveal>
          {c.title}
        </h1>
        <p className="article__lede" data-reveal>
          {c.excerpt}
        </p>
        {c.sample && (
          <span className="sample-note" data-reveal>
            {t.sampleCase}
          </span>
        )}
      </header>
      {c.image && (
        <div className="article__image" data-reveal>
          <Image src={c.image} width={1200} height={500} sizes="(max-width: 1240px) 100vw, 1200px" alt={c.imageAlt} loading="eager" fetchPriority="high" />
        </div>
      )}
      <div className="article__info">
        <span>
          {c.readTime} {t.minRead}
        </span>
        <span>{c.client}</span>
        <span className="article__tags">
          {c.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </span>
      </div>
      {c.results.length > 0 && (
        <div className="stats">
          {c.results.map((r) => (
            <div className="stat" data-reveal key={r.label}>
              <b>{r.value}</b>
              <span>{r.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="prose" dangerouslySetInnerHTML={{ __html: c.html }} />
      <footer className="article__foot">
        {next.slug !== c.slug && <NextLink href={`/${lang}/case-studies/${next.slug}`} label={t.nextCase} title={next.title} />}
        <BackLink href={`/${lang}/case-studies`} label={t.allCases} />
      </footer>
    </article>
  );
}
