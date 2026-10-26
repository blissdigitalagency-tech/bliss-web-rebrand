// Keystatic: the editor at /keystatic for blog posts, case studies and the
// client logos. It saves plain files in /content (Markdown with a YAML header)
// and images in /public/images, which src/lib/content.ts reads. Nothing else
// in the site imports Keystatic, so it can be swapped for another CMS later.
//
// Where it saves:
//   - Without NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO: straight to the files in this
//     folder. Use this with `npm run dev` on your own computer.
//   - With it (owner/name): commits to that GitHub repository, locally and on
//     Vercel. Each save triggers a new deploy. Setup steps are in the README.
import { collection, config, fields, singleton } from "@keystatic/core";

const repo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO as `${string}/${string}` | undefined;

// Fields shared by both languages
const postFields = {
  title: fields.slug({
    name: { label: "Title" },
    slug: { label: "Web address", description: "The last part of the link, e.g. check-tracking-before-ads" },
  }),
  topic: fields.text({ label: "Topic", description: "One or two words, shown as the pill on the card (e.g. Tracking)" }),
  date: fields.date({ label: "Date", validation: { isRequired: true } }),
  readTime: fields.integer({ label: "Reading time (minutes)", defaultValue: 5 }),
  image: fields.image({ label: "Image", directory: "public/images/blog", publicPath: "/images/blog/" }),
  imageAlt: fields.text({ label: "Image description", description: "What the image shows, for screen readers and Google" }),
  excerpt: fields.text({ label: "Summary", multiline: true, description: "Two sentences for the card and Google results" }),
  draft: fields.checkbox({ label: "Show the “draft” label", description: "Untick when the article has been reviewed", defaultValue: true }),
  body: fields.markdoc({ label: "Article", extension: "md" }),
};

const caseFields = {
  title: fields.slug({
    name: { label: "Title" },
    slug: { label: "Web address", description: "The last part of the link, e.g. harbour-hotel" },
  }),
  client: fields.text({ label: "Client" }),
  industry: fields.text({ label: "Industry" }),
  service: fields.select({
    label: "Main service (shown on the card)",
    options: [
      { label: "Google Ads", value: "Google Ads" },
      { label: "Meta Ads", value: "Meta Ads" },
      { label: "Website", value: "Website" },
      { label: "Social media", value: "Social media" },
    ],
    defaultValue: "Google Ads",
  }),
  tags: fields.array(fields.text({ label: "Tag" }), {
    label: "Work we did",
    description: "Short tags shown on the case study page, e.g. Ads, Website, Search",
    itemLabel: (props) => props.value,
  }),
  date: fields.date({ label: "Date", validation: { isRequired: true } }),
  readTime: fields.integer({ label: "Reading time (minutes)", defaultValue: 5 }),
  image: fields.image({ label: "Image", directory: "public/images/case-studies", publicPath: "/images/case-studies/" }),
  imageAlt: fields.text({ label: "Image description" }),
  excerpt: fields.text({ label: "Summary", multiline: true }),
  results: fields.array(
    fields.object({
      value: fields.text({ label: "Number", description: "e.g. +62% or 2.1×" }),
      label: fields.text({ label: "What it measures", description: "e.g. booked appointments" }),
    }),
    { label: "Results (up to three)", itemLabel: (props) => `${props.fields.value.value} ${props.fields.label.value}` },
  ),
  sample: fields.checkbox({ label: "Show the “sample” label", description: "Untick for real, approved case studies", defaultValue: true }),
  body: fields.markdoc({ label: "Story", extension: "md" }),
};

export default config({
  storage: repo ? { kind: "github", repo } : { kind: "local" },
  ui: {
    brand: { name: "Bliss Digital" },
    navigation: {
      Blog: ["postsEn", "postsId"],
      "Case studies": ["casesEn", "casesId"],
      Site: ["clients"],
    },
  },
  collections: {
    postsEn: collection({
      label: "Blog posts (English)",
      path: "content/blog/en/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: postFields,
    }),
    postsId: collection({
      label: "Blog posts (Indonesian)",
      path: "content/blog/id/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: {
        ...postFields,
        translationOf: fields.relationship({
          label: "English version",
          description: "Links the two languages, so the language switch and Google know they are the same article",
          collection: "postsEn",
        }),
      },
    }),
    casesEn: collection({
      label: "Case studies (English)",
      path: "content/case-studies/en/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: caseFields,
    }),
    casesId: collection({
      label: "Case studies (Indonesian)",
      path: "content/case-studies/id/*",
      slugField: "title",
      format: { contentField: "body" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: {
        ...caseFields,
        translationOf: fields.relationship({ label: "English version", collection: "casesEn" }),
      },
    }),
  },
  singletons: {
    clients: singleton({
      label: "Client logos",
      path: "content/clients",
      format: { data: "yaml" },
      schema: {
        logos: fields.array(
          fields.object({
            name: fields.text({ label: "Client name" }),
            logo: fields.image({ label: "Logo", directory: "public/images/clients", publicPath: "/images/clients/" }),
            tight: fields.checkbox({
              label: "Logo has no white space around it",
              description: "Tick for tightly cropped logos, so they show at a similar size to the others",
            }),
          }),
          { label: "Logos (in the order they scroll)", itemLabel: (props) => props.fields.name.value },
        ),
      },
    }),
  },
});
