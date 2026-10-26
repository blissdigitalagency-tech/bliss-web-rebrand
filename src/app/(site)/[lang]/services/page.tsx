/* eslint-disable @next/next/no-img-element -- service logos stay plain <img>; photos use next/image */
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { pageMetadata } from "@/lib/seo";
import { rich } from "@/components/Rich";
import { Cta, Eyebrow, PageHead } from "@/components/sections";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.services;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/services" });
}

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

type Copy = Dictionary["servicesPage"];
type Service = {
  id: string;
  icon: string;
  image?: { src: string; alt: string };
  copy: Copy["google"] | Copy["meta"] | Copy["web"] | Copy["social"];
  contactKey: string;
};

function ServiceSection({ lang, s, alt, waysTitle, ways }: { lang: Locale; s: Service; alt: boolean; waysTitle?: string; ways?: string[][] }) {
  const c = s.copy;
  return (
    <section className={`sd${alt ? " sd--alt" : ""}`} id={s.id} aria-labelledby={`${s.id}-title`}>
      <div className="sd__inner">
        <div className="sd__side">
          <img className="sd__icon" src={s.icon} width={56} height={56} alt="" data-reveal />
          <h2 className="sd__title" id={`${s.id}-title`} data-reveal>
            {c.title}
          </h2>
          <p className="sd__lede" data-reveal>
            {c.lede}
          </p>
          <Link className="btn btn--solid" href={`/${lang}/contact?service=${s.contactKey}`} data-reveal>
            {c.button}
          </Link>
        </div>
        <div className="sd__main">
          {s.image && (
            <figure className="sd__img" data-reveal>
              <Image src={s.image.src} width={811} height={622} sizes="(max-width: 900px) 100vw, 700px" alt={s.image.alt} />
            </figure>
          )}

          {ways && (
            <div className="sd__group" data-reveal>
              <h3>{waysTitle}</h3>
              <div className="ways">
                {ways.map(([title, text, link, key], i) => (
                  <div className={`way${i === 0 ? " way--main" : ""}`} key={key}>
                    <b>{title}</b>
                    <span>{text}</span>
                    <Link href={`/${lang}/contact?service=${key}`}>{link}</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="sd__group" data-reveal>
            <h3>{c.includedTitle}</h3>
            <ul className="svc__list">
              {c.included.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>

          <div className="sd__group" data-reveal>
            <h3>{c.tagsTitle}</h3>
            <ul className="tags">
              {c.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            {"pair" in c && <p>{c.pair}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const p = t.servicesPage;

  const services: Service[] = [
    { id: "google-ads", icon: "/images/services/logo-google-ads.png", image: { src: "/images/services/google-ads.jpg", alt: p.google.imageAlt }, copy: p.google, contactKey: "google-ads" },
    { id: "meta-ads", icon: "/images/services/logo-meta.png", image: { src: "/images/services/meta-ads.jpg", alt: p.meta.imageAlt }, copy: p.meta, contactKey: "meta-ads" },
    { id: "website", icon: "/images/services/logo-figma.png", image: { src: "/images/services/website.jpg", alt: p.web.imageAlt }, copy: p.web, contactKey: "website" },
    { id: "social-media", icon: "/images/services/logo-instagram.svg", copy: p.social, contactKey: "social-media" },
  ];
  const jump: [string, string, string][] = [
    ["google-ads", "/images/services/logo-google-ads.png", p.jump.google],
    ["meta-ads", "/images/services/logo-meta.png", p.jump.meta],
    ["website", "/images/services/logo-figma.png", p.jump.web],
    ["social-media", "/images/services/logo-instagram.svg", p.jump.social],
  ];

  return (
    <>
      <section className="page page--intro" aria-labelledby="page-title">
        <PageHead eyebrow={p.eyebrow} title={p.title} lede={p.lede}>
          <ul className="jump" data-reveal>
            {jump.map(([id, icon, label]) => (
              <li key={id}>
                <a href={`#${id}`}>
                  <img src={icon} width={24} height={24} alt="" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </PageHead>
      </section>

      {services.map((s, i) => (
        <ServiceSection
          key={s.id}
          lang={lang}
          s={s}
          alt={i % 2 === 1}
          waysTitle={i === 0 ? p.google.waysTitle : undefined}
          ways={i === 0 ? p.google.ways : undefined}
        />
      ))}

      <section className="block" aria-labelledby="steps-title">
        <div className="block__inner">
          <header className="block__head">
            <div className="block__intro">
              <Eyebrow left>{p.stepsEyebrow}</Eyebrow>
              <h2 className="block__title" id="steps-title" data-reveal>
                {rich(p.stepsTitle)}
              </h2>
            </div>
            <p className="block__lede" data-reveal>
              {p.stepsLede}
            </p>
          </header>
          <ol className="steps">
            {p.steps.map(([title, text, note], i) => (
              <li data-reveal style={delay(i * 60)} key={title}>
                <b>{title}</b>
                <span>{text}</span>
                <small>{note}</small>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Cta lang={lang} title={t.cta.servicesTitle} titleEm={t.cta.servicesTitleEm} button={t.common.letsChat} />
    </>
  );
}
