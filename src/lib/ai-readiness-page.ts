import "server-only";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getDictionary, htmlLang, siteUrl, type Locale } from "@/i18n/config";
import { ADDRESS, EMAIL, INSTAGRAM, LINKEDIN, PHONE, PHONE_HREF, WHATSAPP } from "@/lib/contact";
import { ID_ENGINE, ID_PAGE } from "@/lib/ai-readiness-id";

/**
 * Builds the AI Readiness Check page: plain HTML (so ChatGPT and Meta AI,
 * which don't run JavaScript, can read it), from the template in
 * ai-readiness/page/. The header, footer and Tools menu come from the same
 * text files as the rest of the site (src/i18n), so they can't drift. The
 * Meta Pixel and GA4 load from the same settings as the site, and the page's
 * Content-Security-Policy allows exactly the scripts it carries.
 */

// Languages the tool page exists in (Indonesian: src/lib/ai-readiness-id.ts)
export const TOOL_LOCALES: Locale[] = ["en", "id"];
export const toolPath = (lang: Locale) => `/${lang}/tools/ai-readiness`;

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
const ASK_FIRST = process.env.NEXT_PUBLIC_COOKIE_BANNER === "on";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const MARK = (id: string) =>
  `<svg viewBox="0 0 676 676" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="676" y2="676" gradientUnits="userSpaceOnUse"><stop stop-color="#70020F"/><stop offset="1" stop-color="#430719"/></linearGradient></defs><path fill="url(#${id})" d="M169 0C262.336 0 338 75.664 338 169V676C293.615 676 249.666 667.255 208.659 650.271C167.651 633.284 130.376 608.396 98.99 577.01C67.604 545.624 42.716 508.349 25.73 467.341C8.745 426.334 0 382.385 0 338V169C0 75.664 75.664 0 169 0ZM507 338C600.336 338 676 413.664 676 507C676 600.336 600.336 676 507 676C413.664 676 338 600.336 338 507C338 413.664 413.664 338 507 338Z"/></svg>`;
const CHEVRON = `<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 4.5 6 7.5l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function header(lang: Locale) {
  const t = getDictionary(lang).nav;
  const link = (path: string, label: string) => `<a href="/${lang}${path}">${esc(label)}</a>`;
  const tools = t.toolList
    .map((tool) => `<a href="${esc(tool.href)}"${tool.href === toolPath(lang) ? ' aria-current="page"' : ""}><span class="tmenu__name">${esc(tool.name)}</span><span class="tmenu__note">${esc(tool.note)}</span></a>`)
    .join("");
  // Language switch, as on the rest of the site (src/components/client.tsx):
  // on desktop a button with the current language that opens a short list;
  // in the phone menu a "Language" row with both languages side by side
  const LANGS: { code: Locale; name: string }[] = [
    { code: "en", name: "English" },
    { code: "id", name: "Bahasa Indonesia" },
  ].filter((l) => TOOL_LOCALES.includes(l.code as Locale)) as { code: Locale; name: string }[];
  const current = LANGS.find((l) => l.code === lang)!;
  const GLOBE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.3"/><path d="M1.75 8h12.5M8 1.75c1.7 1.8 2.5 3.9 2.5 6.25S9.7 12.45 8 14.25C6.3 12.45 5.5 10.35 5.5 8S6.3 3.55 8 1.75Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
  const CHECK = `<svg class="lang-menu__check" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.3 6.5 11.2 12.5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const langAttrs = (l: { code: Locale }) => `href="${toolPath(l.code)}" hreflang="${l.code}" lang="${l.code}"${l.code === lang ? ' aria-current="true"' : ""}`;
  const langMenu = LANGS.length > 1
    ? `<div class="lang"><button type="button" class="nav__lang" aria-haspopup="true" aria-expanded="false" aria-controls="lang-menu" aria-label="${esc(`${t.chooseLanguage}: ${current.name}`)}">${GLOBE}<span>${lang.toUpperCase()}</span>${CHEVRON.replace("<svg ", '<svg class="nav__lang-chevron" ')}</button><ul class="lang-menu" id="lang-menu" hidden>${LANGS.map((l) => `<li><a ${langAttrs(l)}><span class="lang-menu__short">${l.code.toUpperCase()}</span>${l.name}${l.code === lang ? CHECK : ""}</a></li>`).join("")}</ul></div>`
    : "";
  const langRow = LANGS.length > 1
    ? `<div class="lang-row" role="group" aria-label="${esc(t.language)}"><span class="lang-row__label">${esc(t.language)}</span>${LANGS.map((l) => `<a ${langAttrs(l)}>${l.name}</a>`).join("")}</div>`
    : "";
  return `<header class="nav" id="top">
  <div class="wrap"><div class="navin">
    <a class="logo" href="/${lang}" aria-label="${esc(t.home)}">${MARK("bmk1")}</a>
    <nav class="navlinks" aria-label="${esc(t.main)}">
      <div class="menu" id="site-menu">
        ${link("/about", t.about)}
        ${link("/services", t.services)}
        ${link("/case-studies", t.cases)}
        ${link("/blog", t.blog)}
        <div class="tmenu"><button class="tmenu__btn is-current" type="button" aria-expanded="false" aria-controls="tools-menu">${esc(t.tools)}${CHEVRON}</button><div class="tmenu__list" id="tools-menu" hidden>${tools}</div></div>
        ${link("/contact", t.contact)}
        ${langRow}
      </div>
      ${langMenu}
      <a class="btn sm" href="/${lang}/contact">${esc(t.cta)}</a>
      <button class="menubtn" type="button" aria-label="${esc(t.openMenu)}" aria-expanded="false" aria-controls="site-menu" data-open="${esc(t.openMenu)}" data-close="${esc(t.closeMenu)}" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    </nav>
  </div></div>
</header>`;
}

