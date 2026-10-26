// Scroll and animation behaviour, ported from the prototype's plain scripts
// (site.js, tagline.js, services.js, why.js). Each init function works on
// markup rendered by a Server Component and returns a cleanup, so it can run
// from a useEffect and stop cleanly when the page changes.

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Every page: navbar, back to top, anchor glide, reveals, counters ---------- */

export function initSite(): () => void {
  const ac = new AbortController();
  const { signal } = ac;
  const cleanups: (() => void)[] = [];
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  const toTop = document.querySelector<HTMLElement>("[data-to-top]");
  const reduceMotion = reduced();

  // Navbar fades to frosted as you scroll; back-to-top shows after one screen
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      // Pages without the white hero keep the bar solid from the top
      const solid = !document.querySelector(".hero");
      if (nav) nav.style.setProperty("--p", solid ? "1" : Math.min(1, Math.max(0, y / 120)).toFixed(3));
      toTop?.classList.toggle("is-shown", y > window.innerHeight);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true, signal });
  onScroll();

  // In-page links glide to their section with an eased scroll instead of the
  // browser's quick jump. Scrolling with the mouse or a finger stops the glide.
  let glide = 0;
  const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  function glideTo(target: HTMLElement, hash: string) {
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const to = target.id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY - margin;
    const from = window.scrollY;
    const dist = to - from;
    history.pushState(history.state, "", hash);
    if (reduceMotion || Math.abs(dist) < 2) {
      window.scrollTo({ top: to, behavior: "instant" });
      return;
    }
    const duration = Math.min(1400, Math.max(700, 500 + Math.abs(dist) * 0.12));
    const start = performance.now();
    const id = ++glide;
    const stop = () => { glide++; };
    window.addEventListener("wheel", stop, { once: true, passive: true });
    window.addEventListener("touchstart", stop, { once: true, passive: true });
    const step = (now: number) => {
      if (id !== glide) return;
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo({ top: from + dist * easeInOut(t), behavior: "instant" });
      if (t < 1) requestAnimationFrame(step);
      else {
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchstart", stop);
      }
    };
    requestAnimationFrame(step);
  }
  document.addEventListener(
    "click",
    (e) => {
      const a = (e.target as HTMLElement).closest?.("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.getAttribute("href")!, location.href);
      if (url.pathname !== location.pathname || !url.hash) return; // another page: Next handles it
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      glideTo(target, url.hash);
    },
    { signal },
  );

  // Entrance and exit for [data-reveal] elements. Elements rise in when they
  // enter the screen and drift up and out when they leave through the top.
  if (!reduceMotion) {
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target;
          if (e.isIntersecting) {
            el.classList.add("is-in");
            el.classList.remove("is-above");
          } else {
            el.classList.remove("is-in");
            el.classList.toggle("is-above", e.boundingClientRect.top < 0);
          }
        });
      },
      { rootMargin: "-6% 0px -6% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
    cleanups.push(() => reveal.disconnect());
  }

  // Numbers: each digit flickers through random digits and settles on the
  // real one, left to right ("3+", "50M+", ...)
  const counters = [...document.querySelectorAll<HTMLElement>("[data-count]")];
  if (counters.length && !reduceMotion) {
    const timers: number[] = [];
    const scramble = (el: HTMLElement) => {
      const final = el.dataset.count || el.textContent || "";
      const start = performance.now();
      const SETTLE = 900; // when the first digit lands (ms)
      const STAGGER = 180; // each next digit lands this much later
      const timer = window.setInterval(() => {
        const t = performance.now() - start;
        let digit = 0;
        let done = true;
        el.textContent = [...final]
          .map((ch) => {
            if (!/\d/.test(ch)) return ch;
            const lands = SETTLE + STAGGER * digit++;
            if (t >= lands) return ch;
            done = false;
            return String(Math.floor(Math.random() * 10));
          })
          .join("");
        if (done) {
          clearInterval(timer);
          el.textContent = final;
        }
      }, 50);
      timers.push(timer);
    };
    const seen = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          seen.unobserve(e.target);
          scramble(e.target as HTMLElement);
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((el) => seen.observe(el));
    cleanups.push(() => {
      seen.disconnect();
      timers.forEach(clearInterval);
      counters.forEach((el) => { if (el.dataset.count) el.textContent = el.dataset.count; });
    });
  }

  return () => {
    ac.abort();
    cleanups.forEach((c) => c());
  };
}

/* ---------- Homepage hero ---------- */

