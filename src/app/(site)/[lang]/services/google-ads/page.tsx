// The Google Ads service page (/services/google-ads): its own page so it can
// rank for "jasa Google Ads Jakarta" on its own. The Services overview keeps a
// short version and links here. Shared pieces: src/components/service-page.tsx
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { Cta } from "@/components/sections";
import { Ways, type Way } from "@/components/client";
import { ServiceFaq, ServiceGroup, ServiceHead, ServiceHow, ServiceJsonLd, ServiceSplit, ServiceSteps } from "@/components/service-page";

export async function generateMetadata({ params }: PageProps<"/[lang]/services/google-ads">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.googleAds;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/services/google-ads" });
}

export default async function GoogleAdsPage({ params }: PageProps<"/[lang]/services/google-ads">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const g = t.googleAdsPage;
  const s = t.servicesPage.google;
  const ways: Way[] = s.ways.map(([title, text, link, key, includedTitle], i) => ({
    title,
    text,
    link,
    key,
    includedTitle,
    items: i === 0 ? s.included : t.services.google.tabs[i].items,
  }));

  return (
    <>
      <ServiceHead lang={lang} crumbs={g.crumbs} title={g.title} lede={g.lede} />

      <ServiceHow
        id="how-title"
        icon="/images/services/logo-google-ads.png"
        title={g.howTitle}
        lede={s.lede}
        button={{ href: `/${lang}/contact#service=google-ads`, label: s.button }}
        image={{ src: "/images/services/search-campaigns.jpg", alt: s.imageAlt }}
      >
        <Ways lang={lang} title={s.waysTitle} ways={ways} />
        <ServiceGroup title={s.tagsTitle} items={s.tags} tags />
      </ServiceHow>

      <ServiceSteps id="steps-title" eyebrow={g.tracking.eyebrow} title={g.tracking.title} lede={g.tracking.lede} items={g.tracking.steps} />

      <ServiceSplit
        id="split-title"
        eyebrow={g.review.eyebrow}
        title={g.review.title}
        lede={g.review.lede}
        items={g.review.items}
        note={g.review.note}
        box={{ title: g.ownership.title, text: g.ownership.text }}
      />

      <ServiceFaq id="faq-title" eyebrow={g.faq.eyebrow} title={g.faq.title} items={g.faq.items} />

      <ServiceJsonLd
        lang={lang}
        path="/services/google-ads"
        name={t.meta.googleAds.title}
        serviceType="Google Ads management"
        description={t.meta.googleAds.description}
        crumbs={g.crumbs}
        faq={g.faq.items}
      />
      <Cta lang={lang} title={g.cta.title} titleEm={g.cta.titleEm} button={t.common.letsChat} />
    </>
  );
}
