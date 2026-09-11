"use client";

import { useState } from "react";
import { UncertaintyGlyph } from "./icons/glyphs";

const HEADLINE = [
  {
    title: "Statistical significance",
    detail: "The raw return advantage over SPY doesn't clear a conventional significance bar (t = 0.66, p = 0.51); the ranking edge itself does (t = 2.19, +1.85pp over the 50% baseline). I treat the return figure as descriptive, the ranking edge as the actual proven result.",
  },
  {
    title: "Concentration risk",
    detail: "A 3-name basket lets a single idiosyncratic move dominate a period's return. The worst single-name outcome in this test lost 15.8% against a universe that gained 2.5% the same period.",
  },
  {
    title: "No live execution",
    detail: "This is a backtest, not a live track record. A flat 15 bps round-trip cost is modeled; real slippage, fills, market impact, and taxes are not.",
  },
];

const MORE = [
  {
    title: "Small sample",
    detail: "45 non-overlapping rebalances over 2023–2026, enough for the ranking edge to clear significance, not enough to make strong claims about the return figures.",
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
    title: "Volatility-target lag",
    detail: "Exposure is sized off trailing realized volatility, which lags true forward risk. Realized volatility ran above the 17.3% target the basket was sized to.",
  },
  {
    title: "Universe construction",
    detail: "The ~90-name universe reflects the dataset's current membership, not a strictly point-in-time historical index list; some hindsight in \"what counted as the universe\" is possible.",
  },
];

export function Limitations() {
  const [showAll, setShowAll] = useState(false);

  return (
    <div>
      <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        <UncertaintyGlyph className="text-subtle" />
        Where this could be wrong
      </h2>

      <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-3">
        {HEADLINE.map((item) => (
          <div key={item.title} className="border-t border-border pt-3">
            <h3 className="text-[0.85rem] font-medium text-foreground">{item.title}</h3>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{item.detail}</p>
          </div>
        ))}
      </div>

      {showAll ? (
        <div className="mt-6 grid gap-x-8 gap-y-6 border-t border-border pt-6 sm:grid-cols-2">
          {MORE.map((item) => (
            <div key={item.title}>
              <h3 className="text-[0.85rem] font-medium text-foreground">{item.title}</h3>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setShowAll((v) => !v)}
        className="mt-6 font-mono text-[0.75rem] text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
      >
        {showAll ? "Show fewer" : `Show ${MORE.length} more`}
      </button>

      <p className="mt-10 max-w-2xl border-t border-border pt-6 text-[0.8rem] leading-relaxed text-subtle">
        This project is presented for research and engineering demonstration
        purposes and is not investment advice.
      </p>
    </div>
  );
}
