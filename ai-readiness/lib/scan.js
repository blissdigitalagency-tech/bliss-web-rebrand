/**
 * AI Access Check — scan engine
 *
 * Reads a URL the way four AI channels read it, using plain HTTP only.
 * No headless browser.
 *
 * GET /api/scan?url=https://example.com&q1=...&q2=...&q3=...
 *
 * Safety rules for a public tool that fetches addresses typed by strangers:
 *   - only http and https, only ports 80 and 443, no user:password in the URL
 *   - every address is resolved first, and private, loopback, link-local and
 *     cloud-metadata addresses are refused; the connection uses the address
 *     that was checked, so a second DNS answer cannot swap it
 *   - every redirect hop is checked the same way, by hand
 *   - every body is read with a size cap, counted after decompression
 *   - one deadline for the whole scan, and a cap on outgoing requests
 */

const dns = require("dns");
const net = require("net");
const zlib = require("zlib");
const { Parser: HtmlParser } = require("htmlparser2");
const { Agent, fetch: uFetch } = require("undici");

/* ------------------------------------------------------------------ config */

const UA = "BlissAccessCheck/1.0 (+https://www.blissdigital.id/tools/ai-readiness)";
const MAX_REDIRECTS = 5;
const SCAN_DEADLINE_MS = 25000; // Vercel allows 300 s; 25 s keeps the visitor's wait short
const PER_REQUEST_MS = 10000;
const MAX_REQUESTS = 40;        // outgoing requests per scan, all kinds
const CAP = { page: 3000000, robots: 512000, sitemap: 10000000 }; // robots: Google reads 500 KiB

// Content thresholds, in words of visible text found in the RAW html.
const RAW_RICH = 250;
const RAW_THIN = 60;

const TOKENS = { aio: "Googlebot", gemini: "Googlebot", chatgpt: "OAI-SearchBot", meta: "meta-webindexer" };
const CRAWLER_ORDER = ["Googlebot", "OAI-SearchBot", "meta-webindexer"]; // fixed order, so texts never depend on which answer came first
// How we ask as each crawler. Our own name stays in every request.
const CRAWLER_UA = {
  Googlebot: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) " + UA,
  "OAI-SearchBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot " + UA,
  "meta-webindexer": "meta-webindexer/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/web-crawlers) " + UA,
};
const CHANNEL_NAMES = { aio: "Google AI Overviews", gemini: "Gemini app", chatgpt: "ChatGPT", meta: "Meta AI" };

/* ------------------------------------------------------ address safety */

// Tests run against local servers and set this. Vercel never does.
const allowPrivate = () => process.env.BLISS_ALLOW_PRIVATE === "1";
// Where the check runs, for the speed and redirect wording. The live tool runs
// in Vercel's Singapore region; the Terminal pack sets "this computer".
const checkFrom = () => process.env.BLISS_CHECK_FROM || "Singapore";

function v4ToInt(ip) {
  return ip.split(".").reduce((n, p) => n * 256 + (parseInt(p, 10) & 255), 0) >>> 0;
}
const V4_BLOCKED = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16],
  ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
].map(([a, bits]) => [v4ToInt(a), bits]);
function isPrivateV4(ip) {
  const n = v4ToInt(ip);
  return V4_BLOCKED.some(([base, bits]) => (n >>> (32 - bits)) === (base >>> (32 - bits)));
}
// IPv6 as 8 numbers; handles "::" and a dotted IPv4 tail.
function v6Groups(ip) {
  let s = ip.toLowerCase().split("%")[0];
  const tail = s.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (tail) {
    const n = v4ToInt(tail[1]);
    s = s.slice(0, -tail[1].length) + ((n >>> 16).toString(16)) + ":" + ((n & 65535).toString(16));
  }
  const [head, rest] = s.split("::");
  const a = head ? head.split(":") : [];
  const b = rest !== undefined && rest ? rest.split(":") : [];
  const fill = rest !== undefined ? new Array(8 - a.length - b.length).fill("0") : [];
  return [...a, ...fill, ...b].map((x) => parseInt(x || "0", 16));
}
function isPrivateV6(ip) {
  const g = v6Groups(ip);
  if (g.length !== 8 || g.some((x) => isNaN(x))) return true;
  const allZeroTo = (i) => g.slice(0, i).every((x) => x === 0);
  if (allZeroTo(8)) return true;                                   // ::
  if (allZeroTo(7) && g[7] === 1) return true;                     // ::1
  const v4of = (hi, lo) => [hi >>> 8, hi & 255, lo >>> 8, lo & 255].join(".");
  if (allZeroTo(5) && g[5] === 0xffff) return isPrivateV4(v4of(g[6], g[7]));   // ::ffff:a.b.c.d
  if (allZeroTo(6)) return isPrivateV4(v4of(g[6], g[7]));                        // ::a.b.c.d
  if (g[0] === 0x64 && g[1] === 0xff9b && g[2] === 1) return true;             // 64:ff9b:1::/48 local NAT64
  if (g[0] === 0x64 && g[1] === 0xff9b) return isPrivateV4(v4of(g[6], g[7]));  // NAT64
  if ((g[0] & 0xfe00) === 0xfc00) return true;                     // fc00::/7
  if ((g[0] & 0xffc0) === 0xfec0) return true;                     // fec0::/10 site-local
  if (g[0] === 0x0100 && g[1] === 0 && g[2] === 0 && g[3] === 0) return true; // 100::/64 discard
  if (g[0] === 0x2001 && g[1] < 0x0200) return true;               // 2001::/23 protocol assignments (Teredo, ORCHID)
  if ((g[0] & 0xfff0) === 0x3ff0) return true;                     // 3fff::/20 documentation
  if (g[0] === 0x5f00) return true;                                // 5f00::/16 SRv6
  if ((g[0] & 0xffc0) === 0xfe80) return true;                     // fe80::/10
  if ((g[0] & 0xff00) === 0xff00) return true;                     // multicast
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true;             // documentation
  if (g[0] === 0x2002) return isPrivateV4(v4of(g[1], g[2]));       // 6to4
  return false;
}
function isPublicIP(ip) {
  const v = net.isIP(ip);
  if (v === 4) return !isPrivateV4(ip);
  if (v === 6) return !isPrivateV6(ip);
  return false;
}

// null when the URL may be fetched, otherwise a short reason.
function urlProblem(u) {
  if (u.protocol !== "http:" && u.protocol !== "https:") return "scheme";
  if (u.username || u.password) return "credentials";
  if (allowPrivate()) return null;
  if (u.port && u.port !== "80" && u.port !== "443") return "port";
  const h = u.hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.+$/, "");
  if (net.isIP(h)) return isPublicIP(h) ? null : "private";
  if (!h.includes(".") || /(^|\.)(localhost|local|internal|intranet|lan|home|corp|localdomain|home\.arpa)$/.test(h)) return "private";
  return null;
}

function codeErr(code, msg) { const e = new Error(msg || code); e.code = code; return e; }

// Resolve, refuse private answers, and connect to the address we checked.
function safeLookup(hostname, options, cb) {
  if (typeof options === "function") { cb = options; options = {}; }
  dns.lookup(hostname, { all: true, verbatim: true }, (err, addrs) => {
    if (err) return cb(err);
    if (!addrs.length) return cb(codeErr("ENOTFOUND"));
    if (!allowPrivate() && addrs.some((a) => !isPublicIP(a.address))) return cb(codeErr("EPRIVATE", "private address"));
    if (options && options.all) return cb(null, addrs);
    cb(null, addrs[0].address, addrs[0].family);
  });
}
const agent = new Agent({ connect: { lookup: safeLookup, timeout: 5000 }, headersTimeout: PER_REQUEST_MS, bodyTimeout: PER_REQUEST_MS });

/* ------------------------------------------------------- one scan's budget */

function newScan() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), SCAN_DEADLINE_MS);
  return { signal: ctrl.signal, deadline: Date.now() + SCAN_DEADLINE_MS, requests: 0, done: () => clearTimeout(timer) };
}

// One request, no redirects followed. The body is read separately, with a cap.
async function requestOnce(scan, url, ua, timeoutMs) {
  const u = new URL(url);
  const why = urlProblem(u);
  if (why) throw codeErr(why === "private" ? "EPRIVATE" : "EBADURL", why);
  if (++scan.requests > MAX_REQUESTS) throw codeErr("ELIMIT");
  const left = scan.deadline - Date.now();
  if (left < 250) throw codeErr("EDEADLINE");
  const signal = AbortSignal.any([scan.signal, AbortSignal.timeout(Math.min(timeoutMs || PER_REQUEST_MS, left))]);
  const t0 = Date.now();
  // fetch joins repeated headers into one line. X-Robots-Tag must be read one
  // header at a time, so we keep the raw headers of this response.
  let raw = [];
  const dispatcher = agent.compose((dispatch) => (opts, handler) => dispatch(opts, {
    __proto__: handler,
    onConnect: (...a) => handler.onConnect(...a), onData: (...a) => handler.onData(...a),
    onComplete: (...a) => handler.onComplete(...a), onError: (...a) => handler.onError(...a),
    onHeaders(status, rawHeaders, resume, text) { raw = rawHeaders || []; return handler.onHeaders(status, rawHeaders, resume, text); },
  }));
  const res = await uFetch(u.toString(), {
    dispatcher, redirect: "manual", signal,
    headers: { "User-Agent": ua || UA, "Accept-Encoding": "gzip, deflate, br", Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
  });
  const rawValues = (name) => { const out = []; for (let i = 0; i + 1 < raw.length; i += 2) if (String(raw[i]).toLowerCase() === name) out.push(String(raw[i + 1])); return out; };
  return { res, ttfb: Date.now() - t0, rawValues };
}

// Read at most `cap` bytes after decompression, then stop.
async function readCapped(res, cap) {
  if (!res.body) return { buf: Buffer.alloc(0), truncated: false };
  const reader = res.body.getReader();
  const parts = [];
  let n = 0, truncated = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (n + value.length > cap) {
      parts.push(Buffer.from(value.buffer, value.byteOffset, cap - n));
      n = cap; truncated = true;
      await reader.cancel().catch(() => {});
      break;
    }
    parts.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength));
    n += value.length;
  }
  return { buf: Buffer.concat(parts), truncated };
}

