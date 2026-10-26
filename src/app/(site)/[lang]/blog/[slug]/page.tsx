import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales, siteUrl } from "@/i18n/config";
import { getPost, getPosts, translations } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { BackLink, NextLink } from "@/components/sections";

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap((lang) => getPosts(lang).map((p) => ({ lang, slug: p.slug })));

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const p = getPost(lang, slug);
  if (!p) return {};
  const paths = Object.fromEntries(Object.entries(translations(getPosts, lang, slug)).map(([l, s]) => [l, `/blog/${s}`]));
  return pageMetadata({ locale: lang, title: p.title, description: p.excerpt, paths, image: p.image, type: "article" });
}

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const all = getPosts(lang);
  const i = all.findIndex((p) => p.slug === slug);
  if (i < 0) notFound();
  const p = all[i];
  const next = all[(i + 1) % all.length];
  const t = getDictionary(lang).common;

  // Article details for Google (schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.date,
    image: p.image ? `${siteUrl}${p.image}` : undefined,
    inLanguage: lang,
    author: { "@type": "Organization", name: "Bliss Digital", url: siteUrl },
    publisher: { "@type": "Organization", name: "Bliss Digital", logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512.png` } },
    mainEntityOfPage: `${siteUrl}/${lang}/blog/${p.slug}`,
  };

  return (
    <article className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="article__head">
        <p className="article__meta" data-reveal>
          <time dateTime={p.date}>{formatDate(p.date, lang)}</time> <i aria-hidden="true">·</i> {p.topic} <i aria-hidden="true">·</i> {p.readTime}{" "}
          {t.minRead}
        </p>
        <h1 className="article__title" data-reveal>
          {p.title}
        </h1>
        <p className="article__lede" data-reveal>
          {p.excerpt}
        </p>
        {p.draft && (
          <span className="sample-note" data-reveal>
            {t.draftPost}
          </span>
        )}
      </header>
      {p.image && (
        <div className="article__image" data-reveal>
          <Image src={p.image} width={1200} height={500} sizes="(max-width: 1240px) 100vw, 1200px" alt={p.imageAlt} loading="eager" fetchPriority="high" />
        </div>
      )}
      <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
      <footer className="article__foot">
        {next.slug !== p.slug && <NextLink href={`/${lang}/blog/${next.slug}`} label={t.nextPost} title={next.title} />}
        <BackLink href={`/${lang}/blog`} label={t.allPosts} />
      </footer>
    </article>
  );
}
