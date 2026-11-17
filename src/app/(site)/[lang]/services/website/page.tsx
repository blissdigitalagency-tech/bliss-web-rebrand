// The website service page (/services/website), so it can rank for "jasa
// pembuatan website Jakarta" on its own. Shared pieces: src/components/service-page.tsx
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { Cta } from "@/components/sections";
import { ServiceFaq, ServiceGroup, ServiceHead, ServiceHow, ServiceJsonLd, ServiceSplit, ServiceSteps } from "@/components/service-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/services/website">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.website;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/services/website" });
}

export default async function WebsitePage({ params }: PageProps<"/[lang]/services/website">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const w = t.websitePage;
  const s = t.servicesPage.web;
  const crumbs = { ...t.googleAdsPage.crumbs, current: w.crumbs.current };
  const f = w.found;

  return (
    <>
      <ServiceHead lang={lang} crumbs={crumbs} title={w.title} lede={w.lede} />

      <ServiceHow
        id="how-title"
        icon="/images/services/icon-website.svg"
        title={w.howTitle}
        lede={s.lede}
        button={{ href: `/${lang}/contact#service=website`, label: s.button }}
        image={{ src: "/images/services/website.jpg", alt: s.imageAlt }}
      >
        <ServiceGroup title={s.includedTitle} items={s.included} />
        <ServiceGroup title={s.tagsTitle} items={s.tags} tags />
      </ServiceHow>

      <ServiceSteps id="steps-title" eyebrow={w.steps.eyebrow} title={w.steps.title} lede={w.steps.lede} items={w.steps.items} />

      <ServiceSplit
        id="split-title"
        eyebrow={f.eyebrow}
        title={f.title}
        lede={f.lede}
        items={f.items}
        box={{
          title: f.boxTitle,
          text: f.boxText,
          // The tool is a plain HTML page outside the app, so a plain link
          children: (
            <a className="btn btn--outline sp-box__btn" href={`/${lang}/tools/ai-readiness`}>
              {f.boxLink}
            </a>
          ),
        }}
      />

      <ServiceFaq id="faq-title" eyebrow={w.faq.eyebrow} title={w.faq.title} items={w.faq.items} />

      <ServiceJsonLd
        lang={lang}
        path="/services/website"
        name={t.meta.website.title}
        serviceType="Website design and development"
        description={t.meta.website.description}
        crumbs={crumbs}
        faq={w.faq.items}
      />
      <Cta lang={lang} title={w.cta.title} titleEm={w.cta.titleEm} button={t.common.letsChat} />
    </>
  );
}
