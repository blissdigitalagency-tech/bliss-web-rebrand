// Checks the Vercel entry point (api/scan.mjs) the way Vercel calls it: with
// web-standard Request objects. Run with: node test/vercel.mjs
process.env.BLISS_ALLOW_PRIVATE = "1";
// Start the fixture server first: node test/fixtures.js (as for test/run.js).
const { GET, POST } = await import("../api/scan.mjs");
let fails = 0;
const check = (name, got, want) => { const ok = got === want; if (!ok) fails++; console.log((ok ? "PASS  " : "FAIL  ") + name.padEnd(58) + " got " + got + "  expected " + want); };
const base = "https://www.blissdigital.id/tools/ai-readiness/api/scan";

let r = await GET(new Request(base + "?url=" + encodeURIComponent("not a url"), { headers: { "x-real-ip": "1.1.1.1" } }));
check("bad address gives 400", r.status, 400);
check("answer is JSON", r.headers.get("content-type").startsWith("application/json"), true);
check("answer is never cached", r.headers.get("cache-control"), "no-store");
check("error text comes through", typeof (await r.json()).error, "string");

r = await GET(new Request(base + "?url=" + encodeURIComponent("http://127.0.0.1:8899/rich.html"), { headers: { "x-real-ip": "2.2.2.2" } }));
const d = await r.json();
check("fixture page is checked (200)", r.status, 200);
check("report has four channels", Object.keys(d.channels || {}).length, 4);

r = await GET(new Request(base + "?url=" + encodeURIComponent("http://127.0.0.1:8899/rich.html"), { headers: { "x-real-ip": "2.2.2.2" } }));
check("same visitor, same page again: 429", r.status, 429);
r = await GET(new Request(base + "?url=" + encodeURIComponent("http://127.0.0.1:8899/rich.html"), { headers: { "x-forwarded-for": "3.3.3.3, 10.0.0.1" } }));
check("other visitor (x-forwarded-for) is not blocked", r.status, 200);

const html = "<!doctype html><html><head><title>Paste test page</title></head><body><h1>Paste test</h1><p>" + "word ".repeat(120) + "</p></body></html>";
r = await POST(new Request(base, { method: "POST", headers: { "content-type": "application/json", "x-real-ip": "4.4.4.4" }, body: JSON.stringify({ url: "http://127.0.0.1:8899/rich.html", html }) }));
const p = await r.json();
check("pasted page is checked (200)", r.status, 200);
check("report says it was pasted", p.page && p.page.pasted, true);

r = await POST(new Request(base, { method: "POST", headers: { "content-type": "application/json", "x-real-ip": "5.5.5.5" }, body: "{not json" }));
check("broken POST body gives 400", r.status, 400);

console.log(fails ? "\n" + fails + " Vercel checks failed." : "\nAll Vercel checks passed.");
process.exit(fails ? 1 : 0);