export function initHero(hero: HTMLElement): () => void {
  const ac = new AbortController();
  let alive = true;
  const reduceMotion = reduced();
  const content = hero.querySelector<HTMLElement>(".hero__content");

  // The collage is drawn at 620px wide; scale it to the space it has
  const visual = hero.querySelector<HTMLElement>(".hero__visual");
  const collage = visual?.querySelector<HTMLElement>(".hv");
  let ro: ResizeObserver | undefined;
  if (visual && collage) {
    ro = new ResizeObserver(() => collage.style.setProperty("--s", (visual.clientWidth / 620).toFixed(4)));
    ro.observe(visual);
  }

  // Intro: wait for the fonts so words don't swap mid-animation
  const start = () => {
    if (!alive || hero.classList.contains("is-loaded")) return;
    hero.classList.add("is-loaded");
    setTimeout(() => alive && hero.classList.add("is-ready"), 2200);
  };
  document.fonts.ready.then(() => requestAnimationFrame(start));
  const fallback = setTimeout(start, 1500); // don't wait forever on a slow font

  // Leaving the hero: content drifts up and fades
  let ticking = false;
  const onScroll = () => {
    if (ticking || reduceMotion || !content) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const hx = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.75)));
      content.style.setProperty("--hx", hx.toFixed(3));
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true, signal: ac.signal });
  onScroll();

  // Chart and website score: after the intro, each drains and fills again
  // every few seconds, out of step, paused while the hero is off screen
  let io: IntersectionObserver | undefined;
  let readyTimer: number | undefined;
  if (!reduceMotion) {
    const countTo = (el: Element, from: number, to: number, ms: number, format: (n: number) => string) => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / ms);
        el.textContent = format(Math.round(from + (to - from) * easeOut(p)));
        if (p < 1 && alive) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const loops = [
      { card: hero.querySelector(".hv-stats"), num: hero.querySelector(".stats__num"), value: 62, format: (n: number) => "+" + n + "%", offset: 0 },
      { card: hero.querySelector(".hv-site"), num: hero.querySelector(".ring b"), value: 98, format: (n: number) => String(n), offset: 1800 },
    ].filter((l) => l.card && l.num);
    const HOLD = 3600;
    const DRAIN = 450; // matches the .is-reset transition
    const GROW = 1200;
    let visible = true;
    io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(hero);
    const run = async (l: (typeof loops)[number]) => {
      await wait(l.offset);
      while (alive) {
        await wait(HOLD);
        if (!alive) return;
        if (!visible || document.hidden) continue;
        l.card!.classList.add("is-reset");
        countTo(l.num!, l.value, 0, DRAIN, l.format);
        await wait(DRAIN + 150);
        l.card!.classList.remove("is-reset");
        countTo(l.num!, 0, l.value, GROW, l.format);
        await wait(GROW);
      }
    };
    readyTimer = window.setInterval(() => {
      if (!hero.classList.contains("is-ready")) return;
      clearInterval(readyTimer);
      loops.forEach(run);
    }, 200);
  }

  return () => {
    alive = false;
    ac.abort();
    ro?.disconnect();
    io?.disconnect();
    clearTimeout(fallback);
    clearInterval(readyTimer);
  };
}

/* ---------- Scroll-pinned tagline ---------- */

export function initTagline(track: HTMLElement): () => void {
  const ac = new AbortController();
  const stage = track.querySelector<HTMLElement>(".tagline__stage")!;
  const lines = [...track.querySelectorAll<HTMLElement>(".tagline__line")];
  const bg = track.querySelector<HTMLCanvasElement>("canvas.silk");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Line 1 arrives while the section scrolls into view; the others while it is pinned
  const windows: ([number, number] | null)[] = [null, [0.04, 0.42], [0.46, 0.84]];

  let ticking = false;
  function update() {
    ticking = false;
    if (reduceMotion.matches) {
      lines.forEach((l) => l.style.setProperty("--e", "1"));
      return;
    }
    const r = track.getBoundingClientRect();
    const vh = window.innerHeight;
    const entry = clamp(1 - r.top / vh);
    const pinned = clamp(-r.top / (r.height - vh));
    lines.forEach((line, i) => {
      const w = windows[i];
      const x = w ? clamp((pinned - w[0]) / (w[1] - w[0])) : entry;
      line.style.setProperty("--e", easeOut(x).toFixed(4));
    });
    stage.style.setProperty("--progress", pinned.toFixed(4));
    if (bg) bg.dataset.drift = (entry + pinned * 2).toFixed(4);
  }
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true, signal: ac.signal });
  window.addEventListener("resize", onScroll, { signal: ac.signal });
  reduceMotion.addEventListener("change", update, { signal: ac.signal });
  update();
  return () => ac.abort();
}

