import type { MetricsData } from "@/lib/types";

export function ResearchConclusion({ metrics }: { metrics: MetricsData | null }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        What I learned
      </h2>

      <div className="mt-8 grid gap-10 sm:grid-cols-2">
        <div>
          <h3 className="text-[0.9rem] font-medium text-foreground">What worked</h3>
          <ul className="mt-3 flex flex-col gap-3 text-[0.9rem] leading-relaxed text-muted">
            <li>
              There&apos;s a real cross-sectional sorting edge:{" "}
              <span className="font-mono tabular-nums text-foreground">+1.85pp</span> over
              the 50% baseline, significant at t&nbsp;=&nbsp;2.19 across 45 independent
              periods. That&apos;s the part I&apos;m actually proud of: the model can tell
              stronger names from weaker ones, on data it never trained on.
            </li>
            <li>
              <span className="font-mono tabular-nums text-foreground">60.7%</span> of
              individual Top-3 picks beat their day&apos;s cross-sectional median return.
            </li>
            <li>
              A{" "}
              <span className="font-mono tabular-nums text-foreground">+259 bps</span>{" "}
              per-period top-minus-bottom spread, the clearest evidence the ranking
              actually separates stronger and weaker names, not just noise.
            </li>
            <li>Higher historical absolute return than SPY and the equal-weight universe, net of modeled transaction costs.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-[0.9rem] font-medium text-foreground">What didn&apos;t</h3>
          <ul className="mt-3 flex flex-col gap-3 text-[0.9rem] leading-relaxed text-muted">
            <li>
              Sharpe ratio ({metrics ? metrics.sharpe.topThree.toFixed(2) : "N/A"}) trailed
              both SPY ({metrics ? metrics.sharpe.spy.toFixed(2) : "N/A"}) and the universe
              ({metrics ? metrics.sharpe.universe.toFixed(2) : "N/A"}). I won on return, not
              on risk-adjusted return, and I don&apos;t want to bury that.
            </li>
            <li>
              The raw return advantage over SPY isn&apos;t statistically significant
              (t&nbsp;=&nbsp;0.66, p&nbsp;=&nbsp;0.51); I won 20 of 45 periods, close
              to a coin flip. I can&apos;t honestly call the headline return number proven.
            </li>
            <li>
              Realized volatility (
              {metrics ? (metrics.realizedVolatility.topThree * 100).toFixed(1) : "N/A"}%)
              ran well above the 17.3% target I sized the basket to.
            </li>
            <li>A 3-name basket concentrates idiosyncratic risk; one earnings surprise can dominate a period.</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 max-w-3xl border-t border-border pt-6">
        <h3 className="text-[0.9rem] font-medium text-foreground">What this suggests, and what I&apos;d try next</h3>
        <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
          The most defensible result here is the cross-sectional sorting signal, not
          the raw backtest headline return. The ranking edge clears a conventional
          significance bar across 45 non-overlapping periods; the return advantage
          over SPY does not, and I&apos;m not going to describe one saved backtest&apos;s
          t-statistic as proof of anything beyond that specific test. A Top-3 basket
          is also a genuinely concentrated bet: most of its return variance comes from
          broad market exposure, not stock selection, so a larger basket, or an
          explicit hedge against the market, feels like a more promising way to express
          the same ranking signal than trusting the headline number on its own. That&apos;s
          the next thing I want to try.
        </p>
      </div>
    </div>
  );
}
