import { Section, SectionHeading } from "./ui/section";
import { Stat } from "./ui/stat";
import { formatDecimal, formatPercent, formatSignedPercent } from "@/lib/format";
import type { MetricsData, PredictionsData } from "@/lib/types";

function PercentileStrip({ periods }: { periods: PredictionsData["periods"] }) {
  return (
    <div className="mt-2">
      <div className="relative h-16 w-full">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-border-strong" />
        <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-border-strong" />
        <div className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 bg-border-strong" />
        {periods.map((p) => {
          const pct = p.meanActualPercentile;
          const positive = pct > 0.5;
          return (
            <div
              key={p.date}
              className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                positive ? "bg-accent" : "bg-subtle"
              }`}
              style={{ left: `${pct * 100}%` }}
              title={`${p.date}: mean actual percentile ${pct.toFixed(3)}`}
            />
          );
        })}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[0.7rem] tabular-nums text-subtle">
        <span>0.0 — worst</span>
        <span>0.5 — no skill</span>
        <span>1.0 — best</span>
      </div>
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
  if (!metrics) return null;

  return (
    <Section id="ranking-quality">
      <SectionHeading
        title="Does the ranking signal work?"
        lede="Portfolio returns mix two things: whether the model can sort stocks against each other, and how much market exposure the resulting basket happened to carry. This section isolates the first question."
      />

      <div className="grid gap-6 border border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
        <div className="p-5">
          <Stat
            label="Rank accuracy (median split)"
            value={formatPercent(metrics.rankAccuracy, 2)}
            detail={`${formatSignedPercent(metrics.sortingEdge, 2)} over the 50% baseline, t = ${formatDecimal(
              metrics.significance.sortingEdgeTStat,
              2
            )}`}
            tone="accent"
          />
        </div>
        <div className="p-5">
          <Stat
            label="Top-3 picks beating median"
            value={formatPercent(metrics.pctTopThreeBeatingMedian, 1)}
            detail="of individual picks, across all rebalances"
          />
        </div>
        <div className="p-5">
          <Stat
            label="Top-minus-bottom-3 spread"
            value={`${metrics.topMinusBottomSpreadBps.toFixed(0)} bps`}
            detail="per 20-trading-day period"
          />
        </div>
      </div>

      {predictions ? (
        <div className="mt-10">
          <h3 className="text-sm font-medium text-foreground">
            Mean realized percentile of Top-3 picks, by rebalance
          </h3>
          <p className="mt-1 max-w-xl text-[0.85rem] leading-relaxed text-muted">
            Each dot is one rebalance: where the three selected stocks actually
            landed, on average, within that day&apos;s cross-sectional return
            distribution. A model with no skill clusters around 0.5.
          </p>
          <PercentileStrip periods={predictions.periods} />
        </div>
      ) : null}

      <div className="mt-10 overflow-x-auto">
        <h3 className="text-sm font-medium text-foreground">Basket size comparison</h3>
        <p className="mt-1 max-w-xl text-[0.85rem] leading-relaxed text-muted">
          The same ranking, held at three different concentrations. Top 1 earns
          more on average but the extra return over Top 3 is not statistically
          distinguishable from luck (see{" "}
          <a href="#conclusion" className="underline decoration-border underline-offset-4 hover:decoration-accent">
            results interpretation
          </a>
          ).
        </p>
        <table className="mt-4 w-full min-w-[420px] border-collapse">
          <thead>
            <tr className="border-t border-border">
              <th scope="col" className="py-2 pr-4 text-left text-[0.8rem] font-normal text-subtle">
                Basket
              </th>
              <th scope="col" className="py-2 pr-4 text-right text-[0.8rem] font-normal text-subtle">
                Annualized return
              </th>
              <th scope="col" className="py-2 pr-4 text-right text-[0.8rem] font-normal text-subtle">
                Sharpe
              </th>
              <th scope="col" className="py-2 text-right text-[0.8rem] font-normal text-subtle">
                Mean exposure
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.strategyComparison.map((row) => (
              <tr key={row.strategy} className="border-t border-border">
                <th
                  scope="row"
                  className={`py-2.5 pr-4 text-left text-[0.85rem] font-normal ${
                    row.strategy === "Top 3" ? "text-accent" : "text-muted"
                  }`}
                >
                  {row.strategy}
                </th>
                <td className="py-2.5 pr-4 text-right font-mono text-[0.9rem] tabular-nums text-foreground">
                  {formatPercent(row.annualizedReturn, 1)}
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-[0.9rem] tabular-nums text-foreground">
                  {formatDecimal(row.sharpe, 2)}
                </td>
                <td className="py-2.5 text-right font-mono text-[0.9rem] tabular-nums text-foreground">
                  {formatPercent(row.meanExposure, 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
