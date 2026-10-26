import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { getClients } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { rich } from "@/components/Rich";
import { AboutBlock, Clients, Cta, Eyebrow, PageHead, EMAIL, INSTAGRAM, PHONE, WHATSAPP } from "@/components/sections";
import { ArrowUpRight } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.about;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/about" });
}

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const a = t.aboutPage;

  return (
    <>
      <section className="page page--intro" aria-labelledby="page-title">
        <PageHead eyebrow={a.eyebrow} title={a.title} lede={a.lede} />
      </section>

      <AboutBlock lang={lang} t={t.about} common={t.common} id="story" eyebrow={a.storyEyebrow} extra={a.storyText} />

      {/* Mission and vision: copy from the current blissdigital.id site */}
      <section className="block block--card" aria-labelledby="mv-title">
        <div className="block__inner">
          <header className="block__head">
            <div className="block__intro">
              <Eyebrow left>{a.mvEyebrow}</Eyebrow>
              <h2 className="block__title" id="mv-title" data-reveal>
                {rich(a.mvTitle)}
              </h2>
            </div>
          </header>
          <div className="mv">
            <article className="mv__card" data-reveal>
              <h3 className="mv__label">{a.mission}</h3>
              <p className="mv__text">{a.missionText}</p>
            </article>
            <article className="mv__card" data-reveal style={delay(110)}>
              <h3 className="mv__label">{a.vision}</h3>
              <p className="mv__text">{a.visionText}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="block" aria-labelledby="beliefs-title">
        <div className="block__inner">
          <header className="block__head">
            <div className="block__intro">
              <Eyebrow left>{a.beliefsEyebrow}</Eyebrow>
              <h2 className="block__title" id="beliefs-title" data-reveal>
                {rich(a.beliefsTitle)}
              </h2>
            </div>
            <Link className="btn btn--outline" href={`/${lang}#why-us`} data-reveal>
              {a.beliefsLink}
            </Link>
          </header>
          <ul className="beliefs">
            {a.beliefs.map(([title, text], i) => (
              <li data-reveal style={delay(i * 80)} key={title}>
                <b>{title}</b>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Clients t={t.clients} logos={getClients()} lede={a.clientsLede} />

      <section className="block" aria-labelledby="visit-title">
        <div className="block__inner">
          <header className="block__head">
            <div className="block__intro">
              <Eyebrow left>{a.visitEyebrow}</Eyebrow>
              <h2 className="block__title" id="visit-title" data-reveal>
                {rich(a.visitTitle)}
              </h2>
            </div>
            <p className="block__lede" data-reveal>
              {a.visitLede}
            </p>
          </header>
          <div className="visit">
            <div className="visit__card" data-reveal>
              <address>
                <strong>PT Blissindo Kreasi Digital</strong>
                <br />
                Legalyn Indonesia, Kawasan Rasuna Epicentrum,
                <br />
                Epiwalk Office Suite Lt. 5 Unit A501,
                <br />
                Jl. HR Rasuna Said, Jakarta Selatan, DKI Jakarta 12940
              </address>
              <a
                className="text-link"
                href="https://www.google.com/maps/search/?api=1&query=Epiwalk+Office+Suite+Rasuna+Epicentrum+Jakarta"
                target="_blank"
                rel="noopener"
              >
                {a.maps} <ArrowUpRight />
              </a>
            </div>
            <div className="visit__card" data-reveal style={delay(110)}>
              <ul className="visit__list">
                <li>
                  <small>{a.phoneLabel}</small>
                  <a href={WHATSAPP} target="_blank" rel="noopener">
                    {PHONE}
                  </a>
                </li>
                <li>
                  <small>{a.emailLabel}</small>
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                </li>
                <li>
                  <small>{a.instagramLabel}</small>
                  <a href={INSTAGRAM} target="_blank" rel="noopener">
                    @blissdigital.id
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Cta lang={lang} title={t.cta.title} titleEm={t.cta.titleEm} button={t.common.letsChat} />
    </>
  );
}
