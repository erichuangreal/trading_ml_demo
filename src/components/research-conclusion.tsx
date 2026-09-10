import { Section, SectionHeading } from "./ui/section";
import type { MetricsData } from "@/lib/types";

export function ResearchConclusion({ metrics }: { metrics: MetricsData | null }) {
  return (
    <Section id="conclusion">
      <SectionHeading title="Results interpretation" />

      <div className="grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="text-[0.9rem] font-medium text-foreground">What worked</h3>
          <ul className="mt-3 flex flex-col gap-3 text-[0.85rem] leading-relaxed text-muted">
            <li>
              A measurable cross-sectional sorting edge —{" "}
              <span className="font-mono tabular-nums text-foreground">+1.85pp</span> over
              the 50% baseline, significant at t&nbsp;=&nbsp;2.19 across 45 independent
              periods.
            </li>
            <li>
              <span className="font-mono tabular-nums text-foreground">60.7%</span> of
              individual Top-3 picks beat their day&apos;s cross-sectional median return.
            </li>
            <li>
              A{" "}
              <span className="font-mono tabular-nums text-foreground">
                +259 bps
              </span>{" "}
              per-period top-minus-bottom spread — the clearest evidence the ranking
              separates stronger and weaker names.
            </li>
            <li>Higher historical absolute return than SPY and the equal-weight universe, net of modeled transaction costs.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-[0.9rem] font-medium text-foreground">What didn&apos;t</h3>
          <ul className="mt-3 flex flex-col gap-3 text-[0.85rem] leading-relaxed text-muted">
            <li>
              Sharpe ratio ({metrics ? metrics.sharpe.topThree.toFixed(2) : "N/A"}) trailed
              both SPY ({metrics ? metrics.sharpe.spy.toFixed(2) : "N/A"}) and the universe
              ({metrics ? metrics.sharpe.universe.toFixed(2) : "N/A"}).
            </li>
            <li>
              The raw return advantage over SPY is not statistically significant
              (t&nbsp;=&nbsp;0.66, p&nbsp;=&nbsp;0.51) — the model won 20 of 45 periods, close
              to a coin flip.
            </li>
            <li>
              Realized volatility (
              {metrics ? (metrics.realizedVolatility.topThree * 100).toFixed(1) : "N/A"}%)
              ran well above the 17.3% target the basket was sized to.
            </li>
            <li>A 3-name basket concentrates idiosyncratic risk; one earnings surprise can dominate a period.</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 max-w-3xl border-t border-border pt-6">
        <h3 className="text-[0.9rem] font-medium text-foreground">What this suggests</h3>
        <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
          The most defensible result here is the cross-sectional sorting
          signal, not the raw backtest headline return. The ranking
          edge clears a conventional significance bar across 45
          non-overlapping periods; the return advantage over SPY does not.
          A Top-3 basket is also a genuinely concentrated bet — most of its
          return variance comes from broad market exposure, not from stock
          selection — so a stronger, lower-variance way to express the same
          ranking signal (a larger basket, or an explicit hedge against the
          market) is a more promising next step than trusting the headline
          number on its own.
        </p>
      </div>
    </Section>
  );
}