// Text in the page's own character set (Content-Type first, then <meta charset>).
function decodeBody(buf, contentType) {
  let cs = (/charset\s*=\s*["']?([\w:.-]+)/i.exec(contentType || "") || [])[1];
  if (!cs) {
    const head = buf.subarray(0, 4096).toString("latin1");
    const m = /<meta[^>]+charset\s*=\s*["']?([\w:.-]+)/i.exec(head);
    if (m) cs = m[1];
  }
  try { return new TextDecoder((cs || "utf-8").toLowerCase()).decode(buf); }
  catch { return new TextDecoder("utf-8").decode(buf); }
}

// A page that sends visitors on with <meta http-equiv="refresh"> is treated as
// a redirect, as Google does.
function metaRefreshTarget(html, base) {
  // Tag by tag with indexOf, so a page of unclosed <meta tags cannot stall us.
  const head = html.slice(0, 20000), low = head.toLowerCase();
  let tag = null;
  for (let i = low.indexOf("<meta"); i >= 0 && !tag; i = low.indexOf("<meta", i + 5)) {
    const end = low.indexOf(">", i);
    if (end < 0) break;
    const t = head.slice(i, Math.min(end + 1, i + 2000));
    if (/http-equiv\s*=\s*["']?refresh/i.test(t)) tag = t;
  }
  if (!tag) return null;
  const c = /content\s*=\s*["']\s*(\d+)\s*[;,]\s*(?:url\s*=\s*)?['"]?([^"'>]+)/i.exec(tag);
  if (!c || parseInt(c[1], 10) > 5) return null;
  try { return new URL(c[2].trim(), base).toString(); } catch { return null; }
}

/* ------------------------------------------------------- fetch with hops */

async function fetchPage(scan, startUrl, userAgent) {
  let current = startUrl;
  let hops = 0;
  const started = Date.now();
  for (;;) {
    const { res, ttfb, rawValues } = await requestOnce(scan, current, userAgent);
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      res.body && res.body.cancel().catch(() => {});
      const loc = res.headers.get("location");
      if (!loc) return { finalUrl: current, status: res.status, problem: "noLocation", hops, ms: Date.now() - started, ttfb, html: "", headers: res.headers };
      if (hops >= MAX_REDIRECTS) return { finalUrl: current, status: res.status, problem: "tooManyRedirects", hops, ms: Date.now() - started, ttfb, html: "", headers: res.headers };
      let next;
      try { next = new URL(loc, current).toString(); } catch { return { finalUrl: current, status: res.status, problem: "badLocation", hops, ms: Date.now() - started, ttfb, html: "", headers: res.headers }; }
      current = next;
      hops += 1;
      continue;
    }
    const type = res.headers.get("content-type") || "";
    const { buf, truncated } = await readCapped(res, CAP.page);
    const html = decodeBody(buf, type);
    const refreshTo = res.status === 200 && hops < MAX_REDIRECTS ? metaRefreshTarget(html, current) : null;
    if (refreshTo && refreshTo !== current) { current = refreshTo; hops += 1; continue; }
    return {
      finalUrl: current, status: res.status, hops, ms: Date.now() - started, ttfb,
      encoding: res.headers.get("content-encoding") || "none",
      xRobots: rawValues("x-robots-tag"),
      vary: res.headers.get("vary") || "",
      contentType: type,
      mitigated: res.headers.get("cf-mitigated") || "",
      html, truncated, bytes: buf.length,
    };
  }
}

/* ------------------------------------------------- bot protection ------ */

// Services such as Cloudflare and Akamai often refuse automated tools while
// letting verified crawlers like Googlebot through. A refusal to US is not a
// refusal to AI, so we stop and say "could not check" instead of grading.
const REFUSAL_CODES = [401, 403, 405, 406, 415, 418, 429, 451, 503];
const CHALLENGE_MARKERS = [
  /<title>\s*just a moment\.{0,3}\s*<\/title>/i,         // Cloudflare challenge
  /<title>\s*attention required!? \| cloudflare/i,      // Cloudflare block
  /cf-browser-verification|\/cdn-cgi\/challenge-platform\/h\/[bg]\/orchestrate/i,
  /_Incapsula_Resource|Incapsula incident ID/i,          // Imperva
  /<title>\s*access denied\s*<\/title>[\s\S]{0,4000}reference\s*#/i, // Akamai
  /captcha-delivery\.com|geo\.captcha-delivery/i,         // DataDome
  /<div id="px-captcha"|_pxCaptcha/i,                     // HUMAN / PerimeterX
  /awsWafCookieDomainList|gokuProps|\/__challenge_[\w-]+\/[\s\S]{0,80}challenge\.js/i, // AWS WAF (booking.com)
  /<title>\s*Request Rejected\s*<\/title>[\s\S]{0,800}The requested URL was rejected/i, // F5 BIG-IP (pontianak.ut.ac.id)
  /used Cloudflare to restrict access|has banned the country or region your IP address is in/i, // Cloudflare country block (error 1009)
];
// A short page that only says the site is not available in our country.
const COUNTRY_BLOCK = /not (?:available|accessible) (?:in|from) your (?:country|region|location)/i;
// A contact form protected by Cloudflare Turnstile is not a challenge page, so
// the Turnstile script alone never counts.
function refusal(status, html, mitigated) {
  if (REFUSAL_CODES.includes(status)) return "error " + status;
  if (/challenge/i.test(mitigated || "")) return "a robot check page";
  if ((status === 200 || status === 202) && CHALLENGE_MARKERS.some((re) => re.test(String(html || "").slice(0, 20000))))
    return "a robot check page";
  if (status === 200 && String(html || "").length < 6000 && COUNTRY_BLOCK.test(String(html || "")))
    return "a page that blocks visitors from our country";
  return null;
}

// Every <loc> value, found with indexOf, not a pattern: a <loc> that never
// closes cannot make this slow.
function sitemapLocs(xml) {
  const low = xml.toLowerCase(), out = [];
  let i = 0;
  while (out.length < 200000) {
    const a = low.indexOf("<loc>", i); if (a < 0) break;
    const b = low.indexOf("</loc>", a + 5); if (b < 0) break;
    out.push(xml.slice(a + 5, b).trim());
    i = b + 6;
  }
  return out;
}

/* --------------------------------------------------------- robots.txt side */

// robots.txt, read the way Google reads it: its published spec and its
// open-source parser (github.com/google/robotstxt, robots.cc).
// - Only user-agent, allow and disallow lines count. Other lines, such as
//   sitemap or crawl-delay, are skipped and do not end a group.
// - A user-agent line after a rule line starts a new group.
// - A crawler uses every group that names it. Only when no group names it
//   does it use the "*" groups. A group that names it but has no rules
//   allows everything.
// - The longest matching rule wins. On a tie, allow wins.
const ROBOTS_KEY = {
  "user-agent": "ua", useragent: "ua", "user agent": "ua",
  allow: "allow",
  disallow: "disallow", dissallow: "disallow", dissalow: "disallow", disalow: "disallow", diasllow: "disallow", disallaw: "disallow",
  sitemap: "sitemap", "site-map": "sitemap",
};
function parseRobots(text) {
  const groups = [], sitemaps = [];
  let cur = null, agentRun = false;
  for (const rawLine of String(text).split(/\r\n|\r|\n/)) {
    let line = rawLine;
    const hash = line.indexOf("#"); if (hash >= 0) line = line.slice(0, hash);
    line = line.trim(); if (!line) continue;
    let key, value;
    const colon = line.indexOf(":");
    if (colon >= 0) { key = line.slice(0, colon); value = line.slice(colon + 1); }
    else { const m = /^(\S+)\s+(\S.*)$/.exec(line); if (!m) continue; key = m[1]; value = m[2]; }
    const kind = ROBOTS_KEY[key.trim().toLowerCase()];
    value = value.trim();
    if (!kind) continue;
    if (kind === "sitemap") { if (value && sitemaps.length < 50) sitemaps.push(value); continue; }
    if (kind === "ua") {
      if (!cur || !agentRun) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(value); agentRun = true;
      continue;
    }
    if (!cur) continue;               // rules before any user-agent line are ignored
    agentRun = false;
    if (!value || cur.rules.length >= 5000) continue;
    cur.rules.push({ allow: kind === "allow", pattern: robotsPattern(value) });
    // Google also treats "Allow: /dir/index.html" as allowing "/dir/".
    if (kind === "allow" && /\/index\.html?$/i.test(value)) cur.rules.push({ allow: true, pattern: robotsPattern(value.replace(/index\.html?$/i, "") + "$") });
  }
  return { groups, sitemaps };
}
// Percent-encode anything outside ASCII, and upper-case %xx, as Google does.
function robotsPattern(p) {
  return p.replace(/%[0-9a-f]{2}/gi, (x) => x.toUpperCase())
    .replace(/[^\x00-\x7f]+/g, (x) => [...Buffer.from(x, "utf8")].map((b) => "%" + b.toString(16).toUpperCase().padStart(2, "0")).join(""));
}
// Does a robots.txt pattern match the path? "*" matches any run of
// characters and a final "$" anchors the end. The fixed pieces between the
// stars are found left to right with indexOf; the leftmost match is always
// safe for this kind of pattern, so no backtracking is needed.
function robotsMatch(path, pattern) {
  let anchored = false;
  if (pattern.endsWith("$")) { anchored = true; pattern = pattern.slice(0, -1); }
  const pieces = pattern.split("*");
  const first = pieces[0];
  if (!path.startsWith(first)) return false;
  if (pieces.length === 1) return anchored ? path.length === first.length : true;
  let pos = first.length;
  for (let i = 1; i < pieces.length - 1; i++) {
    if (!pieces[i]) continue;
    const at = path.indexOf(pieces[i], pos);
    if (at < 0) return false;
    pos = at + pieces[i].length;
  }
  const last = pieces[pieces.length - 1];
  if (!anchored) return !last || path.indexOf(last, pos) >= 0;
  return path.length - last.length >= pos && path.endsWith(last);
}
// The product token of a user-agent line: "Googlebot/2.1" is "googlebot".
const agentToken = (v) => (/^[a-zA-Z_-]+/.exec(v) || [""])[0].toLowerCase();
function robotsAllowed(parsed, token, url) {
  const u = new URL(url);
  const path = (u.pathname || "/") + (u.search || "");
  const want = token.toLowerCase();
  const own = parsed.groups.filter((g) => g.agents.some((a) => agentToken(a) === want));
  const use = own.length ? own : parsed.groups.filter((g) => g.agents.some((a) => /^\*(\s|$)/.test(a)));
  let allow = -1, disallow = -1, n = 0;
  const stopAt = Date.now() + 500;  // a robots.txt built to be slow gets "could not read", never a stalled check
  for (const g of use) for (const r of g.rules) {
    if (++n % 100 === 0 && Date.now() > stopAt) return null;
    if (r.pattern.length <= (r.allow ? allow : disallow)) continue;
    if (robotsMatch(path, r.pattern)) { if (r.allow) allow = r.pattern.length; else disallow = r.pattern.length; }
  }
  return !(disallow > allow);
}


// state: "ok" (rules read), "none" (4xx: no rules, all allowed),
//        "refused" (bot protection), "error" (5xx, timeout, network)
async function readRobots(scan, origin) {
  const robotsUrl = origin + "/robots.txt";
  try {
    let url = robotsUrl, res;
    for (let hop = 0; ; hop++) {
      ({ res } = await requestOnce(scan, url, UA, 8000));
      if ([301, 302, 303, 307, 308].includes(res.status) && hop < 5 && res.headers.get("location")) {
        res.body && res.body.cancel().catch(() => {});
        url = new URL(res.headers.get("location"), url).toString();
        continue;
      }
      break;
    }
    if (REFUSAL_CODES.includes(res.status)) { res.body && res.body.cancel().catch(() => {}); return { state: "refused", status: res.status, sitemaps: [] }; }
    if (res.status >= 500) { res.body && res.body.cancel().catch(() => {}); return { state: "error", status: res.status, sitemaps: [] }; }
    if (res.status >= 400) { res.body && res.body.cancel().catch(() => {}); return { state: "none", status: res.status, sitemaps: [] }; }
    const { buf } = await readCapped(res, CAP.robots);
    const text = buf.toString("utf8").replace(/^﻿/, "");
    const parsed = parseRobots(text);
    const sitemaps = parsed.sitemaps.slice(0, 10);
    return { state: "ok", parsed, text, status: res.status, sitemaps };
  } catch (e) {
    if (e && e.code === "EPRIVATE") return { state: "error", status: 0, sitemaps: [] };
    return { state: "error", status: 0, sitemaps: [] };
  }
}

// true, false, or null when we could not read the rules.
function tokenAllowed(robots, token, url) {
  if (robots.state === "none") return true;
  if (robots.state !== "ok") return null;
  try { return robotsAllowed(robots.parsed, token, url); } catch { return null; }
}

/* -------------------------------------------------- reading a page, once */

const SKIP_TEXT = new Set(["script", "style", "noscript", "template", "svg", "head", "title", "iframe", "object", "canvas", "select", "option", "pre"]);
const BOUNDARY = new Set(["address", "article", "aside", "blockquote", "br", "dd", "div", "dl", "dt", "fieldset", "figcaption", "figure",
  "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main", "nav", "ol", "p", "pre", "section", "table",
  "tbody", "td", "tfoot", "th", "thead", "tr", "ul", "button", "label", "summary", "details", "caption", "img"]);
const BLOCK = new Set(["p", "li", "td", "th", "blockquote", "figcaption", "dd"]);
const HEADING = /^h([1-6])$/;
const NON_SPACED = /[฀-๿຀-໿က-႟ក-៿぀-ヿ㐀-䶿一-鿿豈-﫿]/;
let segmenter = null;

// Words, also for Thai, Chinese and Japanese, which do not put spaces between words.
function countWords(s) {
  const t = String(s || "").trim();
  if (!t) return 0;
  if (!NON_SPACED.test(t)) return t.split(/\s+/).length;
  segmenter = segmenter || new Intl.Segmenter(undefined, { granularity: "word" });
  let n = 0;
  for (const seg of segmenter.segment(t)) if (seg.isWordLike) n++;
  return n;
}
const squash = (s) => String(s || "").replace(/\s+/g, " ").trim();
const firstWords = (s, n) => {
  const t = squash(s);
  if (!NON_SPACED.test(t)) return t.split(" ").slice(0, n).join(" ");
  return t.slice(0, n * 3);
};

/**
 * One walk over the page collects everything the checks need: the visible
 * text, the text blocks, the sections under each title, the titles, the
 * robots directives, the canonical tag and data-nosnippet. It does not
 * recurse, so very deep pages cannot overflow the stack, and each part of
 * the page is read once, so big pages stay fast.
 */
function readPage(html) {
  // htmlparser2 reads the page as a stream of events (a tag opens, text, a tag
  // closes). Its work grows only with the size of the page, whatever the HTML
  // looks like, and it closes tags the way browsers do.
  const text = [];
  const blocks = [];         // innermost text blocks outside nav, header and footer
  const sections = [];       // titles h1 to h4 outside nav and footer, with their text
  const metas = [];          // { name, content }
  const heads = { 1: 0, 2: 0, 3: 0 };  // every heading tag, anywhere
  let canonical = null, times = 0, firstH1 = "", title = "", inTitle = 0;
  let dnCount = 0, dnWords = 0, dnMax = 0;

  let skip = 0, exclNav = 0, exclHeader = 0, inContent = 0;
  const blockStack = [];     // text of open blocks
  const headStack = [];      // text of open headings
  const headAlt = [];        // labels of logos or images inside open headings
  let dnDepth = 0, dnBuf = [];
  let current = null;        // the section being filled
  const open = [];           // one frame per open element

  const gap = () => {
    text.push(" ");
    if (blockStack.length) blockStack[blockStack.length - 1].push(" ");
    if (headStack.length) headStack[headStack.length - 1].push(" ");
    if (dnDepth) dnBuf.push(" ");
  };

  const parser = new HtmlParser({
    onopentag(tag, attribs) {
      const frame = { tag };
      const attr = (k) => (attribs[k] == null ? "" : String(attribs[k]));
      if (headAlt.length) {
        const label = attr("aria-label") || (tag === "img" ? attr("alt") : "");
        if (label) headAlt[headAlt.length - 1].push(label);
      }
      if (tag === "meta") {
        const name = attr("name").toLowerCase();
        if (name) metas.push({ name, content: attr("content") });
      } else if (tag === "link" && !canonical && /(^|\s)canonical(\s|$)/i.test(attr("rel"))) {
        canonical = attr("href").trim();
      } else if (tag === "time") times++;
      if (tag === "title") inTitle++;
      if (SKIP_TEXT.has(tag)) skip++;
      if (BOUNDARY.has(tag)) gap();
      if (tag === "nav" || tag === "footer") exclNav++;
      if (tag === "main" || tag === "article") inContent++;
      if (tag === "header" && !inContent && attr("role") !== "none") { exclHeader++; frame.topBar = true; }
      const hm = HEADING.exec(tag);
      if (hm) {
        const lv = parseInt(hm[1], 10);
        if (heads[lv] !== undefined) heads[lv]++;
        if (!skip) { headStack.push([]); headAlt.push([]); frame.head = true; frame.outside = exclNav > 0; frame.inHeader = exclHeader > 0; }
      }
      if (BLOCK.has(tag) && !skip) { blockStack.push([]); frame.block = true; frame.outside = exclNav > 0; frame.inHeader = exclHeader > 0; }
      // Google supports data-nosnippet on span, div and section only.
      if ((tag === "span" || tag === "div" || tag === "section") && "data-nosnippet" in attribs) { dnCount++; dnDepth++; frame.dn = true; }
      open.push(frame);
    },
    ontext(t) {
      if (inTitle && !title) title = t;
      else if (inTitle) title += t;
      if (skip || !t) return;
      text.push(t);
      if (blockStack.length) blockStack[blockStack.length - 1].push(t);
      if (headStack.length) headStack[headStack.length - 1].push(t);
      if (dnDepth) dnBuf.push(t);
    },
    onclosetag() {
      const f = open.pop();
      if (!f) return;
      const tag = f.tag;
      if (tag === "title") inTitle--;
      if (SKIP_TEXT.has(tag)) skip--;
      if (BOUNDARY.has(tag)) gap();
      if (tag === "nav" || tag === "footer") exclNav--;
      if (tag === "header" && f.topBar) exclHeader--;
      if (tag === "main" || tag === "article") inContent--;
      if (f.dn) {
        dnDepth--;
        if (dnDepth === 0) { const w = countWords(dnBuf.join("")); dnWords += w; dnMax = Math.max(dnMax, w); dnBuf = []; }
      }
      const hm = HEADING.exec(tag);
      if (hm && f.head) {
        // A title that is a logo has no text; its label (aria-label or alt) is its text.
        const alt = squash(headAlt.pop().join(" "));
        const t = squash(headStack.pop().join("")) || alt;
        const lv = parseInt(hm[1], 10);
        if (lv === 1 && !firstH1) firstH1 = t;
        if (t && lv <= 4 && !f.outside) { current = { heading: t, level: lv, body: [], inHeader: !!f.inHeader }; sections.push(current); }
      }
      if (f.block) {
        const t = squash(blockStack.pop().join(""));
        if (t) {
          if (!f.outside && !f.inHeader) blocks.push({ words: countWords(t), text: t });
          if (!f.outside && current) current.body.push(t);
        }
      }
    },
  }, { decodeEntities: true, lowerCaseTags: true, lowerCaseAttributeNames: true, recognizeSelfClosing: false });
  parser.write(String(html || ""));
  parser.end();

  const pageText = squash(text.join(""));
  sections.forEach((s) => { s.bodyText = s.body.join(" "); s.words = countWords(s.bodyText); });
  const firstPara = blocks.find((b) => b.words >= 20);
  return {
    pageText, words: countWords(pageText), blocks, sections, metas, canonical, times, heads,
    title: squash(title),
    first: [firstH1, firstPara ? firstWords(firstPara.text, 12) : ""].filter(Boolean).join(" — "),
    dn: { count: dnCount, words: dnWords, max: dnMax },
  };
}

/* ------------------------------------------------------ directive reading */

// Page directives, kept per crawler: "robots" applies to every crawler; a
// named crawler ("googlebot", "bingbot") applies to that crawler only. The
// X-Robots-Tag header can name a crawler too: "googlebot: noindex".
const DIRECTIVE_WORDS = /^(all|none|noindex|index|nofollow|follow|nosnippet|noarchive|nocache|notranslate|noimageindex|indexifembedded|max-snippet|max-image-preview|max-video-preview|unavailable_after)\b/;
function readDirectives(pg, xRobotsHeader) {
  const byUa = {};                       // ua -> [tokens]
  const add = (ua, t) => { (byUa[ua] = byUa[ua] || []).push(t); };
  pg.metas.forEach((m) => {
    m.content.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean).forEach((t) => add(m.name, t));
  });
  // Each X-Robots-Tag header is read on its own: a crawler name at the start
  // of one header does not carry over to the next header.
  const headers = Array.isArray(xRobotsHeader) ? xRobotsHeader : [xRobotsHeader];
  headers.forEach((h) => {
    let ua = "robots";
    String(h || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean).forEach((t) => {
      const m = /^([a-z0-9_.-]+)\s*:\s*(.+)$/.exec(t);
      if (m && !DIRECTIVE_WORDS.test(t)) { ua = m[1]; t = m[2].trim(); }
      add(ua, t);
    });
  });
  return {
    byUa,
    dataNosnippet: pg.dn.count, dataNosnippetWords: pg.dn.words, dataNosnippetMax: pg.dn.max,
    canonical: pg.canonical,
  };
}
// The directives one crawler obeys: the general ones plus its own.
function directivesFor(dir, uas) {
  const tokens = [].concat(...["robots", ...uas].map((u) => dir.byUa[u] || []));
  // When a page sets max-snippet more than once, Google applies the most restrictive value.
  const snippetValues = tokens.map((t) => t.match(/^max-snippet\s*:\s*(-?\d+)/)).filter(Boolean).map((m) => parseInt(m[1], 10));
  const limits = snippetValues.filter((v) => v >= 0);
  const maxSnippet = limits.length ? Math.min(...limits) : snippetValues.length ? -1 : null;
  // unavailable_after with a date in the past: Google stops showing the page.
  const expired = tokens.some((t) => {
    const m = t.match(/^unavailable_after\s*:\s*(.+)$/); if (!m) return false;
    const d = Date.parse(m[1].trim()); return !isNaN(d) && d < Date.now();
  });
  return {
    expired,
    noindex: tokens.includes("noindex") || tokens.includes("none"),
    nosnippet: tokens.includes("nosnippet"),
    maxSnippet,
  };
}
const GOOGLE_UAS = ["googlebot"];
const OAI_UAS = ["oai-searchbot"];

/* ------------------------------------------------ retrieval fitness ------ */

const PASSAGE_MIN_WORDS = 40; // cited passages run roughly 70 to 150 words

// Sample text that website builders put in their templates. Owners often
// leave it in hidden galleries and captions, and crawlers still read it.
const PLACEHOLDERS = [
  /This is the area to introduce viewers to the context of this image/gi,   // Wix gallery
  /I['’]m a paragraph\. Click here to add your own text/gi,                 // Wix
  /I['’]m a title\. Click here to edit/gi,                                  // Wix
  /Click here to add your own text and edit me/gi,                         // Wix
  /Describe your image here/gi,
  /Click edit button to change this text/gi,                               // Elementor
  /Welcome to WordPress\. This is your first post/gi,                      // WordPress
  /Just another WordPress site/gi,
  /\bLorem ipsum dolor sit amet\b/gi,
  /\b(?:Add|Insert) (?:your )?(?:paragraph )?text here\b/gi,
];
function placeholderText(text) {
  let count = 0, sample = "";
  PLACEHOLDERS.forEach((re) => { const m = text.match(re); if (m) { count += m.length; if (!sample) sample = m[0]; } });
  return { count, sample };
}

function sentencesOf(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+|(?<=[。！？])/)
    .map((x) => x.trim())
    .filter((x) => x.length > (NON_SPACED.test(x) ? 8 : 15));
}

/**
 * Structural facts only. Nothing here judges whether the writing is good,
 * persuasive or expert. Every value is something we counted.
 */
function fitness(pg) {
  const sections = pg.sections;
  const blocks = pg.blocks;
  const passages = blocks.filter((b) => b.words >= PASSAGE_MIN_WORDS).length;

  // Titles are counted from the same list the "titles now" outline shows:
  // non-empty headings outside the menu and the footer.
  const h1List = sections.filter((s) => s.level === 1);
  const h1 = h1List.length;
  const cut = (t, n) => (t.length > n ? t.slice(0, n).trimEnd() + "…" : t);
  const quoteList = (a) => a.slice(0, 3).map((x) => '"' + cut(x.heading, 60) + '"').join(", ") + (a.length > 3 ? " and " + (a.length - 3) + " more" : "");
  const h1Found = h1 === 0 ? "None" : (h1 === 1 ? "1 main title: " : h1 + " main titles: ") + quoteList(h1List);
  // A main title in the top bar is fine when it names the site, as the page's
  // <title> does (Tabelog). It is a problem when it is unrelated text that
  // visitors never see, such as "RESERVATION CONFIRMED" (Studio Pepe).
  const titleWords = new Set(contentWords(pg.title));
  const namesTheSite = (h) => { const w = contentWords(h); return w.length > 0 && w.filter((x) => titleWords.has(x)).length / w.length >= 0.5; };
  const h1InTopBar = h1 > 0 && h1List.every((x) => x.inHeader) && !h1List.some((x) => namesTheSite(x.heading));
  const subheads = sections.filter((s) => s.level === 2 || s.level === 3).length;

  const sentences = sentencesOf(pg.pageText);
  const leaning = sentences.filter((x) => LEANING_OPENERS.test(x)).length;
  const leanRatio = sentences.length ? leaning / sentences.length : 0;

  const hasDate = DATE_RE.test(pg.pageText.slice(0, 6000)) || pg.times > 0;
  const longest = blocks.reduce((m, b) => Math.max(m, b.words), 0);
  const tpl = placeholderText(pg.pageText);

  // Every check below is a threshold Bliss set, from third-party research
  // into how retrieval works. No channel publishes these numbers.
  const M = "measure";
  const checks = [
    h1 === 1 && !h1InTopBar
      ? ok("One main title", "Exactly 1", h1Found, M)
      : bad("One main title", "Exactly 1, at the top of your content", h1Found,
            h1InTopBar
              ? "Your main title (Heading 1) is in the top bar, and it does not say what this page is about. AI uses the main title to understand the page. " +
                "Change the top-bar text to normal text. Then make the first headline in your content Heading 1."
              : h1 === 0
                ? "In your website editor, set the main title of this page to Heading 1."
                : "This page has more than one main title. In your website editor, keep one as Heading 1 and change the others to Heading 2.", M),

    subheads >= 2
      ? ok("Section titles", "2 or more", subheads + " found", M)
      : bad("Section titles", "2 or more", subheads === 0 ? "None" : subheads + " found",
            "Break the page into sections. Give each section a title that is a question your customers ask, such as \u201cWhat time do you open?\u201d", M),

    passages >= 3
      ? ok("Paragraphs AI can quote", "3 or more, each 40+ words (best: 70 to 150)", passages + " found", M)
      : bad("Paragraphs AI can quote", "3 or more, each 40+ words (best: 70 to 150)",
            (passages === 0 ? "None" : passages + " found") + (longest ? ". Longest is " + longest + (longest === 1 ? " word" : " words") : ""),
            "AI quotes whole paragraphs, not single lines. Write " + (3 - passages) + (passages ? " more paragraph" : " paragraph") + (3 - passages === 1 ? "" : "s") + " of 70 to 150 words, which is about 5 to 8 sentences each.", M),

    leanRatio <= 0.35
      ? ok("Sentences name your business", "Few start with we, it, this or they", leaning + " of " + sentences.length + " do", M)
      : bad("Sentences name your business", "Few start with we, it, this or they", leaning + " of " + sentences.length + " do",
            "Write your business name instead of we, it, this or they at the start of those sentences. A sentence gets lifted out on its own, and on its own we means nothing.", M),

    tpl.count === 0
      ? ok("No sample text from the template", "No sample text", "None found", M)
      : bad("No sample text from the template", "No sample text", "Found " + tpl.count + (tpl.count === 1 ? " time" : " times") + ', such as "' + tpl.sample + '"',
            "Your website template left sample text on this page, and AI crawlers read it. In your website editor, find it (often in image gallery captions) and replace it with your own words, or delete it.", M),

    hasDate
      ? ok("A visible date", "A date on the page", "Found", M)
      : bad("A visible date", "A date on the page", "None",
            "Put a date on the page that visitors can see, such as \u201cUpdated September 2026\u201d.", M),
  ];

  // A short action for each unmet check, used when a grade is explained.
  const TODO = {
    "One main title": h1InTopBar ? "move the main title out of the top bar" : h1 === 0 ? "add one main title" : "keep only one main title",
    "Section titles": "add section titles",
    "Paragraphs AI can quote": "write longer paragraphs that AI can quote",
    "Sentences name your business": "use your business name instead of we or it",
    "No sample text from the template": "remove the sample text left by your template",
    "A visible date": "add a visible date",
  };
  checks.forEach((c) => { if (c.state === "fail") c.todo = TODO[c.label]; });

  return {
    checks,
    failed: checks.filter((c) => c.state === "fail").length,
    passages,
    longestBlockWords: longest,
    h1,
    subheads,
    sentences: sentences.length,
    leaning,
    hasDate,
    blockSpread: [
      { band: "1-24", count: blocks.filter((b) => b.words < 25).length },
      { band: "25-39", count: blocks.filter((b) => b.words >= 25 && b.words < 40).length },
      { band: "40-69", count: blocks.filter((b) => b.words >= 40 && b.words < 70).length },
      { band: "70-150", count: blocks.filter((b) => b.words >= 70 && b.words <= 150).length },
      { band: "150+", count: blocks.filter((b) => b.words > 150).length },
    ],
    blocks: blocks.length,
    paraWords: blocks.reduce((a, b) => a + b.words, 0),
    templateText: tpl.count,
  };
}

/* ------------------------------------------------- who does the work ----- */

// Checks a business owner can act on inside their website editor. Everything
// else needs whoever looks after the site's files and server settings.
const BY_EDITOR = new Set([
  "One main title",
  "Section titles",
  "Paragraphs AI can quote",
  "Sentences name your business",
  "A visible date",
  "No sample text from the template",
  "A section answers this search",
  "Answer comes first",
  "Sits high on the page",
  "A date sits nearby",
]);

function stampBy(c) {
  c.by = BY_EDITOR.has(c.label) ? "editor" : "developer";
  return c;
}

// Turn the customer's search into the heading they should put on the page.
const QUESTION_START = /^(what|when|where|why|how|who|which|do|does|did|is|are|can|could|should|will|would|has|have)\b/i;

function asHeading(query) {
  const q = String(query || "").trim().replace(/\s+/g, " ");
  if (!q) return "";
  const cased = q.charAt(0).toUpperCase() + q.slice(1);
  return QUESTION_START.test(q) && !/[?]$/.test(cased) ? cased + "?" : cased;
}

/* ------------------------------------------------- search-term evaluation */

const STOPWORDS = new Set(
  ("a an and are as at be best but by can do does for from get good how i in is it its my of on or our that the their there they this to top up use was what when where which who why will with you your".split(
    " "
  ))
);

// Words that carry meaning, in any language. Thai, Chinese and Japanese are
// split into words first, because they do not use spaces.
function contentWords(q) {
  const s = String(q || "").toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, " ");
  let words;
  if (NON_SPACED.test(s)) {
    segmenter = segmenter || new Intl.Segmenter(undefined, { granularity: "word" });
    words = [...segmenter.segment(s)].filter((x) => x.isWordLike).map((x) => x.segment);
  } else words = s.split(/\s+/);
  return words.filter((w) => (NON_SPACED.test(w) ? w.length >= 1 : w.length > 1) && !STOPWORDS.has(w));
}

const LEANING_OPENERS =
  /^(we|it|this|that|they|our|its|their|these|those|he|she|there)\b/i;

// Month names in English and Indonesian, whole words only, so "marketing 2026"
// or "design 2026" never count as a date.
const MONTH =
  "(?:jan(?:uary|uari)?|feb(?:ruary|ruari)?|mar(?:ch|et)?|apr(?:il)?|may|mei|jun(?:e|i)?|jul(?:y|i)?|" +
  "aug(?:ust)?|agu(?:stus)?|agt|sep(?:t|tember)?|oct(?:ober)?|okt(?:ober)?|nov(?:ember)?|dec(?:ember)?|des(?:ember)?)\\.?";

// "May" and "Mar" are also ordinary words ("Top 10 may help"), so without a
// year they do not count.
const MONTH_SAFE = MONTH.replace("mar(?:ch|et)?", "march|maret").replace("may|", "");
const DATE_RE = new RegExp(
  [
    "\\b(?:0?[1-9]|[12]\\d|3[01])\\s" + MONTH_SAFE + "(?:\\s20\\d{2})?\\b", // 26 September, 5 Agustus
    "\\b(?:0?[1-9]|[12]\\d|3[01])\\s" + MONTH + "\\s20\\d{2}\\b",          // 10 May 2026
    "\\b" + MONTH + "\\s(?:0?[1-9]|[12]\\d|3[01]),?\\s20\\d{2}\\b",    // September 26, 2026
    "\\b" + MONTH + "\\s20\\d{2}\\b",                                  // September 2026
    "\\b20\\d{2}-\\d{2}-\\d{2}\\b",                                     // 2026-09-26
    "\\b(?:0?[1-9]|[12]\\d|3[01])/(?:0?[1-9]|1[0-2])/20\\d{2}\\b",       // 26/09/2026
  ].join("|"),
  "i"
);

// "a, b, and c"
function andList(a) {
  if (a.length <= 1) return a.join("");
  if (a.length === 2) return a[0] + " and " + a[1];
  return a.slice(0, -1).join(", ") + ", and " + a[a.length - 1];
}

function evaluateQuery(query, sections, pageText, hasDateOnPage) {
  const qWords = contentWords(query);
  if (!qWords.length) return null;

  // Only sections with enough body text to stand alone can be candidates.
  // Cited passages run roughly 70 to 150 words, so very short stubs are out,
  // but the floor stays low enough that a tight, correct answer still counts.
  const MIN_SECTION_WORDS = 20;
  const candidates = sections.filter((s) => s.words >= MIN_SECTION_WORDS);

  // Best matching section by share of the query's content words present.
  let best = null;
  let bestScore = 0;
  candidates.forEach((s) => {
    const hay = (s.heading + " " + s.bodyText).toLowerCase();
    const hits = qWords.filter((w) => hay.includes(w)).length;
    // A hit in the heading counts for more: headings are what a retriever
    // matches a sub-query against first.
    const headHits = qWords.filter((w) => s.heading.toLowerCase().includes(w)).length;
    const score = (hits + headHits * 0.5) / (qWords.length * 1.5);
    if (score > bestScore) {
      bestScore = score;
      best = s;
    }
  });

  const matched = best && bestScore >= 0.45;

  if (!matched) {
    return {
      query,
      verdict: "not_addressed",
      matchedHeading: null,
      coverage: Math.round(bestScore * 100),
      checks: [
        bad(
          "A section answers this search",
          "A heading that matches the search",
          bestScore > 0
            ? "Closest section covers " + Math.round(bestScore * 100) + "% of the words"
            : "Nothing on this page covers it",
          "Add a new section to this page. Make the section title the question itself, then answer it straight away underneath.",
          "measure"
        ),
      ],
      example: {
        heading: asHeading(query),
        first: "Answer it here in one sentence. Write your business name, not we.",
        then: "Then add 3 to 6 more sentences with the details. Aim for 70 to 150 words in the section.",
      },
    };
  }

  const checks = [];

  checks.push(
    ok("A section answers this search", "A heading that matches the search",
       '"' + best.heading + '" · ' + best.words + " words", "measure")
  );

  // Answer before explanation. A retrieved chunk starts at the heading, so the
  // heading counts as part of the opening: that is what the machine reads first.
  const opening = (best.heading + " " + best.bodyText.slice(0, 200)).toLowerCase();
  const earlyHits = qWords.filter((w) => opening.includes(w)).length;
  const answerFirst = earlyHits / qWords.length >= 0.5;
  checks.push(
    answerFirst
      ? ok("Answer comes first", "Answer in the first sentence", "Yes", "measure")
      : weak("Answer comes first", "Answer in the first sentence", "Buried further down",
             "Move the answer up so it is the first sentence under the heading, then explain underneath.")
  );

  const sentences = best.bodyText
    .split(/(?<=[.!?])\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length > 15);
  const leaning = sentences.filter((x) => LEANING_OPENERS.test(x)).length;
  const leanRatio = sentences.length ? leaning / sentences.length : 0;
  checks.push(
    leanRatio <= 0.35
      ? ok("Sentences name your business", "Few start with we, it, this or they",
           leaning + " of " + sentences.length, "measure")
      : weak("Sentences name your business", "Few start with we, it, this or they",
             leaning + " of " + sentences.length,
             "Write your business name instead of we, so the sentence still makes sense once lifted out of the page.")
  );

  const idx = pageText.toLowerCase().indexOf(best.heading.toLowerCase());
  const position = idx >= 0 && pageText.length ? Math.round((idx / pageText.length) * 100) : null;
  const earlyOnPage = position !== null && position <= 40;
  checks.push(
    earlyOnPage
      ? ok("Sits high on the page", "Top 40% of the page", position + "% down", "measure")
      : weak("Sits high on the page", "Top 40% of the page",
             position === null ? "Not located" : position + "% down",
             "Move this section nearer the top of the page.")
  );

  const dateNear = DATE_RE.test(best.heading + " " + best.bodyText) || hasDateOnPage;
  checks.push(
    dateNear
      ? ok("A date sits nearby", "A date on the page", "Found", "measure")
      : weak("A date sits nearby", "A date on the page", "None found",
             "Add a visible published or updated date.")
  );

  const weakCount = checks.filter((c) => c.state === "weak").length;

  return {
    query,
    verdict: weakCount === 0 ? "ready" : "partly_ready",
    matchedHeading: best.heading,
    coverage: Math.round(bestScore * 100),
    checks,
  };
}

/* ------------------------------------------------------------- sitemap */

const XML_ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
function xmlText(s) {
  return String(s)
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e) =>
      e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : XML_ENT[e.toLowerCase()])
    .trim();
}
// Compare addresses the way a site owner means them: http or https, with or
// without www, with or without a trailing slash, are the same page.
function samePage(a) {
  try {
    const u = new URL(a);
    return (u.hostname.replace(/^www\./, "") + stripTrailingSlash(u.pathname) + u.search).toLowerCase();
  } catch { return String(a).toLowerCase(); }
}

// Returns "found", "missing" (searched everything and it is not there) or
// "unknown" (too big to search in the time we have, or it would not load).
// Large sites split their sitemap by country or section, so child files whose
// names share a word with the page's path are searched first.
async function urlInSitemap(scan, sitemapUrls, origin, target) {
  const wanted = samePage(target);
  const hints = new URL(target).pathname.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 2);
  const MAX_FILES = 14;
  const stopAt = Math.min(scan.deadline - 400, Date.now() + 8000);
  const seen = new Set();
  let cutShort = false;

  const score = (u) => {
    const name = u.toLowerCase().split("/").pop();
    return hints.reduce((n, h) => n + (new RegExp("(^|[^a-z0-9])" + h + "([^a-z0-9]|$)").test(name) ? 1 : 0), 0);
  };
  const order = (list) => list.map((l, i) => ({ l, i, s: score(l) })).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.l);

  async function load(u) {
    let url = u, res;
    for (let hop = 0; ; hop++) {
      ({ res } = await requestOnce(scan, url, UA, Math.max(500, stopAt - Date.now())));
      if ([301, 302, 303, 307, 308].includes(res.status) && hop < 3 && res.headers.get("location")) {
        res.body && res.body.cancel().catch(() => {});
        url = new URL(res.headers.get("location"), url).toString();
        continue;
      }
      break;
    }
    if (res.status >= 400) { res.body && res.body.cancel().catch(() => {}); return null; }
    const { buf, truncated } = await readCapped(res, CAP.sitemap);
    if (truncated) cutShort = "big";
    let data = buf;
    if (data[0] === 0x1f && data[1] === 0x8b) {
      try { data = zlib.gunzipSync(data, { maxOutputLength: CAP.sitemap }); } catch { cutShort = "big"; return null; }
    }
    return data.toString("utf8");
  }

  async function walk(u, depth) {
    if (seen.has(u)) return false;
    if (depth > 1 || seen.size >= MAX_FILES || Date.now() > stopAt) { cutShort = cutShort || "big"; return false; }
    seen.add(u);
    try {
      const xml = await load(u);
      if (xml === null) return false;
      const locs = sitemapLocs(xml).map(xmlText);
      if (locs.some((l) => samePage(l) === wanted)) return true;
      if (/<sitemapindex/i.test(xml)) {
        for (const c of order(locs)) if (await walk(c, depth + 1)) return true;
      }
      return false;
    } catch {
      cutShort = "failed";
      return false;
    }
  }

  const tops = sitemapUrls.length ? sitemapUrls : [origin + "/sitemap.xml"];
  for (const t of order(tops)) if (await walk(t, 0)) return "found";
  return cutShort ? "unknown:" + cutShort : "missing";
}

/* ------------------------------------------------------------- grading */

/**
 * Worst tier reached wins. No weights, no invented arithmetic.
 *
 * E is reserved for a published platform rule. If Google says a page with
 * this directive is not used, that is Google's statement, and E is a fact.
 * Everything Bliss measured itself stops at D, however bad it looks. We
 * do not hand out a failing grade on the strength of our own threshold.
 *
 *   E  a platform rule is broken
 *   D  a usage limit applies, or a measured floor is missed, or 3+ fitness issues
 *   C  2 fitness issues, or 3 or more site warnings
 *   B  1 fitness issue, or 1 to 2 site warnings
 *   A  none of the above
 */
// Why a check stops or limits a channel, in plain words.
function whyNot(label, found) {
  if (label === "No noindex" && /unavailable_after/.test(found || "")) return "The page's unavailable_after date has passed, so Google no longer shows it.";
  const m = /^(.+) may (crawl|use the page)$/.exec(label);
  if (m) return "Your robots.txt blocks " + m[1] + ({ Googlebot: ", so Google's AI cannot use your page.", "Google-Extended": ", so Gemini cannot use your page.",
    "OAI-SearchBot": ", so ChatGPT search will not show your page.", "meta-webindexer": ", so Meta AI cannot use your page." }[m[1]] || ".");
  return ({
    "No noindex": "The page is marked noindex, so it is left out.",
    "Snippets allowed": "The page is marked nosnippet, so AI cannot quote it.",
    "max-snippet not capped": "A max-snippet setting limits how much AI can quote.",
    "No data-nosnippet on main text": "data-nosnippet hides your main text from Google, so its AI cannot quote it.",
    "Page loads": "The page does not load for this crawler.",
    "Main text is in the raw HTML": "This crawler gets almost no text. JavaScript adds your text, and this crawler is not known to run JavaScript.",
    "Main text reaches this channel": "This crawler gets almost no text.",
  })[label] || "Not met: " + label + ".";
}

function gradeChannel(blockers, limits, fitnessFailed, warningCount) {
  const failed = blockers.filter((b) => b.state === "fail");
  const unknown = blockers.filter((b) => b.state === "unknown");
  const platformFailed = failed.filter((b) => b.src !== "measure");
  const measureFailed = failed.filter((b) => b.src === "measure");
  const failedLimits = limits.filter((l) => l.state === "fail");

  if (platformFailed.length)
    return { grade: "E", reason: whyNot(platformFailed[0].label, platformFailed[0].found), basis: "platform" };
  if (unknown.length)
    return { grade: "?", reason: "We could not confirm it. This site may send AI crawlers a different page from the one we received.", basis: "unknown" };
  if (measureFailed.length)
    return { grade: "D", reason: whyNot(measureFailed[0].label), basis: "measure" };
  if (failedLimits.length)
    return { grade: "D", reason: whyNot(failedLimits[0].label), basis: "platform" };
  if (fitnessFailed >= 3)
    return { grade: "D", reason: `${fitnessFailed} page issues to fix.`, basis: "measure" };
  if (fitnessFailed === 2)
    return { grade: "C", reason: "2 page issues to fix.", basis: "measure" };
  if (warningCount >= 3)
    return { grade: "C", reason: `${warningCount} site setup issues.`, basis: "measure" };
  if (fitnessFailed === 1)
    return { grade: "B", reason: "1 page issue to fix.", basis: "measure" };
  if (warningCount >= 1)
    return {
      grade: "B",
      reason: `${warningCount} site warning${warningCount > 1 ? "s" : ""}.`,
      basis: "measure",
    };
  return { grade: "A", reason: "Nothing to fix.", basis: "platform" };
}

/**
 * Every check carries where its rule came from.
 *
 *   platform  a rule the channel itself published. Breaking it stops the
 *             channel reading the page. Bliss did not invent the rule.
 *   measure   a threshold Bliss set, based on third-party research into
 *             how retrieval works. Useful, but it is our number, not theirs.
 *
 * Only a platform rule can take a channel to E. A measure can take it to D.
 */
const ok = (label, need, found, src) =>
  ({ label, state: "pass", need: need, found: found || null, fix: null, src: src || "platform" });
const bad = (label, need, found, fix, src) =>
  ({ label, state: "fail", need: need, found: found || null, fix: fix, src: src || "platform" });
const weak = (label, need, found, fix) =>
  ({ label, state: "weak", need: need, found: found || null, fix: fix, src: "measure" });

/* ------------------------------------------------------------- handler */

function normaliseUrl(raw) {
  let s = String(raw || "").trim();
  if (!s || s.length > 2000) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s) && !/^(file|data|javascript|vbscript|mailto|ftp|about|blob|gopher|ws|wss):/i.test(s)) s = "https://" + s;
  try { return new URL(s); } catch { return null; }
}
function stripTrailingSlash(s) { return String(s || "").replace(/\/+$/, ""); }

