const http = require('http');
const zlib = require('zlib');

const RICH = `<!doctype html><html><head><title>Google Ads Audit</title>
<link rel="canonical" href="http://127.0.0.1:8899/rich.html">
</head><body><h1>Google Ads audit service</h1>
<h2>What does a Google Ads audit include</h2>
<p>An Adcumen Co audit covers search terms, conversion tracking, location targeting and asset quality. Adcumen Co reviews every campaign type in the account. Adcumen Co checks conversion tracking against the live site and confirms every action fires once. The report is delivered in two business days. Published 12 March 2026.</p>
<h2>How long does a Google Ads audit take</h2>
<p>Adcumen Co delivers the report in two business days. The review itself takes about six hours of analyst time across the account.</p>
<h2>Pricing</h2>
<p>${'word '.repeat(90)}</p>
<h2>What you receive</h2>
<p>${'word '.repeat(80)}</p>
<h2>Who this is for</h2>
<p>${'word '.repeat(70)}</p>
</body></html>`;

const SHELL = `<!doctype html><html><head><title>App</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>`;

const BLOCKED = RICH
  .replace('rich.html"', 'blocked.html"')
  .replace('</head>', '<meta name="robots" content="noarchive, max-snippet:40"></head>');

const FRAGMENTS = `<!doctype html><html><head><title>Studio</title>
<link rel="canonical" href="http://127.0.0.1:8899/fragments.html"></head><body>
<h1>RESERVATION CONFIRMED</h1><h1>RESERVATION CONFIRMED</h1>
<p>Book a table</p><p>Our story</p><p>Contact us</p>
<p>${'word '.repeat(30)}</p><p>${'word '.repeat(28)}</p>
</body></html>`;

const NOHEAD = `<!doctype html><html><head><title>Article</title>
<link rel="canonical" href="http://127.0.0.1:8899/nohead.html"></head><body>
<p>${'word '.repeat(120)}</p><p>${'word '.repeat(120)}</p><p>${'word '.repeat(120)}</p>
</body></html>`;


// Modelled on the live measurements taken from studiopepebali.com:
// 465 words of raw text, 2 H1 both reading "RESERVATION CONFIRMED", 0 H2,
// 0 H3, longest text block 36 words, 0 blocks of 40+ words, no visible date.
// This is the calibration case: clearly unfit, but nothing a platform
// published is broken, so it must never reach E.
const WIXLIKE = (() => {
  const short = n => `<p>${'word '.repeat(n)}</p>`;
  const filler = '<p>This is the area to introduce viewers to the context of this image.</p>';
  const blocks = [short(36), short(34), short(31), short(30), short(29), short(28),
                  short(27), short(26), short(26), short(25), short(25), short(25), short(25)].join('');
  return `<!doctype html><html><head><title>Studio Pepe Bali</title>
<link rel="canonical" href="http://127.0.0.1:8899/wixlike.html"></head><body>
<h1>RESERVATION CONFIRMED</h1><h1>RESERVATION CONFIRMED</h1>
${blocks}${filler}${filler}${filler}${filler}
<p>Book a table</p><p>Our story</p><p>Contact</p>
</body></html>`;
})();

const ROBOTS_OPEN = `User-agent: *\nAllow: /\nSitemap: http://127.0.0.1:8899/sitemap.xml`;
const ROBOTS_META = `User-agent: meta-webindexer\nDisallow: /\n\nUser-agent: meta-externalagent\nAllow: /\n\nUser-agent: *\nAllow: /\nSitemap: http://127.0.0.1:8899/sitemap.xml`;
const ROBOTS_OAI = `User-agent: GPTBot\nUser-agent: OAI-SearchBot\nDisallow: /\n\nUser-agent: *\nAllow: /\nSitemap: http://127.0.0.1:8899/sitemap.xml`;
const SITEMAP = `<urlset><url><loc>http://127.0.0.1:8899/rich.html</loc></url><url><loc>http://127.0.0.1:8899/blocked.html</loc></url><url><loc>http://127.0.0.1:8899/fragments.html</loc></url><url><loc>http://127.0.0.1:8899/nohead.html</loc></url><url><loc>http://127.0.0.1:8899/fineprint.html</loc></url><url><loc>http://127.0.0.1:8899/hidden-content.html</loc></url><url><loc>http://127.0.0.1:8899/wixlike.html</loc></url><url><loc>http://127.0.0.1:8899/p-nosnippet.html</loc></url></urlset>`;

let robotsMode = 'open';

