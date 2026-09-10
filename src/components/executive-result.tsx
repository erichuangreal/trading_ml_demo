import { Section, SectionHeading } from "./ui/section";
import { formatDecimal, formatPercent, formatSignedPercent } from "@/lib/format";
import type { MetricsData } from "@/lib/types";

function Row({
  label,
  topThree,
  spy,
  universe,
  format,
}: {
  label: string;
  topThree: number;
  spy: number;
  universe: number;
  format: (v: number) => string;
}) {
  return (
    <tr className="border-t border-border">
      <th scope="row" className="py-3 pr-4 text-left text-[0.85rem] font-normal text-muted">
        {label}
      </th>
      <td className="py-3 pr-4 text-right font-mono text-[0.95rem] tabular-nums text-accent">
        {format(topThree)}
      </td>
      <td className="py-3 pr-4 text-right font-mono text-[0.95rem] tabular-nums text-foreground">
        {format(spy)}
      </td>
      <td className="py-3 text-right font-mono text-[0.95rem] tabular-nums text-foreground">
        {format(universe)}
      </td>
    </tr>
  );
}

export function ExecutiveResult({ metrics }: { metrics: MetricsData | null }) {
  if (!metrics) {
    return (
      <Section id="results">
        <SectionHeading title="Executive result" />
        <p className="text-sm text-muted">Metrics unavailable — public/data/metrics.json is missing.</p>
      </Section>
    );
  }

  const { returns, sharpe, significance } = metrics;

  return (
    <Section id="results">
      <SectionHeading title="Executive result" />

      <p className="max-w-3xl text-xl font-medium leading-snug text-foreground sm:text-2xl">
        The Top-3 portfolio produced stronger absolute historical returns than SPY
        over the test window, but at a lower risk-adjusted return: its Sharpe ratio
        trailed the benchmark it beat on raw performance.
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse">
          <thead>
            <tr>
              <th scope="col" className="py-2 pr-4 text-left text-[0.8rem] font-normal text-subtle">
                Metric
              </th>
              <th scope="col" className="py-2 pr-4 text-right text-[0.8rem] font-normal text-accent">
                Top 3 model
              </th>
              <th scope="col" className="py-2 pr-4 text-right text-[0.8rem] font-normal text-subtle">
                SPY
              </th>
              <th scope="col" className="py-2 text-right text-[0.8rem] font-normal text-subtle">
                Universe (90, eq-wt)
              </th>
            </tr>
          </thead>
          <tbody>
            <Row
              label="Annualized return"
              topThree={returns.topThreeAnnualized}
              spy={returns.spyAnnualized}
              universe={returns.universeAnnualized}
              format={(v) => formatPercent(v, 1)}
            />
            <Row
              label="Sharpe ratio"
              topThree={sharpe.topThree}
              spy={sharpe.spy}
              universe={sharpe.universe}
              format={(v) => formatDecimal(v, 2)}
            />
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid max-w-3xl gap-x-8 gap-y-4 text-[0.85rem] leading-relaxed text-muted sm:grid-cols-2">
        <p>
          <span className="font-mono tabular-nums text-foreground">
            {formatSignedPercent(metrics.excessReturn.vsSpy, 2)}
          </span>{" "}
          annualized excess return vs. SPY, but that gap tests at t&nbsp;=&nbsp;
          {formatDecimal(significance.returnVsSpyTStat, 2)} (p&nbsp;=&nbsp;
          {formatDecimal(significance.returnVsSpyPValue, 2)}) — not distinguishable
          from chance. Top 3 beat SPY in {significance.periodsWonVsSpy} of{" "}
          {significance.periodsTotal} independent rebalance periods.
        </p>
        <p>
          The cross-sectional sorting edge behind the picks is stronger evidence:{" "}
          {formatSignedPercent(metrics.sortingEdge, 2)} rank-accuracy edge at t&nbsp;=&nbsp;
          {formatDecimal(significance.sortingEdgeTStat, 2)}, significant across{" "}
          {significance.periodsTotal} periods. See{" "}
          <a href="#ranking-quality" className="underline decoration-border underline-offset-4 hover:decoration-accent">
            ranking quality
          </a>
          .
        </p>
      </div>
    </Section>
  );
}
