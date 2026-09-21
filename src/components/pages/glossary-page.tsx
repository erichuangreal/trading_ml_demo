"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Vane, type VaneState } from "../character/vane";
import { CompareGlyph, EvaluateGlyph, RankGlyph, TimeGlyph } from "../icons/glyphs";
import type { PageProps } from "./types";

const TERMS = [
  {
    term: "Cross-sectional ranking",
    plain: "Comparing every stock against every other stock on the same day, rather than judging one stock against its own history.",
    precise: "At each rebalance, the model scores all ~90 equities against the same day's cross-sectional median return, then ranks them relative to each other.",
  },
  {
    term: "Walk-forward validation",
    plain: "Testing the model the way it would actually be used: train on the past, predict the future, then move forward in time and repeat.",
    precise: "Retrained every 20 trading days on an expanding window of past data only, never on data from after the period being scored.",
  },
  {
    term: "Embargo",
    plain: "A short gap left empty between training data and test data, so no future information leaks backward.",
    precise: "A 20-trading-day buffer dropped from the end of the training window, since each label already looks 20 days into the future.",
  },
  {
    term: "t-statistic (t)",
    plain: "A measure of how likely a result is to be real signal rather than random noise. Bigger (in either direction) means more confidence it isn't luck.",
    precise: "Here, t = 2.19 for the ranking edge (conventionally significant) and t = 0.66 for the raw return advantage over SPY (not significant at typical thresholds).",
  },
  {
    term: "p-value (p)",
    plain: "The probability of seeing a result this extreme purely by chance, if there were actually no real effect at all. Smaller means less likely to be chance.",
    precise: "p = 0.51 for the return advantage over SPY: essentially a coin flip's worth of confidence that the gap is real.",
  },
  {
    term: "Sharpe ratio",
    plain: "Return per unit of bumpiness. Two strategies can earn the same money, but the one with a smoother ride has a higher Sharpe ratio.",
    precise: "Annualized return divided by annualized volatility. The model's Sharpe (1.15) trails SPY's (1.77) despite a higher raw return, because its path is rougher.",
  },
  {
    term: "Basis points (bps)",
    plain: "A hundredth of a percent. 100 bps = 1%. Used because it's easier to compare small numbers precisely.",
    precise: "The modeled 15 bps round-trip transaction cost = 0.15% per trade, deducted from every reported return.",
  },
  {
    term: "Exposure",
    plain: "How much of the portfolio is actually invested at a given time, versus held back as a safety margin.",
    precise: "Ranges 20%–100%, scaled so the whole basket targets a 17.3% annualized volatility rather than always being fully invested.",
  },
  {
    term: "Drawdown",
    plain: "How far the portfolio has fallen from its highest point so far, at a given moment.",
    precise: "Measured here only at the 46 rebalance-date observations, not daily, so the real intraperiod drawdown was likely deeper than shown.",
  },
];

// Sparse, on purpose: only the terms that are literally named after one of
// the site's own symbols get marked with it. Marking all nine would be the
// "one icon per heading" pattern the symbol language explicitly avoids.
const GLYPHS: Record<string, typeof RankGlyph> = {
  "Cross-sectional ranking": RankGlyph,
  "Walk-forward validation": TimeGlyph,
  Embargo: TimeGlyph,
  "Sharpe ratio": CompareGlyph,
};

export function GlossaryPage(_props: PageProps) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [vaneState, setVaneState] = useState<VaneState>("idle");
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function jumpTo(term: string) {
    entryRefs.current[term]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setActiveTerm(term);
    setVaneState("alert");
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setActiveTerm(null);
      setVaneState("idle");
    }, 1400);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
      <div className="mb-8 flex items-start gap-3">
        <EvaluateGlyph className="mt-1 shrink-0 text-accent" />
        <div className="flex flex-1 items-start justify-between gap-3">
          <h1 className="text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
            How to read this site
          </h1>
          <Vane state={vaneState} size={26} className="mt-1 shrink-0" />
        </div>
      </div>

      <div className="mb-10 flex flex-wrap gap-1.5" role="list" aria-label="Jump to a term">
        {TERMS.map((t) => (
          <button
            key={t.term}
            type="button"
            role="listitem"
            onClick={() => jumpTo(t.term)}
            className={`border px-2.5 py-1.5 font-mono text-[0.7rem] transition-colors ${
              activeTerm === t.term
                ? "border-accent text-accent"
                : "border-border text-subtle hover:border-border-strong hover:text-muted"
            }`}
          >
            {t.term}
          </button>
        ))}
      </div>

      <dl className="sm:columns-2 sm:gap-x-10">
        {TERMS.map((t) => {
          const Glyph = GLYPHS[t.term];
          return (
            <div
              key={t.term}
              ref={(el) => {
                entryRefs.current[t.term] = el;
              }}
              className="break-inside-avoid border-t border-border py-6 first:border-t-0 first:pt-0"
            >
              <motion.div
                animate={{
                  backgroundColor: activeTerm === t.term ? "var(--color-accent-glow)" : "rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.6 }}
                className="-mx-3 rounded px-3 py-1"
              >
                <dt className="flex items-center gap-1.5 text-[1rem] font-medium text-foreground">
                  {Glyph ? <Glyph width={12} height={12} className="shrink-0 text-accent/70" /> : null}
                  {t.term}
                </dt>
                <dd className="mt-2 max-w-xl text-[0.9rem] leading-relaxed text-muted">{t.plain}</dd>
                <dd className="mt-2 max-w-xl border-l-2 border-border pl-3 text-[0.8rem] leading-relaxed text-subtle">
                  {t.precise}
                </dd>
              </motion.div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