const srv = http.createServer((req, res) => {
  const p = req.url.split('?')[0];
  const send = (body, type='text/html') => {
    const gz = zlib.gzipSync(Buffer.from(body));
    res.writeHead(200, {'Content-Type': type, 'Content-Encoding': 'gzip'});
    res.end(gz);
  };
  if (p === '/robots.txt' && robotsMode === 'refuse') { res.writeHead(403); return res.end('Forbidden'); }
  if (p === '/robots.txt') return send(robotsMode === 'open' ? ROBOTS_OPEN : robotsMode === 'meta' ? ROBOTS_META : ROBOTS_OAI, 'text/plain');
  if (p === '/sitemap.xml') return send(SITEMAP, 'application/xml');
  if (p === '/rich.html') return send(RICH);
  if (p === '/shell.html') return send(SHELL);
  if (p === '/blocked.html') return send(BLOCKED);
  if (p === '/fragments.html') return send(FRAGMENTS);
  if (p === '/nohead.html') return send(NOHEAD);
  if (p === '/wixlike.html') return send(WIXLIKE);
  if (p === '/mode/oai') { robotsMode = 'oai'; return send('ok', 'text/plain'); }
  if (p === '/mode/meta') { robotsMode = 'meta'; return send('ok', 'text/plain'); }
  if (p === '/mode/refuse') { robotsMode = 'refuse'; return send('ok', 'text/plain'); }
  if (p === '/refused') { res.writeHead(403, {'Content-Type': 'text/html'}); return res.end('<title>Access Denied</title>Reference #18.abc'); }
  if (p === '/challenge') return send('<!doctype html><html><head><title>Just a moment...</title></head><body>Checking your browser</body></html>');
  if (p === '/fineprint.html') return send(RICH.replace('rich.html"', 'fineprint.html"').replace('</body>', '<p><span data-nosnippet>All material herein copyright 2005 to 2026. All rights reserved.</span></p></body>'));
  // Google supports data-nosnippet on span, div and section only.
  if (p === '/hidden-content.html') return send(RICH.replace('rich.html"', 'hidden-content.html"').replace('<h2>Pricing</h2>\n<p>', '<h2>Pricing</h2>\n<div data-nosnippet><p>').replace('</p>\n<h2>What you receive</h2>', '</p></div>\n<h2>What you receive</h2>'));
  if (p === '/p-nosnippet.html') return send(RICH.replace('rich.html"', 'p-nosnippet.html"').replace('<h2>Pricing</h2>\n<p>', '<h2>Pricing</h2>\n<p data-nosnippet>'));
  if (p === '/mode/open') { robotsMode = 'open'; return send('ok', 'text/plain'); }
  if (p === '/redir') { res.writeHead(301, {Location: '/rich.html'}); return res.end(); }
  res.writeHead(404); res.end('not found');
});
srv.listen(8899, '127.0.0.1', () => console.log('fixtures on 8899'));


