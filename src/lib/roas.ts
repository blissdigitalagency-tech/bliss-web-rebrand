// The ROAS Calculator's math (src/components/roas-calculator.tsx).
//
// "Check Results" follows the Bliss team's ROAS spreadsheet: each kind of
// conversion is counted, multiplied by the share that became a sale (for
// example bookings that showed up), by people or items per sale and by the
// value of each. Estimates, such as Google's store visits, are kept apart from
// measured conversions, so the measured ROAS works as a minimum.
//
// "Plan a Budget" works the other way: from a sale's value, the profit margin
// and the conversion rate, the most an ad click or a sale can cost before the
// ads lose money.

export type Conversion = { count: number; rate: number; per: number; value: number; estimate: boolean };

const n = (x: number) => (Number.isFinite(x) ? x : 0);

/**
 * Reads a number typed with either decimal style: "2.5" and "2,5" are 2.5,
 * "1.814" and "1,814" are 1814 (a separator followed by exactly 3 digits
 * groups thousands), "1.814,5" is 1814.5. Empty input is NaN.
 */
export function parseNum(s: string): number {
  const clean = s.replace(/[^\d.,]/g, "");
  if (!/\d/.test(clean)) return NaN;
  const i = Math.max(clean.lastIndexOf("."), clean.lastIndexOf(","));
  if (i === -1) return Number(clean);
  const head = clean.slice(0, i).replace(/[.,]/g, "");
  const tail = clean.slice(i + 1);
  return tail.length === 3 ? Number(head + tail) : Number(`${head || 0}.${tail || 0}`);
}

/** Rupiah amounts: digits only */
export const parseMoney = (s: string) => {
  const digits = s.replace(/\D/g, "");
  return digits ? Number(digits) : NaN;
};

export const conversionValue = (c: Conversion) => n(c.count) * (n(c.rate) / 100) * n(c.per) * n(c.value);

export function checkResults(rows: Conversion[], spend: number, fee: number, margin: number) {
  spend = n(spend);
  fee = n(fee);
  const measured = rows.filter((r) => !r.estimate).reduce((s, r) => s + conversionValue(r), 0);
  const estimated = rows.filter((r) => r.estimate).reduce((s, r) => s + conversionValue(r), 0);
  const revenue = measured + estimated;
  const cost = spend + fee;
  const m = margin / 100;
  const hasMargin = Number.isFinite(m) && m > 0 && m <= 1;
  const profit = hasMargin ? revenue * m - cost : null;
  return {
    measured,
    estimated,
    revenue,
    cost,
    // Revenue left after ad spend and fee; product and staff costs not included
    net: revenue - cost,
    // Return on ad spend: sales from ads per rupiah spent on ads
    roas: spend > 0 ? revenue / spend : null,
    // The spreadsheet's ROAS: sales per rupiah of ad spend and fee together
    roasWithFee: spend > 0 && fee > 0 ? revenue / cost : null,
    // Measured conversions only, when some are estimates
    measuredRoas: spend > 0 && estimated > 0 ? measured / spend : null,
    profit,
    // Profit (after product costs, ad spend and fee) per rupiah of marketing cost
    roi: profit !== null && cost > 0 ? profit / cost : null,
    // The ROAS at which profit covers ad spend and fee exactly
    breakEven: hasMargin && spend > 0 ? cost / (spend * m) : null,
  };
}

export function planBudget(value: number, margin: number, conversionRate: number, budget: number, fee: number) {
  const m = margin / 100;
  const c = conversionRate / 100;
  if (!(value > 0) || !(m > 0 && m <= 1)) return null;
  const maxCpa = value * m;
  const hasRate = c > 0 && c <= 1;
  fee = n(fee);
  if (!(budget > 0)) {
    return { breakEven: 1 / m, maxCpa, maxCpc: hasRate ? maxCpa * c : null, salesNeeded: null, clicksNeeded: null, withFee: false };
  }
  // With a budget, the sales must also cover the management fee
  const salesNeeded = (budget + fee) / maxCpa;
  const clicksNeeded = hasRate ? salesNeeded / c : null;
  return {
    breakEven: (budget + fee) / (budget * m),
    maxCpa: budget / salesNeeded,
    maxCpc: clicksNeeded ? budget / clicksNeeded : null,
    salesNeeded: Math.ceil(salesNeeded),
    clicksNeeded: clicksNeeded ? Math.ceil(clicksNeeded) : null,
    withFee: fee > 0,
  };
}
