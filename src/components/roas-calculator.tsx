"use client";

// The free ROAS Calculator (/tools/roas-calculator): ad spend and sales in,
// ROAS out, plus break-even ROAS and profit when a margin is given. Sales can
// be typed as a total or worked out from orders × average order value.
// The math is in src/lib/roas.ts. Nothing leaves the browser.

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { parseMoney, parsePercent, roasResults } from "@/lib/roas";

type T = Dictionary["roas"];

function useFormat(lang: Locale) {
  return useMemo(() => {
    const tag = lang === "id" ? "id-ID" : "en-US";
    const whole = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
    const two = new Intl.NumberFormat(tag, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    return {
      group: (n: number) => whole.format(n),
      money: (n: number) => `${n < 0 ? "−" : ""}Rp${whole.format(Math.round(Math.abs(n)))}`,
      ratio: (n: number) => `${two.format(n)}x`,
      plain: (n: number) => two.format(n),
    };
  }, [lang]);
}

const fill = (s: string, values: Record<string, string>) => s.replace(/\{(\w)\}/g, (_, k: string) => values[k] ?? "");

/** A labelled input. Money and counts are grouped as you type. */
function Field({
  id,
  label,
  hint,
  value,
  onChange,
  kind,
  group,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  kind: "money" | "count" | "percent";
  group: (n: number) => string;
}) {
  return (
    <div className="field roas-field">
      <label htmlFor={id}>{label}</label>
      <div className={`roas-affix roas-affix--${kind}`}>
        {kind === "money" && <span aria-hidden="true">Rp</span>}
        <input
          id={id}
          type="text"
          inputMode={kind === "percent" ? "decimal" : "numeric"}
          autoComplete="off"
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => {
            const v = e.target.value;
            if (kind === "percent") return onChange(v.replace(/[^\d.,]/g, ""));
            const n = parseMoney(v);
            onChange(Number.isNaN(n) ? "" : group(n));
          }}
        />
        {kind === "percent" && <span aria-hidden="true">%</span>}
      </div>
      {hint && (
        <p className="roas-field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}

function Result({ label, value, sub, big = false }: { label: string; value: string; sub?: string; big?: boolean }) {
  return (
    <div className={`roas-result${big ? " roas-result--big" : ""}`}>
      <dt>{label}</dt>
      <dd>
        <span className="roas-result__value">{value}</span>
        {sub && <span className="roas-result__sub">{sub}</span>}
      </dd>
    </div>
  );
}

export function RoasCalculator({ lang, t }: { lang: Locale; t: T }) {
  const f = useFormat(lang);
  const d = t.form.defaults;
  const grouped = (s: string) => (s ? f.group(Number(s)) : "");

  const [spend, setSpend] = useState(() => grouped(d.spend));
  const [sales, setSales] = useState(() => grouped(d.sales));
  const [calc, setCalc] = useState(false);
  const [orders, setOrders] = useState(() => grouped(d.orders));
  const [aov, setAov] = useState(() => grouped(d.aov));
  const [margin, setMargin] = useState("");

  const worked = parseMoney(orders) * parseMoney(aov);
  const salesValue = calc ? worked : parseMoney(sales);
  const r = roasResults(parseMoney(spend), salesValue, parsePercent(margin));

  const toggleCalc = () => {
    // Closing the helper keeps the total it worked out
    if (calc && Number.isFinite(worked)) setSales(f.group(worked));
    setCalc(!calc);
  };

  const R = t.results;

  return (
    <div className="roas">
      <div className="roas__grid">
        <section className="roas__card" aria-labelledby="roas-form-title">
          <h2 className="roas__h" id="roas-form-title">
            {t.form.title}
          </h2>
          <p className="roas__example">{t.example}</p>
          <div className="roas__fields">
            <Field id="roas-spend" label={t.form.spend} hint={t.form.spendHint} value={spend} onChange={setSpend} kind="money" group={f.group} />

            <div className="roas-sales">
              {calc ? (
                <div className="roas-calc" id="roas-calc">
                  <div className="roas-calc__fields">
                    <Field id="roas-orders" label={t.form.orders} value={orders} onChange={setOrders} kind="count" group={f.group} />
                    <Field id="roas-aov" label={t.form.aov} value={aov} onChange={setAov} kind="money" group={f.group} />
                  </div>
                  <p className="roas-calc__line" aria-live="polite">
                    {Number.isFinite(worked) ? fill(t.form.calcLine, { o: f.group(parseMoney(orders)), v: f.money(parseMoney(aov)), t: f.money(worked) }) : ""}
                  </p>
                </div>
              ) : (
                <Field id="roas-sales" label={t.form.sales} hint={t.form.salesHint} value={sales} onChange={setSales} kind="money" group={f.group} />
              )}
              <button type="button" className="roas-calc__toggle" aria-expanded={calc} aria-controls={calc ? "roas-calc" : undefined} onClick={toggleCalc}>
                {calc ? t.form.calcClose : t.form.calcOpen}
              </button>
            </div>

            <Field id="roas-margin" label={t.form.margin} hint={t.form.marginHint} value={margin} onChange={setMargin} kind="percent" group={f.group} />
          </div>
        </section>

        <aside className="roas__results" aria-labelledby="roas-results-title">
          <h2 className="roas__results-title" id="roas-results-title">
            {R.title}
          </h2>
          <div aria-live="polite">
            {r === null ? (
              <p className="roas__empty">{R.empty}</p>
            ) : (
              <>
                <dl className="roas-results">
                  <Result big label={R.roas} value={f.ratio(r.roas)} sub={fill(R.roasSub, { n: f.plain(r.roas) })} />
                  {r.breakEven !== null && <Result label={R.breakEven} value={f.ratio(r.breakEven)} sub={fill(R.breakEvenSub, { m: margin })} />}
                  {r.profit !== null && <Result label={R.profit} value={f.money(r.profit)} sub={R.profitSub} />}
                </dl>
                {r.profit === null ? (
                  <p className="roas__note">{R.addMargin}</p>
                ) : (
                  <p className={`roas__status roas__status--${r.profit >= 0 ? "good" : "bad"}`}>{r.profit >= 0 ? R.good : R.bad}</p>
                )}
              </>
            )}
          </div>
          <p className="roas__private">{t.private}</p>
        </aside>
      </div>
    </div>
  );
}
