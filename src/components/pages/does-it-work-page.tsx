import { RankingQuality } from "../ranking-quality";
import { HistoricalDecisionExplorer } from "../historical-decision-explorer";
import type { PageProps } from "./types";

export function DoesItWorkPage({ metrics, predictions, rebalance, selectRebalance }: PageProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
          Is the ranking real, or luck?
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
          Portfolio returns mix two things: whether the model can sort stocks against
          each other, and how much market exposure the resulting basket happened to
          carry. This isolates the first question, then lets you check the model&apos;s
          actual historical picks for yourself.
        </p>
      </div>

      <RankingQuality metrics={metrics} predictions={predictions} />

      <div className="mt-14 border-t border-border pt-10">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Pick a date. See what it actually chose.
        </h2>
        <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
          Every one of the 45 real rebalances the model made during the test window.
          Prediction-time information is shown up front; the realized outcome is a
          deliberate reveal, not automatic — nothing here is cherry-picked.
        </p>
        <div className="mt-6">
          <HistoricalDecisionExplorer
            predictions={predictions}
            selectedDate={rebalance}
            onSelectDate={(date) => selectRebalance(date)}
          />
        </div>
      </div>
    </div>
  );
}