function footer(lang: Locale) {
  const { nav, footer: f } = getDictionary(lang);
  const links: [string, string][] = [
    ["", f.homeLink],
    ["/about", nav.about],
    ["/services", nav.services],
    ["/case-studies", nav.cases],
    ["/blog", nav.blog],
    ["/contact", nav.contact],
    ["/privacy", f.privacy],
  ];
  const social = (href: string, name: string, icon: string) => `<a href="${href}" aria-label="${esc(`${name} (${f.newTab})`)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg></a>`;
  return `<footer>
  <div class="wrap">
    <div class="foot">
      <div>
        <a class="fbrand" href="/${lang}" style="text-decoration:none">${MARK("bmk2")}Bliss Digital</a>
        <p>${esc(f.copyright)}</p>
        <div class="social">
          ${social(WHATSAPP, "WhatsApp", '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>')}
          ${social(INSTAGRAM, "Instagram", '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>')}
          ${social(LINKEDIN, "LinkedIn", '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>')}
        </div>
      </div>
      <div>
        <p style="margin:0"><b>${esc(ADDRESS.company)}</b><br>${ADDRESS.lines.map(esc).join("<br>")}</p>
      </div>
      <div class="fcontact">
        <a href="mailto:${EMAIL}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>${EMAIL}</a>
        <a href="${PHONE_HREF}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>${PHONE}</a>
      </div>
    </div>
    <nav class="footlinks" aria-label="${esc(f.links)}">
      ${links.map(([p, label]) => `<a href="/${lang}${p}">${esc(label)}</a>`).join("")}
    </nav>
  </div>
</footer>`;
}

/**
 * Meta Pixel and GA4, as on the rest of the site (src/components/consent.tsx):
 * with the cookie banner off they load unless the visitor declined while it
 * was on; with it on, only after they accepted on the main site. A click on a
 * WhatsApp, phone or email link sends a Contact event.
 */
