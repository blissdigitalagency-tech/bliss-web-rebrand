/* eslint-disable @next/next/no-img-element -- logos and icons stay plain <img>; photos use next/image */
// Sections shared by the pages. These are Server Components: they render to
// HTML and send no JavaScript. Movement comes from <SectionEffects> and
// <SiteEffects> in client.tsx.
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import type { CaseStudy, ClientLogo, Post } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { rich } from "./Rich";
import { Faq, SectionEffects, SilkCanvas } from "./client";
import { ArrowUpRight, ArrowRight, ArrowLeft, BlissMark, Mail, Phone, WhatsApp, Instagram, LinkedIn } from "./icons";

export const WHATSAPP = "https://wa.me/628137903995";
export const EMAIL = "admin@blissdigital.id";
export const PHONE = "+62 813-7903-995";
export const PHONE_HREF = "tel:+628137903995";
export const INSTAGRAM = "https://www.instagram.com/blissdigital.id";
export const LINKEDIN = "https://www.linkedin.com/company/bliss-digital-agency/";
export const PARTNER = "https://www.google.com/partners/agency?id=3691602641";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

export function Eyebrow({ children, left = false, end = false }: { children: ReactNode; left?: boolean; end?: boolean }) {
  // Dot before the label (left) or after it, as in the designs
  return (
    <p className={`eyebrow${left ? " eyebrow--left" : ""}`} data-reveal>
      {left && <span className="eyebrow__dot" aria-hidden="true" />}
      {children}
      {end && <span className="eyebrow__dot" aria-hidden="true" />}
    </p>
  );
}

export function ButtonIcon() {
  return (
    <span className="btn__icon" aria-hidden="true">
      <ArrowUpRight />
    </span>
  );
}

/** Centered page heading used at the top of the inner pages */
export function PageHead({ eyebrow, title, lede, note, children }: { eyebrow: string; title: string; lede: string; note?: string; children?: ReactNode }) {
  return (
    <header className="page__head">
      <Eyebrow end>{eyebrow}</Eyebrow>
      <h1 className="page__title" id="page-title" data-reveal>
        {rich(title)}
      </h1>
      <p className="page__lede" data-reveal>
        {lede}
      </p>
      {note && (
        <span className="sample-note" data-reveal>
          {note}
        </span>
      )}
      {children}
    </header>
  );
}

/* ---------- Homepage logo intro: white mark on burgundy that flies into the navbar ---------- */

export function Intro({ t }: { t: Dictionary["intro"] }) {
  return (
    <section className="intro" aria-labelledby="intro-name">
      <SectionEffects section="intro" />
      <div className="intro__stage">
        <SilkCanvas className="intro__bg" />
        <div className="intro__brand">
          {/* The slot keeps the logo's place in the layout while the logo itself
              flies off; two stacked copies cross-fade from white to burgundy */}
          <div className="intro__slot">
            <div className="intro__logo" aria-hidden="true">
              <BlissMark white className="intro__mark intro__mark--white" />
              <BlissMark className="intro__mark intro__mark--brand" />
            </div>
          </div>
          <p className="intro__name" id="intro-name">
            {t.name} <em>{t.nameEm}</em>
          </p>
        </div>
        <p className="intro__cue" aria-hidden="true">
          {t.cue}
          <span className="intro__cue-line" />
        </p>
      </div>
    </section>
  );
}

/* ---------- Homepage hero: words left, floating mock ad and results UI right ---------- */

