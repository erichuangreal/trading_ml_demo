"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Vane } from "../character/vane";
import { RankGlyph } from "../icons/glyphs";
import { Tag } from "../ui/tag";
import {
  formatDateRange,
  formatDecimal,
  formatInt,
  formatPercent,
  formatSignedPercent,
} from "@/lib/format";
import type { PageProps } from "./types";

function MiniDemo({
  predictions,
  onExplore,
}: {
  predictions: PageProps["predictions"];
  onExplore: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const period = predictions?.periods[0];

  if (!period) {
    return <p className="text-sm text-muted">Historical picks aren&apos;t available right now.</p>;
  }

  return (
    <div className="border border-border p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[0.7rem] uppercase tracking-wide text-subtle">
            The model&apos;s very first real rebalance
          </div>
          <div className="mt-1 font-mono text-sm tabular-nums text-foreground">{period.date}</div>
        </div>
        <Vane state={revealed ? "alert" : "idle"} angle={20} size={34} />
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {period.picks.map((pick) => (
          <li
            key={pick.ticker}
            className="flex items-center justify-between border-t border-border py-2.5 first:border-t-0"
          >
            <div className="flex items-center gap-2.5">
              <RankGlyph className="text-subtle" width={14} height={14} />
              <span className="font-mono text-sm tabular-nums text-foreground">{pick.ticker}</span>
              <span className="font-mono text-[0.7rem] tabular-nums text-subtle">
                score {formatDecimal(pick.score, 2)}
              </span>
            </div>
            <motion.span
              className="font-mono text-sm tabular-nums"
              initial={false}
              animate={{ opacity: 1 }}
            >
              {revealed ? (
                <span className={pick.next20dReturn >= 0 ? "text-positive" : "text-negative"}>
                  {formatSignedPercent(pick.next20dReturn, 1)}
                </span>
              ) : (
                <span className="text-subtle">? ? ?</span>
              )}
            </motion.span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {!revealed ? (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="border border-accent px-3 py-1.5 font-mono text-[0.75rem] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Reveal what happened next
          </button>
        ) : (
          <p className="text-[0.75rem] text-subtle">
            Real outcome, {period.date} + 20 trading days. Not a live recommendation.
          </p>
        )}
        <button
          type="button"
          onClick={onExplore}
          className="font-mono text-[0.75rem] text-muted underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-accent"
        >
          Explore all 45 rebalances →
        </button>
      </div>
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: revealed && !prefersReducedMotion ? 1 : 0 }}
        className="pointer-events-none mt-3 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />
    </div>
  );
}

export function OverviewPage({ metrics, predictions, selectRebalance, navigate }: PageProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-20 md:py-24">
      <div className="grid gap-12 md:grid-cols-[1.15fr_1fr] md:gap-16">
        <div>
          <h1 className="max-w-xl text-[2rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[2.6rem]">
            I taught a model to rank stocks. It edged out the S&P!
          </h1>

          <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-muted">
            This is a personal project I built and tested in my own time: an XGBoost
            classifier that ranks a universe of equities every 20 trading days and
            bets on the top 3, sized so no single name can dominate the basket. Everything
            on this site is a real, out-of-sample historical result. I wanted to see
            what the model actually did, not just what it was supposed to do.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
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
            <p className="mt-6 max-w-lg text-[0.9rem] leading-relaxed text-subtle">
              Headline numbers: {formatPercent(metrics.returns.topThreeAnnualized, 1)} annualized
              return against SPY&apos;s {formatPercent(metrics.returns.spyAnnualized, 1)}, but a
              lower Sharpe ratio ({formatDecimal(metrics.sharpe.topThree, 2)} vs.{" "}
              {formatDecimal(metrics.sharpe.spy, 2)}). The honest read is on{" "}
              <button
                type="button"
                onClick={() => navigate("performance")}
                className="underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-accent"
              >
                Performance
              </button>
              .
            </p>
          ) : null}

          <div className="mt-8 flex items-center gap-2.5 border-l-2 border-accent/50 pl-3">
            <Vane state="idle" size={26} />
            <p className="text-[0.85rem] text-subtle">
              That&apos;s Vane: it&apos;ll point at whatever the model&apos;s watching as you explore.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.85rem]">
            <button
              type="button"
              onClick={() => navigate("does-it-work")}
              className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              Explore historical results
            </button>
            <button
              type="button"
              onClick={() => navigate("how-its-built")}
              className="text-muted underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-accent"
            >
              See how it&apos;s built
            </button>
            <a
              href="https://github.com/erichuangreal/trading_ml"
              target="_blank"
              rel="noreferrer"
              className="text-muted underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-accent"
            >
              See the model &amp; training code
            </a>
            <a
              href="https://github.com/erichuangreal/trading_ml_demo"
              target="_blank"
              rel="noreferrer"
              className="text-muted underline decoration-border underline-offset-4 hover:text-foreground hover:decoration-accent"
            >
              View this site&apos;s source
            </a>
          </div>
        </div>

        <div className="md:pt-2">
          <MiniDemo
            predictions={predictions}
            onExplore={() => selectRebalance(predictions?.periods[0]?.date ?? null, { navigateTo: "does-it-work" })}
          />
        </div>
      </div>
    </div>
  );
}
