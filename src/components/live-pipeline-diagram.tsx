"use client";

import { motion } from "framer-motion";
import { UncertaintyGlyph } from "./icons/glyphs";
import type { LiveStage } from "@/lib/live-types";

const IDLE_STAGES: LiveStage[] = [
  { key: "extract_data", label: "Fetching prices (yfinance)", state: "pending" },
  { key: "fundamentals", label: "Fetching fundamentals", state: "pending" },
  { key: "edgar_fundamentals", label: "Fetching SEC filings (EDGAR)", state: "pending" },
  { key: "process_data", label: "Processing data", state: "pending" },
  { key: "random_forest", label: "Retraining (45-fold walk-forward)", state: "pending" },
  { key: "predict", label: "Ranking today's picks", state: "pending" },
];

function nodeClass(stage: LiveStage): string {
  if (stage.state === "running") return "border-accent bg-accent text-accent-foreground";
  if (stage.state === "done") return "border-accent text-accent";
  if (stage.state === "error") return "border-dashed border-subtle text-subtle";
  return "border-border-strong bg-background text-subtle";
}

function labelClass(stage: LiveStage): string {
  if (stage.state === "running" || stage.state === "done") return "text-foreground";
  if (stage.state === "error") return "text-subtle";
  return "text-muted";
}

function StageDot({ stage, index }: { stage: LiveStage; index: number }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[0.7rem] tabular-nums transition-colors ${nodeClass(stage)}`}
    >
      {stage.state === "error" ? <UncertaintyGlyph width={14} height={14} /> : String(index + 1).padStart(2, "0")}
    </span>
  );
}

function RunningDots() {
  return (
    <motion.span
      className="ml-1 inline-block text-accent"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      &hellip;
    </motion.span>
  );
}

export function LivePipelineDiagram({ stages: realStages }: { stages: LiveStage[] | null }) {
  const stages = realStages ?? IDLE_STAGES;
  const doneCount = stages.filter((s) => s.state === "done").length;
  // Plain "stages done / total stages" -- this can never exceed 100%. The
  // previous version divided by (length - 1), a leftover from when this
  // fraction had to double as an index position for a traveling Vane; with
  // that gone, dividing by length - 1 just overshoots past the last node
  // once every stage is done (6 done / 5 = 120% width).
  const progressPct = stages.length > 0 ? (doneCount / stages.length) * 100 : 0;

  return (
    <div>
      {/* Mobile: vertical stepper. A 2-column grid of bare circles can't carry a single
          connecting thread, so this is its own layout rather than a squeezed copy of the
          desktop one -- same nodes, same real state, read top to bottom. */}
      <div className="relative sm:hidden">
        <div className="absolute left-4 top-2 bottom-2 w-px -translate-x-1/2 bg-border" aria-hidden />
        <motion.div
          className="absolute left-4 top-2 w-px -translate-x-1/2 bg-accent"
          animate={{ height: `${progressPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          aria-hidden
        />

        <ol className="relative flex flex-col gap-5">
          {stages.map((stage, i) => (
            <li key={stage.key} className="flex items-center gap-3">
              <StageDot stage={stage} index={i} />
              <span className={`text-[0.8rem] leading-snug ${labelClass(stage)}`}>
                {stage.label}
                {stage.state === "running" ? <RunningDots /> : null}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Desktop: horizontal, nodes left to right. */}
      <div className="relative hidden pt-4 sm:block">
        <div className="absolute left-0 right-0 top-[19px] h-px bg-border" aria-hidden />
        <motion.div
          className="absolute left-0 top-[19px] h-px bg-accent"
          animate={{ width: `${progressPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 22 }}
          aria-hidden
        />

        <ol className="relative grid grid-cols-3 gap-3 pt-9 lg:grid-cols-6">
          {stages.map((stage, i) => (
            <li key={stage.key} className="flex flex-col items-start">
              <StageDot stage={stage} index={i} />
              <span className={`mt-2 text-[0.8rem] leading-snug ${labelClass(stage)}`}>
                {stage.label}
                {stage.state === "running" ? <RunningDots /> : null}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
