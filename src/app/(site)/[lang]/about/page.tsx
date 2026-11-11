import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { getClients } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { rich } from "@/components/Rich";
import { AboutBlock, Clients, Cta, Eyebrow, PageHead, EMAIL, INSTAGRAM, PHONE, WHATSAPP } from "@/components/sections";
import { SectionEffects } from "@/components/client";

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
          <header className="block__head block__head--center">
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
        <div className="block__inner block__inner--split">
          <header className="block__head block__head--stack">
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
          {/* One point open at a time, rotating while on screen (initBeliefs).
              The script owns the open state, so React never rewrites these
              classes and wipes the scroll fade-in's. */}
          <SectionEffects section="beliefs" />
          <ul className="beliefs" data-accordion>
            {a.beliefs.map(([title, text], i) => (
              <li className={`belief${i === 0 ? " is-open" : ""}`} data-reveal style={delay(i * 80)} key={title}>
                <span className="belief__bar" aria-hidden="true" />
                <h3 className="belief__h">
                  <button type="button" className="belief__btn" id={`belief-btn-${i + 1}`} aria-expanded={i === 0} aria-controls={`belief-panel-${i + 1}`}>
                    {/* Drawn by CSS from data-num and hidden from screen readers, so the
                        heading reads "One clear goal first", not "01One clear goal first" */}
                    <span className="belief__num" data-num={String(i + 1).padStart(2, "0")} aria-hidden="true" />
                    <span className="belief__name">{title}</span>
                  </button>
                </h3>
                <div className="belief__panel" id={`belief-panel-${i + 1}`} role="region" aria-labelledby={`belief-btn-${i + 1}`}>
                  <div className="belief__inner">
                    <p>{text}</p>
                  </div>
                </div>
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
              <div className="visit__place">
                <svg className="visit__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21.5s-7-6.1-7-11.75A7 7 0 0 1 19 9.75c0 5.65-7 11.75-7 11.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <circle cx="12" cy="9.75" r="2.6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <address>
                  <strong>PT Blissindo Kreasi Digital</strong>
                  <br />
                  Legalyn Indonesia, Kawasan Rasuna Epicentrum,
                  <br />
                  Epiwalk Office Suite Lt. 5 Unit A501,
                  <br />
                  Jl. HR Rasuna Said, Jakarta Selatan, DKI Jakarta 12940
                  {/* Copies the address as one line (initSite) */}
                  <span className="copy-addr">
                    <button className="copy-addr__btn" type="button" data-copy-address aria-label={a.copyAddress} title={a.copyAddress}>
                      <svg className="copy-addr__copy" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="5.25" y="5.25" width="8.5" height="8.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M10.75 5.25V4.25a2 2 0 0 0-2-2h-4.5a2 2 0 0 0-2 2v4.5a2 2 0 0 0 2 2h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <svg className="copy-addr__check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3.5 8.4 6.6 11.4 12.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <span className="copy-addr__done" role="status" data-done={a.copied}></span>
                  </span>
                </address>
              </div>
              <a
                className="text-link"
                href="https://www.google.com/maps/search/?api=1&query=Epiwalk+Office+Suite+Rasuna+Epicentrum+Jakarta"
                target="_blank"
                rel="noopener"
                title={a.maps}
              >
                <span className="visually-hidden">
                  {a.maps} ({t.footer.newTab})
                </span>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 10.5L10.5 3.5M4.75 3.5H10.5V9.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
            <div className="visit__card" data-reveal style={delay(110)}>
              <ul className="visit__list">
                <li>
                  <svg className="visit__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="visit__item">
                    <small>{a.phoneLabel}</small>
                    <a href={WHATSAPP} target="_blank" rel="noopener">
                      {PHONE}
                    </a>
                  </span>
                </li>
                <li>
                  <svg className="visit__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2 12c0-3.771 0-5.657 1.172-6.828C4.343 4 6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172C22 6.343 22 8.229 22 12s0 5.657-1.172 6.828C19.657 20 17.771 20 14 20h-4c-3.771 0-5.657 0-6.828-1.172C2 17.657 2 15.771 2 12Z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="m6 8 2.159 1.799c1.837 1.531 2.755 2.296 3.841 2.296s2.005-.765 3.841-2.296L18 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="visit__item">
                    <small>{a.emailLabel}</small>
                    <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  </span>
                </li>
                <li>
                  <svg className="visit__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
                  </svg>
                  <span className="visit__item">
                    <small>{a.instagramLabel}</small>
                    <a href={INSTAGRAM} target="_blank" rel="noopener">
                      @blissdigital.id
                    </a>
                  </span>
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
