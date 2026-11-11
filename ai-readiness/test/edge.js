// Edge cases found in the independent review of 27 September 2026.
// Starts its own local server on port 8910 and needs nothing else.
//   node test/edge.js
// Hosts: 127.0.0.1 is a normal site. 127.0.0.2 blocks Googlebot and
// OAI-SearchBot in robots.txt. 127.0.0.3 answers robots.txt with error 500.

const http = require("http");
const zlib = require("zlib");
const P = 8910;
const H = (n) => "http://127.0.0.1:" + P + n;

const para = (w) => Array.from({ length: w }, (_, i) => ["Studio", "Bali", "offers", "calm", "rooms", "near", "the", "beach", "for", "families"][i % 10]).join(" ") + ".";
const RICH = (extraHead = "") => `<!doctype html><html><head><title>Rich</title>${extraHead}</head><body>
<h1>Studio Bali guest rooms</h1><p>Updated 26 September 2026</p>
<h2>What is included in a stay?</h2><p>${para(90)}</p>
<h2>How far is the beach?</h2><p>${para(85)}</p>
<h2>Can families book?</h2><p>${para(80)}</p></body></html>`;
const THAI_P = "ร้านกาแฟของเราเปิดทุกวันตั้งแต่เจ็ดโมงเช้าจนถึงหกโมงเย็น เรามีกาแฟคั่วสดจากเชียงใหม่และขนมอบที่ทำใหม่ทุกเช้า ลูกค้าสามารถนั่งทำงานได้ทั้งวันพร้อมอินเทอร์เน็ตความเร็วสูงและปลั๊กไฟทุกโต๊ะ ";
const JA_P = "当店は毎日午前七時から午後六時まで営業しています。京都産の豆を使ったコーヒーと、毎朝焼き上げるパンをご用意しています。電源とWiFiがある席で一日中お仕事ができます。";

const bomb = zlib.gzipSync(Buffer.alloc(300 * 1024 * 1024, 32), { level: 9 });
const big = "<!doctype html><html><body><h1>Big</h1>" + Array.from({ length: 20000 }, (_, i) => `<p>Item ${i} with a few words of text here</p>`).join("") + "</body></html>";
const deep = "<!doctype html><html><body><h1>Deep</h1>" + "<div data-nosnippet>".repeat(3000) + "text" + "</div>".repeat(3000) + "<p>" + para(80) + "</p></body></html>";

