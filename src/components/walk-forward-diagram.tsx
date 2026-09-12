"use client";

import { motion, useReducedMotion } from "framer-motion";

const ROWS = [
  { train: 30, gap: 4, test: 8 },
  { train: 46, gap: 4, test: 8 },
  { train: 62, gap: 4, test: 8 },
  { train: 78, gap: 4, test: 8 },
];

/** Embedded inside How It's Built's pipeline detail panel; remounts (and re-animates) each time that stage is opened. */
export function WalkForwardDiagram() {
  const prefersReducedMotion = useReducedMotion();
  const animated = !prefersReducedMotion;

  return (
    <div>
      <p className="max-w-2xl text-[0.85rem] leading-relaxed text-muted">
        At every refit, only data from before a 20-day embargo is used for training; the model is then scored
        on the period immediately after. The window expands and slides forward through the whole test range:
        never a single random train/test split.
      </p>

      <div className="mt-4 border border-border p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          {ROWS.map((row, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-0"
              initial={animated ? { opacity: 0, x: -12 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="h-6 border border-accent/40 bg-accent/10"
                initial={animated ? { width: 0 } : false}
                animate={{ width: `${row.train}%` }}
                transition={{ duration: 0.5, delay: i * 0.35, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden
              />
              <motion.div
                className="h-6 border-t border-b border-dashed border-border"
                initial={animated ? { width: 0 } : false}
                animate={{ width: `${row.gap}%` }}
                transition={{ duration: 0.2, delay: i * 0.35 + 0.5 }}
                aria-hidden
              />
              <motion.div
                className="h-6 border border-accent bg-accent/70"
                initial={animated ? { width: 0 } : false}
                animate={{ width: `${row.test}%` }}
                transition={{ duration: 0.3, delay: i * 0.35 + 0.65, ease: [0.34, 1.4, 0.64, 1] }}
                aria-hidden
              />
              <div className="ml-3 whitespace-nowrap font-mono text-[0.7rem] tabular-nums text-subtle">
                refit {i + 1}
              </div>
            </motion.div>
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

      <p className="mt-4 max-w-2xl text-[0.8rem] leading-relaxed text-subtle">
        Each rebalance&apos;s label looks 20 trading days into the future, so the embargo drops the last 20
        trading days of training to prevent any overlap, a stricter test than a single random split, at the
        cost of a smaller effective sample: 45 independent, non-overlapping periods across 2023–2026.
      </p>
    </div>
  );
}
