import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { absolute, pageMetadata } from "@/lib/seo";
import { lastUpdated } from "@/lib/updated";
import { rich } from "@/components/Rich";
import { ButtonIcon, Cta, Eyebrow } from "@/components/sections";
import { Faq } from "@/components/client";
import { RoasCalculator } from "@/components/roas-calculator";

export async function generateMetadata({ params }: PageProps<"/[lang]/tools/roas-calculator">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.roas;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/tools/roas-calculator" });
}

export default async function RoasCalculatorPage({ params }: PageProps<"/[lang]/tools/roas-calculator">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).roas;
  const updated = lastUpdated(lang);
  const meta = getDictionary(lang).meta.roas;
  const url = absolute(`/${lang}/tools/roas-calculator`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: meta.title,
      description: meta.description,
      url,
      inLanguage: lang,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
      publisher: { "@type": "Organization", name: "Bliss Digital", url: absolute("") },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a.join(" ") },
      })),
    },
  ];

  return (
    <>
      <article className="page roas-page" aria-labelledby="page-title">
        <header className="article__head">
          <Eyebrow end>
            {t.eyebrow} &middot; {t.updated} <time dateTime={updated.iso}>{updated.label}</time>
          </Eyebrow>
          <h1 className="article__title" id="page-title" data-reveal>
            {rich(t.title)}
          </h1>
          <p className="article__lede" data-reveal>
            {t.lede}
          </p>
          <div className="roas-page__actions" data-reveal>
            <Link className="btn btn--solid" href={`/${lang}/contact`}>
              {t.actions.primary} <ButtonIcon />
            </Link>
            <Link className="btn btn--outline" href={`/${lang}/services`}>
              {t.actions.secondary}
            </Link>
          </div>
        </header>

        <RoasCalculator lang={lang} t={t} />

        <section className="roas-explain" aria-labelledby="roas-explain-title">
          <h2 className="roas-explain__title" id="roas-explain-title">
            {t.explain.title}
          </h2>
          <p className="roas-explain__lede">{t.explain.lede}</p>
          <dl className="roas-explain__list">
            {t.explain.items.map((item) => (
              <div key={item.name}>
                <dt>{item.name}</dt>
                <dd>
                  <code>{item.formula}</code>
                  <p>{item.example}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </article>

      <section className="faq" aria-labelledby="roas-faq-title">
        <div className="faq__inner">
          <div className="faq__side">
            <Eyebrow left>{t.faq.eyebrow}</Eyebrow>
            <div className="faq__intro" data-reveal>
              <h2 className="faq__title" id="roas-faq-title">
                {t.faq.title}
              </h2>
            </div>
          </div>
          <Faq items={t.faq.items} />
        </div>
      </section>

      {/* For search engines and AI answers: the calculator as a free web app, and the questions above */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Cta lang={lang} title={t.cta.title} titleEm={t.cta.titleEm} button={t.cta.button} />
    </>
  );
}