// Best-effort throttle. Function instances are not shared, so this catches
// repeat hits on a warm instance rather than being a hard limit. Checking
// search terms re-reads the same page, so it gets its own shorter spacing.
const recent = new Map();
function throttled(ip, url, isRescan) {
  const now = Date.now();
  for (const [k, v] of recent) if (now - v.t > 60000) recent.delete(k);
  const last = recent.get(ip);
  if (last && now - last.t < 20000) {
    if (isRescan && last.url === url && now - (last.rt || 0) > 5000) { last.rt = now; return false; }
    return true;
  }
  recent.set(ip, { t: now, url });
  return false;
}

const errCode = (e) => {
  if (!e) return "";
  const parts = [e.code, e.name, e.cause && e.cause.code, e.cause && e.cause.name];
  return parts.filter((x) => typeof x === "string").join(" ");
};
const LOAD_ERRORS = [
  [/EPRIVATE|EBADURL/, 400, "Enter a public website address. This tool cannot check private or local networks.", null],
  [/ENOTFOUND|ENODATA/, 400, "We could not find that website. Check the spelling of the address and try again.", null],
  [/EDEADLINE|Abort|Timeout|UND_ERR_(HEADERS|BODY|CONNECT)_TIMEOUT|ETIMEDOUT|EAI_AGAIN/, 504, "The site did not answer in time.", "timeout"],
  [/CERT|SELF_SIGNED|UNABLE_TO_VERIFY|ALTNAME|DEPTH_ZERO|ERR_TLS|SSL/, 502, "The site's security certificate is not valid, so we stopped. Browsers show a warning for this site too.", "certificate"],
  [/ECONNREFUSED/, 502, "The site's server did not accept the connection. Check that the site is online.", "refused"],
];
function loadError(e, headers) {
  const code = errCode(e);
  const hit = LOAD_ERRORS.find(([re]) => re.test(code));
  return {
    statusCode: hit ? hit[1] : 502, headers,
    body: JSON.stringify({ error: hit ? hit[2] : "The site closed the connection before sending the page.", kind: hit ? hit[3] : "connect" }),
  };
}

