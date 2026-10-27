# Bliss Digital website

The blissdigital.id website: Next.js 16 (App Router), in English and Bahasa
Indonesia, with blog posts, case studies and client logos edited in Keystatic.

Every page is built ahead of time as plain HTML. Only the interactive parts
(menu, animations, FAQ, service tabs, contact form) send JavaScript.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000, editor at http://localhost:3000/keystatic
npm run build      # production build; fails on type errors
npm run lint
```

Node 20.9 or newer.

## Where things live

| What | Where |
| --- | --- |
| Page copy (both languages) | `src/i18n/en.ts`, `src/i18n/id.ts` (TypeScript checks the two have the same fields) |
| Blog posts | `content/blog/en/*.md`, `content/blog/id/*.md` |
| Case studies | `content/case-studies/en/*.md`, `content/case-studies/id/*.md` |
| Client logos | `content/clients.yaml`, images in `public/images/clients/` |
| Pages | `src/app/(site)/[lang]/…` |
| Shared sections | `src/components/sections.tsx` (server), `src/components/client.tsx` (interactive) |
| Animations | `src/lib/client/effects.ts`, `src/lib/client/silk.ts` |
| Styles | `src/app/globals.css` (from the design prototype) |
| Contact form API | `src/app/api/lead/route.ts` → Google Form |
| Language redirect (`/` → `/en` or `/id`) | `src/proxy.ts` |
| Reading content | `src/lib/content.ts` (the only file that reads `/content`) |

In the copy files, `*words*` sets words in the italic accent style and
`[[Fill in: …]]` shows a yellow placeholder the team still has to replace.

## Editing content (Keystatic)

Open `/keystatic`. Blog posts and case studies each have an English and an
Indonesian list. An Indonesian entry links to its English version with the
**English version** field; that link powers the language switch and tells
Google the two pages are translations. Untick **Show the “draft” label** (posts)
or **Show the “sample” label** (case studies) once an entry is approved.

Content is saved as plain Markdown files with a YAML header, so it can move to
another CMS later: only `src/lib/content.ts` and `keystatic.config.ts` would
change.

### Letting the team edit on the live site

Without setup, the editor saves to files on your own computer only. To edit on
the live site, connect it to GitHub:

1. Push this project to a GitHub repository.
2. Set `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo` in `.env.local`.
3. Run `npm run dev`, open `/keystatic`, and follow the steps to create the
   GitHub App. Keystatic writes `KEYSTATIC_GITHUB_CLIENT_ID`,
   `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` and
   `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` into `.env`.
4. Add all five values to Vercel (Project → Settings → Environment Variables).
5. In the GitHub App settings, add the live callback URL:
   `https://blissdigital.id/api/keystatic/github/oauth/callback`.

Editors then sign in with GitHub. Each save is a commit, and Vercel redeploys
in a minute or two. Editors need write access to the repository.

## Logo and icons

The logo mark is `public/brand/bliss-mark.svg` (the final rebrand mark). The
navbar and footer use it directly. The favicon, app icons, iPhone
icon and the social preview images (`public/og-en.png`, `public/og-id.png`)
are all made from it.

When the logo changes, replace `public/brand/bliss-mark.svg` (square, with the
mark filling the canvas) and run:

```bash
python tools/brand/make-icons.py
```

It needs Pillow (`pip install pillow`) and Chrome or Edge. To change the
preview images' wording or layout, edit `tools/brand/og-en.html` and
`og-id.html`, then run the script again.

## Deploying (Vercel)

Import the repository in Vercel; the defaults work. Set these environment
variables (see `.env.example`):

- `NEXT_PUBLIC_SITE_URL`: the live address, for canonical links and the sitemap
- `NEXT_PUBLIC_GA_ID`: Google Analytics 4 ID; leave empty for no analytics
- the Keystatic values above, once the editor is connected

## Contact form

The form posts to `/api/lead`, which forwards the enquiry to the same Google
Form the old site used and reports a real success or failure to the visitor.
Bots that fill the hidden field get a fake success and nothing is sent. If
leads ever arrive blank, a question in the Google Form was recreated: copy the
new `entry.*` ids into `FORM_ENTRIES` in `src/app/api/lead/route.ts`.

To check a deploy, send one test enquiry and confirm the row appears in the
responses sheet.

## Before launch

- Replace the six sample case studies with real ones, or hide the section.
- Confirm the About stats (3+ years, 50M+ accounts reached, 100+ projects).
- Have the privacy policy checked, and fill in its date, retention period and
  cookies section.
- Replace the Google Partner image with Google’s official badge code
  (`AboutBlock` in `src/components/sections.tsx`).
- Have a native speaker review the Indonesian copy and articles.
- Review the four draft blog articles.
- Send one real test enquiry through the contact form after deploying.
