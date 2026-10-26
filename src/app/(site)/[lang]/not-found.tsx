import { lang } from "next/root-params";
import { defaultLocale, getDictionary, hasLocale } from "@/i18n/config";
import { NotFoundView } from "@/components/NotFoundView";

// A missing page inside /en or /id, shown with the site's navbar and footer
export default async function NotFound() {
  const value = await lang();
  const locale = value && hasLocale(value) ? value : defaultLocale;
  return <NotFoundView lang={locale} t={getDictionary(locale).notFound} />;
}
