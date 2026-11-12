// The ROAS Calculator's math (src/components/roas-calculator.tsx): the
// standard ROAS formula, plus break-even ROAS and profit when a margin is given.

/** Rupiah amounts and counts: digits only. Empty input is NaN. */
export const parseMoney = (s: string) => {
  const digits = s.replace(/\D/g, "");
  return digits ? Number(digits) : NaN;
};

/** Percentages: "25", "12.5" or "12,5". Empty input is NaN. */
export const parsePercent = (s: string) => {
  const clean = s.replace(",", ".").replace(/[^\d.]/g, "");
  return clean ? Number(clean) : NaN;
};

export function roasResults(spend: number, sales: number, marginPct: number) {
  if (!(spend > 0) || !(sales >= 0)) return null;
  const m = marginPct / 100;
  const hasMargin = m > 0 && m <= 1;
  return {
    // Sales from ads per rupiah spent on ads
    roas: sales / spend,
    // The ROAS at which the profit on sales exactly covers the ad spend
    breakEven: hasMargin ? 1 / m : null,
    // Profit on those sales after the ad spend (product and staff costs come out through the margin)
    profit: hasMargin ? sales * m - spend : null,
  };
}

/**
 * Loss, break-even or profit, for the status line and the next-step button.
 * Within 10% of the ad spend either way counts as break-even. Null without a margin.
 */
export function roasOutcome(spend: number, profit: number | null): "loss" | "even" | "profit" | null {
  if (profit === null) return null;
  if (Math.abs(profit) <= spend * 0.1) return "even";
  return profit > 0 ? "profit" : "loss";
}