const URL_PROBLEM_TEXT = {
  scheme: "Enter a website address that starts with http or https.",
  credentials: "Remove the user name and password from the address, then try again.",
  port: "Enter the address without a port number, such as example.com.",
  private: "Enter a public website address. This tool cannot check private or local networks.",
};

exports._DATE_RE = DATE_RE; // for tests
exports._urlProblem = (s) => { const u = normaliseUrl(s); return u ? urlProblem(u) : "invalid"; };
exports._countWords = countWords;

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  let params = event.queryStringParameters || {};
  let pasted = null;
  // An owner whose site blocks automated tools can paste the page source.
  if (String(event.httpMethod || "GET").toUpperCase() === "POST") {
    let raw = event.body || "";
    if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
    if (raw.length > 3500000) return { statusCode: 400, headers, body: JSON.stringify({ error: "The pasted page is too large. The limit is 3 MB." }) };
    let b;
    try { b = JSON.parse(raw); } catch { b = null; }
    if (!b || typeof b !== "object" || Array.isArray(b))
      return { statusCode: 400, headers, body: JSON.stringify({ error: "We could not read what was sent. Please try again." }) };
    const str = (v) => (typeof v === "string" ? v : "");
    params = { url: str(b.url), q1: str(b.q1), q2: str(b.q2), q3: str(b.q3) };
    const html = str(b.html);
    if (html.trim().length < 50 || !/<(!doctype|html|head|body|div|p|h1)\b/i.test(html))
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Paste the full page source. It usually starts with <!doctype html>." }) };
    if (refusal(200, html, ""))
      return { statusCode: 400, headers, body: JSON.stringify({ error: "What you pasted is a robot check page, not your page. Open your page normally first, then view its source." }) };
    pasted = { html };
  }
  const target = normaliseUrl(params.url);
  if (!target) return { statusCode: 400, headers, body: JSON.stringify({ error: "Enter a valid website address." }) };
  const why = urlProblem(target);
  if (why) return { statusCode: 400, headers, body: JSON.stringify({ error: URL_PROBLEM_TEXT[why] || URL_PROBLEM_TEXT.private }) };

  // Vercel sets x-real-ip and x-forwarded-for itself and overwrites what the
  // visitor sends, so they cannot be faked there. client-ip is for the tests
  // and the Terminal pack.
  const hd = event.headers || {};
  const ip = hd["x-real-ip"] || String(hd["x-vercel-forwarded-for"] || hd["x-forwarded-for"] || "").split(",")[0].trim() || hd["client-ip"] || "unknown";
  const isRescan = !!(params.q1 || params.q2 || params.q3 || pasted);
  if (throttled(ip, target.toString(), isRescan)) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: "One check every 20 seconds, please. Try again shortly." }) };
  }

  const scan = newScan();
  try {
    return await runScan(scan, target, params, headers, pasted);
  } catch (err) {
    if (err && err.code === "ECOMPLEX")
      return { statusCode: 422, headers, body: JSON.stringify({ error: "We could not read this page: its HTML is built in an unusual way (" + err.message + "). Send the address to Bliss and our team will check it by hand." }) };
    console.error("scan failed", target.toString(), err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "The check failed. Please try again." }) };
  } finally {
    scan.done();
  }
};

