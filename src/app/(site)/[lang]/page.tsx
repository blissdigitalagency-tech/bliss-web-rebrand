import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { getCaseStudies, getClients } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { AboutBlock, CasesSection, Clients, Cta, FaqSection, Hero, Intro, ServicesStack, Tagline, Why } from "@/components/sections";

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.home;
  // No title here: the layout's default (the full home title) applies
  return pageMetadata({ locale: lang, description: t.description, paths: "/" });
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <Intro t={t.intro} />
      <Hero lang={lang} t={t.hero} common={t.common} />
      <Tagline lines={t.tagline} />
      <Clients t={t.clients} logos={getClients()} />
      <AboutBlock lang={lang} t={t.about} common={t.common} />
      <ServicesStack lang={lang} t={t.services} />
      <Why t={t.why} />
      <CasesSection lang={lang} t={t.cases} common={t.common} cases={getCaseStudies(lang)} />
      <FaqSection t={t.faq} />
      <Cta lang={lang} title={t.cta.title} titleEm={t.cta.titleEm} button={t.common.letsChat} />
    </>
  );
}
