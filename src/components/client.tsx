"use client";
/* eslint-disable @next/next/no-img-element -- the logo is a tiny SVG */
// The interactive parts of the site. Everything else renders on the server
// and sends no JavaScript.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent, type MouseEvent } from "react";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";
import { initSite, initHero, initTagline, initServices, initWhy } from "@/lib/client/effects";
import { initSilk } from "@/lib/client/silk";
import { rich } from "./Rich";

/* ---------- Behaviour hooks ---------- */

/** Navbar scroll, back to top, anchor glide, reveals and counters. Re-runs on every page. */
export function SiteEffects() {
  const pathname = usePathname();
  useEffect(() => initSite(), [pathname]);
  return null;
}

const inits = { hero: initHero, tagline: initTagline, services: initServices, why: initWhy };

/** Runs one section's animation script on the section with this class. */
export function SectionEffects({ section }: { section: keyof typeof inits }) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`.${section}`);
    return el ? inits[section](el) : undefined;
  }, [section]);
  return null;
}

export function SilkCanvas({ className, droplets = false }: { className: string; droplets?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => (ref.current ? initSilk(ref.current, droplets) : undefined), [droplets]);
  return <canvas ref={ref} className={`${className} silk`} aria-hidden="true" />;
}

/* ---------- Navbar ---------- */

const noSubscribe = () => () => {};

/**
 * Where the language switch goes: the page's hreflang link when it has one
 * (blog posts and case studies have different slugs per language). A detail
 * page with no translation falls back to its section's list page.
 */
function languageSwitchHref(pathname: string, other: Locale) {
  const alt = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${other}"]`);
  if (alt) return new URL(alt.href).pathname;
  const parts = pathname.split("/").filter(Boolean);
  return parts.length > 2 ? `/${other}/${parts[1]}` : pathname.replace(/^\/(en|id)/, `/${other}`);
}

// Each language is named in its own language, so visitors can find theirs
const LANGUAGES: { code: Locale; name: string; short: string }[] = [
  { code: "en", name: "English", short: "EN" },
  { code: "id", name: "Bahasa Indonesia", short: "ID" },
];

/**
 * Desktop: a button with the current language and an arrow that opens a short
 * list. Arrow keys move through the list; Escape or a click outside closes it.
 */