// Which AI crawlers robots.txt lets in, for a page we could not read.
// A blocked crawler is certain even without the page.
function accessFrom(robots, url) {
  if (robots.state !== "ok" && robots.state !== "none") return null;
  const a = (t) => tokenAllowed(robots, t, url);
  const g = a("Googlebot"), gx = a("Google-Extended");
  return {
    aio: g,
    gemini: g === false || gx === false ? false : g === null || gx === null ? null : true,
    chatgpt: a("OAI-SearchBot"),
    meta: a("meta-webindexer"),
  };
}

async function runScan(scan, target, params, headers, pasted) {
  const typedOrigin = target.origin;
  const robotsTyped = readRobots(scan, typedOrigin);

  let page;
  if (pasted) {
    page = { finalUrl: target.toString(), status: 200, hops: 0, ms: 0, ttfb: 0, encoding: "", xRobots: "", vary: "",
             contentType: "text/html", mitigated: "", html: pasted.html, truncated: false,
             bytes: Buffer.byteLength(pasted.html, "utf8"), pasted: true };
  } else {
    try {
      page = await fetchPage(scan, target.toString());
    } catch (e) {
      const robots = await robotsTyped;
      const out = loadError(e, headers);
      if (out.statusCode !== 400) {
        const body = JSON.parse(out.body);
        body.canPaste = true;
        body.access = accessFrom(robots, target.toString());
        out.body = JSON.stringify(body);
      }
      return out;
    }
  }

  // robots.txt belongs to the host the page finally came from.
  const finalOrigin = new URL(page.finalUrl).origin;
  const robots = finalOrigin === typedOrigin ? await robotsTyped : (await robotsTyped, await readRobots(scan, finalOrigin));
  const origin = finalOrigin;

  // Ask as one crawler. A refusal is kept apart from a timeout or network error:
  // only a refusal is something to tell the site owner about.
  async function askAs(tok, url) {
    try {
      const v = await fetchPage(scan, url, CRAWLER_UA[tok]);
      const why = v.status !== 200 ? "error " + v.status : v.problem ? "a page that did not load" : refusal(v.status, v.html, v.mitigated);
      return why ? { failed: true, refused: why } : { page: v };
    } catch {
      return { failed: true, error: true };
    }
  }
  const mayAsk = (tok, url) => tokenAllowed(robots, tok, url) === true;

  // Refused by bot protection? Many sites refuse unknown tools but serve AI
  // crawlers. So we ask as each crawler that robots.txt lets in. If one of them
  // gets the page, we grade from what the crawlers get. If none does, we stop:
  // any grade would be a guess.
  const pageRefused = pasted ? null : refusal(page.status, page.html, page.mitigated);
  let toolRefused = null;
  const asked = {};
  if (pageRefused && robots.state !== "refused") {
    const url = page.finalUrl;
    await Promise.all(Object.keys(CRAWLER_UA).map(async (tok) => { if (mayAsk(tok, url)) asked[tok] = await askAs(tok, url); }));
    const firstGood = Object.keys(CRAWLER_UA).find((t) => asked[t] && asked[t].page);
    if (firstGood) { toolRefused = pageRefused; page = asked[firstGood].page; }
  }
  if ((pageRefused && !toolRefused) || robots.state === "refused") {
    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        url: page.finalUrl, scannedAt: new Date().toISOString(),
        couldNotCheck: { what: pageRefused ? "page" : "robots.txt", reason: pageRefused || "error " + robots.status,
                         access: accessFrom(robots, page.finalUrl), canPaste: true },
      }),
    };
  }

  // Not a web page at all, such as a PDF or an image.
  if (page.status === 200 && page.contentType && !/html|xml|text\/plain/i.test(page.contentType)) {
    const kind = /pdf/i.test(page.contentType) ? "a PDF file" : /image/i.test(page.contentType) ? "an image" : "a file";
    return { statusCode: 400, headers, body: JSON.stringify({ error: "This address opens " + kind + ", not a web page. Enter the address of a web page." }) };
  }

  // Read one version of the page: text, titles, directives and page checks.
  function analyse(html, xRobots, bytes) {
    const pg = readPage(html || "");
    const words = pg.words;
    return {
      pg, bytes: bytes || Buffer.byteLength(html || "", "utf8"), first: pg.first,
      dir: readDirectives(pg, xRobots), pageText: pg.pageText, rawWords: words,
      h1: pg.heads[1], h2: pg.heads[2], h3: pg.heads[3],
      fit: fitness(pg), thin: words < RAW_THIN, rich: words >= RAW_RICH,
    };
  }
  const base = analyse(page.html, page.xRobots, page.bytes);

  // Channels whose "no JavaScript" behaviour has not been tested for their own
  // crawler. A grade that depends on it is "likely", not "confirmed".
  const NO_JS_UNTESTED = { meta: "The page sent to meta-webindexer has no text. No public test shows whether meta-webindexer runs JavaScript." };
  const RENDERS = { aio: true, gemini: true, chatgpt: false, meta: false };

  const allowed = {
    googlebot: tokenAllowed(robots, "Googlebot", page.finalUrl),
    gext: tokenAllowed(robots, "Google-Extended", page.finalUrl),
    oai: tokenAllowed(robots, "OAI-SearchBot", page.finalUrl),
    meta: tokenAllowed(robots, "meta-webindexer", page.finalUrl),
  };
  const pageOk = page.status === 200 && !page.problem;

  // "Vary: User-Agent" means the server sends different pages to different
  // visitors. When our page is empty and the site says it varies, we ask once
  // more as each crawler, so each channel is graded on the page that crawler
  // really gets. Our own name stays in every request. We never ask as a
  // crawler that robots.txt tells to stay out.
  //
  // We now ask as each crawler on every check, so a firewall that refuses one
  // AI crawler shows up. Our requests do not come from Google's or OpenAI's
  // addresses, so a refusal is a question for the developer, never a grade.
  const variesByVisitor = /user-agent/i.test(page.vary || "");
  const askAsCrawlers = !pasted && pageOk;
  const MAY_ASK = { Googlebot: allowed.googlebot === true, "OAI-SearchBot": allowed.oai === true, "meta-webindexer": allowed.meta === true };
  const served = {};
  if (askAsCrawlers) {
    await Promise.all(Object.keys(CRAWLER_UA).map(async (tok) => {
      if (!MAY_ASK[tok]) return;
      const r = asked[tok] || await askAs(tok, page.finalUrl);
      served[tok] = r.page ? { ...analyse(r.page.html, r.page.xRobots, r.page.bytes), ttfb: r.page.ttfb, same: r.page === page } : { failed: true, refused: r.refused, error: r.error };
    }));
  }
  const got = (tok) => served[tok] && !served[tok].failed;
  // A crawler's page counts as its own only when it differs from ours.
  const differs = (s) => s.thin !== base.thin || Math.abs(s.rawWords - base.rawWords) > Math.max(20, base.rawWords * 0.1);
  const own = (tok) => got(tok) && differs(served[tok]);

  function view(key) {
    const tok = TOKENS[key];
    const src = own(tok) ? served[tok] : base;
    return {
      ...src,
      measuredOn: own(tok) ? tok : null,
      unverified: RENDERS[key] ? src.thin : false,
      rawUnconfirmed: !RENDERS[key] && base.thin && variesByVisitor && !got(tok),
    };
  }

  // The richest version we have: used for the page checks, titles and searches.
  const display = own("Googlebot") && !served.Googlebot.thin ? served.Googlebot : base;
  const dir = display.dir;
  const pageText = display.pageText;
  const fit = display.fit;
  const shellLike = display.thin;
  const renderedUnverified = pageOk && display.thin;

  // A homepage is short blocks and links by nature, and rarely shows a date. It is
  // graded on access rules only; the page checks are shown as tips. A language
  // homepage such as /en-id counts as a homepage too.
  const finalPath = new URL(page.finalUrl).pathname;
  // Titles matter on every page, so a homepage keeps the two title checks.
  const HOME_KEEPS = new Set(["One main title", "Section titles", "No sample text from the template"]);
  const counts = (c) => !isHome || HOME_KEEPS.has(c.label);
  const isHome = !new URL(page.finalUrl).search && (/^\/?$/.test(finalPath) || /^\/[a-z]{2}([-_][a-z]{2})?\/?$/i.test(finalPath));

  const listJoin = (a) => (a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0]);
  const fullFor = CRAWLER_ORDER.filter((t) => served[t]).filter((t) => got(t) && !served[t].thin && (own(t) || !base.thin));
  const emptyRaw = CRAWLER_ORDER.filter((t) => served[t]).filter((t) => got(t) && served[t].thin &&
    Object.keys(TOKENS).some((k) => !RENDERS[k] && TOKENS[k] === t));
  const RAW_FIX = fullFor.length && emptyRaw.length
    ? "Your site already sends " + listJoin(fullFor) + " a full page, but sends " + listJoin(emptyRaw) +
      " an empty one. Add " + listJoin(emptyRaw) + " to the list of crawlers that get the full page. This is usually one setting in your pre-rendering service."
    : "Ask your web developer to turn on server-side rendering or pre-rendering, so your text is in the page before JavaScript runs. A Vercel study (December 2024) found that AI crawlers from OpenAI and Meta do not run JavaScript. Then check this page again.";
  const unconfirmedRaw = Object.keys(TOKENS).filter((k) => view(k).rawUnconfirmed).map((k) => TOKENS[k]);

  function fitFor(key) {
    const v = view(key);
    const unverified = v.unverified || v.rawUnconfirmed;
    const failed = v.fit.checks.filter((c) => c.state === "fail" && counts(c)).length;
    return { failed: unverified || !pageOk ? 0 : failed, unverified };
  }

  function nosnippetCheck(key) {
    const v = view(key), d = v.dir;
    const need = "No main text marked data-nosnippet";
    if (!d.dataNosnippet) return ok("No data-nosnippet on main text", need, "0 elements", "platform");
    const heavy = d.dataNosnippetMax >= 40 || d.dataNosnippetWords >= 0.1 * Math.max(v.rawWords, 1);
    const found = d.dataNosnippet + (d.dataNosnippet === 1 ? " element, " : " elements, ") + d.dataNosnippetWords + (d.dataNosnippetWords === 1 ? " word" : " words");
    return heavy
      ? bad("No data-nosnippet on main text", need, found,
            "Remove data-nosnippet from paragraphs you want quoted. Keep it only on fine print such as copyright lines.", "platform")
      : ok("No data-nosnippet on main text", need, found + ": fine print only", "platform");
  }

  // Two decimals near the 2-second limit, so "2.0 s" never shows as a fail.
  const secs = (ms) => (ms < 100 ? "under 0.1 s" : (ms / 1000).toFixed(ms >= 1900 && ms < 2100 ? 2 : 1) + " s");
  const plural = (n, w) => Number(n).toLocaleString("en-US") + " " + w + (n === 1 ? "" : "s");
  const where = (v) => (v.measuredOn ? " in the page sent to " + v.measuredOn : " in the raw HTML");

  function renderedCheck(key) {
    const v = view(key);
    return v.rich
      ? ok("Main text reaches this channel", "250 or more words", plural(v.rawWords, "word") + where(v), "measure")
      : ok("Main text reaches this channel", "250 or more words",
           plural(v.rawWords, "word") + where(v) + ". Not confirmed after JavaScript, so it is not counted against you", "measure");
  }

  function rawCheck(key) {
    const v = view(key);
    const need = RAW_THIN + " or more words before JavaScript";
    if (v.rawUnconfirmed)
      return { label: "Main text is in the raw HTML", state: "unknown", src: "measure", need,
               found: plural(v.rawWords, "word") + " for us. This site sends different pages to different visitors",
               fix: "Ask your web developer: do " + listJoin(unconfirmedRaw) + " get the full page, with the text already in it? If yes, nothing to do. If no, turn on server-side rendering or pre-rendering." };
    if (v.thin)
      return bad("Main text is in the raw HTML", need,
                 plural(v.rawWords, "word") + " before JavaScript",
                 RAW_FIX, "measure");
    return ok("Main text is in the raw HTML", need, plural(v.rawWords, "word") + where(v), "measure");
  }

  // robots.txt answer for one crawler: allowed, blocked, or could not read.
  function robotsCheck(label, verdict, blockedFix) {
    if (verdict === true) return ok(label, "Allowed in robots.txt", "Allowed");
    if (verdict === false) return bad(label, "Allowed in robots.txt", "Blocked", blockedFix);
    return { label, state: "unknown", src: "platform", need: "Allowed in robots.txt",
             found: robots.state === "error" ? "Could not read robots.txt (" + (robots.status ? "error " + robots.status : "no answer") + ")" : "Not confirmed",
             fix: "Ask your web developer why robots.txt does not load. When robots.txt has a server error, Google pauses crawling for up to 12 hours, then uses the last copy it read." };
  }

  const LOAD_FOUND = { tooManyRedirects: "More than 5 redirects", noLocation: "A redirect with no destination", badLocation: "A redirect to a broken address" };
  const pageLoads = page.pasted
    ? ok("Page loads", "Opens without an error", "Not checked: you pasted the page")
    : pageOk
    ? ok("Page loads", "Opens without an error", "Opens (code 200)")
    : bad("Page loads", "Opens without an error", LOAD_FOUND[page.problem] || "Error " + page.status,
          page.problem ? "Fix the redirect so this address leads to a page that loads." : "Fix the error so this address opens normally.");

  /* ---- site warnings, shared across channels ---- */

  let canonOk = true, canonBroken = false;
  if (dir.canonical) {
    try {
      canonOk = stripTrailingSlash(new URL(dir.canonical, page.finalUrl).toString()).toLowerCase() === stripTrailingSlash(page.finalUrl).toLowerCase();
    } catch { canonOk = false; canonBroken = true; }
  }

  const inSitemap = pageOk ? await urlInSitemap(scan, robots.sitemaps || [], origin, page.finalUrl) : "unknown:failed";
  const compressed = /gzip|br|deflate|zstd/i.test(page.encoding || "");
  // Server speed: the middle value of all our requests for this page, so one
  // slow first answer (a cold cache) does not fail the site on its own.
  const times = [page.ttfb].concat(Object.keys(served).filter((t) => got(t) && !served[t].same).map((t) => served[t].ttfb))
    .filter((n) => typeof n === "number").sort((a, b) => a - b);
  const mid = times.length % 2 ? times[(times.length - 1) / 2] : Math.round((times[times.length / 2 - 1] + times[times.length / 2]) / 2);
  const speedFound = secs(mid) + (times.length > 2 ? ", the middle value of " + times.length + " tries" : times.length === 2 ? ", the average of 2 tries" : "");
  const fast = mid < 2000;
  const isHomepage = target.pathname === "/" || target.pathname === "";
  const bare = (u) => { const x = new URL(u); return x.host.replace(/^www\./, "") + stripTrailingSlash(x.pathname); };
  const countedHops = isHomepage ? 0 : (bare(target.toString()) === bare(page.finalUrl) ? 0 : page.hops);
  const noRedirect = countedHops === 0;

  const notChecked = (label, need) => ({ label, state: "unknown", need, found: "Not checked: you pasted the page", fix: null, src: "measure" });
  const warnings = [
    canonOk
      ? ok("Canonical points here", "Points to this URL", dir.canonical || "No canonical tag (this is fine)")
      : bad("Canonical points here", "Points to this URL", dir.canonical,
            canonBroken ? "The canonical tag holds an address that does not work. Change it so it points to this page."
                        : "Point the canonical tag at this URL, or scan the URL it points to instead."),
    inSitemap === "found"
      ? ok("Listed in sitemap.xml", "URL is listed", "Listed")
      : inSitemap.startsWith("unknown")
        ? { label: "Listed in sitemap.xml", state: "unknown", need: "URL is listed",
            found: inSitemap === "unknown:big" ? "Not confirmed. Your sitemap is too large for us to search fully" : "Not confirmed. Your sitemap did not load in time", fix: null, src: "platform" }
        : bad("Listed in sitemap.xml", "URL is listed", "Not found", "Add this URL to sitemap.xml."),
    page.pasted ? notChecked("No redirect", "The address opens directly") : noRedirect
      ? ok("No redirect", "The address opens directly", page.hops === 0 ? "Opens directly"
           : plural(page.hops, "redirect") + (isHomepage ? ", normal for a homepage" : ", to https or www only"), "measure")
      : bad("No redirect", "The address opens directly", plural(countedHops, "redirect"),
            "Update your links to use the final address, so visitors and crawlers are not sent on. We check from " + checkFrom() + ": if your site sends visitors to a different page by country, this may not happen in Indonesia.", "measure"),
    page.pasted ? notChecked("Compression on", "gzip or Brotli") : compressed
      ? ok("Compression on", "gzip or Brotli", page.encoding, "measure")
      : bad("Compression on", "gzip or Brotli", "None", "Switch on gzip or Brotli on the server.", "measure"),
    // Speed is shown, not graded: we measure from one place (Singapore), and
    // visitors in other places get other times.
    page.pasted ? notChecked("Server answers fast", "Answers within 2 seconds")
      : { label: "Server answers fast", state: fast ? "pass" : "fail", need: "Answers within 2 seconds", src: "measure", graded: false,
          found: speedFound + ", measured from " + checkFrom() + ". Not graded",
          fix: fast ? null : "Not graded, because we measure from one place (" + checkFrom() + "). If your site is also slow for your visitors, ask your developer about a caching plugin or a CDN." },
  ];
  CRAWLER_ORDER.filter((t) => served[t] && served[t].refused).forEach((t) => {
    const serverError = /^error 5/.test(served[t].refused);
    warnings.push({ label: t + " gets the page", state: "unknown", need: "The page loads", src: "measure",
      found: serverError ? "Your server had an error (" + served[t].refused.replace(/^error\s*/, "") + ") when we asked as " + t
                         : "Your site answered with " + served[t].refused + " when we asked as " + t,
      fix: serverError
        ? "Ask your web developer why the server fails when " + t + " visits. It may be the firewall or the server itself. The real " + t + " may get the page. We cannot test that from here."
        : "Ask your web developer to check that your firewall lets " + t + " through. Many firewalls check the crawler's IP address, so the real " + t + " may get the page. We cannot test that from here." });
  });
  const warningCount = warnings.filter((w) => w.state === "fail" && w.graded !== false).length;
  const WARN_TODO = {
    "Canonical points here": "fix the canonical tag",
    "Listed in sitemap.xml": "add the page to sitemap.xml",
    "No redirect": "link to the final address so nothing redirects",
    "Compression on": "switch on compression",
    "Server answers fast": "make the server answer faster",
  };
  const warnTodos = warnings.filter((w) => w.state === "fail" && w.graded !== false).map((w) => WARN_TODO[w.label] || w.label);

  /* ---- per-channel checks ---- */

  const gDir = (k) => directivesFor(view(k).dir, GOOGLE_UAS);
  const oDir = directivesFor(view("chatgpt").dir, OAI_UAS);
  const channels = {};

  channels.aio = {
    name: CHANNEL_NAMES.aio, reads: "rendered",
    blockers: [
      robotsCheck("Googlebot may crawl", allowed.googlebot, "In robots.txt, remove the Disallow rule that applies to Googlebot (in its own lines, or under User-agent: *)."),
      pageLoads,
      !gDir("aio").noindex && !gDir("aio").expired
        ? ok("No noindex", "No noindex anywhere", "None")
        : gDir("aio").noindex
        ? bad("No noindex", "No noindex anywhere", "noindex found", "Remove noindex from the robots meta tag and the X-Robots-Tag header.")
        : bad("No noindex", "No noindex anywhere", "unavailable_after, with a date that has passed", "Remove unavailable_after from the robots meta tag and the X-Robots-Tag header, or set a date in the future."),
      !(gDir("aio").nosnippet || gDir("aio").maxSnippet === 0)
        ? ok("Snippets allowed", "No nosnippet, no max-snippet:0", "Allowed")
        : bad("Snippets allowed", "No nosnippet, no max-snippet:0", "Snippets switched off", "Remove nosnippet. Use max-snippet:-1 instead."),
      renderedCheck("aio"),
    ],
    limits: [
      gDir("aio").maxSnippet === null || gDir("aio").maxSnippet < 0
        ? ok("max-snippet not capped", "Not set, or -1", gDir("aio").maxSnippet === null ? "Not set" : "Set to -1")
        : bad("max-snippet not capped", "Not set, or -1", "Set to " + gDir("aio").maxSnippet, "Change it to max-snippet:-1, or remove it."),
      nosnippetCheck("aio"),
    ],
  };

  channels.gemini = {
    name: CHANNEL_NAMES.gemini, reads: "rendered",
    blockers: [
      robotsCheck("Googlebot may crawl", allowed.googlebot, "In robots.txt, remove the Disallow rule that applies to Googlebot (in its own lines, or under User-agent: *)."),
      robotsCheck("Google-Extended may use the page", allowed.gext,
                  "In robots.txt, find the lines for Google-Extended and change Disallow: / to Allow: /. If there are no lines for Google-Extended, add them: User-agent: Google-Extended then Allow: / . Google states this setting does not affect Google Search."),
      pageLoads,
      !gDir("gemini").noindex && !gDir("gemini").expired
        ? ok("No noindex", "No noindex anywhere", "None")
        : gDir("gemini").noindex
        ? bad("No noindex", "No noindex anywhere", "noindex found", "Remove noindex from the robots meta tag and the X-Robots-Tag header.")
        : bad("No noindex", "No noindex anywhere", "unavailable_after, with a date that has passed", "Remove unavailable_after from the robots meta tag and the X-Robots-Tag header, or set a date in the future."),
      renderedCheck("gemini"),
    ],
    limits: [],
  };

  channels.chatgpt = {
    name: CHANNEL_NAMES.chatgpt, reads: "raw",
    blockers: [
      robotsCheck("OAI-SearchBot may crawl", allowed.oai, "In robots.txt, find the lines for OAI-SearchBot and change Disallow: / to Allow: /. If there are no lines for OAI-SearchBot, add them: User-agent: OAI-SearchBot then Allow: / . OpenAI says changes take about 24 hours."),
      pageLoads,
      rawCheck("chatgpt"),
      allowed.oai !== false && oDir.noindex
        ? bad("No noindex", "No noindex anywhere", "noindex found", "Remove noindex from the robots meta tag and the X-Robots-Tag header.")
        : ok("No noindex", "No noindex anywhere", allowed.oai === false ? "Crawler blocked, so the tag is never read" : "None"),
    ],
    limits: [],
  };

  // Meta documents meta-webindexer as the crawler that fetches pages to cite
  // in Meta AI answers. Meta publishes no page-level directive for Meta AI.
  channels.meta = {
    name: CHANNEL_NAMES.meta, reads: "raw",
    blockers: [
      robotsCheck("meta-webindexer may crawl", allowed.meta,
                  "In robots.txt, find the lines for meta-webindexer and change Disallow: / to Allow: /. If there are no lines for meta-webindexer, add them: User-agent: meta-webindexer then Allow: / . This is the crawler Meta uses for Meta AI answers."),
      pageLoads,
      rawCheck("meta"),
    ],
    limits: [],
  };

  // A page that does not load has no text to judge, so only the load rule shows.
  if (!pageOk) Object.keys(channels).forEach((k) => {
    channels[k].blockers = channels[k].blockers.filter((b) => !/^Main text/.test(b.label));
  });

  Object.keys(channels).forEach((k) => {
    const c = channels[k];
    const f = fitFor(k);
    const g = gradeChannel(c.blockers, c.limits, f.failed, warningCount);
    c.grade = g.grade;
    c.reason = g.reason;
    c.basis = g.basis;
    c.fitnessFailed = f.failed;
    c.unverified = f.unverified;
    // We did not see the text, so the best we can say is "Nearly ready".
    if (f.unverified && c.grade === "A") c.grade = "B";
    // On a homepage, an unmet tip keeps the grade at B: "Ready" means nothing is left.
    const tipsMissed = isHome && pageOk && !f.unverified ? view(k).fit.checks.filter((x) => x.state === "fail" && !counts(x)).map((x) => x.label) : [];
    if (c.grade === "A" && tipsMissed.length) {
      c.grade = "B";
      c.basis = "measure";
      const todos = view(k).fit.checks.filter((x) => x.state === "fail" && !counts(x)).map((x) => x.todo);
      c.reason = "Nothing blocks it. To reach A, " + andList(todos) + ".";
    }
    if (!f.unverified && isHome && c.grade === "A") c.reason = "Nothing to fix.";
    if (f.unverified && (c.grade === "A" || c.grade === "B")) c.basis = "measure";
    if (f.unverified && (c.grade === "A" || c.grade === "B"))
      c.reason = view(k).rawUnconfirmed
        ? "Nothing blocks it, but we could not confirm your text. This site may send this crawler a different page."
        : "Nothing blocks it, but we could not see your text, because JavaScript adds it. This channel runs JavaScript, so it probably sees the text.";
    c.token = TOKENS[k];
    c.measuredOn = view(k).measuredOn;

    if (/site (setup issues|warning)/.test(c.reason))
      c.reason = (c.grade === "B" ? "Nothing blocks it. To reach A, ask your web developer to " : "Site setup: ask your web developer to ") + andList(warnTodos) + ".";
    // A "?" says why, in words that match what happened.
    const tok = TOKENS[k];
    const crawlerNoAnswer = served[tok] && served[tok].error;
    if (c.grade === "?" && robots.state === "error")
      c.reason = "We could not read your robots.txt file (" + (robots.status ? "error " + robots.status : "no answer in time") + "), so we cannot tell if " + tok + " may visit.";
    else if (c.grade === "?" && crawlerNoAnswer)
      c.reason = "We asked for the page as " + tok + ", but your site did not answer in time. So we could not see the page it gets.";
    // Name the page issues behind the grade, as things to do.
    if (!f.unverified && /page issues? to fix/.test(c.reason)) {
      const todos = view(k).fit.checks.filter((x) => x.state === "fail" && counts(x)).map((x) => x.todo);
      c.issues = todos;
      c.reason = (todos.length === 1 ? "1 thing to fix on the page: " : todos.length + " things to fix on the page: ") + andList(todos) + ".";
    }

    // How sure the grade is.
    const rawFailed = c.blockers.some((b) => b.label === "Main text is in the raw HTML" && b.state === "fail");
    const crawlerMissed = !toolRefused && MAY_ASK[TOKENS[k]] && served[TOKENS[k]] && served[TOKENS[k]].failed;
    const textUnseen = c.blockers.some((b) => /Not confirmed/.test(b.found || ""));
    if (c.grade === "?") {
      c.confidence = "unconfirmed";
      c.confidenceNote = robots.state === "error" ? "We could not read robots.txt." : crawlerNoAnswer ? "Your site did not answer in time when we asked as " + TOKENS[k] + "." : "This site may send this crawler a page we could not see.";
    } else if (c.grade === "E") {
      c.confidence = "confirmed";
      c.confidenceNote = "Read directly from your robots.txt and your page.";
    } else if (page.pasted) {
      c.confidence = "likely";
      c.confidenceNote = "Based on the page source you pasted. We could not fetch the page ourselves, so what AI crawlers receive may differ.";
    } else if (toolRefused && !got(TOKENS[k])) {
      c.confidence = "likely";
      c.confidenceNote = (served[TOKENS[k]] && served[TOKENS[k]].error
        ? "Your site did not answer in time when we asked as " + TOKENS[k]
        : "Your site refused our test request as " + TOKENS[k]) + ", so we graded the page the other crawlers got. The real " + TOKENS[k] + " may be let through.";
    } else if (f.unverified) {
      c.confidence = "likely";
      c.confidenceNote = view(k).rawUnconfirmed
        ? "This site may send this crawler a page we could not see."
        : "This channel runs JavaScript, and we could not see the finished page.";
    } else if (crawlerMissed) {
      c.confidence = "likely";
      c.confidenceNote = "We could not get the page as " + TOKENS[k] + ", so we graded the page our tool got. The real " + TOKENS[k] + " most likely gets the same page.";
    } else if (textUnseen) {
      c.confidence = "likely";
      c.confidenceNote = "This channel runs JavaScript, and we could not see the finished page.";
    } else if (NO_JS_UNTESTED[k] && rawFailed) {
      c.confidence = "likely";
      c.confidenceNote = NO_JS_UNTESTED[k];
    } else {
      c.confidence = "confirmed";
      c.confidenceNote = "Measured on the page this channel’s crawler receives.";
    }
  });

  // The "what each crawler gets" panel shows only when the pages differ.
  const showServed = askAsCrawlers && (!!toolRefused || Object.keys(served).some((t) => served[t].refused || own(t)));

  /* ---- search terms ---- */

  const sections = display.pg.sections;
  const queries = [params.q1, params.q2, params.q3].map((q) => String(q || "").trim().slice(0, 200)).filter(Boolean).slice(0, 3);
  // When the page text is added by JavaScript, we cannot see it, so we cannot
  // say whether a section answers the search. Saying "not on your page" would be a guess.
  const searchTerms = queries.map((q) => renderedUnverified
    ? { query: q, verdict: "unseen", checks: [], coverage: 0, matchedHeading: null }
    : evaluateQuery(q, sections, pageText, fit.hasDate) || { query: q, verdict: "unreadable", checks: [], coverage: 0, matchedHeading: null });
  searchTerms.forEach((t) => t.checks.forEach(stampBy));

  /* ---- who does the work ---- */

  Object.keys(channels).forEach((k) => { channels[k].blockers.forEach(stampBy); channels[k].limits.forEach(stampBy); });
  fit.checks.forEach(stampBy);
  warnings.forEach(stampBy);

  /* ---- one ranked fix list, deduped across channels ---- */

  const fixMap = new Map();
  function addFix(c, rank, channel, tip) {
    if (c.state === "pass" || !c.fix) return;
    if (c.state === "unknown") rank = 5;
    const key = c.label + "|" + c.fix;
    if (!fixMap.has(key)) {
      fixMap.set(key, { label: c.label, need: c.need, found: c.found, fix: c.fix, src: c.src, by: c.by, rank, state: c.state, channels: [] });
    }
    const e = fixMap.get(key);
    if (rank < e.rank) e.rank = rank;
    if (tip) e.tip = true;
    if (channel && e.channels.indexOf(channel) === -1) e.channels.push(channel);
  }
  Object.keys(channels).forEach((k) => {
    channels[k].blockers.forEach((c) => addFix(c, c.src === "measure" ? 3 : 1, CHANNEL_NAMES[k]));
    channels[k].limits.forEach((c) => addFix(c, 2, CHANNEL_NAMES[k]));
  });
  // On a homepage the page checks are tips: listed last, never counted in the grade.
  if (!shellLike && pageOk) fit.checks.forEach((c) => addFix(c, counts(c) ? 3 : 6, null, !counts(c)));
  warnings.forEach((c) => { if (c.graded !== false) addFix(c, 4, null); });
  const fixes = [...fixMap.values()].sort((a, b) => a.rank - b.rank);

  /* ---- response ---- */

  const report = {


      url: page.finalUrl,
      scannedAt: new Date().toISOString(),
      page: {
        status: page.status,
        hops: page.hops,
        ms: page.ms,
        ttfb: mid,
        encoding: page.encoding || "none",
        truncated: !!page.truncated,
        isHomepage: isHome,
        pasted: !!page.pasted,
        rawWords: base.rawWords,
        h1: fit.h1,
        h2: display.h2,
        h3: display.h3,
        htmlBytes: base.bytes,
        sections: sections.length,
        outline: sections.slice(0, 12).map((x) => ({ level: x.level, text: x.heading.slice(0, 90) })),
        titles: sections.length,
        renderedUnverified,
        variesByVisitor,
        rawUnconfirmed: unconfirmedRaw.length > 0,
        measuredOn: display === base ? null : "Googlebot",
        displayWords: display.rawWords,
        displayBytes: display.bytes,
        toolRefused,
        served: showServed
          ? Object.assign({ "Our tool": toolRefused ? null : base.rawWords },
              ...Object.keys(CRAWLER_UA).map((t) => ({ [t]: got(t) ? served[t].rawWords : null })))
          : null,
        servedDetail: showServed
          ? Object.assign({ "Our tool": toolRefused ? { refused: true } : { bytes: base.bytes, first: base.first } },
              ...Object.keys(CRAWLER_UA).map((t) => ({
                [t]: got(t) ? { bytes: served[t].bytes, first: served[t].first }
                     : { refused: !!(served[t] && served[t].refused), why: (served[t] && served[t].refused) || null, notAsked: !served[t], error: !!(served[t] && served[t].error) } })))
          : null,
      },
      robots: { status: robots.status, state: robots.state, allowed, sitemapsDeclared: (robots.sitemaps || []).length },
      channels,
      fixes,
      fitness: {
        checks: fit.checks, failed: fit.failed, passages: fit.passages, longestBlockWords: fit.longestBlockWords,
        blocks: fit.blocks, blockSpread: fit.blockSpread, h1: fit.h1, subheads: fit.subheads,
        sentences: fit.sentences, leaning: fit.leaning, hasDate: fit.hasDate,
        paraWords: fit.paraWords, templateText: fit.templateText,
      },
      warnings,
      warningCount,
      searchTerms,
      cannotCheck: [
        "Whether Google has indexed this page. You can see this in Search Console, under URL Inspection.",
        "Whether your firewall blocks AI crawlers by their IP address. We only test by crawler name.",
        "Whether AI features are turned off in Search Console, under Settings, Search generative AI. If they are, AI Overviews will not show your site.",
      ],
  };
  // No single text from a page may make the answer huge: cut long strings.
  const bodyText = JSON.stringify(report, (key, v) => (typeof v === "string" && v.length > 2000 ? v.slice(0, 2000) + "…" : v));
  // Vercel refuses any answer over 4.5 MB, so stop well before that.
  if (Buffer.byteLength(bodyText) > 4000000)
    return { statusCode: 422, headers, body: JSON.stringify({ error: "We could not read this page: it is too large to report on. Send the address to Bliss and our team will check it by hand." }) };
  return { statusCode: 200, headers, body: bodyText };
}

/* ---------------------------------------------------------------- notes

Why there is no headless browser here.

Rendering only ever ADDS content to a page. It never removes it. So:

  - If the raw HTML is already rich, the rendered page must be at least as
    rich. Every channel passes the content check and a browser would tell us
    nothing new.
  - If the raw HTML is thin, ChatGPT is blocked either way, because it reads
    only the server response. The verdict is the same whether the page is
    JavaScript-rendered or genuinely short.

The one thing a browser would add: when raw is thin, it would tell us whether
Google and Gemini still see a full page. We report that as unverified
rather than guessing, and it never counts against the grade.

To add rendering later, put a Cloudflare Worker with Browser Rendering behind
one endpoint, call it from here only when rawWords < RAW_RICH, and replace
renderedContentCheck with the real comparison.

---------------------------------------------------------------------- */