/* ---------- Homepage services: stacking cards and the Google Ads tabs ---------- */

export function initServices(section: HTMLElement): () => void {
  const ac = new AbortController();
  const { signal } = ac;
  const cards = [...section.querySelectorAll<HTMLElement>("[data-svc]")];
  const rail = [...section.querySelectorAll<HTMLButtonElement>("[data-rail]")];
  const wide = window.matchMedia("(min-width: 901px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observers: ResizeObserver[] = [];

  // Scroll windows (0–1 of the pinned stretch) in which cards 2 and 3 slide in
  const windows = cards.map((_, i) => (i === 0 ? null : [0.06 + (i - 1) * 0.5, 0.42 + (i - 1) * 0.5]));
  // Where each card is fully in front, for the rail buttons
  const stops = cards.map((_, i) => (i === 0 ? 0 : windows[i]![1] + 0.02));

  let stacking = false;
  let ticking = false;

  // The stage pins once the section top reaches --stage-top, then stays for
  // 160svh of scrolling (the extra height in the CSS)
  const stageTop = () => parseFloat(section.style.getPropertyValue("--stage-top")) || 0;
  const travel = () => window.innerHeight * 1.6;
  const progress = () => clamp((stageTop() - section.getBoundingClientRect().top) / travel());

  function setActive(index: number) {
    rail.forEach((b, i) => {
      b.classList.toggle("is-active", i === index);
      b.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }

  // All cards share one height: what the tallest card's content needs. If the
  // screen is too short for heading and card, the stage pins higher so the top
  // of the heading tucks under the navbar. Only on very short screens does the
  // card get shorter (and its text a touch smaller).
  const stage = section.querySelector<HTMLElement>(".services__stage")!;
  const stack = section.querySelector<HTMLElement>(".services__stack")!;
  const NAV = 88;
  const PEEK = 48;
  function contentHeight(card: HTMLElement) {
    const text = card.querySelector<HTMLElement>(".svc__text")!;
    const top = text.getBoundingClientRect().top;
    const bottom = Math.max(...[...text.children].map((c) => c.getBoundingClientRect().bottom));
    return bottom - top;
  }
  function fitToScreen() {
    if (!stacking) {
      section.classList.remove("services--tucked");
      section.style.removeProperty("--stage-h");
      section.style.removeProperty("--stage-top");
      stack.style.removeProperty("--card-h");
      cards.forEach((c) => c.style.removeProperty("--tz"));
      return;
    }
    const vh = window.innerHeight;
    cards.forEach((c) => c.style.setProperty("--tz", "1"));
    const pad = parseFloat(getComputedStyle(cards[0]).paddingTop) * 2;
    const needed = Math.ceil(Math.max(...cards.map(contentHeight)) + pad);
    const cardH = Math.min(needed, vh - NAV - 24 - PEEK - 16);
    stack.style.setProperty("--card-h", cardH + "px");
    cards.forEach((card) => {
      card.style.setProperty("--tz", Math.min(1, (cardH - pad) / contentHeight(card)).toFixed(3));
    });
    const h = stage.offsetHeight;
    const top = Math.min(0, vh - h);
    section.style.setProperty("--stage-h", h + "px");
    section.style.setProperty("--stage-top", top + "px");
    section.classList.toggle("services--tucked", top < -40);
    section.style.setProperty("--rail-top", stack.offsetTop + "px");
  }

  function update() {
    ticking = false;
    if (!stacking) return;
    const p = progress();
    const e = cards.map((_, i) => (i === 0 ? 1 : easeOut(clamp((p - windows[i]![0]) / (windows[i]![1] - windows[i]![0])))));
    cards.forEach((card, i) => {
      const depth = e.slice(i + 1).reduce((a, b) => a + b, 0);
      card.style.setProperty("--e", e[i].toFixed(4));
      card.style.setProperty("--d", depth.toFixed(4));
    });
    setActive(e.filter((v) => v > 0.5).length - 1);
  }

  function setMode() {
    stacking = wide.matches && !reduceMotion.matches;
    section.classList.toggle("services--stack", stacking);
    if (!stacking) {
      cards.forEach((c) => {
        c.style.removeProperty("--e");
        c.style.removeProperty("--d");
      });
      setActive(0);
    }
    fitToScreen();
    update();
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true, signal });
  window.addEventListener("resize", () => { fitToScreen(); update(); }, { signal });
  document.fonts.ready.then(() => { if (!signal.aborted) fitToScreen(); });
  wide.addEventListener("change", setMode, { signal });
  reduceMotion.addEventListener("change", setMode, { signal });
  setMode();

  // Rail: jump to a card
  rail.forEach((button, i) => {
    button.addEventListener("click", () => {
      if (!stacking) {
        cards[i].scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      const pinStart = section.getBoundingClientRect().top + window.scrollY - stageTop();
      window.scrollTo({ top: pinStart + stops[i] * travel(), behavior: "smooth" });
    }, { signal });
  });

  // Google Ads tabs. Arrow keys move between tabs. All panels share one
  // space, so the card never changes size; the old panel fades out as the new
  // one fades in. The sliding pill is rendered in the markup.
  section.querySelectorAll<HTMLElement>('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const pill = list.querySelector<HTMLElement>(".svc__tabs__pill")!;
    const movePill = (instant: boolean) => {
      const tab = tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0];
      pill.classList.toggle("is-instant", instant);
      pill.style.setProperty("--pill-x", tab.offsetLeft + "px");
      pill.style.setProperty("--pill-w", tab.offsetWidth + "px");
    };
    const ro = new ResizeObserver(() => movePill(true));
    ro.observe(list);
    observers.push(ro);
    const select = (tab: HTMLButtonElement) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")!)!.hidden = !on;
      });
      movePill(false);
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab), { signal });
      tab.addEventListener("keydown", (e) => {
        const step = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[e.key];
        if (!step) return;
        e.preventDefault();
        const next = tabs[(i + step + tabs.length) % tabs.length];
        next.focus();
        select(next);
      }, { signal });
    });
  });

  return () => {
    ac.abort();
    observers.forEach((o) => o.disconnect());
  };
}

