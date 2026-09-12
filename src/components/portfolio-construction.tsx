"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatPercent } from "@/lib/format";
import type { MetricsData } from "@/lib/types";

const STEPS = [
  "Rank all ~90 equities",
  "Select the top 3",
  "Weight inversely to each pick's own volatility",
  "Scale the whole basket to a 17.3% annualized vol target",
  "Hold 20 trading days, then rebalance",
];

/** Embedded inside How It's Built's pipeline detail panel for the sizing stage. */
export function PortfolioConstruction({ metrics }: { metrics: MetricsData | null }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div>
      <p className="max-w-2xl text-[0.85rem] leading-relaxed text-muted">
        The model only decides order. Everything below is a risk-management layer applied after the
        ranking, and it can be changed without retraining anything.
      </p>

      <ol className="mt-4 flex flex-col gap-0 border-l border-border">
        {STEPS.map((step, i) => (
          <motion.li
            key={step}
            className="relative py-3 pl-6"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
          >
            <span className="absolute left-[-4.5px] top-4 h-[9px] w-[9px] rounded-full border-2 border-accent bg-background" />
            <span className="font-mono text-[0.75rem] tabular-nums text-subtle">
              {String(i + 1).padStart(2, "0")}
            </span>{" "}
            <span className="text-[0.9rem] text-foreground">{step}</span>
          </motion.li>
        ))}
      </ol>

      <p className="mt-6 max-w-2xl text-[0.85rem] leading-relaxed text-muted">
        Equal weighting the top 3 would let the single most volatile pick
        dominate the basket&apos;s risk. Sizing inversely to{" "}
        <code className="rounded border border-border px-1 py-0.5 font-mono text-[0.75rem]">volatility_20d</code>{" "}
        equalizes each pick&apos;s risk contribution; the whole basket is then
        scaled toward a 17.3% annualized volatility target, clamped between
        20% and 100% exposure.
        {metrics ? (
          <>
            {" "}In practice the basket still realized{" "}
            <span className="font-mono tabular-nums text-foreground">
              {formatPercent(metrics.realizedVolatility.topThree, 1)}
            </span>{" "}
            annualized volatility, above target, since exposure is sized off trailing realized
            volatility, which lags true forward risk. See What I Learned for the full limitations list.
          </>
        ) : null}
      </p>
    </div>
  );
}
