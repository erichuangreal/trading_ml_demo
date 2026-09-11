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

export function Limitations() {
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

      <p className="mt-10 max-w-2xl border-t border-border pt-6 text-[0.8rem] leading-relaxed text-subtle">
        This project is presented for research and engineering demonstration
        purposes and is not investment advice.
      </p>
    </div>
  );
}
