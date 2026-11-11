# Bliss AI Readiness Check — notes

A free tool at **www.blissdigital.id/en/tools/ai-readiness**, part of the main
website (this repository). It is listed in the navbar under **Tools**
(`nav.toolList` in `src/i18n/en.ts` and `id.ts`; add later tools there).
The first address, /tools/ai-readiness, redirects there.

The page is plain HTML, not a React page. blissdigital.id builds its pages
with JavaScript, and ChatGPT and Meta AI do not run JavaScript, so a page
rebuilt in React would fail its own check. Built once at deploy time from a
template, it arrives as plain HTML and every channel can read it.

(Until 11 November 2026 the tool was planned as its own site at
tools.blissdigital.id, for the same reason.)

---

## Where the parts live

    ai-readiness/page/index.html               the page template (text, styles, report script)
    src/lib/ai-readiness-page.ts               builds the page from the template
    src/app/(site)/[lang]/tools/ai-readiness/route.ts
                                               serves /{lang}/tools/ai-readiness, built at deploy
    public/tools/ai-readiness/fonts/           the two Bliss website fonts
    src/app/tools/ai-readiness/api/scan/route.ts
                                               answers /tools/ai-readiness/api/scan
    ai-readiness/api/scan.mjs                  turns a web Request into the engine's call
    ai-readiness/lib/scan.js                   the scan engine (plain Node, no Next.js)
    ai-readiness/test/                         the tests (see "Run the tests")
    ai-readiness/README.md                     this file

What the builder (`src/lib/ai-readiness-page.ts`) fills into the template:

- **Header, footer and Tools menu** from the site's own text files
  (`src/i18n`) and contact details (`src/lib/contact.ts`), so they always match
  the rest of the site. The phone menu stacks however many links there are.
- **Language:** `<html lang>`, the canonical address and the `hreflang` links.
  `TOOL_LOCALES` lists the languages the page exists in.
- **Meta Pixel and GA4** from the same settings as the site
  (`NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_COOKIE_BANNER`),
  plus a Contact event on WhatsApp, phone and email links.
- **Content-Security-Policy:** only the page's own inline scripts may run (their
  hashes are worked out from the built page), plus Meta's and Google's
  domains when those tags are set up. The report shows text taken from other
  websites, so this is the safety net if escaping ever fails.

Also: `src/app/sitemap.ts` lists the page; the check needs `htmlparser2` and
`undici` (in the site's `package.json`); and every path the page uses for its
fonts and the check starts with `/tools/ai-readiness/`.

---

## Vercel settings

It deploys with the main website: a push to `main` puts it live.

- **Time limit:** the route sets `maxDuration = 60`; a check stops itself
  after 25 seconds.
- **Region:** the check runs in the website's Vercel function region. The
  report says server speed is "measured from Singapore", so set the
  project's Function Region to Singapore (`sin1`) in Vercel: Project
  Settings, then Functions. Next.js no longer lets one route pick its region.
- **Plan:** Vercel allows the free Hobby plan for personal, non-commercial use
  only. This is a business tool, so the team should be on Pro.

---

## Cost on Vercel

Vercel bills Pro usage by active CPU time and memory time, and most of a
check is spent waiting for the other site, which is not counted as CPU time.
At Vercel's published Singapore rates (September 2026: Active CPU US$0.16
per hour, memory US$0.0133 per GB-hour), 1,000 checks a month cost about
US$0.10, if each check holds 2 GB for about 10 seconds. The 60-second limit on the
route (`maxDuration`) stops a stuck check from running up time.

---

## Test it against known answers

Scan these on a Vercel preview deployment before a change goes live.

| Page | What you should see |
|---|---|
| studiopepebali.com | D on all four channels, 3 things to change and 2 tips, all marked "You can do this" |
| blissdigital.id | If the main site still builds its pages with JavaScript: ChatGPT and Meta AI at D, with "Main text is in the raw HTML" as fix number 1 |
| www.blissdigital.id/tools/ai-readiness itself | A on all four channels. The page passes its own check. It is not a homepage, so the paragraph and date checks count in full |
| Any WordPress site | No raw HTML problem. WordPress sends its text in the first response |

The report explains each grade by naming the issues behind it, for example
"3 things to fix on the page: move the main title out of the top bar, add
section titles, and remove the sample text left by your template."

