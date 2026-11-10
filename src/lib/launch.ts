// Sections that show a "Coming soon" page instead of their content. Every
// address under the section (the list and each article) shows the
// placeholder, is left out of the sitemap and asks search engines not to
// index it. Set a section to false to bring its real pages back.
export const COMING_SOON = {
  cases: true,
  blog: true,
} as const;

export type ComingSoonSection = keyof typeof COMING_SOON;