/* ---------- Why us: reveal, then loop each card's small demo ---------- */

type DemoCard = HTMLElement & { _run?: number; _visible?: boolean };

export function initWhy(section: HTMLElement): () => void {
  if (reduced()) return () => {};
  let alive = true;

  section.querySelectorAll<HTMLElement>(".wc").forEach((card, i) => card.style.setProperty("--delay", (i % 3) * 120 + "ms"));
  section.querySelectorAll<HTMLElement>(".why__head [data-reveal]").forEach((el, i) => el.style.setProperty("--delay", i * 120 + "ms"));
  section.querySelectorAll<HTMLElement>(".heat i").forEach((cell, i) => cell.style.setProperty("--i", String(i % 7)));

  const PLAY_MS = 3000; // longest demo, including the typing
  const HOLD_MS = 2800;
  const FADE_MS = 300;

  async function typeNote(note: HTMLElement, isCurrent: () => boolean) {
    const text = note.dataset.type || "";
    note.textContent = "";
    note.classList.add("is-typing");
    await wait(700);
    for (let n = 1; n <= text.length; n++) {
      if (!isCurrent() || !alive) return;
      note.textContent = text.slice(0, n);
      await wait(40);
    }
    await wait(1200);
    note.classList.remove("is-typing");
  }
  function play(card: DemoCard) {
    card.classList.add("is-played");
    const note = card.querySelector<HTMLElement>("[data-type]");
    const run = (card._run = (card._run || 0) + 1);
    if (note) typeNote(note, () => card._run === run);
  }
  function reset(card: DemoCard) {
    card.classList.add("is-resetting");
    card.classList.remove("is-played");
    void card.offsetWidth; // apply the start state before transitions come back
    card.classList.remove("is-resetting");
  }
  async function loop(card: DemoCard) {
    await wait(450);
    while (alive) {
      play(card);
      await wait(PLAY_MS + HOLD_MS);
      while (alive && (!card._visible || document.hidden)) await wait(400);
      if (!alive) return;
      card.classList.add("is-fading");
      await wait(FADE_MS);
      reset(card);
      card.classList.remove("is-fading");
      await wait(FADE_MS);
    }
  }

  const visibility = new IntersectionObserver((entries) => {
    entries.forEach((e) => { (e.target as DemoCard)._visible = e.isIntersecting; });
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as DemoCard;
        io.unobserve(el);
        el.classList.add("is-in");
        if (el.hasAttribute("data-play")) {
          visibility.observe(el);
          loop(el);
        }
      });
    },
    { threshold: 0.35 },
  );
  section.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  return () => {
    alive = false;
    io.disconnect();
    visibility.disconnect();
  };
}
