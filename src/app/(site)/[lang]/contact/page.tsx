import { notFound } from "next/navigation";
import { en } from "@/i18n/en";
import { getDictionary, hasLocale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/client";
import { EMAIL, PHONE, PHONE_HREF, WHATSAPP } from "@/components/sections";
import { Mail, Phone, WhatsApp } from "@/components/icons";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.contact;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/contact" });
}

// The team reads enquiries in English, whatever language the visitor used
const serviceValues = Object.fromEntries(en.contact.services.map((s) => [s.key, s.label]));

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).contact;

  return (
    <section className="contact contact--page" id="contact" aria-labelledby="contact-title">
      <div className="contact__inner">
        <div className="contact__side">
          <p className="eyebrow eyebrow--plain" data-reveal>
            {t.eyebrow}
          </p>
          <h1 className="contact__title" id="contact-title" data-reveal>
            {t.title} <em>{t.titleEm}</em>
          </h1>
          <p className="contact__lede" data-reveal>
            {t.lede}
          </p>
          <ul className="contact__links" data-reveal>
            <li>
              <WhatsApp size={24} />
              <a href={WHATSAPP} target="_blank" rel="noopener">
                {getDictionary(lang).common.whatsappUs}
              </a>
            </li>
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
        <ContactForm t={t} serviceValues={serviceValues} />
      </div>
    </section>
  );
}
