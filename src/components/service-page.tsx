// Shared pieces of the three service pages (/services/google-ads, /website,
// /social-media): the head with its breadcrumb, numbered steps, a checklist
// beside a white box, the FAQ, and the structured data for search engines.
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { absolute } from "@/lib/seo";
import { plain, rich } from "@/components/Rich";
import { Eyebrow } from "@/components/sections";
import { Faq } from "@/components/client";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

type Crumbs = { home: string; services: string; current: string };
type FaqItem = { q: string; a: string[] };

/** Page head: Home / Services / this page, then the main heading and intro. */
export function ServiceHead({ lang, crumbs, title, lede }: { lang: Locale; crumbs: Crumbs; title: string; lede: string }) {
  return (
    <section className="page page--intro" aria-labelledby="page-title">
      <header className="page__head">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href={`/${lang}`}>{crumbs.home}</Link>
            </li>
            <li>
              <Link href={`/${lang}/services`}>{crumbs.services}</Link>
            </li>
            <li aria-current="page">{crumbs.current}</li>
          </ol>
        </nav>
        <h1 className="page__title" id="page-title" data-reveal>
          {rich(title)}
        </h1>
        <p className="page__lede" data-reveal>
          {lede}
        </p>
      </header>
    </section>
  );
}

/**
 * What the service includes: the long intro and the contact button on one
 * side; the photo and the details (children) on the other.
 */
export function ServiceHow({
  id,
  icon,
  title,
  lede,
  button,
  image,
  badge,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  lede: string;
  button: { href: string; label: string };
  image?: { src: string; alt: string };
  /** Shown instead of the service logo (the Google Partner badge on the Google Ads page) */
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="sd" aria-labelledby={id}>
      <div className="sd__inner">
        <div className="sd__side">
          <div data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element -- service logos stay plain <img> */}
            {badge ?? <img className="sd__icon" src={icon} width={56} height={56} alt="" />}
          </div>
          <h2 className="sd__title" id={id} data-reveal>
            {title}
          </h2>
          <p className="sd__lede" data-reveal>
            {lede}
          </p>
          <Link className="btn btn--solid" href={button.href} data-reveal>
            {button.label}
          </Link>
        </div>
        <div className="sd__main">
          {image && (
            <figure className="sd__img" data-reveal>
              <Image src={image.src} width={811} height={622} sizes="(max-width: 900px) 100vw, 700px" alt={image.alt} />
            </figure>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

/** A heading and a list inside ServiceHow: a checklist, or tags. */
export function ServiceGroup({ title, items, tags = false }: { title: string; items: string[]; tags?: boolean }) {
  return (
    <div className="sd__group" data-reveal>
      <h3>{title}</h3>
      <ul className={tags ? "tags" : "svc__list"}>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

/** A real sequence, so the steps are numbered. Four or five steps. */
export function ServiceSteps({ id, eyebrow, title, lede, items }: { id: string; eyebrow: string; title: string; lede: string; items: string[][] }) {
  return (
    <section className="block" aria-labelledby={id}>
      <div className="block__inner">
        <header className="block__head">
          <div className="block__intro">
            <Eyebrow left>{eyebrow}</Eyebrow>
            <h2 className="block__title" id={id} data-reveal>
              {rich(title)}
            </h2>
          </div>
          <p className="block__lede" data-reveal>
            {lede}
          </p>
        </header>
        <ol className={`steps${items.length === 4 ? " steps--4" : ""}`}>
          {items.map(([name, text, note], i) => (
            <li data-reveal style={delay(i * 60)} key={name}>
              <b>{name}</b>
              <span>{text}</span>
              <small>{note}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** A checklist with a heading, beside a white box (account ownership, a tool, other services). */
export function ServiceSplit({
  id,
  eyebrow,
  title,
  lede,
  items,
  note,
  box,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede: string;
  items: string[];
  note?: string;
  box: { title: string; text: string; children?: ReactNode };
}) {
  return (
    <section className="block block--card" aria-labelledby={id}>
      <div className="block__inner sp-split">
        <div className="sp-split__main">
          <Eyebrow left>{eyebrow}</Eyebrow>
          <h2 className="block__title" id={id} data-reveal>
            {rich(title)}
          </h2>
          <p className="block__lede" data-reveal>
            {lede}
          </p>
          <ul className="svc__list" data-reveal>
            {items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
          {note && (
            <p className="sp-split__note" data-reveal>
              {note}
            </p>
          )}
        </div>
        <div className="sp-box" data-reveal>
          <h2 className="sp-box__title">{rich(box.title)}</h2>
          <p>{box.text}</p>
          {box.children}
        </div>
      </div>
    </section>
  );
}

export function ServiceFaq({ id, eyebrow, title, items }: { id: string; eyebrow: string; title: string; items: FaqItem[] }) {
  return (
    <section className="faq" aria-labelledby={id}>
      <div className="faq__inner">
        <div className="faq__side">
          <Eyebrow left>{eyebrow}</Eyebrow>
          <div className="faq__intro" data-reveal>
            <h2 className="faq__title" id={id}>
              {rich(title)}
            </h2>
          </div>
        </div>
        <Faq items={items} />
      </div>
    </section>
  );
}

/** For search engines and AI answers: the service, where the page sits, and its questions. */
export function ServiceJsonLd({
  lang,
  path,
  name,
  serviceType,
  description,
  crumbs,
  faq,
}: {
  lang: Locale;
  path: string;
  name: string;
  serviceType: string;
  description: string;
  crumbs: Crumbs;
  faq: FaqItem[];
}) {
  const url = absolute(`/${lang}${path}`);
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name,
      serviceType,
      description,
      url,
      inLanguage: lang,
      areaServed: [
        { "@type": "City", name: "Jakarta" },
        { "@type": "AdministrativeArea", name: "Bali" },
        { "@type": "Country", name: "Indonesia" },
      ],
      provider: { "@type": "ProfessionalService", name: "Bliss Digital", url: absolute("") },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: crumbs.home, item: absolute(`/${lang}`) },
        { "@type": "ListItem", position: 2, name: crumbs.services, item: absolute(`/${lang}/services`) },
        { "@type": "ListItem", position: 3, name: crumbs.current, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: plain(item.a.join(" ")) },
      })),
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