const server = http.createServer((req, res) => {
  const host = (req.headers.host || "").split(":")[0];
  const u = new URL(req.url, "http://x");
  const p = u.pathname;
  const html = (s, h = {}) => { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", ...h }); res.end(s); };
  if (p === "/robots.txt") {
    if (host === "127.0.0.3") { res.writeHead(500); return res.end("oops"); }
    if (host === "127.0.0.2") { res.writeHead(200); return res.end("User-agent: Googlebot\nDisallow: /\n\nUser-agent: OAI-SearchBot\nDisallow: /\n"); }
    // Review of 28 Sep 2026: robots.txt read the way Google reads it.
    if (host === "127.0.0.4") { res.writeHead(200); return res.end("User-agent: *\nCrawl-delay: 10\nUser-agent: Googlebot\nDisallow: /\n"); }
    if (host === "127.0.0.5") { res.writeHead(200); return res.end("User-agent: *\nDisallow: /\n\nUser-agent: Googlebot\n"); }
    if (host === "127.0.0.6") { res.writeHead(200); return res.end("User-agent: Google-Extended\nDisallow: /\n"); }
    if (host === "127.0.0.7") { res.writeHead(200); return res.end("User-agent: *\n" + Array.from({ length: 2000 }, (_, i) => "Disallow: /" + "*a".repeat(120) + "b" + i).join("\n")); }
    if (host === "127.0.0.8") { res.writeHead(200); return res.end("User-agent: googlebot\nDisalow: /\n"); }
    if (host === "127.0.0.9") { res.writeHead(200); return res.end("User-agent: *\nAllow: /\nSitemap: http://127.0.0.9:" + P + "/badsitemap.xml\n"); }
    res.writeHead(200); return res.end("User-agent: *\nAllow: /\nSitemap: " + H("/sitemap.xml"));
  }
  if (p === "/sitemap.xml") { res.writeHead(200, { "Content-Type": "application/xml" }); return res.end(`<urlset><url><loc>${H("/amp")}?a=1&amp;b=2</loc></url><url><loc><![CDATA[${H("/rich")}]]></loc></url></urlset>`); }
  if (p === "/") return html(`<!doctype html><html><body><h1>Home</h1><ul>${Array.from({ length: 40 }, (_, i) => "<li>Link " + i + " to a page</li>").join("")}</ul></body></html>`);
  if (p === "/secret") return html("<h1>INTERNAL ADMIN token=SEKRET</h1>");
  if (p === "/rich" || p === "/amp") return html(RICH());
  if (p === "/to-blocked") { res.writeHead(301, { Location: "http://127.0.0.2:" + P + "/rich" }); return res.end(); }
  if (p === "/bomb") { res.writeHead(200, { "Content-Type": "text/html", "Content-Encoding": "gzip" }); return res.end(bomb); }
  if (p === "/slow") { res.writeHead(200, { "Content-Type": "text/html" }); const t = setInterval(() => res.write("a"), 1000); res.on("close", () => clearInterval(t)); return; }
  if (p === "/thai") return html(`<!doctype html><html lang="th"><body><h1>ร้านกาแฟเชียงใหม่</h1><h2>เปิดกี่โมง</h2><p>${THAI_P.repeat(3)}</p><h2>มีอะไรบ้าง</h2><p>${THAI_P.repeat(3)}</p><p>${THAI_P.repeat(3)}</p></body></html>`);
  if (p === "/japanese") return html(`<!doctype html><html lang="ja"><body><h1>京都のカフェ</h1><h2>営業時間</h2><p>${JA_P.repeat(3)}</p><h2>メニュー</h2><p>${JA_P.repeat(3)}</p><p>${JA_P.repeat(3)}</p></body></html>`);
  if (p === "/sjis") { res.writeHead(200, { "Content-Type": "text/html; charset=Shift_JIS" }); return res.end(Buffer.from([0x3c,0x68,0x31,0x3e,0x83,0x4a,0x83,0x74,0x83,0x46,0x3c,0x2f,0x68,0x31,0x3e])); } // <h1>カフェ</h1>
  if (p === "/big") return html(big);
  if (p === "/deep") return html(deep);
  if (p === "/turnstile") return html(RICH('<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async></script>'));
  if (p === "/xr-google") return html(RICH(), { "X-Robots-Tag": "googlebot: noindex" });
  if (p === "/meta-bing") return html(RICH('<meta name="bingbot" content="noindex">'));
  if (p === "/nf") { res.writeHead(404, { "Content-Type": "text/html" }); return res.end(RICH()); }
  if (p === "/minified") return html("<!doctype html><html><body><h1>List</h1><ul>" + Array.from({ length: 35 }, (_, i) => `<li>item${i}</li><li>thing${i}</li>`).join("") + "</ul></body></html>");
  if (p === "/badcanon") return html(RICH('<link rel="canonical" href="https://%%siteurl%%/page">'));
  if (p === "/badgzip") { res.writeHead(200, { "Content-Type": "text/html", "Content-Encoding": "gzip" }); return res.end("not gzip at all"); }
  if (p === "/refresh") return html('<!doctype html><html><head><meta http-equiv="refresh" content="0; url=/rich"></head><body></body></html>');
  if (p === "/awswaf") { res.writeHead(202, { "Content-Type": "text/html" }); return res.end('<html><head><script>window.awsWafCookieDomainList = ["example.com"];</script><script src="/__challenge_abc/x/y/challenge.js"></script></head><body></body></html>'); }
  if (p === "/topbar-h1") return html(`<!doctype html><html><body><header><div><h1>RESERVATION CONFIRMED</h1></div></header><main><p class="big">Something Italian</p><h2>Made for sharing</h2><p>${para(60)}</p><h2>Menu</h2><p>${para(60)}</p></main></body></html>`);
  if (p === "/logo-h1") return html(`<!doctype html><html><body><h1><svg aria-label="News" role="img"><path d="M0 0"/></svg></h1><h2>World</h2><p>${para(60)}</p><h2>Asia</h2><p>${para(60)}</p></body></html>`);
  if (p === "/template-text") return html(RICH('').replace("</body>", '<div aria-hidden="true"><div>This is the area to introduce viewers to the context of this image. Briefly explain what it represents.</div><div>This is the area to introduce viewers to the context of this image.</div></div></body>'));
  if (p === "/pdf") { res.writeHead(200, { "Content-Type": "application/pdf" }); return res.end("%PDF-1.4"); }
  if (p === "/loop") { res.writeHead(302, { Location: "/loop2" }); return res.end(); }
  if (p === "/loop2") { res.writeHead(302, { Location: "/loop" }); return res.end(); }
  if (p === "/to-private") { res.writeHead(302, { Location: "http://169.254.169.254/latest/meta-data/" }); return res.end(); }
  if (p === "/maydate") return html(`<h1>Tips</h1><h2>One</h2><p>${para(60)} Top 10 may help you.</p>`);
  const ua = req.headers["user-agent"] || "";
  const F5 = '<html><head><title>Request Rejected</title></head><body>The requested URL was rejected. Please consult with your administrator.<br><br>Your support ID is: <123></body></html>';
  if (p === "/f5") return html(/OAI-SearchBot|meta-webindexer/.test(ua) ? RICH() : F5);
  if (p === "/f5all") return html(F5);
  if (p === "/slowfirst") return setTimeout(() => html(RICH()), /Googlebot|OAI-SearchBot|meta-webindexer/.test(ua) ? 0 : 2600);
  if (p === "/slowall") return setTimeout(() => html(RICH()), 2300);
  if (p === "/oai502") { if (/OAI-SearchBot/.test(ua)) { res.writeHead(502, { "Content-Type": "text/html" }); return res.end("<title>502: Bad gateway</title>"); } return html(RICH()); }
  if (p === "/badsitemap.xml") { res.writeHead(200, { "Content-Type": "application/xml" }); return res.end("<urlset><loc>" + " ".repeat(200000)); }
  if (p === "/xrt2") { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": ["bingbot: noindex", "noindex"] }); return res.end(RICH()); }
  if (p === "/snip2") return html(RICH('<meta name="robots" content="max-snippet:0"><meta name="googlebot" content="max-snippet:-1">'));
  if (p === "/expired") return html(RICH('<meta name="robots" content="unavailable_after: 2025-01-01">'));
  if (p === "/metastorm") return html("<meta http-equiv=refresh ".repeat(800) + "<h1>x</h1>");
  if (p === "/country") return html("<html><body><h1>Sorry</h1><p>This website is not available in your country.</p></body></html>");
  if (p === "/slowcrawler") return setTimeout(() => html(RICH()), /Googlebot|OAI-SearchBot|meta-webindexer/.test(ua) ? 12000 : 0);
  if (p === "/s415") { res.writeHead(415, { "Content-Type": "text/html" }); return res.end("<h1>Blocked</h1>"); }
  if (p === "/jsonly") return html(`<!doctype html><html><head><title>App</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>`);
  if (p === "/nested") return html(`<h1>Nested</h1><ul><li>Outer short<ul><li>${para(45)}</li></ul></li></ul>`);
  res.writeHead(404); res.end("nf");
});

const scanMod = require("../lib/scan.js");
let ipn = 0;
async function paste(url, html) {
  const r = await scanMod.handler({ httpMethod: "POST", body: JSON.stringify({ url, html }), queryStringParameters: {}, headers: { "client-ip": "edge" + ipn++ } });
  let body = {}; try { body = JSON.parse(r.body); } catch {}
  return { code: r.statusCode, d: body };
}
async function scan(url, qs = {}) {
  const t0 = Date.now();
  const r = await scanMod.handler({ queryStringParameters: { url, ...qs }, headers: { "client-ip": "edge" + ipn++ } });
  let body = {};
  try { body = JSON.parse(r.body); } catch {}
  return { code: r.statusCode, d: body, ms: Date.now() - t0 };
}
const G = (d) => (d.channels ? ["aio", "gemini", "chatgpt", "meta"].map((k) => d.channels[k].grade).join("") : "-");
let fails = 0;
const t = (name, got, exp) => { const ok = got === exp; if (!ok) fails++; console.log((ok ? "PASS" : "FAIL") + "  " + name.padEnd(58) + " got " + got + "  expected " + exp); };

server.listen(P, "0.0.0.0", async () => {
  let r0;
  // --- security: the live setting, private addresses refused ---
  delete process.env.BLISS_ALLOW_PRIVATE;
  for (const u of [H("/secret"), "localhost:" + P + "/secret", "http://2130706433:" + P + "/", "http://169.254.169.254/latest/meta-data/", "http://[::1]/", "http://[::ffff:127.0.0.1]/", "http://user:pw@example.com/", "file:///etc/passwd", "http://metadata/"]) {
    const r = await scan(u);
    t("refuses " + u.slice(0, 44), r.code + (r.d.page ? " LEAK" : ""), "400");
  }
  // Secure sites only: http:// is refused before anything is fetched
  r0 = await scan("http://example.com/");
  t("refuses http://example.com/ (https only)", r0.code + " " + (r0.d.error || "").includes("https://"), "400 true");
  const leak = await scan(H("/secret"));
  t("  no internal text in the answer", /SEKRET/.test(JSON.stringify(leak.d)), false);

  process.env.BLISS_ALLOW_PRIVATE = "1";
  let r;

  // --- stability ---
  r = await scan(H("/bomb"));
  t("decompression bomb: capped, no crash", r.code === 200 && r.d.page.htmlBytes <= 3000000, true);
  r = await scan(H("/slow"));
  t("slow body: stops at the 10 s request limit", r.ms < 13000, true);
  t("  says the site was too slow", r.code, 504);
  r = await scan(H("/big"));
  t("1.3 MB page with 20,000 paragraphs: under 4 s", r.ms < 4000, true);
  r = await scan(H("/deep"));
  t("3,000 nested elements: no crash", r.code, 200);
  r = await scan(H("/badgzip"));
  t("broken gzip: an error message, not a crash", r.code !== 500 && !!r.d.error, true);
  r = await scan(H("/loop"));
  t("redirect loop: page fails to load", r.d.channels && r.d.channels.chatgpt.blockers.find((b) => b.label === "Page loads").found, "More than 5 redirects");
  r = await scan(H("/badcanon"));
  t("broken canonical: graded, canonical warning fails", r.code + ":" + r.d.warnings.find((w) => w.label.includes("Canonical")).state, "200:fail");
  r = await scan(H("/topbar-h1"));
  t("main title only in the top bar: named and failed", r.d.fitness.checks[0].state + ":" + /RESERVATION CONFIRMED/.test(r.d.fitness.checks[0].found) + ":" + /top bar/.test(r.d.fitness.checks[0].fix), "fail:true:true");
  r = await scan(H("/logo-h1"));
  t("a logo title counts, by its label", r.d.page.outline[0].text + ":" + r.d.fitness.h1, "News:1");
  r = await scan(H("/"));
  t("homepage: titles still count, paragraphs and date are tips", r.d.page.isHomepage + ":" + r.d.channels.chatgpt.fitnessFailed + ":" + r.d.fixes.filter((f) => f.tip).map((f) => f.label).sort().join("|"),
    "true:1:A visible date|Paragraphs AI can quote");
  r = await scan(H("/template-text"));
  const tc = r.d.fitness.checks.find((c) => c.label === "No sample text from the template");
  t("sample text left from the template is found", tc.state + ":" + /^Found 2 times/.test(tc.found), "fail:true");
  t("  paragraph words are reported apart from all words", r.d.fitness.paraWords < r.d.page.rawWords, true);
  r = await scan("http://127.0.0.2:" + P + "/awswaf");
  t("blocked page: robots.txt still graded (partial result)", JSON.stringify(r.d.couldNotCheck && r.d.couldNotCheck.access), '{"aio":false,"gemini":false,"chatgpt":false,"meta":true}');
  t("  and the owner is offered the paste option", r.d.couldNotCheck.canPaste, true);
  r = await scan("http://127.0.0.1:1/");
  t("site that refuses to connect: paste option offered", r.d.canPaste, true);
  r = await paste(H("/not-served"), RICH());
  t("pasted page source is graded", r.code + ":" + r.d.page.pasted + ":" + G(r.d).replace(/[AB]/g, "ok"), "200:true:okokokok");
  t("  marked Likely, and says it was pasted", r.d.channels.chatgpt.confidence + ":" + /pasted/.test(r.d.channels.chatgpt.confidenceNote), "likely:true");
  t("  speed and compression are not checked, not failed", r.d.warnings.filter((w) => /Not checked/.test(w.found || "")).length, 3);
  r = await paste(H("/x"), "hello");
  t("pasting something that is not a page: a clear message", r.code + ":" + /page source/.test(r.d.error), "400:true");
  r = await paste(H("/x"), '<html><head><title>Just a moment...</title></head><body></body></html>');
  t("pasting a robot check page: a clear message", r.code + ":" + /robot check/.test(r.d.error), "400:true");
  r = await scan(H("/awswaf"));
  t("AWS WAF challenge (202): could not check, no grade", r.d.couldNotCheck && r.d.couldNotCheck.reason, "a robot check page");
  r = await scan(H("/pdf"));
  t("PDF: says it is not a web page", r.code + ":" + /PDF/.test(r.d.error || ""), "400:true");
  process.env.BLISS_ALLOW_PRIVATE = "";
  r = await scan(H("/to-private"));
  t("redirect to a private address is refused", r.code, 400);
  process.env.BLISS_ALLOW_PRIVATE = "1";

  // --- grading ---
  r = await scan("http://127.0.0.1:" + P + "/to-blocked");
  t("redirect to another host: that host's robots.txt is used", G(r.d).slice(0, 3), "EEE");
  r = await scan("http://127.0.0.3:" + P + "/rich");
  t("robots.txt error 500: not confirmed, not allowed", G(r.d), "????");
  r = await scan(H("/thai"));
  t("Thai page is not counted as empty", r.d.page && r.d.page.rawWords > 60, true);
  t("  Thai page: ChatGPT not failed on raw text", r.d.channels.chatgpt.blockers.find((b) => b.label.startsWith("Main text")).state, "pass");
  r = await scan(H("/japanese"));
  t("Japanese page is not counted as empty", r.d.page && r.d.page.rawWords > 60, true);
  r = await scan(H("/sjis"));
  t("Shift_JIS page decoded", r.d.page && r.d.page.outline[0] && r.d.page.outline[0].text, "カフェ");
  r = await scan(H("/turnstile"));
  t("Turnstile on a contact form: still graded", !!r.d.channels, true);
  r = await scan(H("/xr-google"));
  t("X-Robots-Tag googlebot: noindex hits Google only", G(r.d).replace(/[AB]/g, "ok"), "EEokok");
  r = await scan(H("/meta-bing"));
  t("bingbot noindex meta does not touch Google or ChatGPT", G(r.d).replace(/[AB]/g, "ok"), "okokokok");
  r = await scan(H("/nf"));
  t("404 page: every channel fails to load", G(r.d), "EEEE");
  r = await scan(H("/minified"));
  t("minified list: words not glued together", r.d.page.rawWords >= 70, true);
  r = await scan(H("/refresh"));
  t("meta refresh followed like a redirect", r.d.page.hops + ":" + G(r.d).replace(/[AB]/g, "ok"), "1:okokokok");
  r = await scan(H("/amp") + "?a=1&b=2");
  t("sitemap entry with &amp; is found", r.d.warnings.find((w) => w.label.includes("sitemap")).state, "pass");
  r = await scan(H("/maydate"));
  t("'Top 10 may help' is not a date", r.d.fitness.hasDate, false);
  r = await scan(H("/nested"));
  t("nested list item counted once", r.d.fitness.blocks, 2);
  t("  titles tile and outline agree", r.d.page.h1 + ":" + r.d.page.outline.filter((o) => o.level === 1).length, "1:1");
  r = await scan(H("/japanese"), { q1: "営業時間", q2: "メニュー", q3: "best coffee" });
  t("Japanese search terms are all answered", r.d.searchTerms.length + ":" + r.d.searchTerms.filter((s) => s.verdict === "unreadable").length, "3:0");

  r = await scan(H("/jsonly"), { q1: "is there a free plan", q2: "pricing for small teams" });
  t("page text we cannot see: searches say could not check", r.d.searchTerms.map((s) => s.verdict).join(","), "unseen,unseen");

  // A firewall that refuses our tool and Googlebot, but serves the other crawlers.
  r = await scan(H("/f5"));
  t("F5 firewall page is a refusal, crawler pages are graded", (r.d.page && r.d.page.toolRefused) + ":" + (r.d.channels ? G(r.d).slice(2) : "none"), "a robot check page:BB");
  t("  Google graded on the others' page, marked best estimate", r.d.channels.aio.confidence + ":" + r.d.channels.chatgpt.confidence, "likely:confirmed");
  t("  Googlebot refusal raised as a question", r.d.warnings.some((w) => w.label === "Googlebot gets the page" && w.state === "unknown"), true);
  r = await scan(H("/f5all"));
  t("F5 page for everyone: could not check", r.d.couldNotCheck && r.d.couldNotCheck.reason, "a robot check page");
  // A page that loads for us but errors for OpenAI's crawler.
  r = await scan(H("/oai502"));
  t("error only for OAI-SearchBot: grade kept (B: not in sitemap)", G(r.d) + ":" + r.d.channels.chatgpt.reason, "BBBB:Nothing blocks it. To reach A, ask your web developer to add the page to sitemap.xml and switch on compression.");
  t("  and raised as a question", (r.d.fixes.find((f) => f.label === "OAI-SearchBot gets the page") || {}).state, "unknown");

  // Server speed is the middle of all requests, not the first one alone.
  r = await scan(H("/slowfirst"));
  const sp1 = r.d.warnings.find((w) => w.label === "Server answers fast");
  t("one slow first answer does not fail the speed check", sp1.state + ":" + /middle value of 4 tries/.test(sp1.found), "pass:true");
  r = await scan(H("/slowall"));
  t("a server slow every time still fails", r.d.warnings.find((w) => w.label === "Server answers fast").state, "fail");

  // --- review of 28 September 2026 ---
  r = await scan("http://127.0.0.4:" + P + "/rich");
  t("robots: Crawl-delay does not end a group (Googlebot blocked)", G(r.d).slice(0, 2), "EE");
  r = await scan("http://127.0.0.5:" + P + "/rich");
  t("robots: a group naming Googlebot with no rules allows it", r.d.robots.allowed.googlebot + ":" + r.d.robots.allowed.oai, "true:false");
  r = await scan("http://127.0.0.6:" + P + "/rich");
  t("robots: Google-Extended blocked stops Gemini only", /^[AB]E$/.test(G(r.d).slice(0, 2)), true);
  let t0 = Date.now();
  r = await scan("http://127.0.0.7:" + P + "/rich");
  t("robots: 2,000 wildcard rules read in under 2 s", Date.now() - t0 < 2000 && !!r.d.channels, true);
  r = await scan("http://127.0.0.8:" + P + "/rich");
  t("robots: 'Disalow' typo read as Google reads it", G(r.d).slice(0, 2), "EE");
  t0 = Date.now();
  r = await scan("http://127.0.0.9:" + P + "/rich");
  t("sitemap: an unclosed <loc> does not stall the check", Date.now() - t0 < 3000, true);
  r = await scan(H("/xrt2"));
  t("two X-Robots-Tag headers are read apart (general noindex counts)", G(r.d).slice(0, 3), "EEE");
  r = await scan(H("/snip2"));
  t("max-snippet set twice: the more restrictive wins", G(r.d)[0], "E");
  r = await scan(H("/expired"));
  t("unavailable_after in the past stops Google", G(r.d).slice(0, 2), "EE");
  t("  and the reason says unavailable_after, not noindex", /unavailable_after/.test(r.d.channels.aio.reason), true);
  r = await scan(H("/s415"));
  t("a 415 from a firewall: could not check, not E", r.d.couldNotCheck && r.d.couldNotCheck.reason, "error 415");
  t0 = Date.now();
  r = await scan(H("/metastorm"));
  t("800 unclosed meta tags do not stall the check", Date.now() - t0 < 2000, true);
  // Pages built to make HTML parsing slow (review of 28 September 2026).
  const hostile = {
    "8,000 unclosed <b> tags": "<!doctype html><html><body><h1>Hi</h1>" + "<b>".repeat(8000) + "x</body></html>",
    "5,000 x <B>x</b> (mixed case)": "<!doctype html><html><body><h1>Hi</h1>" + "<B>x</b>".repeat(5000) + "</body></html>",
    "4,000 unclosed <button> tags": "<!doctype html><html><body><h1>Hi</h1>" + "<button>".repeat(4000) + "x</body></html>",
    "one unclosed <div> with 60,000 children": "<!doctype html><html><body><h1>Hi</h1><div>" + "<p>a b</p>".repeat(60000),
    "3 MB of short paragraphs": "<!doctype html><html><body><h1>Hi</h1>" + "<p>word word</p>".repeat(190000),
  };
  for (const [name, html] of Object.entries(hostile)) {
    t0 = Date.now();
    r = await paste(H("/rich"), html);
    t("hostile HTML, " + name + ": done in under 5 s", r.code + ":" + (Date.now() - t0 < 5000), "200:true");
  }
  r = await paste(H("/rich"), "null");
  t("pasted body that is not a page: plain error", r.code, 400);
  const nullBody = await scanMod.handler({ httpMethod: "POST", body: "null", headers: { "client-ip": "n" + Math.random() } });
  t("POST body null: 400, no crash", nullBody.statusCode, 400);
  r = await scan(H("/country"));
  t("country block page: could not check, not graded", r.d.couldNotCheck && r.d.couldNotCheck.reason, "a page that blocks visitors from our country");
  r = await scan(H("/oai502"));
  t("server error for one crawler: said as a server error", /Your server had an error \(502\)/.test((r.d.fixes.find((f) => f.label === "OAI-SearchBot gets the page") || {}).found), true);
  r = await scan(H("/slowall"));
  t("slow server: shown, not graded", r.d.warnings.find((w) => w.label === "Server answers fast").graded + ":" + G(r.d), "false:BBBB");
  r = await scan(H("/slowcrawler"));
  t("crawler that times out: no firewall question", r.d.fixes.some((f) => / gets the page$/.test(f.label)), false);
  t("  and the grade does not become ?", G(r.d).includes("?"), false);
  t("  graded on our page, marked best estimate", r.d.channels.chatgpt.confidence, "likely");
  for (const u of ["http://172.16.0.1/", "http://172.31.255.255/", "http://[fec0::1]/", "http://[2001::1]/", "http://[3fff::1]/", "http://[5f00::1]/", "http://[100::1]/", "http://localhost./", "http://127.0.0.1.:80/"]) {
    delete process.env.BLISS_ALLOW_PRIVATE;
    t("refuses " + u, scanMod._urlProblem(u) !== null, true);
    process.env.BLISS_ALLOW_PRIVATE = "1";
  }

  server.close();
  console.log(fails ? "\n" + fails + " FAILED" : "\nAll edge checks passed.");
  process.exit(fails ? 1 : 0);
});
