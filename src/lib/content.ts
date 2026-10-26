// The only place the site reads /content. Pages ask for posts, case studies
// and logos here, and never touch the files or Keystatic directly. To move to
// another CMS later, rewrite this file and keep the same exported functions.
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { load as loadYaml } from "js-yaml";
import { type Locale, locales } from "@/i18n/config";

const root = path.join(process.cwd(), "content");

export type Post = {
  slug: string;
  title: string;
  topic: string;
  date: string; // YYYY-MM-DD
  readTime: number;
  image: string;
  imageAlt: string;
  excerpt: string;
  draft: boolean;
  translationOf?: string;
  html: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  service: string;
  tags: string[];
  date: string;
  readTime: number;
  image: string;
  imageAlt: string;
  excerpt: string;
  results: { value: string; label: string }[];
  sample: boolean;
  translationOf?: string;
  html: string;
};

export type ClientLogo = { name: string; logo: string; tight: boolean };

// YAML reads an unquoted 2026-10-14 as a Date; keep dates as plain strings
const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ""));

function readFolder(folder: string) {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      return { slug: file.replace(/\.md$/, ""), data, html: marked.parse(content, { async: false }) };
    });
}

const newestFirst = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);

export function getPosts(locale: Locale): Post[] {
  return readFolder(`blog/${locale}`)
    .map(({ slug, data, html }) => ({
      slug,
      title: data.title ?? slug,
      topic: data.topic ?? "",
      date: day(data.date),
      readTime: Number(data.readTime) || 5,
      image: data.image ?? "",
      imageAlt: data.imageAlt ?? "",
      excerpt: data.excerpt ?? "",
      draft: data.draft !== false,
      translationOf: data.translationOf || undefined,
      html,
    }))
    .sort(newestFirst);
}

export function getCaseStudies(locale: Locale): CaseStudy[] {
  return readFolder(`case-studies/${locale}`)
    .map(({ slug, data, html }) => ({
      slug,
      title: data.title ?? slug,
      client: data.client ?? "",
      industry: data.industry ?? "",
      service: data.service ?? "",
      tags: data.tags ?? [],
      date: day(data.date),
      readTime: Number(data.readTime) || 5,
      image: data.image ?? "",
      imageAlt: data.imageAlt ?? "",
      excerpt: data.excerpt ?? "",
      results: data.results ?? [],
      sample: data.sample !== false,
      translationOf: data.translationOf || undefined,
      html,
    }))
    .sort(newestFirst);
}

export const getPost = (locale: Locale, slug: string) => getPosts(locale).find((p) => p.slug === slug);
export const getCaseStudy = (locale: Locale, slug: string) => getCaseStudies(locale).find((c) => c.slug === slug);

/**
 * The same article in every language, as { en: "slug", id: "slug" }.
 * English is the source; each Indonesian entry points to it with translationOf.
 */
export function translations<T extends { slug: string; translationOf?: string }>(
  list: (locale: Locale) => T[],
  locale: Locale,
  slug: string,
): Partial<Record<Locale, string>> {
  const item = list(locale).find((x) => x.slug === slug);
  if (!item) return {};
  const source = locale === "en" ? item.slug : item.translationOf;
  const out: Partial<Record<Locale, string>> = { [locale]: slug };
  if (!source) return out;
  for (const l of locales) {
    if (l === "en") out.en = source;
    else {
      const match = list(l).find((x) => x.translationOf === source);
      if (match) out[l] = match.slug;
    }
  }
  return out;
}

export function getClients(): ClientLogo[] {
  const file = path.join(root, "clients.yaml");
  if (!fs.existsSync(file)) return [];
  const data = loadYaml(fs.readFileSync(file, "utf8")) as { logos?: Partial<ClientLogo>[] };
  return (data.logos ?? [])
    .filter((l) => l.logo)
    .map((l) => ({ name: l.name ?? "", logo: l.logo!, tight: !!l.tight }));
}