function LanguageMenu({ lang, t, hrefFor, onSwitch }: { lang: Locale; t: Dictionary["nav"]; hrefFor: (code: Locale) => string; onSwitch: (e: MouseEvent) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;
  // Set when the list is opened from the keyboard, so focus moves into it
  const focusFirst = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (focusFirst.current) {
      focusFirst.current = false;
      root.current?.querySelector<HTMLAnchorElement>(".lang-menu a")?.focus();
    }
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = () => [...(root.current?.querySelectorAll<HTMLAnchorElement>(".lang-menu a") ?? [])];
  const focusItem = (step: number) => {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLAnchorElement);
    list[(i + step + list.length) % list.length]?.focus();
  };

  return (
    <div className="lang" ref={root}>
      <button
        ref={button}
        type="button"
        className="nav__lang"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="lang-menu"
        aria-label={`${t.chooseLanguage}: ${current.name}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            focusFirst.current = true;
            if (open) items()[0]?.focus();
            else setOpen(true);
          }
        }}
      >
        <Globe />
        <span>{current.short}</span>
        <Chevron />
      </button>
      <ul
        className="lang-menu"
        id="lang-menu"
        hidden={!open}
        onKeyDown={(e) => {
          const step = ({ ArrowDown: 1, ArrowUp: -1 } as Record<string, number>)[e.key];
          if (step) {
            e.preventDefault();
            focusItem(step);
          }
        }}
      >
        {LANGUAGES.map((l) => {
          const isCurrent = l.code === lang;
          return (
            <li key={l.code}>
              <Link
                href={hrefFor(l.code)}
                hrefLang={l.code}
                lang={l.code}
                aria-current={isCurrent ? "true" : undefined}
                onClick={(e) => {
                  setOpen(false);
                  if (!isCurrent) onSwitch(e);
                }}
              >
                <span className="lang-menu__short">{l.short}</span>
                {l.name}
                {isCurrent && <Check />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const Globe = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1.75 8h12.5M8 1.75c1.7 1.8 2.5 3.9 2.5 6.25S9.7 12.45 8 14.25C6.3 12.45 5.5 10.35 5.5 8S6.3 3.55 8 1.75Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

const Chevron = () => (
  <svg className="nav__lang-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M3 4.5 6 7.5l3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg className="lang-menu__check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.3 6.5 11.2 12.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Nav({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const other: Locale = lang === "en" ? "id" : "en";
  const switchHref = useSyncExternalStore(noSubscribe, () => languageSwitchHref(pathname, other), () => pathname.replace(/^\/(en|id)/, `/${other}`));

  // Escape closes the phone menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links: [string, string][] = [
    ["/about", t.about],
    ["/services", t.services],
    ["/case-studies", t.cases],
    ["/blog", t.blog],
    ["/contact", t.contact],
  ];
  // The page's hreflang link can change after a client-side navigation, so
  // check it again at click time
  const router = useRouter();
  const onSwitch = (e: MouseEvent) => {
    const fresh = languageSwitchHref(pathname, other);
    if (fresh !== switchHref) {
      e.preventDefault();
      router.push(fresh);
    }
  };
  const hrefFor = (code: Locale) => (code === lang ? pathname : switchHref);
  const current = (path: string) => pathname === `/${lang}${path}` || pathname.startsWith(`/${lang}${path}/`);

  return (
    // Pages without the white hero keep the bar solid from the top (initSite keeps it in sync)
    <header
      className={`nav${open ? " is-open" : ""}`}
      data-nav
      style={{ "--p": pathname === `/${lang}` ? 0 : 1 } as CSSProperties}
    >
      <div className="nav__inner">
        <Link className="nav__logo" href={`/${lang}`} aria-label={t.home}>
          <img src="/brand/bliss-mark.svg" width={40} height={40} alt="" />
        </Link>

        {/* Following a link closes the phone menu */}
        <nav
          className="nav__links"
          id="nav-menu"
          aria-label={t.main}
          onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        >
          {links.map(([path, label]) => (
            <Link key={path} href={`/${lang}${path}`} aria-current={current(path) ? "page" : undefined}>
              {label}
            </Link>
          ))}
          {/* Phone menu: both languages side by side, the current one filled in */}
          <div className="lang-row" role="group" aria-label={t.language}>
            <span className="lang-row__label">{t.language}</span>
            {LANGUAGES.map((l) => (
              <Link
                key={l.code}
                href={hrefFor(l.code)}
                hrefLang={l.code}
                lang={l.code}
                aria-current={l.code === lang ? "true" : undefined}
                onClick={l.code === lang ? undefined : onSwitch}
              >
                {l.name}
              </Link>
            ))}
          </div>
          <Link className="btn btn--glass nav__cta nav__cta--menu" href={`/${lang}/contact`}>
            {t.cta}
          </Link>
        </nav>

        <div className="nav__end">
          <LanguageMenu lang={lang} t={t} hrefFor={hrefFor} onSwitch={onSwitch} />
          <Link className="btn btn--glass nav__cta" href={`/${lang}/contact`}>
            {t.cta}
          </Link>
          <button
            ref={toggle}
            className="nav__toggle"
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? t.closeMenu : t.openMenu}
            onClick={() => setOpen((o) => !o)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- FAQ: one answer open at a time ---------- */

export function Faq({ items }: { items: { q: string; a: string[] }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="faq__list">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div className={`qa${open ? " is-open" : ""}`} data-reveal key={i}>
            <h3>
              <button type="button" aria-expanded={open} onClick={() => setOpenIndex(open ? null : i)}>
                {item.q}
                <span className="qa__icon" aria-hidden="true"></span>
              </button>
            </h3>
            <div className="qa__a">
              <div>
                {item.a.map((p, j) => (
                  <p key={j}>{rich(p)}</p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Contact form ---------- */

type ContactCopy = Dictionary["contact"];
type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; name: string } | { kind: "failed" };

/**
 * Posts to /api/lead, which forwards to the Google Form. `serviceValues` maps
 * each service key to the English label the team sees in the form responses,
 * whatever language the visitor uses.
 */
export function ContactForm({ t, serviceValues }: { t: ContactCopy; serviceValues: Record<string, string> }) {
  const form = useRef<HTMLFormElement>(null);
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Links from the service cards pick the matching service (?service=...)
  useEffect(() => {
    const key = new URLSearchParams(location.search).get("service");
    const preset = key === "training" ? "consultation" : key;
    const select = form.current?.elements.namedItem("service") as HTMLSelectElement | null;
    if (select && preset && t.services.some((s) => s.key === preset)) select.value = preset;
  }, [t.services]);

  const check = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    const ok = el.checkValidity();
    setInvalid((s) => ({ ...s, [el.name]: !ok }));
    return ok;
  };
  const fieldEvents = {
    onBlur: (e: { currentTarget: HTMLInputElement | HTMLSelectElement }) => {
      if (e.currentTarget.value) check(e.currentTarget);
    },
    onChange: (e: { currentTarget: HTMLInputElement | HTMLSelectElement }) => {
      if (invalid[e.currentTarget.name]) check(e.currentTarget);
    },
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const required = ["name", "email", "service"].map((n) => f.elements.namedItem(n) as HTMLInputElement);
    const bad = required.filter((el) => !check(el));
    if (bad.length) {
      bad[0].focus();
      return;
    }
    const value = (n: string) => ((f.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "").trim();
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: value("name"),
          email: value("email"),
          phone: value("whatsapp"),
          website: value("website"),
          service: serviceValues[value("service")] ?? value("service"),
          message: value("message"),
          company_role: value("company_role"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || res.statusText);
      setStatus({ kind: "sent", name: value("name").split(" ")[0] });
    } catch {
      setStatus({ kind: "failed" });
    }
  }

  const err = (name: string) => (invalid[name] ? " is-invalid" : "");
  const sent = status.kind === "sent";

  return (
    <form ref={form} className="contact__form" noValidate onSubmit={onSubmit} data-reveal>
      <div className={`field${err("name")}`}>
        <label htmlFor="cf-name">{t.name}</label>
        <input id="cf-name" name="name" type="text" autoComplete="name" placeholder={t.namePlaceholder} required {...fieldEvents} />
        <span className="field__error">{t.nameError}</span>
      </div>
      <div className="field">
        <label htmlFor="cf-wa">{t.whatsapp}</label>
        <input id="cf-wa" name="whatsapp" type="tel" autoComplete="tel" placeholder={t.whatsappPlaceholder} />
      </div>
      <div className={`field${err("email")}`}>
        <label htmlFor="cf-email">{t.email}</label>
        <input id="cf-email" name="email" type="email" autoComplete="email" placeholder={t.emailPlaceholder} required {...fieldEvents} />
        <span className="field__error">{t.emailError}</span>
      </div>
      <div className="field">
        <label htmlFor="cf-site">{t.website}</label>
        <input id="cf-site" name="website" type="text" autoComplete="url" placeholder={t.websitePlaceholder} />
      </div>
      <div className={`field field--wide${err("service")}`}>
        <label htmlFor="cf-service">{t.service}</label>
        <select id="cf-service" name="service" required defaultValue="" {...fieldEvents}>
          <option value="" disabled>
            {t.servicePlaceholder}
          </option>
          {t.services.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="field__error">{t.serviceError}</span>
      </div>
      <div className="field field--wide">
        <label htmlFor="cf-msg">{t.message}</label>
        <textarea id="cf-msg" name="message" rows={3} placeholder={t.messagePlaceholder}></textarea>
      </div>
      {/* Honeypot: hidden from people, filled in by bots; /api/lead drops those */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="cf-role">Role</label>
        <input id="cf-role" name="company_role" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="btn btn--solid contact__submit field--wide" type="submit" disabled={status.kind === "sending" || sent}>
        {status.kind === "sending" ? t.sending : t.submit}
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
          <path d="M2 10H25M25 10L18 3M25 10L18 17" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <p className={`contact__sent field--wide${status.kind === "failed" ? " contact__sent--error" : ""}`} role="status" hidden={!sent && status.kind !== "failed"}>
        {sent ? t.sent.replace("{name}", status.name) : status.kind === "failed" ? t.failed : ""}
      </p>
      <div className="contact__notes field--wide">
        <p className="contact__eta">{t.eta}</p>
        <p className="contact__privacy">
          {t.privacyA}
          <br />
          {t.privacyB} <PrivacyLink label={t.privacyLink} />.
        </p>
      </div>
    </form>
  );
}

function PrivacyLink({ label }: { label: string }) {
  const lang = usePathname().split("/")[1] || "en";
  return <Link href={`/${lang}/privacy`}>{label}</Link>;
}