/* ---- Nike homepage, rebuilt from measurements of the live page ---- */
{
// Rebuilds the structure measured on www.nike.com/my/ on 27 Sep 2026, from its
// server HTML (no JavaScript run): 1 H1 "Featured", 9 H2 (8 in the footer),
// 14 H3 card titles, 25 text blocks all under 21 words, 17 sentences, none
// opening with we/it, one date ("29 October"), robots meta index,follow,
// canonical /my/. robots.txt is Nike's own `*` group (no AI-crawler rules).
// The homepage sits in landing-page sitemap 41 of 64, as on the live site.
const H = 'http://127.0.0.1:8903';
const ROBOTS = `# www.nike.com robots.txt -- just crawl it.
User-agent: *
Disallow: */member/inbox
Disallow: */member/settings
Disallow: */p/
Disallow: */checkout/
Disallow: /*.swf$
Disallow: /*.pdf$
Disallow: /fragments/recommendations-carousel

User-agent: Baiduspider
Allow: /cn/
Disallow: /

Sitemap: ${H}/sitemap-us-help.xml
Sitemap: ${H}/sitemap-v2-landingpage-index.xml
Sitemap: ${H}/sitemap-v2-pdp-index.xml
Sitemap: ${H}/sitemap-v2-article-index.xml`;

const locales = [];
for (let i = 1; i <= 64; i++) locales.push(i === 41 ? 'en-my' : 'xx-' + String(i).padStart(2, '0'));
const INDEX = `<sitemapindex>${locales.map(l => `<sitemap><loc>${H}/sitemap-v2-landingpage-${l}.xml</loc></sitemap>`).join('')}</sitemapindex>`;
const child = l => `<urlset>${Array.from({length: 400}, (_, i) => `<url><loc>${H}/${l}/page-${i}</loc></url>`).join('')}${l === 'en-my' ? `<url><loc>${H}/my/</loc></url>` : ''}</urlset>`;

const cards = [
  ['ALPHAFLY 4 "PROTOTYPE"', 'Built for record attempts. Lighter foam and a new plate for the fastest marathon runners.'],
  ['EVERY. DAY. SPEED.', 'Daily trainers made to carry fast legs through easy miles and hard sessions alike.'],
  ['CAITLIN CLARK EATS', 'The signature collection arrives 29 October. Shop the first colourways online.'],
  ['‘DEEP WATER’', 'A short film on swimmers training through the monsoon season in Asia.'],
];
let h3 = '', blocks = '';
for (let i = 0; i < 14; i++) { const c = cards[i % 4]; h3 += `<div><h3>${c[0]}</h3><p>${c[1]}</p></div>`; }
const extra = ['Shop New Arrivals.', 'Member exclusives, free delivery and returns for Nike Members.',
  'Find a store near you.', 'Nike Membership unlocks the best of Nike.', 'Sign up for free today.',
  'Join the Nike Run Club community.', 'Download the Nike App for early access.', 'Explore the Jordan collection.',
  'Shop Running.', 'Shop Basketball.', 'Shop Football.'];
blocks = extra.map(t => `<p>${t}</p>`).join('');
const nav = ['New & Featured', 'Men', 'Women', 'Kids', 'Jordan', 'Sale', 'Find a Store', 'Help', 'Join Us', 'Sign In'].map(t => `<a>${t}</a>`).join(' ');
const footLinks = Array.from({length: 60}, (_, i) => `<a>Footer link number ${i + 1} about help orders returns</a>`).join(' ');
const PAGE = `<!doctype html><html><head><title>Nike. Just Do It. Nike MY</title>
<meta name="robots" content="index, follow"><link rel="canonical" href="${H}/my/"></head><body>
<header><nav>${nav}</nav></header>
<main><h1>Featured</h1><h2>SPOTLIGHT</h2>${h3}${blocks}</main>
<footer><h2>Resources</h2><h2>Help</h2><h2>Company</h2><h2>Africa</h2><h2>Americas</h2><h2>Asia Pacific</h2><h2>Europe</h2><h2>Middle East</h2>${footLinks}</footer>
</body></html>`;

http.createServer((req, res) => {
  const host = (req.headers.host || '').split(':')[0];
  const p = req.url.split('?')[0];
  const send = (b, t = 'text/html') => { res.writeHead(200, {'Content-Type': t, 'Content-Encoding': 'gzip'}); res.end(zlib.gzipSync(b)); };
  if (host === 'localhost' && p === '/') { res.writeHead(301, {Location: `${H}/my/`}); return res.end(); } // nike.com -> www.nike.com/my/
  if (p === '/robots.txt') return send(ROBOTS, 'text/plain');
  if (p === '/sitemap-v2-landingpage-index.xml') return send(INDEX, 'application/xml');
  const m = p.match(/^\/sitemap-v2-landingpage-(.+)\.xml$/); if (m) return send(child(m[1]), 'application/xml');
  if (/^\/sitemap-.*\.xml$/.test(p)) return send('<urlset><url><loc>' + H + '/help/a</loc></url></urlset>', 'application/xml');
  if (p === '/my/') return send(PAGE);
  res.writeHead(404); res.end('nf');
}).listen(8903, '0.0.0.0', () => console.log('nike fixture on 8903'));

}


