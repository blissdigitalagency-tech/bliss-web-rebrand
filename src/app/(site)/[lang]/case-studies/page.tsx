import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { getCaseStudies } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageHead, caseCard } from "@/components/sections";

export async function generateMetadata({ params }: PageProps<"/[lang]/case-studies">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.cases;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/case-studies" });
}

export default async function CaseStudiesPage({ params }: PageProps<"/[lang]/case-studies">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const cases = getCaseStudies(lang);

  return (
    <section className="page" aria-labelledby="page-title">
      <PageHead
        eyebrow={t.cases.eyebrow}
        title={t.cases.pageTitle}
        lede={t.cases.pageLede}
        note={cases.some((c) => c.sample) ? t.common.sampleCases : undefined}
      />
      <div className="posts">{cases.map((c, i) => caseCard(c, i, lang, t.common))}</div>
    </section>
  );
}
