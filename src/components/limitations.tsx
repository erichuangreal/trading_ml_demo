import { Section, SectionHeading } from "./ui/section";

const LIMITATIONS = [
  {
    title: "Small sample",
    detail: "45 non-overlapping rebalances over 2023–2026 — enough for the ranking edge to clear significance, not enough to make strong claims about the return figures.",
  },
  {
    title: "Regime dependence",
    detail: "The test window is one specific market period. Feature-return relationships learned here may not hold in a different regime.",
  },
  {
    title: "Signal decay",
    detail: "Ranking edges commonly shrink as market conditions and participants change; nothing here re-validates the model against new data automatically.",
  },
  {
    title: "Concentration risk",
    detail: "A 3-name basket lets a single idiosyncratic move dominate a period's return — the worst single-name outcome in this test lost 15.8% against a universe that gained 2.5% the same period.",
  },
  {
    title: "Volatility-target lag",
    detail: "Exposure is sized off trailing realized volatility, which lags true forward risk — realized volatility ran above the 17.3% target the basket was sized to.",
  },
  {
    title: "Modeled execution",
    detail: "A flat 15 bps round-trip cost is a modeled estimate. Real slippage, spreads, and market impact — especially at larger size — may differ.",
  },
  {
    title: "No live execution",
    detail: "This is a backtest, not a live track record. Fills, timing, and partial-bar effects are not modeled.",
  },
  {
    title: "Pre-tax",
    detail: "No tax treatment is modeled; realized returns are shown gross of any tax consequence.",
  },
  {
    title: "Universe construction",
    detail: "The ~90-name universe reflects the dataset's current membership, not a strictly point-in-time historical index list — some hindsight in \"what counted as the universe\" is possible.",
  },
  {
    title: "Statistical significance",
    detail: "The raw return advantage over SPY does not clear a conventional significance bar (t = 0.66, p = 0.51); treat it as descriptive, not proven.",
  },
];

export function Limitations() {
  return (
    <Section id="limitations">
      <SectionHeading title="Limitations" />

      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {LIMITATIONS.map((item) => (
          <div key={item.title} className="border-t border-border pt-3">
            <h3 className="text-[0.85rem] font-medium text-foreground">{item.title}</h3>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{item.detail}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-2xl border-t border-border pt-6 text-[0.8rem] leading-relaxed text-subtle">
        This project is presented for research and engineering demonstration
        purposes and is not investment advice.
      </p>
    </Section>
  );
}