function tracking() {
  if (!GA_ID && !PIXEL_ID) return "";
  return `<script>
(function(){
  var GA = ${JSON.stringify(GA_ID)}, PX = ${JSON.stringify(PIXEL_ID)}, ASK = ${ASK_FIRST};
  var c = null; try { c = localStorage.getItem('bliss-consent'); } catch(e) {}
  if (ASK ? c !== 'granted' : c === 'denied') return;
  if (PX) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('consent', 'grant'); fbq('init', PX); fbq('track', 'PageView');
  }
  if (GA) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    var all = function(v){ return { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v }; };
    gtag('consent', 'default', all('denied')); gtag('consent', 'update', all('granted'));
    gtag('js', new Date()); gtag('config', GA);
    var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA); document.head.appendChild(g);
  }
  document.addEventListener('click', function(e){
    var a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href') || '';
    var ch = /^https:\\/\\/(wa\\.me|api\\.whatsapp\\.com)\\//.test(h) ? 'WhatsApp' : /^tel:/.test(h) ? 'Phone' : /^mailto:/.test(h) ? 'Email' : null;
    if (!ch) return;
    if (window.fbq) fbq('track', 'Contact', { content_name: ch });
    if (window.gtag) gtag('event', 'contact', { method: ch });
  }, true);
})();
</script>`;
}

/** Only the page's own inline scripts may run, plus Meta's and Google's when set up */
function policy(html: string) {
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, code]) => `'sha256-${createHash("sha256").update(code, "utf8").digest("base64")}'`,
  );
  const script = [...hashes, PIXEL_ID && "https://connect.facebook.net", GA_ID && "https://www.googletagmanager.com"];
  const connect = ["'self'", PIXEL_ID && "https://www.facebook.com https://connect.facebook.net", GA_ID && "https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com"];
  const img = ["'self' data:", PIXEL_ID && "https://www.facebook.com", GA_ID && "https://*.google-analytics.com https://www.googletagmanager.com"];
  const list = (a: (string | false)[]) => a.filter(Boolean).join(" ");
  return [
    "default-src 'none'",
    `script-src ${list(script)}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${list(img)}`,
    "font-src 'self'",
    `connect-src ${list(connect)}`,
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

/**
 * Indonesian: swap every English snippet of the template for its translation
 * (longest first, so a short snippet never breaks a longer one), and give the
 * page script the engine translations. A snippet that is no longer in the
 * template stops the build, so English never slips onto the Indonesian page.
 */
function translate(template: string, lang: Locale) {
  if (lang === "en") return template;
  let html = template;
  const missing: string[] = [];
  for (const [en, id] of [...ID_PAGE].sort((a, b) => b[0].length - a[0].length)) {
    if (!html.includes(en)) missing.push(en);
    else html = html.split(en).join(id);
  }
  if (missing.length) throw new Error(`AI Readiness Check (${lang}): ${missing.length} English snippet(s) not found in the template:\n${missing.map((m) => "  " + m.slice(0, 100)).join("\n")}`);
  // JSON inside a <script>: escape "<" so no text can close the tag
  return html.replace("/*@tx*/null", JSON.stringify(ID_ENGINE).replace(/</g, "\\u003c"));
}

export function buildToolPage(lang: Locale) {
  const template = translate(readFileSync(join(process.cwd(), "ai-readiness/page/index.html"), "utf8"), lang);
  const canonical = siteUrl + toolPath(lang);
  const alternates = TOOL_LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${siteUrl}${toolPath(l)}">`)
    .concat(`<link rel="alternate" hreflang="x-default" href="${siteUrl}${toolPath("en")}">`)
    .join("\n");
  const html = template
    .replace("{{htmlLang}}", htmlLang[lang])
    .replaceAll("{{canonical}}", canonical)
    .replace("<!--@alternates-->", alternates)
    .replace("{{printUrl}}", esc(canonical.replace(/^https?:\/\//, "")))
    .replace("<!--@header-->", header(lang))
    .replace("<!--@footer-->", footer(lang))
    .replace("<!--@tracking-->", tracking());
  return { html, csp: policy(html) };
}
