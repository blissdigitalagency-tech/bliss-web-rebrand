import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/config";
import { getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { PageHead, postCard } from "@/components/sections";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).meta.blog;
  return pageMetadata({ locale: lang, title: t.title, description: t.description, paths: "/blog" });
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const posts = getPosts(lang);

  return (
    <section className="page" aria-labelledby="page-title">
      <PageHead
        eyebrow={t.blogPage.eyebrow}
        title={t.blogPage.title}
        lede={t.blogPage.lede}
        note={posts.some((p) => p.draft) ? t.common.draftPosts : undefined}
      />
      <div className="posts">{posts.map((p, i) => postCard(p, i, lang, t.common))}</div>
    </section>
  );
}
