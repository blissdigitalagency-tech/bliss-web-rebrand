"use client";

// Analytics and ad tags (Google tag with GA4, Meta Pixel), in two modes:
//
// - Banner off (askFirst false, the current setting): the tags load on every
//   visit, with no banner. A visitor who declined while the banner was on
//   keeps their choice.
// - Banner on (NEXT_PUBLIC_COOKIE_BANNER=on): nothing loads until the visitor
//   clicks Accept; Decline loads nothing. The choice is kept in this browser,
//   and "Cookie Settings" in the footer opens the banner again. Switching from
//   Accept to Decline deletes the Google and Meta cookies and reloads.
//
// The privacy policy ("Cookies and Analytics") describes the current mode, so
// change it too when switching.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/en";

type Choice = "granted" | "denied";
type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[][]; push: unknown; loaded: boolean; version: string };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const KEY = "bliss-consent";
const CHANGED = "bliss:consent-changed"; // the choice was saved in this tab
const OPEN = "bliss:cookie-settings"; // "Cookie settings" was clicked

function readChoice(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null; // storage blocked: ask again on each visit
  }
}

function subscribe(onChange: () => void) {
  addEventListener("storage", onChange); // a choice made in another tab
  addEventListener(CHANGED, onChange);
  return () => {
    removeEventListener("storage", onChange);
    removeEventListener(CHANGED, onChange);
  };
}

/** Google tag with GA4, with Consent Mode v2 signals. Runs only after Accept. */
function loadGoogle(id: string) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // gtag.js reads the arguments object itself, as in Google's own snippet
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  const all = (v: "granted" | "denied") => ({ ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
  window.gtag("consent", "default", all("denied"));
  window.gtag("consent", "update", all("granted"));
  window.gtag("js", new Date());
  window.gtag("config", id);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

/** Meta Pixel, as in Meta's own snippet. Runs only after Accept. */
function loadMeta(id: string) {
  if (window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = window._fbq = fbq;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  fbq("consent", "grant");
  fbq("init", id);
  fbq("track", "PageView");
}

/**
 * Conversion events, sent to the Meta Pixel and to GA4 under their standard
 * names. Does nothing when the tags aren't loaded (no ID set, or the visitor
 * declined while the banner is on). No personal details: only the event and
 * the service or channel.
 */
const GA_NAMES = { Lead: "generate_lead", Contact: "contact" } as const;
export function trackEvent(name: keyof typeof GA_NAMES, detail: string) {
  window.fbq?.("track", name, { content_name: detail });
  window.gtag?.("event", GA_NAMES[name], { method: detail });
}

/** Contact links anywhere on the site, by where they lead */
function contactChannel(href: string) {
  if (href.startsWith("https://wa.me/") || href.startsWith("https://api.whatsapp.com/")) return "WhatsApp";
  if (href.startsWith("tel:")) return "Phone";
  if (href.startsWith("mailto:")) return "Email";
  return null;
}

/** Deletes Google Analytics, Google Ads and Meta cookies on this site and its parent domains. */
function clearTrackingCookies() {
  const names = document.cookie.split(";").map((c) => c.split("=")[0].trim()).filter((n) => /^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(n));
  const parts = location.hostname.split(".");
  const domains = [""].concat(parts.map((_, i) => parts.slice(i).join(".")).filter((d) => d.includes(".")).map((d) => `; domain=.${d}`));
  for (const n of names) for (const d of domains) document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
}

export function ConsentBanner({ t, privacyHref, gaId, pixelId, askFirst }: { t: Dictionary["consent"]; privacyHref: string; gaId?: string; pixelId?: string; askFirst: boolean }) {
  // "pending" on the server and in the first client render, so the HTML matches
  const choice = useSyncExternalStore(subscribe, readChoice, () => "pending" as const);
  const [reopened, setReopened] = useState(false);
  const box = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const firstPath = useRef(pathname);

  // Load the tags: with the banner on, once the visitor has accepted (now or
  // on an earlier visit); with it off, on every visit unless they declined
  // while the banner was on
  const load = askFirst ? choice === "granted" : choice === null || choice === "granted";
  useEffect(() => {
    if (!load) return;
    if (gaId) loadGoogle(gaId);
    if (pixelId) loadMeta(pixelId);
  }, [load, gaId, pixelId]);

  // Meta counts each page; GA4 counts in-app page changes by itself
  useEffect(() => {
    if (pathname === firstPath.current) return;
    firstPath.current = pathname;
    window.fbq?.("track", "PageView");
  }, [pathname]);

  // Contact event: a click on any WhatsApp, phone or email link, now or added later
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const channel = link && contactChannel(link.getAttribute("href") || "");
      if (channel) trackEvent("Contact", channel);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // "Cookie settings" in the footer
  useEffect(() => {
    const open = () => setReopened(true);
    addEventListener(OPEN, open);
    return () => removeEventListener(OPEN, open);
  }, []);

  // When opened from the footer, move keyboard focus into the banner
  useEffect(() => {
    if (reopened) box.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [reopened]);

  const save = (next: Choice) => {
    const before = readChoice();
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    setReopened(false);
    if (before === "granted" && next === "denied") {
      window.gtag?.("consent", "update", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
      window.fbq?.("consent", "revoke");
      clearTrackingCookies();
      location.reload(); // start again without the tags
      return;
    }
    dispatchEvent(new Event(CHANGED));
  };

  if (!askFirst || (!gaId && !pixelId)) return null; // banner off, or nothing to ask about
  if (choice === "pending" || (choice !== null && !reopened)) return null;

  return (
    <section ref={box} className="consent" aria-label={t.label}>
      <p className="consent__text">
        {t.text} <a href={privacyHref}>{t.policy}</a>
      </p>
      <div className="consent__actions">
        <button type="button" className="btn btn--outline" onClick={() => save("denied")}>
          {t.decline}
        </button>
        <button type="button" className="btn btn--solid" onClick={() => save("granted")}>
          {t.accept}
        </button>
      </div>
    </section>
  );
}

/** Footer link that opens the banner again. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="footer__cookies" onClick={() => dispatchEvent(new Event(OPEN))}>
      {label}
    </button>
  );
}
