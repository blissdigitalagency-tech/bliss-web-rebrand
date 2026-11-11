"use client";

// The free ROAS Calculator (/tools/roas-calculator). Two tabs: "Check Results"
// works out the return on a campaign that has run, following the Bliss team's
// ROAS spreadsheet; "Plan a Budget" works out the most a click or a sale can
// cost. The math is in src/lib/roas.ts. Nothing leaves the browser.

import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/en";
import { checkResults, parseMoney, parseNum, planBudget } from "@/lib/roas";

type T = Dictionary["roas"];
type Row = { key: number; name: string; count: string; rate: string; per: string; value: string; estimate: boolean };

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
      pct: (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${whole.format(Math.round(Math.abs(n) * 100))}%`,
    };
  }, [lang]);
}

const fill = (s: string, values: Record<string, string>) => s.replace(/\{(\w)\}/g, (_, k: string) => values[k] ?? "");

/** A labelled input. Money is grouped as you type; other numbers accept 2.5 or 2,5. */
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
  kind: "money" | "percent" | "number";
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
          inputMode={kind === "money" ? "numeric" : "decimal"}
          autoComplete="off"
          value={value}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onChange={(e) => {
            const v = e.target.value;
            if (kind === "money") {
              const n = parseMoney(v);
              onChange(Number.isNaN(n) ? "" : group(n));
            } else onChange(v.replace(/[^\d.,]/g, ""));
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

function Result({ label, value, sub, big = false }: { label: string; value: ReactNode; sub?: string; big?: boolean }) {
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
  const [tab, setTab] = useState<"check" | "plan">("check");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // Check Results
  const nextKey = useRef(t.check.rows.length);
  const moneyStr = (s: string) => (s ? f.group(Number(s)) : "");
  const [rows, setRows] = useState<Row[]>(() => t.check.rows.map((r, key) => ({ ...r, key, value: moneyStr(r.value) })));
  const [spend, setSpend] = useState(() => moneyStr(t.check.spendDefault));
  const [fee, setFee] = useState("");
  const [margin, setMargin] = useState("");

  const setRow = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows((rs) => [...rs, { key: nextKey.current++, name: t.check.newName, count: "", rate: "100", per: "1", value: "", estimate: false }]);

  const check = checkResults(
    rows.map((r) => ({ count: parseNum(r.count), rate: parseNum(r.rate), per: parseNum(r.per), value: parseMoney(r.value), estimate: r.estimate })),
    parseMoney(spend),
    parseMoney(fee),
    parseNum(margin),
  );

  // Plan a Budget
  const d = t.plan.defaults;
  const [pValue, setPValue] = useState(() => moneyStr(d.value));
  const [pMargin, setPMargin] = useState(d.margin);
  const [pRate, setPRate] = useState(d.rate);
  const [pBudget, setPBudget] = useState(() => moneyStr(d.budget));
  const [pFee, setPFee] = useState(() => moneyStr(d.fee));
  const plan = planBudget(parseMoney(pValue), parseNum(pMargin), parseNum(pRate), parseMoney(pBudget), parseMoney(pFee));

  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = tab === "check" ? "plan" : "check";
    setTab(next);
    tabs.current[next === "check" ? 0 : 1]?.focus();
  };

  const r = t.results;
  const p = t.planResults;

  return (
    <div className="roas">
      <div className="roas__tabs" role="tablist" aria-label={t.tabs.label} onKeyDown={onTabKey}>
        {(["check", "plan"] as const).map((k, i) => (
          <button
            key={k}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`roas-tab-${k}`}
            className="roas__tab"
            aria-selected={tab === k}
            aria-controls={`roas-panel-${k}`}
            tabIndex={tab === k ? 0 : -1}
            onClick={() => setTab(k)}
          >
            {t.tabs[k]}
          </button>
        ))}
      </div>

      {tab === "check" ? (
        <div className="roas__grid" role="tabpanel" id="roas-panel-check" aria-labelledby="roas-tab-check">
          <div className="roas__inputs">
            <section className="roas__card" aria-labelledby="roas-sales">
              <h2 className="roas__h" id="roas-sales">
                {t.check.salesTitle}
              </h2>
              <p className="roas__text">{t.check.salesText}</p>
              <p className="roas__example">{t.example}</p>
              <ul className="roas-rows">
                {rows.map((row) => {
                  const id = `roas-row-${row.key}`;
                  return (
                    <li className="roas-row" key={row.key}>
                      <div className="field roas-row__name">
                        <label htmlFor={`${id}-name`}>{t.check.name}</label>
                        <input id={`${id}-name`} type="text" value={row.name} onChange={(e) => setRow(row.key, { name: e.target.value })} />
                      </div>
                      <div className="roas-row__nums">
                        <Field id={`${id}-count`} label={t.check.count} value={row.count} onChange={(v) => setRow(row.key, { count: v })} kind="number" group={f.group} />
                        <Field id={`${id}-rate`} label={t.check.rate} hint={t.check.rateHint} value={row.rate} onChange={(v) => setRow(row.key, { rate: v })} kind="percent" group={f.group} />
                        <Field id={`${id}-per`} label={t.check.per} value={row.per} onChange={(v) => setRow(row.key, { per: v })} kind="number" group={f.group} />
                        <Field id={`${id}-value`} label={t.check.value} value={row.value} onChange={(v) => setRow(row.key, { value: v })} kind="money" group={f.group} />
                      </div>
                      <div className="roas-row__foot">
                        <div className="roas-check__wrap">
                          <label className="roas-check">
                            <input
                              type="checkbox"
                              checked={row.estimate}
                              aria-describedby={`${id}-estimate-hint`}
                              onChange={(e) => setRow(row.key, { estimate: e.target.checked })}
                            />
                            {t.check.estimate}
                          </label>
                          <p className="roas-field__hint roas-check__hint" id={`${id}-estimate-hint`}>
                            {t.check.estimateHint}
                          </p>
                        </div>
                        {rows.length > 1 && (
                          <button type="button" className="roas-row__remove" onClick={() => setRows((rs) => rs.filter((x) => x.key !== row.key))} aria-label={`${t.check.remove}: ${row.name}`}>
                            {t.check.remove}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="roas__add" onClick={addRow}>
                <span aria-hidden="true">+</span> {t.check.add}
              </button>
            </section>

            <section className="roas__card" aria-labelledby="roas-costs">
              <h2 className="roas__h" id="roas-costs">
                {t.check.costsTitle}
              </h2>
              <div className="roas__fields">
                <Field id="roas-spend" label={t.check.spend} value={spend} onChange={setSpend} kind="money" group={f.group} />
                <Field id="roas-fee" label={t.check.fee} hint={t.check.feeHint} value={fee} onChange={setFee} kind="money" group={f.group} />
                <Field id="roas-margin" label={t.check.margin} hint={t.check.marginHint} value={margin} onChange={setMargin} kind="percent" group={f.group} />
              </div>
            </section>
          </div>

          <aside className="roas__results" aria-labelledby="roas-results-title">
            <h2 className="roas__results-title" id="roas-results-title">
              {r.title}
            </h2>
            <div aria-live="polite">
              {check.roas === null ? (
                <p className="roas__empty">{r.empty}</p>
              ) : (
                <>
                  <dl className="roas-results">
                    <Result big label={r.roas} value={f.ratio(check.roas)} sub={fill(r.roasSub, { n: f.plain(check.roas) })} />
                    {check.roasWithFee !== null && <Result label={r.roasWithFee} value={f.ratio(check.roasWithFee)} />}
                    {check.measuredRoas !== null && <Result label={r.measuredRoas} value={f.ratio(check.measuredRoas)} sub={r.measuredSub} />}
                    <Result
                      label={r.revenue}
                      value={f.money(check.revenue)}
                      sub={check.estimated > 0 ? fill(r.split, { m: f.money(check.measured), e: f.money(check.estimated) }) : undefined}
                    />
                    <Result label={r.cost} value={f.money(check.cost)} />
                    {check.profit === null ? (
                      <Result label={r.net} value={f.money(check.net)} sub={r.netNote} />
                    ) : (
                      <>
                        <Result label={r.profit} value={f.money(check.profit)} />
                        {check.roi !== null && <Result label={r.roi} value={f.pct(check.roi)} />}
                        {check.breakEven !== null && <Result label={r.breakEven} value={f.ratio(check.breakEven)} />}
                      </>
                    )}
                  </dl>
                  {check.profit !== null && (
                    <p className={`roas__status roas__status--${check.profit >= 0 ? "good" : "bad"}`}>{check.profit >= 0 ? r.good : r.bad}</p>
                  )}
                </>
              )}
            </div>
            <p className="roas__private">{t.private}</p>
          </aside>
        </div>
      ) : (
        <div className="roas__grid" role="tabpanel" id="roas-panel-plan" aria-labelledby="roas-tab-plan">
          <div className="roas__inputs">
            <section className="roas__card" aria-labelledby="roas-plan">
              <h2 className="roas__h" id="roas-plan">
                {t.plan.title}
              </h2>
              <p className="roas__text">{t.plan.text}</p>
              <p className="roas__example">{t.example}</p>
              <div className="roas__fields">
                <Field id="plan-value" label={t.plan.value} hint={t.plan.valueHint} value={pValue} onChange={setPValue} kind="money" group={f.group} />
                <Field id="plan-margin" label={t.plan.margin} hint={t.plan.marginHint} value={pMargin} onChange={setPMargin} kind="percent" group={f.group} />
                <Field id="plan-rate" label={t.plan.rate} hint={t.plan.rateHint} value={pRate} onChange={setPRate} kind="percent" group={f.group} />
                <Field id="plan-budget" label={t.plan.budget} hint={t.plan.budgetHint} value={pBudget} onChange={setPBudget} kind="money" group={f.group} />
                <Field id="plan-fee" label={t.plan.fee} hint={t.plan.feeHint} value={pFee} onChange={setPFee} kind="money" group={f.group} />
              </div>
            </section>
          </div>

          <aside className="roas__results" aria-labelledby="roas-plan-results">
            <h2 className="roas__results-title" id="roas-plan-results">
              {r.title}
            </h2>
            <div aria-live="polite">
              {plan === null ? (
                <p className="roas__empty">{p.empty}</p>
              ) : (
                <dl className="roas-results">
                  <Result big label={p.breakEven} value={f.ratio(plan.breakEven)} sub={fill(plan.withFee ? p.breakEvenFee : p.breakEvenSub, { n: f.plain(plan.breakEven) })} />
                  <Result label={p.maxCpa} value={f.money(plan.maxCpa)} />
                  <Result label={p.maxCpc} value={plan.maxCpc === null ? "—" : f.money(plan.maxCpc)} sub={plan.maxCpc === null ? p.needRate : undefined} />
                  {plan.salesNeeded !== null && <Result label={p.salesNeeded} value={`${f.group(plan.salesNeeded)} ${p.perMonth}`} />}
                  {plan.clicksNeeded !== null && <Result label={p.clicksNeeded} value={`${f.group(plan.clicksNeeded)} ${p.perMonth}`} />}
                </dl>
              )}
            </div>
            <p className="roas__private">{t.private}</p>
          </aside>
        </div>
      )}
    </div>
  );
}
