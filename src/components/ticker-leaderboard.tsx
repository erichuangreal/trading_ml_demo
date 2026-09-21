"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Vane } from "./character/vane";
import { RankGlyph } from "./icons/glyphs";
import { formatDecimal, formatPercent } from "@/lib/format";
import type { LiveResult } from "@/lib/live-types";

const GRID_SIZE = 18;
const SHUFFLE_INTERVAL_MS = 1100;
const MEDAL_CLASS = ["border-accent/60 text-accent", "border-border-strong text-foreground", "border-border-strong text-muted"];

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Decorative "sorting in progress" leaderboard, shown while the live
 * pipeline runs. No score, weight, or dollar figure appears here: the model
 * has no real intermediate ranking while it's training, so this is a
 * clearly stylized visualization of activity, not a claim about real
 * numbers. The moment the real result lands, it resolves into the real
 * Top-3 podium in one deliberate motion.
 */
export function TickerLeaderboard({
  tickerPool,
  isRunning,
  result,
}: {
  tickerPool: string[];
  isRunning: boolean;
  result: LiveResult | null;
}) {
  const prefersReducedMotion = useReducedMotion();
  const pool = tickerPool.length > 0 ? tickerPool : ["N/A"];
  const [order, setOrder] = useState<string[]>(() => pool.slice(0, GRID_SIZE));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning || prefersReducedMotion) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setOrder((prev) => shuffled(prev));
    }, SHUFFLE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, prefersReducedMotion]);

  if (result) {
    return (
      <div className="border border-border">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <Vane state="alert" angle={20} size={28} />
            <span className="text-[0.85rem] font-medium text-foreground">Today&apos;s real Top 3</span>
          </div>
          <span className="font-mono text-[0.75rem] tabular-nums text-subtle">as of {result.asOf}</span>
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="grid gap-px bg-border p-px sm:grid-cols-3"
        >
          {result.picks.map((pick, i) => (
            <div key={pick.ticker} className="bg-background p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <RankGlyph className={MEDAL_CLASS[i] ?? "text-subtle"} width={14} height={14} />
                <span className="font-mono text-base font-medium tabular-nums text-foreground">{pick.ticker}</span>
              </div>
              <dl className="mt-3 flex flex-col gap-1.5 text-[0.75rem] text-muted">
                <div className="flex justify-between">
                  <dt>Model score</dt>
                  <dd className="font-mono tabular-nums text-foreground">{formatDecimal(pick.score, 2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>20d volatility</dt>
                  <dd className="font-mono tabular-nums text-foreground">{formatPercent(pick.volatility20d, 1)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Weight</dt>
                  <dd className="font-mono tabular-nums text-foreground">{formatPercent(pick.weightPct / 100, 1)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Sized at</dt>
                  <dd className="font-mono tabular-nums text-foreground">${formatDecimal(pick.dollars, 2)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </motion.div>

        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-border p-4 text-[0.8rem] sm:p-5">
          <span className="text-muted">
            Exposure <span className="font-mono tabular-nums text-foreground">{formatPercent(result.exposure, 0)}</span>
          </span>
          <span className="text-muted">
            Invested <span className="font-mono tabular-nums text-foreground">${formatDecimal(result.invested, 2)}</span>
            {" · "}Cash <span className="font-mono tabular-nums text-foreground">${formatDecimal(result.cash, 2)}</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <span className="text-[0.85rem] font-medium text-foreground">
          {isRunning ? "Sorting in progress" : "Today's picks aren't ready yet"}
        </span>
        <span className="text-[0.75rem] text-subtle">not live scores</span>
      </div>

      <div className="grid grid-cols-3 gap-px bg-border p-px sm:grid-cols-6">
        {order.map((ticker) => (
          <motion.div
            key={ticker}
            layout={!prefersReducedMotion}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="flex items-center justify-center bg-background px-2 py-3"
          >
            <span className="font-mono text-[0.8rem] tabular-nums text-muted">{ticker}</span>
          </motion.div>
        ))}
      </div>

      <p className="border-t border-border p-4 text-[0.75rem] leading-relaxed text-subtle sm:p-5">
        The model has no partial ranking while it trains, so this board is a stylized visualization of activity, not
        real scores. The real Top 3 replaces it the moment the run finishes.
      </p>
    </div>
  );
}