---

## The four channels

| Channel | Reads the page | robots.txt name it obeys |
|---|---|---|
| Google AI Overviews | After JavaScript | Googlebot |
| Gemini app | After JavaScript | Googlebot, and Google-Extended for Gemini use |
| ChatGPT | Before JavaScript | OAI-SearchBot |
| Meta AI | Before JavaScript | meta-webindexer |

Meta runs two crawlers. `meta-webindexer` fetches pages to cite in Meta AI
answers. `meta-externalagent` collects training data. Blocking the training
crawler does not affect citations, so the tool checks `meta-webindexer` only.

Meta publishes no page-level directive for Meta AI, like Google's
`max-snippet`. So Meta AI has two checks: the crawler rule, and whether the
text is in the first response.

---

## Two kinds of check

Every check carries a `src` field.

**`platform`** — a rule the channel published. A blocked crawler, a `noindex`
tag, a page that does not load. Only these can take a channel to **E**.

**`measure`** — a threshold Bliss set from third-party research. One main
title, two or more section titles, three paragraphs of 40+ words, sentences
that name the business, a visible date, and the 60-word floor for text in the
raw HTML. No channel publishes these numbers, so they stop at **D**.

**The grade, per channel.** The worst tier reached wins:

| Grade | When |
|---|---|
| E | A published rule is broken: robots.txt blocks the crawler, noindex, nosnippet, max-snippet:0, unavailable_after in the past, or the page does not load |
| ? | We could not confirm it: robots.txt could not be read, or the site may send the crawler a page we could not see |
| D | A measured floor is missed (no text before JavaScript for ChatGPT or Meta AI), a usage limit applies (max-snippet above 0, data-nosnippet on main text), or 3 or more page issues |
| C | 2 page issues, or 3 or more site setup gaps (canonical, sitemap, redirect, compression) |
| B | 1 page issue, 1 or 2 site setup gaps, a missed homepage tip, or text we could not see |
| A | Nothing to fix |

On a homepage, paragraph length, sentences and a visible date are tips: a
missed tip stops an A but never lowers a grade below B. Server speed is shown
but not graded.

---

## The WhatsApp hand-off

Under every result there is a **Send to Bliss on WhatsApp** button. It opens
WhatsApp with this message already filled in:

    Hi Bliss, I ran the AI readiness check on https://www.studiopepebali.com.
    Grades: AI Overviews D, Gemini D, ChatGPT D, Meta AI D.
    Could your team review it with me?

No form, no database, and no email storage. The lead arrives in the Bliss
WhatsApp inbox with the site and grades already in it.

"Save as PDF" uses the browser's own print dialog. A print style hides the
menu and buttons, so only the result prints.

---

## Sites that refuse the tool

**Asking as each crawler (changed 27 September 2026, after the second real-site
test).** On every check the tool now also asks as Googlebot, OAI-SearchBot and
meta-webindexer, when robots.txt lets that crawler in. Our own name stays in
every request.

- If a crawler gets a different page from ours, that channel is graded on the
  crawler's page.
- If our tool is refused but a crawler gets the page (pontianak.ut.ac.id: an F5
  firewall page for our tool and Googlebot, the full page for OAI-SearchBot and
  meta-webindexer), the tool grades from the crawlers' pages. A channel whose
  crawler was also refused is marked "Best estimate".
- If a crawler is refused while our page loads (digimaya.com: error 502 only
  for OAI-SearchBot), the grade does not change. The fix list shows a Question
  for the developer. Our requests do not come from Google's or OpenAI's
  addresses, and many firewalls check that, so a refusal to us does not prove
  the real crawler is refused.
- If every request is refused (discoverasr.com: Cloudflare), the tool shows
  "We could not read this page", as before.
- Server speed is the middle value of all these requests (up to 4), not the
  first one alone. One slow first answer, often a cold cache, no longer fails a
  site (rentalpontianak.com: 4.7 s first, about 2 s after).

Large sites often use bot protection, such as Cloudflare or Akamai. It can
refuse our tool while letting Googlebot and other verified crawlers through.
When the tool gets error 401, 403, 429 or 503, a robot-check page (Cloudflare,
Akamai, DataDome, PerimeterX, AWS WAF), or cannot connect at all, it shows
"We could not read this page" and gives no page grade. A refusal to our tool
does not mean AI is blocked, so the tool does not guess.

