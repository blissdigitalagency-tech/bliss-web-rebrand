import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import "../../globals.css";
import { jakarta, fragment } from "../../fonts";
import { getDictionary, hasLocale, htmlLang, locales, siteUrl } from "@/i18n/config";
import { Nav, SiteEffects } from "@/components/client";
import { Footer, ToTop, EMAIL, INSTAGRAM, LINKEDIN, PHONE } from "@/components/sections";

// Only /en and /id exist; anything else is a 404
export const dynamicParams = false;
export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.home.title, template: `%s — ${t.siteName}` },
    description: t.home.description,
    applicationName: t.siteName,
    icons: {
      // All made from the new mark in public/brand (see README, "Logo and icons")
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/brand/bliss-icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = { themeColor: "#ffffff" };

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  // Business details for Google and AI search (schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Bliss Digital",
    legalName: "PT Blissindo Kreasi Digital",
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
    image: `${siteUrl}/og-${lang}.png`,
    description: t.meta.home.description,
    email: EMAIL,
    telephone: PHONE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Epiwalk Office Suite Lt. 5 Unit A501, Kawasan Rasuna Epicentrum, Jl. HR Rasuna Said",
      addressLocality: "Jakarta Selatan",
      addressRegion: "DKI Jakarta",
      postalCode: "12940",
      addressCountry: "ID",
    },
    areaServed: "ID",
    sameAs: [INSTAGRAM, LINKEDIN],
    knowsLanguage: ["en", "id"],
  };

  return (
    // The inline script below adds .motion before hydration, so React is told to expect it
    <html lang={htmlLang[lang]} className={`${jakarta.variable} ${fragment.variable}`} suppressHydrationWarning>
      <head>
        {/* Before the first paint: turn on entrance animations, so nothing
            flashes. And on a reload, start at the top of the page instead of
            the browser restoring the old scroll position. Fresh visits,
            Back/Forward and language switches keep their usual behaviour; the
            browser's restoring is switched back on once the page has loaded. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion");
(function(){var n=performance.getEntriesByType("navigation")[0];
if(n&&n.type==="reload"){history.scrollRestoration="manual";scrollTo(0,0);addEventListener("load",function(){scrollTo(0,0);setTimeout(function(){history.scrollRestoration="auto"},0)})}})()`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <Nav lang={lang} t={t.nav} />
        <main id="top">{children}</main>
        <Footer lang={lang} t={t.footer} nav={t.nav} />
        <ToTop label={t.nav.backToTop} />
        <SiteEffects />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${GA_ID}");`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