/* ---- Agoda homepage, rebuilt from measurements of the live page ---- */
{
// Rebuilds www.agoda.com/ as measured on 27 Sep 2026 from its server HTML:
// empty <title>, no H1, 0 readable words, 31 scripts (219 KB), React mount
// points only. robots.txt: `*` and Googlebot groups, neither blocks "/".
// Sitemap: an index of 258 files holding up to 45,000 addresses each.
// Response header, as live: Vary: User-Agent, Accept-Encoding.
const H = 'http://127.0.0.1:8904';
const ROBOTS = `User-agent: *
Disallow: /api/
Disallow: /*/search
Disallow: /Search/

User-agent: Googlebot
Disallow: /api/
Disallow: /Search/

User-agent: TurnitinBot
Disallow: /

Sitemap: ${H}/sitemaps.xml`;
const INDEX = `<sitemapindex>${Array.from({length: 258}, (_, i) => `<sitemap><loc>${H}/sitemaps-part-${i + 1}.xml</loc></sitemap>`).join('')}</sitemapindex>`;
const part = n => `<urlset>${Array.from({length: 3000}, (_, i) => `<url><loc>${H}/city/place-${n}-${i}.html</loc></url>`).join('')}</urlset>`;
const script = `<script>window.__DATA__=${JSON.stringify({hotels: Array.from({length: 400}, (_, i) => ({name: 'Hotel ' + i, city: 'Bali', text: 'Great hotel near the beach with pool'}))})}</script>`;
const SEEN = [];
const para = (topic) => `${topic} Agoda lists more than 7,000 places to stay in Bali, from beach resorts in Nusa Dua to villas in Ubud and guesthouses in Canggu. Travellers compare prices, read verified guest reviews and book with free cancellation on many rooms. Most visitors fly into Ngurah Rai International Airport, and the dry season from April to October is the most popular time to visit.`;
const FULL = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>11 Best Hotels in Bali, Indonesia</title>
<link rel="canonical" href="${H}/"></head><body><header><nav><a>Hotels</a><a>Flights</a></nav></header>
<main><h1>Bali Hotels</h1><p>Updated September 2026</p>
<h2>Fast facts about Bali, Indonesia</h2><p>${para('Bali is an Indonesian island known for beaches, temples and rice terraces.')}</p>
<h2>Where to stay in Bali</h2><p>${para('Seminyak and Kuta suit travellers who want nightlife close to the beach.')}</p>
<h2>When to visit Bali</h2><p>${para('Bali has two seasons, a dry season and a wet season.')}</p>
<h3>Popular hotels</h3>${Array.from({length: 11}, (_, i) => `<h3>Hotel number ${i + 1}</h3><p>Rated 8.${i % 10} by guests. Free cancellation.</p>`).join('')}
</main><footer><h2>Help</h2></footer></body></html>`;
const PAGE = `<!DOCTYPE html><html><head><meta charset="utf-8"><title></title><meta name="viewport" content="width=device-width"></head><body>
<div id="seo-data"></div>${script.repeat(3)}<div id="mockDataEnabled"></div><div id="login-react-popup"></div><div id="login-react-root"></div>
<div id="pointsmax-panel-react-root"></div><input id="requestVerificationToken" type="hidden"><header id="page-header"></header>
<div id="heroBanner"></div><div id="contentReact"></div><div id="themeDescription"></div><script src="https://cdn6.agoda.net/app.js"></script></body></html>`;
http.createServer((req, res) => {
  const host = (req.headers.host || '').split(':')[0], p = req.url.split('?')[0];
  const send = (b, t = 'text/html') => { res.writeHead(200, {'Content-Type': t, 'Content-Encoding': 'gzip'}); res.end(zlib.gzipSync(b)); };
  if (host === 'localhost' && p === '/') { res.writeHead(301, {Location: `${H}/`}); return res.end(); } // agoda.com -> www.agoda.com
  if (p === '/robots.txt') return send(ROBOTS, 'text/plain');
  if (p === '/sitemaps.xml') return send(INDEX, 'application/xml');
  const m = p.match(/^\/sitemaps-part-(\d+)\.xml$/); if (m) return send(part(m[1]), 'application/xml');
  const ua = req.headers['user-agent'] || '';
  if (/googlebot|oai-searchbot|meta-webindexer|bingbot/i.test(ua)) SEEN.push(ua);
  if (p === '/uas-reset') { SEEN.length = 0; res.writeHead(200); return res.end('ok'); }
  if (p === '/uas') { res.writeHead(200, {'Content-Type': 'application/json'}); return res.end(JSON.stringify(SEEN)); }
  if (p === '/') { // as served live: Googlebot gets a ready-made page, everyone else an empty one
    const body = /googlebot/i.test(ua) ? FULL : PAGE;
    res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip', 'Vary': 'User-Agent, Accept-Encoding'}); return res.end(zlib.gzipSync(body)); }
  if (p === '/refuses-crawlers') { // empty for people; 403 for anything named like a crawler
    if (/googlebot|oai-searchbot|meta-webindexer|bingbot/i.test(ua)) { res.writeHead(403); return res.end('Forbidden'); }
    res.writeHead(200, {'Content-Type': 'text/html', 'Content-Encoding': 'gzip', 'Vary': 'User-Agent'}); return res.end(zlib.gzipSync(PAGE)); }
  res.writeHead(404); res.end('nf');
}).listen(8904, '0.0.0.0', () => console.log('agoda fixture on 8904'));

}
