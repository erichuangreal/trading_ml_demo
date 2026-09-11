"use client";

import { PerformanceChart } from "../performance-chart";
import { DrawdownChart } from "../drawdown-chart";
import { ExecutiveResult } from "../executive-result";
import { Vane } from "../character/vane";
import type { PageProps } from "./types";

export function PerformancePage({ metrics, equityCurve, predictions, rebalance, selectRebalance }: PageProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8 sm:py-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
            How did it actually do?
          </h1>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
            $100 invested at the start of the test window, compounded through every real 20-trading-day rebalance.
            Every point that starts a rebalance is clickable; it opens that period in{" "}
            <button
              type="button"
              onClick={() => selectRebalance(rebalance, { navigateTo: "does-it-work" })}
              className="underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-accent"
            >
              Does It Work?
            </button>
            .
          </p>
        </div>
        <Vane state="resting" size={32} className="mt-1 hidden sm:inline-flex" />
      </div>

      <PerformanceChart
        equityCurve={equityCurve}
        predictions={predictions}
        selectedDate={rebalance}
        onSelectRebalance={(date) => selectRebalance(date, { navigateTo: "does-it-work" })}
      />

      <div className="mt-10 border-t border-border pt-8">
        <DrawdownChart equityCurve={equityCurve} />
      </div>

      <div className="mt-8 border-t border-border pt-8">
        <ExecutiveResult metrics={metrics} />
      </div>
    </div>
  );
}
