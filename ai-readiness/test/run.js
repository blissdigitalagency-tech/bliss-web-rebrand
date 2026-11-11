// The tests use local servers, which the live tool refuses on purpose.
process.env.BLISS_ALLOW_PRIVATE = '1';
const h = require('../lib/scan.js').handler;
let ip = 0;
const scan = async (url, qs = {}) => {
  const res = await h({ queryStringParameters: { url, ...qs }, headers: { 'client-ip': 'ip' + (ip++) } });
  return JSON.parse(res.body);
};
const G = d => ['aio','gemini','chatgpt','meta'].map(k => d.channels[k].grade).join('');
let fails = 0, passes = 0;
const t = (name, got, exp) => { const ok = got === exp; if (!ok) fails++; else passes++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name.padEnd(46) + ' got ' + got + '  expected ' + exp); };

(async () => {
  await fetch('http://127.0.0.1:8899/mode/open');

  const rich = await scan('http://127.0.0.1:8899/rich.html');
  t('clean server-rendered page', G(rich), 'AAAA');
  t('  raw words detected', rich.page.rawWords > 250, true);
  t('  sitemap warning clears', rich.warnings.find(w=>w.label.includes('sitemap')).state, 'pass');

  const shell = await scan('http://127.0.0.1:8899/shell.html');
  t('client-rendered shell caps ChatGPT and Meta AI at D', G(shell), 'BBDD');
  t('  rendered marked unverified', shell.page.renderedUnverified, true);
  t('  ChatGPT D rests on our measure', shell.channels.chatgpt.basis, 'measure');

  const blocked = await scan('http://127.0.0.1:8899/blocked.html');
  t('max-snippet Ds Google AIO only', G(blocked), 'DAAA');

  await fetch('http://127.0.0.1:8899/mode/oai');
  const oai = await scan('http://127.0.0.1:8899/rich.html');
  t('grouped UA block stops ChatGPT only', G(oai), 'AAEA');
  await fetch('http://127.0.0.1:8899/mode/open');

  const redir = await scan('http://127.0.0.1:8899/redir');
  t('redirect followed, hop counted', redir.page.hops, 1);
  t('  redirect raises a warning', redir.warnings.find(w=>w.label.includes('redirect')).state, 'fail');

  const q = await scan('http://127.0.0.1:8899/rich.html', {
    q1: 'how long does a google ads audit take',
    q2: 'what does a google ads audit include',
    q3: 'do you offer white label reseller pricing'
  });
  t('search term with a matching section', q.searchTerms[0].verdict, 'ready');
  t('  matched the right heading', /how long/i.test(q.searchTerms[0].matchedHeading), true);
  t('search term 2 matches too', q.searchTerms[1].verdict !== 'not_addressed', true);
  t('search term with no section', q.searchTerms[2].verdict, 'not_addressed');

  const fitClean = await scan('http://127.0.0.1:8899/rich.html');
  t('clean page has no fitness issues', fitClean.fitness.failed, 0);
  t('  passages counted', fitClean.fitness.passages >= 3, true);

  const frag = await scan('http://127.0.0.1:8899/fragments.html');
  t('fragmented page caps at D, never E', G(frag), 'DDDD');
  t('  D rests on our measure, not a platform rule', frag.channels.aio.basis, 'measure');
  t('  longest block reported', frag.fitness.longestBlockWords < 40, true);
  t('  no platform blocker failed', frag.channels.aio.blockers.every(b=>b.state!=='fail'), true);
  t('  block spread returned', frag.fitness.blockSpread.length, 5);

  const nohead = await scan('http://127.0.0.1:8899/nohead.html');
  t('long text, no headings, no date', G(nohead), 'DDDD');
  t('  fitness issues counted', nohead.fitness.failed >= 3, true);

  const wix = await scan('http://127.0.0.1:8899/wixlike.html');
  t('template-heavy page, no platform rule broken', G(wix), 'DDDD');
  t('  raw text is not thin', wix.page.rawWords > 400, true);
  t('  no block reaches passage length', wix.fitness.passages, 0);
  t('  grade rests on our measure', wix.channels.chatgpt.basis, 'measure');

  await fetch('http://127.0.0.1:8899/mode/meta');
  const metaBlk = await scan('http://127.0.0.1:8899/rich.html');
  t('meta-webindexer block stops Meta AI only', G(metaBlk), 'AAAE');
  t('  that E rests on a platform rule', metaBlk.channels.meta.basis, 'platform');
  await fetch('http://127.0.0.1:8899/mode/open');

  const blk2 = await scan('http://127.0.0.1:8899/blocked.html');
  t('  every fitness check marked measure', blk2.fitness.checks.every(c=>c.src==='measure'), true);

  // Nike: a page every AI tool cites, used as a reality check.
  const nike = await scan('http://localhost:8903/');
  // A homepage is graded on access rules only (decided 27 Sep 2026); page checks become tips.
  t('nike.com homepage grades (a missed tip keeps it at B)', ['aio','gemini','chatgpt','meta'].map(k => nike.channels[k].grade).join(''), 'BBBB');
  t('  the paragraph check is a tip, not counted', nike.fixes.filter(f => f.tip).map(f => f.label).join('|'), 'Paragraphs AI can quote');
  t('  only one fix, and it is the paragraph one', nike.fixes.map(f => f.label).join('|'), 'Paragraphs AI can quote');
  t('  sitemap found in file 41 of 64', nike.warnings.find(w => w.label.includes('sitemap')).state, 'pass');
  t('  homepage redirect not counted', nike.warnings.find(w => w.label.includes('redirect')).state, 'pass');
  t('  footer headings not counted as sections', nike.fitness.subheads, 15);

  // Bot protection: never grade what we could not see.
  const ref = await scan('http://127.0.0.1:8899/refused');
  t('403 from bot protection gives no grade', !!ref.couldNotCheck && !ref.channels, true);
  t('  reason says which error', ref.couldNotCheck.reason, 'error 403');
  const chal = await scan('http://127.0.0.1:8899/challenge');
  t('Cloudflare challenge page gives no grade', chal.couldNotCheck && chal.couldNotCheck.reason, 'a robot check page');
  await fetch('http://127.0.0.1:8899/mode/refuse');
  const rr = await scan('http://127.0.0.1:8899/rich.html');
  t('refused robots.txt gives no grade', rr.couldNotCheck && rr.couldNotCheck.what, 'robots.txt');
  await fetch('http://127.0.0.1:8899/mode/open');
  const nf = await scan('http://127.0.0.1:8899/does-not-exist');
  t('a real 404 is still graded E', ['aio','gemini'].map(k => nf.channels[k].grade).join(''), 'EE');

  // Agoda: empty for people and AI crawlers, full for Googlebot (measured live from Terminal).
  await fetch('http://127.0.0.1:8904/uas-reset');
  const ag = await scan('http://localhost:8904/');
  t('agoda.com: each channel graded on its own crawler page', ['aio','gemini','chatgpt','meta'].map(k => ag.channels[k].grade).join(''), 'AADD');
  t('  Google graded on the page sent to Googlebot', ag.channels.aio.measuredOn, 'Googlebot');
  t('  ChatGPT D is now confirmed, not a guess', ag.channels.chatgpt.basis, 'measure');
  t('  the fix names the crawlers to add', /already sends Googlebot a full page, but sends OAI-SearchBot/.test(ag.fixes[0].fix), true);
  t('  one fix, for the raw-reading channels', ag.fixes.length + ':' + ag.fixes[0].channels.join('|'), '1:ChatGPT|Meta AI');
  t('  ChatGPT D is "confirmed"', ag.channels.chatgpt.confidence, 'confirmed');
  t('  Meta AI D is "likely": its crawler was never tested for JavaScript', ag.channels.meta.confidence, 'likely');
  t('  Google grade is "confirmed" on the Googlebot page', ag.channels.aio.confidence, 'confirmed');
  t('  huge sitemap is "not confirmed", not "missing"', ag.warnings.find(w => w.label.includes('sitemap')).state, 'unknown');
  const uas = await (await fetch('http://127.0.0.1:8904/uas')).json();
  t('  every crawler-named request carries our own name', uas.length > 0 && uas.every(u => u.includes('BlissAccessCheck')), true);

  // A site that refuses anything named like a crawler: we still do not guess.
  const rc = await scan('http://127.0.0.1:8904/refuses-crawlers');
  t('crawler requests refused: raw channels stay "?"', ['aio','gemini','chatgpt','meta'].map(k => rc.channels[k].grade).join(''), 'BB??');

  // data-nosnippet: fine print is fine; hiding a real paragraph is not.
  const fp = await scan('http://127.0.0.1:8899/fineprint.html');
  t('data-nosnippet on a copyright line keeps an A', fp.channels.aio.grade, 'A');
  const hc = await scan('http://127.0.0.1:8899/hidden-content.html');
  t('data-nosnippet on a 90-word paragraph is a D', hc.channels.aio.grade, 'D');
  const pn = await scan('http://127.0.0.1:8899/p-nosnippet.html');
  const dnCheck = [...pn.channels.aio.blockers, ...pn.channels.aio.limits].find((c) => c.label === 'No data-nosnippet on main text');
  t('  data-nosnippet on a <p> is ignored, as Google does', dnCheck.state + ':' + dnCheck.found, 'pass:0 elements');

  const R = require('../lib/scan.js')._DATE_RE;
  const dateYes = ['Updated September 2026','Diperbarui 5 Agustus 2026','26 Sep 2026','September 26, 2026','2026-09-26','3 Mei 2026','26/09/2026'];
  const dateNo  = ['Marketing 2026 plan','Our design 2026 range','Open 7 days'];
  t('dates in English and Indonesian are found', dateYes.every(x => R.test(x)), true);
  t('  words that only look like months are not', dateNo.some(x => R.test(x)), false);

  console.log('\n' + (fails === 0 ? 'All ' + passes + ' checks passed.' : fails + ' FAILED'));
  process.exit(fails ? 1 : 0);
})();
