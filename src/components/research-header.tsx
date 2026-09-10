import { Tag } from "./ui/tag";
import { Stat } from "./ui/stat";
import { formatDateRange, formatDecimal, formatInt, formatPercent, formatShortDateRange, formatSignedPercent } from "@/lib/format";
import type { MetricsData } from "@/lib/types";

export function ResearchHeader({ metrics }: { metrics: MetricsData | null }) {
  return (
    <header className="mx-auto w-full max-w-5xl px-6 pb-16 pt-16 sm:px-8 sm:pt-24 md:pb-20 md:pt-28">
      <h1 className="max-w-3xl text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[2.75rem] md:text-[3.25rem]">
        Cross-sectional equity ranking with walk-forward machine learning
      </h1>

      <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-muted">
        Can engineered historical market features rank a universe of equities well
        enough to construct a useful Top-3, volatility-sized portfolio? This project
        trains an XGBoost classifier to estimate each stock&apos;s odds of beating its
        peers over the next 20 trading days, tested walk-forward on data the model
        never trained on.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Tag>Out-of-sample walk-forward backtest</Tag>
        {metrics ? (
          <>
            <Tag>{formatInt(metrics.universeSize)} equities</Tag>
            <Tag>Top {metrics.topN}</Tag>
            <Tag>{metrics.rebalanceDays}-day rebalance</Tag>
            <Tag>{formatDateRange(metrics.testStart, metrics.testEnd)}</Tag>
          </>
        ) : null}
      </div>

      {metrics ? (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border border-border p-5 sm:mt-12 sm:flex sm:flex-wrap sm:gap-0 sm:p-6">
          <Stat
            label="Annualized return"
            value={formatPercent(metrics.returns.topThreeAnnualized, 1)}
            tone="accent"
          />
          <Stat
            label="Excess vs. SPY"
            value={formatSignedPercent(metrics.excessReturn.vsSpy, 1)}
          />
          <Stat label="Sharpe ratio" value={formatDecimal(metrics.sharpe.topThree, 2)} />
          <Stat
            label="Backtest period"
            value={formatShortDateRange(metrics.testStart, metrics.testEnd)}
          />
        </div>
      ) : null}
    </header>
  );
}