The page still shows two useful things:

1. **What robots.txt says.** robots.txt is a separate file and is often not
   behind the bot protection. The tool reads it and shows each channel as
   Allowed, Blocked (grade E) or Not known. This part does not need the page,
   so it is certain. Booking.com and Tokopedia both allow all four AI
   crawlers in robots.txt.
2. **Paste the page source.** The site owner opens the page in Chrome, presses
   Cmd + Option + U (Windows: Ctrl + U), copies everything and pastes it.
   The tool grades the pasted page with the same rules
   (`POST /api/scan` with `{url, html}`, up to 3.5 MB). Speed, compression
   and redirects show as "Not checked". Every grade is marked "Likely",
   because the page is what the owner's browser received, not what each
   crawler received. A pasted robot-check page, or text that is not a web
   page, is refused with a plain message.

The tool never tries to get past bot protection. The owner can also allow
`BlissAccessCheck` in their bot protection, and then the normal check works.

---

## Sites that send different pages to different visitors

Some sites send an empty JavaScript page to people and a ready-made page to
chosen crawlers. They say so with the response header `Vary: User-Agent`.
Agoda does this: Googlebot gets a full page, while OAI-SearchBot and
meta-webindexer get the same empty page as a person.

When the page we receive is empty AND that header is present, the tool asks
once more as each crawler that robots.txt allows. Each channel is then graded
on the page its own crawler receives, and the result shows a panel: "What your
site sends to each reader". The tool keeps its own name in every one of these
requests, for example:

    Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) BlissAccessCheck/1.0 (+https://www.blissdigital.id/en/tools/ai-readiness)

so a site owner can see in their logs who really asked. On 27 September 2026,
Agoda still recognised Googlebot with our name added (801,941 bytes, the same
as the plain Googlebot request).

If the site refuses those requests, ChatGPT and Meta AI are shown as "?" and "Not
confirmed", with one question for the owner's developer. The tool does not
guess.

When the page is empty and the header is NOT present, the tool grades
ChatGPT and Meta AI D, because there is no sign that crawlers get anything else.

---

## Design: matches www.blissdigital.id (10 November 2026)

The page now uses the Bliss website's own design, read from the live site's
stylesheet on 10 November 2026.

- **Fonts.** Plus Jakarta Sans (400 and 600, with italics) for all text, and
  Fragment Mono for small labels, the same two fonts the website uses. Both
  are open-source (SIL Open Font License, copies in `public/fonts/`). They are
  served from this site, not from Google Fonts, so the page makes no request
  to another company.
- **Colours.** Ink `#430719` for text, maroon `#70020F` for buttons and
  accent words, cream `#F6F4F0` for cards, grey `#55595C` for body text (a
  little darker than the website's `#5C6063`, because reports are long), and
  the website's green `#2F7A4F` for good results. Grades: A `#2F7A4F`,
  B `#427A50`, C `#A4525D`, D `#8E2A37`, E `#70020F`, ? `#696D72`. Every grade
  colour passes WCAG AA contrast for small text on white. No yellow or red
  warning boxes. Colour stays in small marks.
- **Shapes.** Buttons have 10 px corners and the website's layered shadow.
  Cards have 20 to 28 px corners. Small chips are fully round.
- **Headings.** Large and tight, with words in maroon italic, as on the
  website ("Can AI read *your website?*").
- **Header and footer.** The same links, logo mark, address and social
  buttons as the website. The header turns into a white floating bar when
  the visitor scrolls. On phones the links move into a menu button.
- **Motion.** The website's own timings: the hero rises in, sections fade up
  24 px as they scroll into view (0.7 s), buttons lift 2 px on hover, the
  grade rings draw in. All motion stops when the visitor's device asks for
  reduced motion. With JavaScript off, everything is visible and still.

The demo, the saved site reports, the 17-site file, the sample file and the
Terminal pack's report template use the same design. Those files open
straight from a computer, so they load the two fonts from Google Fonts.

---

## How the result page is laid out

The result comes in two parts, so the reader enjoys the result before reading
the reasons.

**Part 1, Your result.** Few words. Four grade cards (grade, status word, a
5-step bar, and a confidence pill), four count tiles (channels that can read
the text, things to fix, fixes the owner can do, fixes for the developer),
"What each reader receives" when the site sends different pages, six number tiles
with the ideal under each, the paragraph-length chart, and the page titles
now next to the ideal (first 8 titles, then "+ N more").

**Part 2, What we found, and what to do.** One-sentence verdict, why each
grade (channels with the same grade and reason share one row, and the reason
names each issue), the fix list in order, what the tool cannot check, and the
WhatsApp hand-off.

**Search terms: removed from the page, 27 September 2026.** The check matched
the words of a search against the page's sections. AI matches by meaning, so
the results were often wrong (Studio Pepe, an Italian restaurant in Bali, got
"Not on your page yet" for "italian restaurant in bali"). The matching code
stays in `scan.js` and still answers `q1` to `q3` in the API, but the page no
longer sends them. The citation tool (tool 2) will measure this properly by
asking the AI platforms real questions.

---

## How sure each grade is

Each grade card carries one of three labels:

| Label | When |
|---|---|
| Confirmed | Measured on the page that channel's crawler receives |
| Likely | Meta AI failed only because its raw page is empty. No public test shows whether meta-webindexer runs JavaScript. Also used when the raw page is thin and a JavaScript-running channel could not be confirmed |
| Not confirmed | The grade is "?": the site refused a check |

The evidence behind "ChatGPT and Meta AI read the raw page" is dated on the
page itself: an independent test by Vercel (December 2024) found that
OAI-SearchBot, ChatGPT-User, GPTBot and Meta-ExternalAgent do not run
JavaScript. OpenAI's crawler page says nothing about JavaScript. No newer
public test has shown a change. Review this line whenever a newer test appears.

---

## How the measuring was checked

On 27 September 2026, six real copies of Agoda's Bali page were saved from a
Mac, one per reader (browser, Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User,
meta-webindexer). Each was measured twice: by the tool's own engine, and by a
separate counter written with Python's standard HTML parser, sharing no code.

| Reader | Bytes | Words | H1 | Section titles | Quotable paragraphs |
|---|---|---|---|---|---|
| Browser | 87,966 | 0 | 0 | 0 | 0 |
| Googlebot | 801,941 | 36,058 | 1 | 37 | 259 |
| Bingbot | 801,941 | 36,058 | 1 | 37 | 259 |
| OAI-SearchBot | 85,812 | 0 | 0 | 0 | 0 |
| ChatGPT-User | 87,758 | 0 | 0 | 0 | 0 |
| meta-webindexer | 86,012 | 0 | 0 | 0 | 0 |

Both methods gave identical counts once one bug was fixed: the engine had
counted "<!DOCTYPE html>" as 2 words. The same run caught a second bug:
3 data-nosnippet elements holding only a copyright line and a server ID had
been graded as a usage limit (D). The rule now counts marked text by words,
and fails only when it is a quotable paragraph or 10% of the page.

Update after the independent review: the engine now puts a space between
blocks such as list items, as a browser does. The Googlebot count moved from
34,400 to 36,058 words. A real browser (Chromium, JavaScript off, hidden
sections shown) counts exactly 36,058 on the same file. 15,517 of those words
sit in sections the page hides until a visitor opens them.

---

## Rules decided after the real-site test, 27 September 2026

Seventeen real sites were saved from a Mac and graded. Andri checked the key
findings by hand (page source, ChatGPT, Google). Three rules came out of it:

- **Homepages** (the path is `/`, or a language path such as `/en-id`) keep the
  two title checks. Paragraph length and a visible date are shown as tips and
  do not lower the grade. Most homepages are short blocks and links by design.
- **Text we could not see** (for example a JavaScript-only page, where Google
  runs the script but we cannot) gets at most B, marked "Likely".
- **The main title** is named in the result. A Heading 1 that sits only in the
  page's top bar is a problem, unless it names the site as the page title does.
  A logo used as the main title counts by its label.
- **Sample text left by the website template** (for example Wix's "This is the
  area to introduce viewers to the context of this image") is a page check.
  Crawlers read it even when it sits in a hidden gallery.
- **Word totals:** the words tile counts all text in the HTML, including menus,
  buttons and captions. The paragraph chart counts only paragraphs and list
  items, and the report now shows both numbers side by side.

---

## Independent review, 27 September 2026

Two reviewers that had not seen the code checked the engine and the page,
and proved most findings by running them. Every finding below is fixed and
has a test in `test/edge.js`.

**Safety (the tool fetches addresses typed by strangers)**
- Private, local and cloud-metadata addresses are refused, in every form
  (127.0.0.1, 2130706433, 0x7f.1, [::1], [::ffff:127.0.0.1], 169.254.169.254,
  10.x, 192.168.x, names such as localhost or *.internal). The check runs on
  the typed address, on every redirect hop, on robots.txt, on every sitemap
  and on every crawler request. The connection goes to the address that was
  checked, so a second DNS answer cannot swap it.
- Only ports 80 and 443. No user name or password in the address.
- Every body is read with a size cap counted after decompression: page 3 MB,
  robots.txt 500 KB, sitemap 10 MB. A 300 MB "zip bomb" is stopped at 3 MB.
- One deadline for the whole check (now 25 seconds; see the final review below) and at
  most 40 outgoing requests per check.
- Error messages no longer include technical details.

**Grades**
- robots.txt is read from the host the page finally comes from. Before,
  `example.com` redirecting to `www.example.com` skipped its rules.
- robots.txt that answers with a server error, or does not answer, gives "?",
  not "allowed". Google stops crawling a site while its robots.txt fails.
- Thai, Chinese and Japanese text is split into words properly. Before, a
  Thai page counted as almost empty.
- Page text is read in its own character set (for example Shift_JIS).
- `X-Robots-Tag: googlebot: noindex` applies to Google only. A `bingbot` or
  `googlebot` meta tag no longer applies to ChatGPT.
- A page that does not load (404, 500, a redirect loop) fails every channel.
- A contact form using Cloudflare Turnstile no longer counts as a robot check.
- A `<meta http-equiv="refresh">` page is followed like a redirect.
- Sitemap entries with `&amp;`, CDATA, `.gz` files, or a www/https difference
  are matched correctly.
- "Server answers fast" now measures time to first byte.
- The title counts and the "titles now" outline come from the same list.
- "Top 10 may help" is no longer read as a date.
- A PDF or image address gets a clear message instead of a grade.

**Page**
- Error and progress messages sit under the form and are announced to screen
  readers. On a phone they appear where the visitor is looking.
- The verdict sentence checks for E grades first, so it never contradicts them.
- Colours meet the WCAG AA contrast ratio. Each fix carries a text label
  (Stops a channel, Limits AI use, AI gets no text, Page quality, Site setup,
  Tip), not colour only.
- Long addresses and titles wrap instead of widening the page.
- Save as PDF keeps the whole table and prints the Bliss name and WhatsApp
  number at the top.

---

## Final independent review, 28 September 2026

Five reviewers checked the tool, each with one job: platform rules, security,
a hand audit of the 34 real sites, report wording, and production limits.
To test the review itself, four bugs were planted in the reviewed copy
without telling the reviewers. All four were found. A sixth reviewer then
checked the fixes against the reviewers' own proof scripts. The full list is
in FIXES.md of the review pack; the main changes:

- **robots.txt is now read the way Google reads it**, by our own reader that
  follows Google's published spec and its open-source parser (robots.cc).
  Lines such as Crawl-delay no longer end a group; a group that names a
  crawler with no rules allows it; common typos (Disalow, Useragent) count;
  the longest rule wins and Allow wins a tie; 500 KiB limit. It agrees with a
  port of Google's parser on all 1,088 real-site checks and 80,000 random
  files. Matching uses indexOf between the stars, with a 0.5-second budget.
- **HTML is read with htmlparser2 as a stream**, not built into a page tree.
  Pages built to make parsing slow (thousands of unclosed tags, one unclosed
  element with many children, 3 MB of short paragraphs) now take under a
  second. Results on the 34 real sites: no grade changed.
- **Directives:** each X-Robots-Tag header is read on its own; the most
  restrictive max-snippet wins; unavailable_after in the past stops Google;
  data-nosnippet counts only on span, div and section, as Google supports.
- **Time:** the check has 25 seconds in total, 10 per request, 8 for
  robots.txt and 8 for sitemaps. A crawler that times out is never reported
  as a refusal, and never changes a grade.
- **Location:** the check runs in Singapore (Vercel region `sin1`, set in the
  project settings; see "Vercel settings"), the closest region to Indonesia. Server speed is
  shown but not graded ("measured from Singapore"). The redirect fix says
  country redirects may not apply in Indonesia.
- **Refusals:** status 401, 403, 405, 406, 415, 418, 429, 451 and 503, robot
  check pages (Cloudflare, Akamai, Imperva, DataDome, HUMAN, AWS WAF, F5) and
  country block pages give "could not check", never a grade. If a crawler
  gets a page when our tool is refused, the channels are graded from the
  crawlers' pages.
- **Errors:** a mistyped address, a timeout, a bad certificate, a refused
  connection and a closed connection each get their own plain message.
- **Security:** 172.16.0.0/12 and more IPv6 special ranges blocked; names with
  a trailing dot checked; odd POST bodies answered with 400; no single text
  from a page may exceed 2,000 characters in the answer, and the answer stays
  under 5 MB.
- **Report:** only real fixes are numbered (tips get a dot, questions "?");
  the developer tile always shows; the summary names each blocked channel's
  reason; "Confirmed" only when the grade was measured on that crawler's page.

Known limits, left on purpose:

- Text in `<div>` blocks with line breaks is not counted as paragraphs
  (only p, li, td, th, blockquote, figcaption, dd). Some site builders put
  text in divs, so their paragraph count can be low.
- Any date in the page text counts as "a visible date", even an old one.
- A refusal of our crawler-named request (for example Wikipedia refusing a
  Googlebot request from our server) shows as a question for the developer.
  Many firewalls check the crawler's IP address, so the real crawler may get
  the page. The grade does not change.
- Gemini's rules are inferred from Googlebot and Google-Extended; Google does
  not publish separate rules for the Gemini app.
- One check sends up to about 13 requests to the site. The rate limit is kept
  in memory per function instance.

---

## Rate limiting

The function allows one check per visitor every 20 seconds. A check from pasted page source is allowed every 5 seconds. The limit lives in memory,
so it holds while the function is warm and resets when it goes cold. The
visitor's address comes from `x-real-ip`, which Vercel sets itself, so a
visitor cannot fake it. For a hard limit, add a rate-limiting rule for
`/api/scan` in the Vercel Firewall.

---

## Run the tests

    npm install
    node ai-readiness/test/fixtures.js &
    npm run test:ai-readiness

Run both from the repository root. Node 22 or 24. All 57 checks in
`test/run.js`, all 94 checks in `test/edge.js` and all 11 checks in
`test/vercel.mjs` pass as shipped. The tests use local servers, so they set
`BLISS_ALLOW_PRIVATE=1`. Never set it on Vercel.

| Test page | Grades | What it proves |
|---|---|---|
| Clean server-built page | A A A A | The normal path |
| JavaScript shell | B B D D | ChatGPT and Meta AI alone read the empty first response |
| `max-snippet:40` | D A A A | A Google usage limit touches AI Overviews only |
| ChatGPT crawlers blocked together | A A E A | Grouped robots.txt rules are read correctly |
| `meta-webindexer` blocked | A A A E | Meta AI stops; its training crawler is left open and ignored |
| Template-heavy page | D D D D | The Studio Pepe case: unfit, but no platform rule broken |
| Date formats | — | English and Indonesian dates are found, such as 5 Agustus 2026; words like "marketing 2026" are not |
| nike.com homepage | B B B B | A site AI cites often. One real fix: no paragraph long enough to quote |
| agoda.com Bali page | B B D D | Full page for Googlebot, empty for OAI-SearchBot and meta-webindexer, as measured live. The fix names the crawlers to add. Google B: no visible date |
| Site that refuses our tool (403, robot check, or blocked robots.txt) | no grade | Shows "could not check" instead of guessing |
| Site that refuses our tool, robots.txt readable | no page grade | Shows each channel from robots.txt (for example Blocked, Blocked, Allowed, Allowed) and the paste box |
| Search terms on a page whose text JavaScript adds | "Could not check" | The tool cannot see the text, so it does not say "Not on your page yet" |
| Pasted page source | graded, all "Likely" | Same rules as a normal check. Speed, compression and redirects "Not checked" |

Grade order in the table: AI Overviews, Gemini, ChatGPT, Meta AI.
