import { Section, SectionHeading } from "./ui/section";

const STAGES = [
  { title: "Historical market data", detail: "OHLCV, SPY/VIX, earnings dates, SEC EDGAR fundamentals" },
  { title: "Feature engineering", detail: "34 features across momentum, trend, volatility, range, and market context" },
  { title: "Walk-forward training", detail: "Retrained every 20 trading days on an expanding window of past data only" },
  { title: "XGBoost classifier", detail: "Estimates P(beats the cross-sectional median) over the next 20 trading days" },
  { title: "Cross-sectional ranking", detail: "All ~90 equities ranked against each other on that date" },
  { title: "Top-3 selection", detail: "Highest-ranked names, excluding those near an earnings report" },
  { title: "Inverse-volatility sizing", detail: "Weighted within the basket, then scaled to a 17.3% vol target" },
  { title: "20-day hold, then repeat", detail: "Position held to the next rebalance; the cycle advances forward in time" },
];

export function ModelPipeline() {
  return (
    <Section id="pipeline">
      <SectionHeading
        title="How the system works"
        lede="Eight stages, run once per rebalance. Ranking and portfolio construction are deliberately separate: the model only decides order, sizing is a downstream risk decision."
      />

      <ol className="grid grid-cols-1 gap-0 border border-border sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage, i) => (
          <li
            key={stage.title}
            className="border-b border-border p-5 sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0"
          >
            <div className="font-mono text-[0.8rem] tabular-nums text-accent">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="mt-2 text-[0.9rem] font-medium text-foreground">{stage.title}</div>
            <div className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">{stage.detail}</div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
