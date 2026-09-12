"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Vane } from "./character/vane";
import { RankGlyph } from "./icons/glyphs";
import { PercentileAxis, PercentileDot } from "./percentile-scale";
import { formatDate, formatChipDate, formatSignedPercent, formatDecimal, formatPercent } from "@/lib/format";
import type { PredictionsData } from "@/lib/types";

const MEDAL_CLASS = ["border-accent/60 text-accent", "border-border-strong text-foreground", "border-border-strong text-muted"];

function ReturnCell({ value }: { value: number | undefined }) {
  if (value === undefined) return <span className="text-subtle">N/A</span>;
  return <span className={value >= 0 ? "text-positive" : "text-negative"}>{formatSignedPercent(value, 1)}</span>;
}

export function HistoricalDecisionExplorer({
  predictions,
  selectedDate,
  onSelectDate,
}: {
  predictions: PredictionsData | null;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const periods = useMemo(() => predictions?.periods ?? [], [predictions]);
  const prefersReducedMotion = useReducedMotion();

  const index = useMemo(() => {
    const found = periods.findIndex((p) => p.date === selectedDate);
    return found >= 0 ? found : 0; // deterministic default: earliest period
  }, [periods, selectedDate]);

  const period = periods[index];
  const [revealedDates, setRevealedDates] = useState<Set<string>>(new Set());
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [lastDate, setLastDate] = useState(period?.date);
  if (period?.date !== lastDate) {
    setLastDate(period?.date);
    setExpandedTicker(null);
  }

  useEffect(() => {
    chipRefs.current[index]?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [index]);

  if (!predictions || periods.length === 0 || !period) {
    return <p className="text-sm text-muted">Predictions unavailable: public/data/predictions.json is missing.</p>;
  }

  const revealed = revealedDates.has(period.date);

  function reveal() {
    setRevealedDates((prev) => new Set(prev).add(period.date));
  }

  const strongest = periods.reduce((best, p) => (p.portfolioReturn > best.portfolioReturn ? p : best), periods[0]);
  const hardest = periods.reduce((worst, p) => (p.portfolioReturn < worst.portfolioReturn ? p : worst), periods[0]);

  return (
    <div>
      <p className="mb-3 text-[0.75rem] text-subtle">
        By portfolio return: strongest real period was{" "}
        <button type="button" onClick={() => onSelectDate(strongest.date)} className="font-mono text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
          {formatChipDate(strongest.date)} ({formatSignedPercent(strongest.portfolioReturn, 1)})
        </button>
        , hardest was{" "}
        <button type="button" onClick={() => onSelectDate(hardest.date)} className="font-mono text-negative underline decoration-negative/40 underline-offset-2 hover:decoration-negative">
          {formatChipDate(hardest.date)} ({formatSignedPercent(hardest.portfolioReturn, 1)})
        </button>
        .
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSelectDate(periods[Math.max(0, index - 1)].date)}
          disabled={index === 0}
          aria-label="Previous rebalance"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div role="listbox" aria-label="Select a historical rebalance date" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1">
          {periods.map((p, i) => (
            <button
              key={p.date}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              type="button"
              role="option"
              aria-selected={i === index}
              onClick={() => onSelectDate(p.date)}
              className={`shrink-0 whitespace-nowrap border px-2.5 py-1.5 font-mono text-[0.75rem] tabular-nums transition-colors ${
                i === index ? "border-accent text-accent" : "border-border text-subtle hover:border-border-strong hover:text-muted"
              }`}
            >
              {formatChipDate(p.date)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelectDate(periods[Math.min(periods.length - 1, index + 1)].date)}
          disabled={index === periods.length - 1}
          aria-label="Next rebalance"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted transition-colors hover:border-border-strong hover:text-foreground disabled:opacity-30"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M5.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mt-8 border border-border">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <Vane state={revealed ? "alert" : "idle"} angle={20} size={30} />
            <div className="font-mono text-lg tabular-nums text-foreground">{formatDate(period.date)}</div>
          </div>
          <div className="text-[0.75rem] text-subtle">Historical out-of-sample decision · not a live recommendation</div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={period.date}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
          >
            <div className="grid gap-px bg-border p-px sm:grid-cols-3">
              {period.picks.map((pick, i) => {
                const isExpanded = expandedTicker === pick.ticker;
                return (
                  <div key={pick.ticker} className={`bg-background p-4 ${isExpanded ? "sm:col-span-3" : ""}`}>
                    <button
                      type="button"
                      onClick={() => setExpandedTicker(isExpanded ? null : pick.ticker)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <span className="flex items-center gap-2">
                        <RankGlyph className={MEDAL_CLASS[i] ?? "text-subtle"} width={14} height={14} />
                        <span className="font-mono text-sm font-medium tabular-nums text-foreground">{pick.ticker}</span>
                        <span className="font-mono text-[0.7rem] tabular-nums text-subtle">#{pick.rank}</span>
                      </span>
                      <span className="font-mono text-[0.7rem] text-subtle">{isExpanded ? "−" : "+"}</span>
                    </button>

                    <dl className="mt-2 flex flex-col gap-1 text-[0.75rem] text-muted">
                      <div className="flex justify-between">
                        <dt>Model score</dt>
                        <dd className="font-mono tabular-nums text-foreground">{formatDecimal(pick.score, 2)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>20d volatility</dt>
                        <dd className="font-mono tabular-nums text-foreground">{formatPercent(pick.volatility20d, 1)}</dd>
                      </div>
                    </dl>

                    {isExpanded ? (
                      <div className="mt-3 border-t border-border pt-3 text-[0.75rem] leading-relaxed text-muted">
                        <p>
                          Known at prediction time: rank #{pick.rank} of the Top {period.picks.length}, model score{" "}
                          {formatDecimal(pick.score, 2)} (its estimated probability of beating the day&apos;s cross-sectional
                          median return), sized against {formatPercent(pick.volatility20d, 1)} trailing 20-day volatility.
                        </p>
                        {revealed ? (
                          <>
                            <p className="mt-2 border-t border-border pt-2">
                              Known only afterward: landed at the{" "}
                              <span className="font-mono tabular-nums text-foreground">{formatPercent(pick.actualPercentile, 0)}</span>{" "}
                              percentile of that day&apos;s actual return distribution, returning{" "}
                              <ReturnCell value={pick.next20dReturn} /> over the next 20 trading days.
                            </p>
                            <div className="mt-3">
                              <PercentileAxis height={28}>
                                <PercentileDot pct={pick.actualPercentile} size={9} color="bg-accent" />
                              </PercentileAxis>
                            </div>
                          </>
                        ) : (
                          <p className="mt-2 border-t border-border pt-2 text-subtle">Reveal the outcome below to see how it actually landed.</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 font-mono text-[0.8rem] tabular-nums">
                        {revealed ? <ReturnCell value={pick.next20dReturn} /> : <span className="text-subtle">? ? ?</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!revealed ? (
              <div className="flex items-center justify-between gap-3 border-t border-border p-4 sm:p-5">
                <p className="text-[0.75rem] text-subtle">Outcomes are known only after the 20-day hold; nothing here was cherry-picked.</p>
                <button
                  type="button"
                  onClick={reveal}
                  className="shrink-0 border border-accent px-3 py-1.5 font-mono text-[0.75rem] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Reveal outcome
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
                <div className="bg-background p-4 sm:p-5">
                  <div className="text-[0.75rem] text-subtle">Top-3 portfolio</div>
                  <div className="mt-1 font-mono text-base tabular-nums">
                    <ReturnCell value={period.portfolioReturn} />
                  </div>
                </div>
                <div className="bg-background p-4 sm:p-5">
                  <div className="text-[0.75rem] text-subtle">SPY, same window</div>
                  <div className="mt-1 font-mono text-base tabular-nums">
                    <ReturnCell value={period.spyReturn} />
                  </div>
                </div>
                <div className="bg-background p-4 sm:p-5">
                  <div className="text-[0.75rem] text-subtle">Excess vs. SPY</div>
                  <div className="mt-1 font-mono text-base tabular-nums">
                    <ReturnCell value={period.excessReturnVsSpy} />
                  </div>
                </div>
                <div className="bg-background p-4 sm:p-5">
                  <div className="text-[0.75rem] text-subtle">Exposure</div>
                  <div className="mt-1 font-mono text-base tabular-nums text-foreground">{formatPercent(period.exposure, 0)}</div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