export function Hero({ lang, t, common }: { lang: Locale; t: Dictionary["hero"]; common: Dictionary["common"] }) {
  const m = t.mock;
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
  const f = (dur: string, del: string) => ({ "--fd": dur, "--fdel": del }) as CSSProperties;
  const bars = [22, 30, 28, 44, 52, 66, 92];
  return (
    <section className="hero" aria-labelledby="hero-title">
      <SectionEffects section="hero" />
      <div className="hero__content">
        <div className="hero__text">
          <p className="hero__pill" data-intro style={d(0)}>
            <span className="hero__pill-dot" aria-hidden="true" />
            {t.pill}
          </p>
          <h1 className="hero__title" id="hero-title">
            <span className="hero__word" data-intro style={d(120)}>
              {t.title}
            </span>{" "}
            <em className="hero__word" data-intro style={d(220)}>
              {t.titleEm}
            </em>
          </h1>
          <p className="hero__lede" data-intro style={d(360)}>
            {t.lede}
          </p>
          <div className="hero__actions" data-intro style={d(480)}>
            <Link className="btn btn--solid" href={`/${lang}/contact`}>
              {common.letsChat} <ButtonIcon />
            </Link>
            <a className="btn btn--outline" href="#services">
              {common.ourServices}
            </a>
          </div>
        </div>

        {/* Decorative examples: a Google search ad, an Instagram ad, a results chart and a website score */}
        <div className="hero__visual" aria-hidden="true">
          <div className="hv">
            <div className="hv__item hv__search" data-intro style={d(380)}>
              <div className="hv__float" style={f("7s", "0s")}>
                <div className="hv-card hv-search">
                  <div className="search__bar">
                    <span className="g-logo">
                      <b style={{ color: "#4285F4" }}>G</b>
                      <b style={{ color: "#EA4335" }}>o</b>
                      <b style={{ color: "#FBBC04" }}>o</b>
                      <b style={{ color: "#4285F4" }}>g</b>
                      <b style={{ color: "#34A853" }}>l</b>
                      <b style={{ color: "#EA4335" }}>e</b>
                    </span>
                    <span className="search__q">{m.query}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="7" cy="7" r="4.5" stroke="#4285F4" strokeWidth="1.6" />
                      <path d="M10.4 10.4 14 14" stroke="#4285F4" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="search__ad">
                    <span className="search__tag">{m.sponsored}</span>
                    <div className="search__site">
                      <i>S</i>
                      <span>
                        {m.clinic}
                        <small>sehatdental.id</small>
                      </span>
                    </div>
                    <p className="search__title">{m.adTitle}</p>
                    <p className="search__desc">{m.adDesc}</p>
                    <p className="search__links">{m.adLinks}</p>
                  </div>
                  <div className="search__org">
                    <i style={{ width: "46%" }} />
                    <i style={{ width: "88%" }} />
                    <i style={{ width: "70%" }} />
                  </div>
                </div>
                <span className="hv-chip">{m.rank}</span>
              </div>
            </div>

            <div className="hv__item hv__meta" data-intro style={d(560)}>
              <div className="hv__float" style={f("8s", "-2s")}>
                <div className="hv-card hv-meta">
                  <div className="meta__head">
                    <i>K</i>
                    <span>
                      <b>kopiruang</b>
                      {m.sponsored}
                    </span>
                    <img src="/images/services/logo-meta.png" width={18} height={18} alt="" />
                  </div>
                  <div className="meta__img">
                    <Image src="/images/hero-coffee.jpg" width={600} height={600} sizes="220px" alt="" />
                  </div>
                  <div className="meta__cta">
                    {m.order} <span>›</span>
                  </div>
                  <p className="meta__cap">
                    <b>kopiruang</b> {m.caption}
                  </p>
                </div>
              </div>
            </div>

            <div className="hv__item hv__stats" data-intro style={d(720)}>
              <div className="hv__float" style={f("6s", "-1s")}>
                <div className="hv-card hv-stats">
                  <p className="stats__label">
                    <i />
                    {m.statsLabel}
                  </p>
                  <p className="stats__num">+62%</p>
                  <div className="bars">
                    {bars.map((h, i) => (
                      <i key={i} className={i === bars.length - 1 ? "is-top" : undefined} style={{ "--h": `${h}%` } as CSSProperties} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="hv__item hv__site" data-intro style={d(860)}>
              <div className="hv__float" style={f("7.5s", "-3s")}>
                <div className="hv-card hv-site">
                  <div className="ring">
                    <svg viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" className="ring__track" />
                      <circle cx="22" cy="22" r="18" className="ring__fill" />
                    </svg>
                    <b>98</b>
                  </div>
                  <div className="site__text">
                    <p className="site__title">{m.speed}</p>
                    <p className="site__sub">
                      <span className="ok">✓</span> {m.found}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Scroll-pinned tagline ---------- */

export function Tagline({ lines }: { lines: string[] }) {
  return (
    <section className="tagline" id="tagline" aria-labelledby="tagline-title">
      <SectionEffects section="tagline" />
      <div className="tagline__stage">
        <SilkCanvas className="tagline__bg" droplets />
        <h2 className="tagline__title" id="tagline-title">
          {lines.map((line, i) => (
            <span className="tagline__line" key={i}>
              {rich(line)}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}

/* ---------- Client logos ---------- */

export function Clients({ t, logos, lede }: { t: Dictionary["clients"]; logos: ClientLogo[]; lede?: string }) {
  const list = (hidden: boolean) => (
    <ul className="marquee__list" aria-hidden={hidden || undefined}>
      {logos.map((l) => (
        <li key={l.logo}>
          <img className={l.tight ? "is-tight" : undefined} src={l.logo} alt={hidden ? "" : l.name} loading="lazy" />
        </li>
      ))}
    </ul>
  );
  return (
    <section className="clients" id="clients" aria-labelledby="clients-title">
      <header className="clients__head">
        <div className="clients__intro">
          <Eyebrow left>{t.eyebrow}</Eyebrow>
          <h2 className="clients__title" id="clients-title" data-reveal>
            <span>{t.title}</span> <em>{t.titleEm}</em>
          </h2>
        </div>
        <p className="clients__lede" data-reveal>
          {lede ?? t.lede}
        </p>
      </header>
      <div className="marquee" data-reveal>
        <div className="marquee__track">
          {list(false)}
          {list(true)}
        </div>
      </div>
    </section>
  );
}

/* ---------- About us block (homepage and About page) ---------- */

export function AboutBlock({
  lang,
  t,
  common,
  id = "about",
  eyebrow,
  extra,
}: {
  lang: Locale;
  t: Dictionary["about"];
  common: Dictionary["common"];
  id?: string;
  eyebrow?: string;
  extra?: string;
}) {
  return (
    <section className="about" id={id} aria-labelledby={`${id}-title`}>
      <div className="about__inner">
        <div className="about__img" data-reveal>
          <Image src="/images/about-team.jpg" width={735} height={360} sizes="(max-width: 900px) 100vw, 600px" alt={t.imageAlt} />
        </div>
        <div className="about__body">
          <Eyebrow left>{eyebrow ?? t.eyebrow}</Eyebrow>
          <h2 className="about__title" id={`${id}-title`} data-reveal>
            <span>{rich(t.titleA)}</span> <span>{rich(t.titleB)}</span>
          </h2>
          <p className="about__text" data-reveal>
            {rich(t.text)}
          </p>
          {extra && (
            <p className="about__text" data-reveal>
              {extra}
            </p>
          )}
          <dl className="stats-row" data-reveal>
            {t.stats.map((s) => (
              <div key={s.value}>
                <dt>{rich(s.label)}</dt>
                <dd data-count={s.value} aria-label={s.value}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
          <div className="about__actions" data-reveal>
            <Link className="btn btn--solid" href={`/${lang}/contact`}>
              {common.startProject} <ButtonIcon />
            </Link>
            {/* GOOGLE PARTNER BADGE: Google requires its official badge snippet
                (Google Ads > Partners program > Badge). Replace this stand-in
                image with it, unchanged, without extra text or borders.
                Guidelines: support.google.com/google-ads/answer/9028798 */}
            <a className="partner-badge" href={PARTNER} target="_blank" rel="noopener">
              <img src="/brand/google-partner.png" width={86} height={86} alt={common.partnerAlt} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Homepage services: three stacking cards ---------- */

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="svc__list">
      {items.map((it) => (
        <li key={it}>{it}</li>
      ))}
    </ul>
  );
}

export function ServicesStack({ lang, t }: { lang: Locale; t: Dictionary["services"] }) {
  const g = t.google;
  const contact = (service: string) => `/${lang}/contact?service=${service}`;
  const solo = (key: "meta" | "web", icon: string, alt: string, service: string, i: number) => {
    const s = t[key];
    return (
      <article className="svc" data-svc style={{ "--i": i } as CSSProperties}>
        <div className="svc__text">
          <div className="svc__lead">
            <div className="svc__icon">
              <img src={icon} width={48} height={48} alt={alt} />
            </div>
            <div>
              <h3 className="svc__title">{s.title}</h3>
              <p className="svc__sub">{s.sub}</p>
            </div>
          </div>
          <div className="svc__panel svc__panel--solo">
            <div>
              <h4 className="svc__plan">{s.plan}</h4>
              <p className="svc__desc">{s.desc}</p>
              <Link className="btn btn--solid" href={contact(service)}>
                {s.button}
              </Link>
            </div>
            <Checklist items={s.items} />
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="services" id="services" aria-labelledby="services-title">
      <SectionEffects section="services" />
      <div className="services__stage">
        <div className="services__fit">
          <header className="services__head">
            <Eyebrow left>{t.eyebrow}</Eyebrow>
            <div className="services__intro">
              <h2 className="services__title" id="services-title" data-reveal style={delay(100)}>
                <span>{t.titleA}</span> <span>{rich(t.titleB)}</span>
              </h2>
              <p className="services__lede" data-reveal style={delay(200)}>
                {t.lede}
              </p>
            </div>
            <div className="services__rail" role="group" aria-label={t.railLabel} data-reveal style={delay(300)}>
              {[g.title, t.meta.title, t.web.title].map((label, i) => (
                <button key={label} type="button" data-rail={i} aria-label={label} className={i === 0 ? "is-active" : undefined} />
              ))}
            </div>
          </header>
          <div className="services__stack" data-reveal style={delay(250)}>
            <article className="svc" data-svc style={{ "--i": 0 } as CSSProperties}>
              <div className="svc__text">
                <div className="svc__lead">
                  <div className="svc__icon">
                    <img src="/images/services/logo-google-ads.png" width={48} height={48} alt="Google Ads" />
                  </div>
                  <div>
                    <h3 className="svc__title">{g.title}</h3>
                    <p className="svc__sub">{g.sub}</p>
                  </div>
                </div>
                <div className="svc__tabs has-pill" role="tablist" aria-label={g.tabsLabel}>
                  <span className="svc__tabs__pill" aria-hidden="true" />
                  {g.tabs.map((tab, i) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`gads-${tab.id}-tab`}
                      aria-controls={`gads-${tab.id}`}
                      aria-selected={i === 0}
                      tabIndex={i === 0 ? 0 : -1}
                    >
                      {tab.tab}
                    </button>
                  ))}
                </div>
                {/* All three panels share one space, so the card keeps the height of the tallest */}
                <div className="svc__panels">
                  {g.tabs.map((tab, i) => (
                    <div key={tab.id} className="svc__panel" id={`gads-${tab.id}`} role="tabpanel" aria-labelledby={`gads-${tab.id}-tab`} hidden={i !== 0}>
                      <div>
                        <h4 className="svc__plan">{tab.plan}</h4>
                        <p className="svc__desc">{tab.desc}</p>
                        <Link className={`btn ${i === 0 ? "btn--solid" : "btn--outline"}`} href={contact(tab.service)}>
                          {tab.button}
                        </Link>
                      </div>
                      <Checklist items={tab.items} />
                    </div>
                  ))}
                </div>
              </div>
            </article>
            {solo("meta", "/images/services/logo-meta.png", "Meta", "meta-ads", 1)}
            {solo("web", "/images/services/logo-figma.png", "Figma", "website", 2)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Why us: six cards, each with a small looping demo ---------- */

export function Why({ t }: { t: Dictionary["why"] }) {
  // Busy hours in the example grid: m = medium, p = peak
  const heat = [
    ["", "", "", "", "", "m", "m"],
    ["m", "m", "m", "m", "p", "p", "m"],
    ["m", "", "m", "p", "p", "p", "m"],
    ["", "", "", "", "m", "m", ""],
  ];
  return (
    <section className="why" id="why-us" aria-labelledby="why-title">
      <SectionEffects section="why" />
      <div className="why__inner">
        <header className="why__head">
          <div className="why__intro">
            <h2 className="why__title" id="why-title" data-reveal>
              <span className="why__title-line">{t.titleA}</span>
              <em className="why__title-line">{t.titleB}</em>
            </h2>
            <p className="why__lede" data-reveal>
              {t.lede}
            </p>
          </div>
          <Eyebrow end>{t.eyebrow}</Eyebrow>
        </header>

        <div className="why__grid">
          <article className="wc" data-reveal data-play>
            <p className="wc__label">{t.people.label}</p>
            <h3 className="wc__title">{t.people.title}</h3>
            <p className="wc__body">{t.people.body}</p>
            <div className="wc__vis funnel" aria-hidden="true">
              {t.people.rows.map((row, i) => (
                <div className="funnel__row" key={row}>
                  <span>{row}</span>
                  <i style={{ "--w": ["100%", "62%", "30%"][i], "--c": ["#e6e6e6", "#c9c4bd", "var(--accent)"][i] } as CSSProperties} />
                </div>
              ))}
            </div>
            <p className="wc__sig">{rich(t.people.sig)}</p>
          </article>

          <article className="wc" data-reveal data-play>
            <p className="wc__label">{t.time.label}</p>
            <h3 className="wc__title">{t.time.title}</h3>
            <p className="wc__body">{t.time.body}</p>
            <div className="wc__vis" aria-hidden="true">
              <div className="heat">
                <span />
                {t.time.days.map((day, i) => (
                  <span className="heat__d" key={i}>
                    {day}
                  </span>
                ))}
                {heat.map((row, r) => [
                  <span className="heat__h" key={`h${r}`}>
                    {t.time.hours[r]}
                  </span>,
                  ...row.map((c, i) => <i key={`${r}-${i}`} className={c || undefined} />),
                ])}
              </div>
              <p className="wc__note">{t.time.note}</p>
            </div>
            <p className="wc__sig">{rich(t.time.sig)}</p>
          </article>

          <article className="wc" data-reveal data-play>
            <p className="wc__label">{t.message.label}</p>
            <h3 className="wc__title">{t.message.title}</h3>
            <p className="wc__body">{t.message.body}</p>
            <div className="wc__vis" aria-hidden="true">
              <div className="msg">
                <div className="msg__row msg__row--a">
                  <span>
                    <small>{t.message.a}</small>
                    {t.message.aText}
                  </span>
                  <span className="status status--change">{t.message.replace}</span>
                </div>
                <div className="msg__row msg__row--b">
                  <span>
                    <small>{t.message.b}</small>
                    {t.message.bText}
                  </span>
                  <span className="status status--ready">{t.message.keep}</span>
                </div>
                <span className="msg__scan" />
              </div>
              <p className="wc__note">{t.example}</p>
            </div>
            <p className="wc__sig">{rich(t.message.sig)}</p>
          </article>

          <article className="wc" data-reveal data-play>
            <p className="wc__label">{t.numbers.label}</p>
            <h3 className="wc__title">{t.numbers.title}</h3>
            <p className="wc__body">{t.numbers.body}</p>
            <div className="wc__vis chips" aria-hidden="true">
              {t.numbers.chips.map(([k, v], i) => (
                <span className={`chip${i === t.numbers.chips.length - 1 ? " chip--go" : ""}`} key={i}>
                  <b>{k}</b>
                  <span>{v}</span>
                </span>
              ))}
            </div>
            <p className="wc__sig">{rich(t.numbers.sig)}</p>
          </article>

          <article className="wc" data-reveal data-play>
            <p className="wc__label">{t.reports.label}</p>
            <h3 className="wc__title">{t.reports.title}</h3>
            <p className="wc__body">{t.reports.body}</p>
            <div className="wc__vis" aria-hidden="true">
              <div className="plan">
                <span className="chip chip--wide plan__now">
                  <b>{t.reports.now}</b>
                  <span>{t.reports.nowText}</span>
                  <i className="dot dot--change" />
                </span>
                <span className="chip chip--wide plan__next">
                  <b>{t.reports.next}</b>
                  <span>{t.reports.nextText}</span>
                  <i className="dot dot--ready" />
                </span>
              </div>
              <div className="plan__key">
                <span>
                  <i className="dot dot--change" />
                  {t.reports.needsChange}
                </span>
                <span>
                  <i className="dot dot--ready" />
                  {t.reports.ready}
                </span>
              </div>
              <p className="wc__note">{t.example}</p>
            </div>
            <p className="wc__sig">{rich(t.reports.sig)}</p>
          </article>

          <article className="wc" data-reveal data-play>
            <p className="wc__label">{t.ownership.label}</p>
            <h3 className="wc__title">{t.ownership.title}</h3>
            <p className="wc__body">{t.ownership.body}</p>
            <div className="wc__vis" aria-hidden="true">
              <div className="pills">
                {["Google Ads", "Meta", "Analytics"].map((p) => (
                  <span className="pill" key={p}>
                    <i />
                    {p}
                  </span>
                ))}
              </div>
              <p className="own-note" data-type={t.ownership.owner}>
                {t.ownership.owner}
              </p>
            </div>
            <div className="keybox">
              <span className="keybox__icon" aria-hidden="true">
                <svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="#fff" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="9" r="3" />
                  <path d="M9 9h7M13.5 9v2.5M15.5 9v1.8" />
                </svg>
              </span>
              <p>{rich(t.ownership.key)}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------- Case study and blog cards ---------- */

export function Card({
  href,
  image,
  imageAlt,
  pill,
  title,
  excerpt,
  date,
  readTime,
  lang,
  minRead,
  index,
}: {
  href: string;
  image: string;
  imageAlt: string;
  pill: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  lang: Locale;
  minRead: string;
  index: number;
}) {
  return (
    <Link className="case" href={href} data-reveal style={delay((index % 3) * 110)}>
      <span className="case__img">
        <Image src={image} width={850} height={560} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 400px" alt={imageAlt} />
      </span>
      <span className="case__text">
        <span className="case__pill">{pill}</span>
        <span className="case__title">{title}</span>
        <span className="case__body">{excerpt}</span>
        <span className="case__meta">
          <time dateTime={date}>{formatDate(date, lang)}</time>
          <i aria-hidden="true" />
          {readTime} {minRead}
        </span>
      </span>
    </Link>
  );
}

export const caseCard = (c: CaseStudy, i: number, lang: Locale, common: Dictionary["common"]) => (
  <Card
    key={c.slug}
    href={`/${lang}/case-studies/${c.slug}`}
    image={c.image}
    imageAlt={c.imageAlt}
    pill={c.service}
    title={c.title}
    excerpt={c.excerpt}
    date={c.date}
    readTime={c.readTime}
    lang={lang}
    minRead={common.minRead}
    index={i}
  />
);

export const postCard = (p: Post, i: number, lang: Locale, common: Dictionary["common"]) => (
  <Card
    key={p.slug}
    href={`/${lang}/blog/${p.slug}`}
    image={p.image}
    imageAlt={p.imageAlt}
    pill={p.topic}
    title={p.title}
    excerpt={p.excerpt}
    date={p.date}
    readTime={p.readTime}
    lang={lang}
    minRead={common.minRead}
    index={i}
  />
);

export function CasesSection({ lang, t, common, cases }: { lang: Locale; t: Dictionary["cases"]; common: Dictionary["common"]; cases: CaseStudy[] }) {
  if (!cases.length) return null;
  return (
    <section className="cases" id="case-studies" aria-labelledby="cases-title">
      <div className="cases__inner">
        <header className="cases__head">
          <div className="cases__intro">
            <h2 className="cases__title" id="cases-title" data-reveal>
              <span>{t.title}</span> <em>{t.titleEm}</em>
            </h2>
            <p className="cases__lede" data-reveal>
              {t.lede}
            </p>
          </div>
          <div className="cases__side">
            <Eyebrow end>{t.eyebrow}</Eyebrow>
            <Link className="btn btn--solid cases__more" href={`/${lang}/case-studies`} data-reveal>
              {common.viewMore} <ButtonIcon />
            </Link>
          </div>
        </header>
        <div className="cases__grid">{cases.slice(0, 3).map((c, i) => caseCard(c, i, lang, common))}</div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

export function FaqSection({ t }: { t: Dictionary["faq"] }) {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="faq__inner">
        <div className="faq__side">
          <Eyebrow left>{t.eyebrow}</Eyebrow>
          <div className="faq__intro" data-reveal>
            <h2 className="faq__title" id="faq-title">
              {rich(t.title)}
            </h2>
            <p className="faq__lede">
              {t.lede} <a href={WHATSAPP}>{t.ledeLink}</a>
            </p>
          </div>
        </div>
        <Faq items={t.items} />
      </div>
    </section>
  );
}

/* ---------- Call to action banner ---------- */

export function Cta({ lang, title, titleEm, button }: { lang: Locale; title: string; titleEm: string; button: string }) {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="cta__box" data-reveal>
        <SilkCanvas className="cta__bg" />
        <h2 className="cta__title" id="cta-title">
          <span>{title}</span> <em>{titleEm}</em>
        </h2>
        <Link className="btn btn--glass cta__btn" href={`/${lang}/contact`}>
          {button} <ButtonIcon />
        </Link>
      </div>
    </section>
  );
}

/* ---------- Footer and back to top ---------- */

export function Footer({ lang, t, nav }: { lang: Locale; t: Dictionary["footer"]; nav: Dictionary["nav"] }) {
  const links: [string, string][] = [
    ["", t.homeLink],
    ["/about", nav.about],
    ["/services", nav.services],
    ["/case-studies", nav.cases],
    ["/blog", nav.blog],
    ["/contact", nav.contact],
    ["/privacy", t.privacy],
  ];
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand" data-reveal>
          <div className="footer__top">
            <Link className="footer__logo" href={`/${lang}`} aria-label={nav.home}>
              <img className="footer__tile" src="/brand/bliss-mark.svg" width={32} height={32} alt="" />
              <span className="footer__name">Bliss Digital</span>
            </Link>
          </div>
          <p className="footer__copy">{t.copyright}</p>
          <div className="footer__social">
            <a className="social-btn" href={WHATSAPP} target="_blank" rel="noopener" aria-label={`WhatsApp (${t.newTab})`}>
              <WhatsApp />
            </a>
            <a className="social-btn" href={INSTAGRAM} target="_blank" rel="noopener" aria-label={`Instagram (${t.newTab})`}>
              <Instagram />
            </a>
            <a className="social-btn" href={LINKEDIN} target="_blank" rel="noopener" aria-label={`LinkedIn (${t.newTab})`}>
              <LinkedIn />
            </a>
          </div>
        </div>

        <address className="footer__address" data-reveal>
          <strong>PT Blissindo Kreasi Digital</strong>
          <br />
          Legalyn Indonesia, Kawasan Rasuna Epicentrum,
          <br />
          Epiwalk Office Suite Lt. 5 Unit A501,
          <br />
          Jl. HR Rasuna Said, Jakarta Selatan, DKI Jakarta 12940
        </address>

        <span className="footer__rule" aria-hidden="true" />

        <ul className="footer__contact" data-reveal>
          <li>
            <Mail />
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
          <li>
            <Phone />
            <a href={PHONE_HREF}>{PHONE}</a>
          </li>
        </ul>
      </div>

      <nav className="footer__base" aria-label={t.links}>
        {links.map(([path, label]) => (
          <Link key={path} href={`/${lang}${path}`}>
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}

export function ToTop({ label }: { label: string }) {
  return (
    <a className="to-top" href="#top" aria-label={label} data-to-top>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 15.8337V4.16699" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.16602 10.0003L9.99935 4.16699L15.8327 10.0003" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/* ---------- Article pages (case studies and blog posts) ---------- */

export function NextLink({ href, label, title }: { href: string; label: string; title: string }) {
  return (
    <Link className="next-case" href={href}>
      <span className="next-case__label">{label}</span>
      <span className="next-case__title">{title}</span>
      <span className="next-case__arrow" aria-hidden="true">
        <ArrowRight />
      </span>
    </Link>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="back-link" href={href}>
      <ArrowLeft />
      {label}
    </Link>
  );
}

export { WhatsApp };
