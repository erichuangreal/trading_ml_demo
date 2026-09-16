"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

const FIELD_DOTS = 14;

function ScanningField() {
  return (
    <div className="relative flex h-24 items-center justify-center">
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: FIELD_DOTS }).map((_, i) => (
          <motion.span
            key={i}
            className="block h-2 w-2 rounded-full bg-border-strong"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.06, ease: "easeInOut" }}
          />
        ))}
      </div>
      <motion.div
        className="absolute"
        animate={{ left: ["8%", "55%", "30%", "80%", "50%"], top: ["20%", "60%", "40%", "30%", "50%"] }}
        transition={{ duration: 1.3, ease: "easeInOut" }}
      >
        <Vane state="travel" size={30} />
      </motion.div>
    </div>
  );
}

function MiniDemo({
  predictions,
  onExplore,
}: {
  predictions: PageProps["predictions"];
  onExplore: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  // Server always renders the resolved state (no window/sessionStorage to
  // check), so the client must start there too and only drop into the
  // scanning animation from a post-mount effect, or hydration would mismatch
  // exactly like the bug fixed in app-shell.tsx.
  const [resolved, setResolved] = useState(true);
  const period = predictions?.periods[0];

  useEffect(() => {
    if (Boolean(prefersReducedMotion) || sessionStorage.getItem("overviewScanned") === "1") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolved(false);
    const t = setTimeout(() => {
      setResolved(true);
      sessionStorage.setItem("overviewScanned", "1");
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!period) {
    return <p className="text-sm text-muted">Historical picks aren&apos;t available right now.</p>;
  }

  return (
    <div className="border border-border p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[0.7rem] uppercase tracking-wide text-subtle">
            {resolved ? "The model's very first real rebalance" : "Scanning the universe…"}
          </div>
          {resolved ? (
            <div className="mt-1 font-mono text-sm tabular-nums text-foreground">{period.date}</div>
          ) : null}
        </div>
        {resolved ? <Vane state={revealed ? "alert" : "idle"} angle={20} size={34} /> : null}
      </div>

      <AnimatePresence mode="wait">
        {!resolved ? (
          <motion.div key="scanning" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mt-2">
              <ScanningField />
            </div>
            <p className="mt-2 text-center text-[0.7rem] text-subtle">
              Illustrative: the dots stand in for the ~90-name universe being scanned, not real distinct tickers.
            </p>
          </motion.div>
        ) : (
          <motion.div key="resolved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <ul className="mt-4 flex flex-col gap-2">
              {period.picks.map((pick, i) => (
                <motion.li
                  key={pick.ticker}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="flex items-center justify-between border-t border-border py-2.5 first:border-t-0"
                >
                  <div className="flex items-center gap-2.5">
                    <RankGlyph className="text-subtle" width={14} height={14} />
                    <span className="font-mono text-sm tabular-nums text-foreground">{pick.ticker}</span>
                    <span className="font-mono text-[0.7rem] tabular-nums text-subtle">
                      score {formatDecimal(pick.score, 2)}
                    </span>
                  </div>
                  <span className="font-mono text-sm tabular-nums">
                    {revealed ? (
                      <span className={pick.next20dReturn >= 0 ? "text-positive" : "text-negative"}>
                        {formatSignedPercent(pick.next20dReturn, 1)}
                      </span>
                    ) : (
                      <span className="text-subtle">? ? ?</span>
                    )}
                  </span>
                </motion.li>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function OverviewPage({ metrics, predictions, selectRebalance, navigate }: PageProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-20 md:py-24">
      <div className="grid gap-12 md:grid-cols-[1.15fr_1fr] md:gap-16">
        <div>
          <h1 className="max-w-xl text-[2.1rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-[2.9rem]">
            I taught a model to rank stocks. It returned more than the S&P 500.
          </h1>

          <p className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-muted">
            This trading ml model ranks NASDAQ stocks against each other and forms a
            long-only basket from the top-ranked, holding for 20 days. Built on OHLCV
            technicals, market context (SPY/VIX), earnings dates, and SEC EDGAR fundamentals.
            Trained on NASDAQ yFinance data.
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
              Final model: Top 3, long only, 20-day hold, 34 features, inverse-volatility weighted
              with the 17.3% vol target. Sorting edge +1.85pp at t = 2.19, +33.8%/yr net against
              SPY's +24.3% and the universe's +27.7%.
              The honest read is on{" "}
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
              That&apos;s Vane: watch it scan the field and land on the real picks on the right.
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
