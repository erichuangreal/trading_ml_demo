"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PercentileAxis, PercentileDot } from "./percentile-scale";
import { formatDecimal, formatPercent, formatSignedPercent } from "@/lib/format";
import { useInView } from "@/lib/use-in-view";
import type { MetricsData, PredictionsData } from "@/lib/types";

function PercentileStrip({ periods }: { periods: PredictionsData["periods"] }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref}>
      <PercentileAxis>
        {periods.map((p, i) => {
          const pct = p.meanActualPercentile;
          const positive = pct > 0.5;
          return (
            <PercentileDot
              key={p.date}
              pct={pct}
              size={8}
              color={positive ? "bg-accent" : "bg-subtle"}
              delay={inView ? i * 0.012 : 0}
              title={`${p.date}: mean actual percentile ${pct.toFixed(3)}`}
            />
          );
        })}
      </PercentileAxis>
    </div>
  );
}

export function RankingQuality({
  metrics,
  predictions,
}: {
  metrics: MetricsData | null;
  predictions: PredictionsData | null;
}) {
  const [selected, setSelected] = useState<string>("Top 3");
  const prefersReducedMotion = useReducedMotion();

  if (!metrics) return null;

  const maxReturn = Math.max(...metrics.strategyComparison.map((r) => r.annualizedReturn));
  const activeRow = metrics.strategyComparison.find((r) => r.strategy === selected) ?? metrics.strategyComparison[0];

  return (
    <div>
      {predictions ? (
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Mean realized percentile of Top-3 picks, by rebalance
          </h3>
          <p className="mt-1 max-w-xl text-[0.85rem] leading-relaxed text-muted">
            Each dot is one rebalance: where the three selected stocks actually
            landed, on average, within that day&apos;s cross-sectional return
            distribution. A model with no skill clusters around 0.5.
          </p>
          <PercentileStrip periods={predictions.periods} />

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5 text-[0.85rem]">
            <span className="text-muted">
              Mean lands at{" "}
              <span className="font-mono tabular-nums font-medium text-accent">
                {formatPercent(metrics.rankAccuracy, 2)}
              </span>{" "}
              ({formatSignedPercent(metrics.sortingEdge, 2)} over the 50% baseline, t ={" "}
              {formatDecimal(metrics.significance.sortingEdgeTStat, 2)})
            </span>
            <span className="text-muted">
              <span className="font-mono tabular-nums font-medium text-foreground">
                {formatPercent(metrics.pctTopThreeBeatingMedian, 1)}
              </span>{" "}
              of individual picks beat their day&apos;s median
            </span>
            <span className="text-muted">
              <span className="font-mono tabular-nums font-medium text-foreground">
                {metrics.topMinusBottomSpreadBps.toFixed(0)} bps
              </span>{" "}
              top-minus-bottom-3 spread per period
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-10 overflow-x-auto">
        <h3 className="text-sm font-medium text-foreground">Basket size comparison</h3>
        <p className="mt-1 max-w-xl text-[0.85rem] leading-relaxed text-muted">
          The same ranking, held at three different concentrations. Select a row to compare. Top 1 earns
          more on average but the extra return over Top 3 is not statistically
          distinguishable from luck. See What I Learned for the full interpretation.
        </p>

        <div className="mt-4 flex flex-col gap-1.5" role="radiogroup" aria-label="Basket size">
          {metrics.strategyComparison.map((row) => {
            const isSelected = row.strategy === selected;
            return (
              <button
                key={row.strategy}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelected(row.strategy)}
                className={`flex w-full min-w-[420px] items-center gap-4 border px-3 py-2.5 text-left transition-colors ${
                  isSelected ? "border-accent bg-accent/5" : "border-border hover:border-border-strong"
                }`}
              >
                <span
                  className={`w-14 shrink-0 font-mono text-[0.85rem] ${isSelected ? "text-accent" : "text-muted"}`}
                >
                  {row.strategy}
                </span>
                <span className="relative h-2 flex-1 overflow-hidden bg-border">
                  <motion.span
                    className={`absolute inset-y-0 left-0 ${isSelected ? "bg-accent" : "bg-subtle"}`}
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    animate={{ width: `${(row.annualizedReturn / maxReturn) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-[0.85rem] tabular-nums text-foreground">
                  {formatPercent(row.annualizedReturn, 1)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4 text-[0.8rem]">
          <div>
            <div className="text-subtle">Annualized return</div>
            <div className="mt-1 font-mono text-base tabular-nums text-foreground">
              {formatPercent(activeRow.annualizedReturn, 1)}
            </div>
          </div>
          <div>
            <div className="text-subtle">Sharpe</div>
            <div className="mt-1 font-mono text-base tabular-nums text-foreground">
              {formatDecimal(activeRow.sharpe, 2)}
            </div>
          </div>
          <div>
            <div className="text-subtle">Mean exposure</div>
            <div className="mt-1 font-mono text-base tabular-nums text-foreground">
              {formatPercent(activeRow.meanExposure, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
