// Checks public/tools/ai-readiness/glossary.js (the hover and tap explanations):
//   1. every check the engine can report has an explanation,
//   2. every explanation has a title and 3 parts in English and in Indonesian.
const fs = require("fs"), path = require("path");
const g = fs.readFileSync(path.join(__dirname, "../../public/tools/ai-readiness/glossary.js"), "utf8");
const scan = fs.readFileSync(path.join(__dirname, "../lib/scan.js"), "utf8");
let fails = 0;
const check = (name, ok, extra) => { if (!ok) fails++; console.log((ok ? "PASS  " : "FAIL  ") + name + (extra ? "  " + extra : "")); };

// Checks shown in the report (the search-term checks are not shown on this page).
const hidden = new Set(["A section answers this search", "Answer comes first", "Sits high on the page", "A date sits nearby"]);
const labels = new Set();
for (const m of scan.matchAll(/(?:ok|bad|notChecked|robotsCheck)\("([^"]+)"/g)) labels.add(m[1]);
for (const m of scan.matchAll(/label: "([^"]+)"/g)) labels.add(m[1]);
const have = new Set([...g.matchAll(/\bC\('([^']+)'/g)].map((m) => m[1]));
const missing = [...labels].filter((l) => !hidden.has(l) && !have.has(l));
check("every check in lib/scan.js has an explanation (" + labels.size + " found)", missing.length === 0, missing.join(", "));

// Each K(...) or C(...) call holds two arrays of 4 texts.
let entries = 0, bad = [];
for (const m of g.matchAll(/\n  [KC]\(('[^']+')[^\n]*\n((?:    .*\n)+?)    \[([\s\S]*?)\]\);/g)) {
  entries++;
  const body = m[0];
  const arrays = body.match(/\[\s*'[\s\S]*?'\s*\]/g) || [];
  const parts = arrays.map((a) => (a.match(/'(?:[^'\\]|\\.)*'/g) || []).length);
  if (parts.length < 2 || parts.slice(-2).some((n) => n !== 4)) bad.push(m[1]);
}
check("every explanation has 4 texts in both languages (" + entries + " entries)", bad.length === 0 && entries > 60, bad.join(", "));
check("no informal Indonesian words", !/\b(kalau|supaya|nggak|kamu)\b/i.test(g));
console.log(fails ? "\n" + fails + " glossary checks failed." : "\nAll glossary checks passed.");
process.exit(fails ? 1 : 0);
