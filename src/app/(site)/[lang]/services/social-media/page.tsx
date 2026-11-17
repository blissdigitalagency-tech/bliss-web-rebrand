// The social media service page (/services/social-media), so it can rank for
// "jasa social media management Jakarta" on its own. Shared pieces:
// src/components/service-page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { Cta } from "@/components/sections";
import { ServiceFaq, ServiceGroup, ServiceHead, ServiceHow, ServiceJsonLd, ServiceSplit, ServiceSteps } from "@/components/service-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/services/social-media">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.social;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/services/social-media" });
}

export default async function SocialMediaPage({ params }: PageProps<"/[lang]/services/social-media">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.socialPage;
  const s = t.servicesPage.social;
  const crumbs = { ...t.googleAdsPage.crumbs, current: p.crumbs.current };
  const r = p.report;

  return (
    <>
      <ServiceHead lang={lang} crumbs={crumbs} title={p.title} lede={p.lede} />

      <ServiceHow
        id="how-title"
        icon="/images/services/icon-social.svg"
        title={p.howTitle}
        lede={s.lede}
        button={{ href: `/${lang}/contact#service=social-media`, label: s.button }}
      >
        <ServiceGroup title={s.includedTitle} items={s.included} />
        <ServiceGroup title={s.tagsTitle} items={s.tags} tags />
      </ServiceHow>

      <ServiceSteps id="steps-title" eyebrow={p.steps.eyebrow} title={p.steps.title} lede={p.steps.lede} items={p.steps.items} />

      <ServiceSplit
        id="split-title"
        eyebrow={r.eyebrow}
        title={r.title}
        lede={r.lede}
        items={r.items}
        box={{
          title: r.boxTitle,
          text: r.boxText,
          children: (
            <div className="sp-box__links">
              <Link className="btn btn--outline sp-box__btn" href={`/${lang}/services/google-ads`}>
                {t.servicesPage.jump.google}
              </Link>
              <Link className="btn btn--outline sp-box__btn" href={`/${lang}/services/website`}>
                {t.servicesPage.jump.web}
              </Link>
            </div>
          ),
        }}
      />

      <ServiceFaq id="faq-title" eyebrow={p.faq.eyebrow} title={p.faq.title} items={p.faq.items} />

      <ServiceJsonLd
        lang={lang}
        path="/services/social-media"
        name={t.meta.social.title}
        serviceType="Social media management"
        description={t.meta.social.description}
        crumbs={crumbs}
        faq={p.faq.items}
      />
      <Cta lang={lang} title={p.cta.title} titleEm={p.cta.titleEm} button={t.common.letsChat} />
    </>
  );
}
