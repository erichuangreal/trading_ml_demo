import { SectionHeading } from "./ui/section";

const ROWS = [
  { train: 30, gap: 4, test: 8 },
  { train: 46, gap: 4, test: 8 },
  { train: 62, gap: 4, test: 8 },
  { train: 78, gap: 4, test: 8 },
];

export function WalkForwardDiagram() {
  return (
    <div>
      <SectionHeading
        title="Walk-forward validation"
        lede="At every refit, only data from before a 20-day embargo is used for training; the model is then scored on the period immediately after. The window expands and slides forward through the whole test range: never a single random train/test split."
      />

      <div className="border border-border p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          {ROWS.map((row, i) => (
            <div key={i} className="flex items-center gap-0">
              <div
                className="h-6 border border-accent/40 bg-accent/10"
                style={{ width: `${row.train}%` }}
                aria-hidden
              />
              <div className="h-6 border-t border-b border-dashed border-border" style={{ width: `${row.gap}%` }} aria-hidden />
              <div
                className="h-6 border border-accent bg-accent/70"
                style={{ width: `${row.test}%` }}
                aria-hidden
              />
              <div className="ml-3 whitespace-nowrap font-mono text-[0.7rem] tabular-nums text-subtle">
                refit {i + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-[0.75rem] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 border border-accent/40 bg-accent/10" aria-hidden />
            Training data (expanding window, past only)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 border-t border-b border-dashed border-border" aria-hidden />
            20-day embargo (dropped, prevents label leakage)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 border border-accent bg-accent/70" aria-hidden />
            Scored test period (unseen at training time)
          </span>
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-[0.85rem] leading-relaxed text-muted">
        Each rebalance&apos;s label looks 20 trading days into the future, so a
        row dated one day before the test block already carries information
        from inside it. The embargo drops the last 20 trading days of
        training so no label ever overlaps the period being scored, a
        stricter and more realistic test than a single random split, at the
        cost of a smaller effective sample: 45 independent, non-overlapping
        periods across 2023–2026.
      </p>
    </div>
  );
}
