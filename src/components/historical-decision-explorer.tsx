"use client";

import { useMemo, useState } from "react";
import { Section, SectionHeading } from "./ui/section";
import { formatDate, formatShortDate, formatSignedPercent, formatDecimal, formatPercent } from "@/lib/format";
import type { PredictionsData } from "@/lib/types";

function ReturnCell({ value }: { value: number | undefined }) {
  if (value === undefined) return <span className="text-subtle">N/A</span>;
  return (
    <span className={value >= 0 ? "text-positive" : "text-negative"}>
      {formatSignedPercent(value, 1)}
    </span>
  );
}

export function HistoricalDecisionExplorer({ predictions }: { predictions: PredictionsData | null }) {
  const periods = useMemo(() => predictions?.periods ?? [], [predictions]);
  const [index, setIndex] = useState(periods.length - 1);

  if (!predictions || periods.length === 0) {
    return (
      <Section id="explorer">
        <SectionHeading title="Historical model decisions" />
        <p className="text-sm text-muted">Predictions unavailable — public/data/predictions.json is missing.</p>
      </Section>
    );
  }

  const period = periods[Math.max(0, Math.min(index, periods.length - 1))];

  return (
    <Section id="explorer">
      <SectionHeading
        title="Historical model decisions"
        lede="Every rebalance the model actually made during the test window, and what happened over the following 20 trading days. These are historical out-of-sample outputs, not live recommendations — the model made no decision about any date after the test window shown here."
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Previous rebalance"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted"
        >
          ←
        </button>

        <div
          role="listbox"
          aria-label="Select a historical rebalance date"
          className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1"
        >
          {periods.map((p, i) => (
            <button
              key={p.date}
              type="button"
              role="option"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`shrink-0 whitespace-nowrap border px-2.5 py-1.5 font-mono text-[0.75rem] tabular-nums transition-colors ${
                i === index
                  ? "border-accent text-accent"
                  : "border-border text-subtle hover:border-border-strong hover:text-muted"
              }`}
            >
              {formatShortDate(p.date)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(periods.length - 1, i + 1))}
          disabled={index === periods.length - 1}
          aria-label="Next rebalance"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted"
        >
          →
        </button>
      </div>

      <div className="mt-8 border border-border">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border p-4 sm:p-5">
          <div className="font-mono text-lg tabular-nums text-foreground">{formatDate(period.date)}</div>
          <div className="text-[0.75rem] text-subtle">
            Historical out-of-sample decision · not a live recommendation
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-4 pb-2 text-left text-[0.75rem] font-normal text-subtle sm:px-5">
                  Rank
                </th>
                <th scope="col" className="p-4 pb-2 text-left text-[0.75rem] font-normal text-subtle sm:px-5">
                  Ticker
                </th>
                <th scope="col" className="p-4 pb-2 text-right text-[0.75rem] font-normal text-subtle sm:px-5">
                  Model score
                </th>
                <th scope="col" className="p-4 pb-2 text-right text-[0.75rem] font-normal text-subtle sm:px-5">
                  Realized percentile
                </th>
                <th scope="col" className="p-4 pb-2 text-right text-[0.75rem] font-normal text-subtle sm:px-5">
                  20d volatility
                </th>
                <th scope="col" className="p-4 pb-2 text-right text-[0.75rem] font-normal text-subtle sm:px-5">
                  Next 20d return
                </th>
              </tr>
            </thead>
            <tbody>
              {period.picks.map((pick) => (
                <tr key={pick.ticker} className="border-b border-border last:border-b-0">
                  <td className="p-4 py-2.5 font-mono text-[0.85rem] tabular-nums text-subtle sm:px-5">
                    #{pick.rank}
                  </td>
                  <td className="p-4 py-2.5 font-mono text-[0.85rem] tabular-nums text-foreground sm:px-5">
                    {pick.ticker}
                  </td>
                  <td className="p-4 py-2.5 text-right font-mono text-[0.85rem] tabular-nums text-foreground sm:px-5">
                    {formatDecimal(pick.score, 2)}
                  </td>
                  <td className="p-4 py-2.5 text-right font-mono text-[0.85rem] tabular-nums text-foreground sm:px-5">
                    {formatPercent(pick.actualPercentile, 0)}
                  </td>
                  <td className="p-4 py-2.5 text-right font-mono text-[0.85rem] tabular-nums text-muted sm:px-5">
                    {formatPercent(pick.volatility20d, 1)}
                  </td>
                  <td className="p-4 py-2.5 text-right font-mono text-[0.85rem] tabular-nums sm:px-5">
                    <ReturnCell value={pick.next20dReturn} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          <div className="bg-background p-4 sm:p-5">
            <div className="text-[0.75rem] text-subtle">Top-3 portfolio</div>
            <div className="mt-1 font-mono text-base tabular-nums">
              <ReturnCell value={period.portfolioReturn} />
            </div>
          </div>
          <div className="bg-background p-4 sm:p-5">
            <div className="text-[0.75rem] text-subtle">SPY, same window</div>
            <div className="mt-1 font-mono text-base tabular-nums">
              <ReturnCell value={period.spyReturn} />
            </div>
          </div>
          <div className="bg-background p-4 sm:p-5">
            <div className="text-[0.75rem] text-subtle">Excess vs. SPY</div>
            <div className="mt-1 font-mono text-base tabular-nums">
              <ReturnCell value={period.excessReturnVsSpy} />
            </div>
          </div>
          <div className="bg-background p-4 sm:p-5">
            <div className="text-[0.75rem] text-subtle">Exposure</div>
            <div className="mt-1 font-mono text-base tabular-nums text-foreground">
              {formatPercent(period.exposure, 0)}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
