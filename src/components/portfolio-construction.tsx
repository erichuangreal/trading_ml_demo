import { SectionHeading } from "./ui/section";
import { formatPercent } from "@/lib/format";
import type { MetricsData } from "@/lib/types";

const STEPS = [
  "Rank all ~90 equities",
  "Select the top 3",
  "Weight inversely to each pick's own volatility",
  "Scale the whole basket to a 17.3% annualized vol target",
  "Hold 20 trading days, then rebalance",
];

export function PortfolioConstruction({ metrics }: { metrics: MetricsData | null }) {
  return (
    <div>
      <SectionHeading
        title="Portfolio construction is a separate decision from ranking"
        lede="The model only decides order. Everything below is a risk-management layer applied after the ranking, and it can be changed without retraining anything."
      />

      <ol className="flex flex-col gap-0 border-l border-border">
        {STEPS.map((step, i) => (
          <li key={step} className="relative py-3 pl-6">
            <span className="absolute left-[-4.5px] top-4 h-[9px] w-[9px] rounded-full border-2 border-accent bg-background" />
            <span className="font-mono text-[0.75rem] tabular-nums text-subtle">
              {String(i + 1).padStart(2, "0")}
            </span>{" "}
            <span className="text-[0.9rem] text-foreground">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-8 max-w-2xl text-[0.85rem] leading-relaxed text-muted">
        Equal weighting the top 3 would let the single most volatile pick
        dominate the basket&apos;s risk — the ranking says which names to
        hold, not how much risk each deserves, so sizing inversely to{" "}
        <code className="rounded border border-border px-1 py-0.5 font-mono text-[0.75rem]">volatility_20d</code>{" "}
        equalizes each pick&apos;s risk contribution. The whole basket is then
        scaled toward a 17.3% annualized volatility target, clamped between
        20% and 100% exposure — de-risking in turbulent stretches, never
        levering past 1x.
        {metrics ? (
          <>
            {" "}In practice the basket still realized{" "}
            <span className="font-mono tabular-nums text-foreground">
              {formatPercent(metrics.realizedVolatility.topThree, 1)}
            </span>{" "}
            annualized volatility — above target, since exposure is sized off
            trailing realized volatility, which lags true forward risk. See
            What I Learned for the full limitations list.
          </>
        ) : null}
      </p>
    </div>
  );
}
