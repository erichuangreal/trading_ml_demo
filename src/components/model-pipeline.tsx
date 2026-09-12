"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "./ui/section";
import { Vane } from "./character/vane";
import { WalkForwardDiagram } from "./walk-forward-diagram";
import { FeatureSystem } from "./feature-system";
import { PortfolioConstruction } from "./portfolio-construction";
import type { MetricsData, ModelInfo } from "@/lib/types";

const STAGE_TITLES = [
  "Historical market data",
  "Feature engineering",
  "Walk-forward training",
  "XGBoost classifier",
  "Cross-sectional ranking",
  "Top-3 selection",
  "Inverse-volatility sizing",
  "20-day hold, then repeat",
];

export function ModelPipeline({ modelInfo, metrics }: { modelInfo: ModelInfo | null; metrics: MetricsData | null }) {
  const [open, setOpen] = useState(0);

  const details: ReactNode[] = [
    <p key={0} className="max-w-2xl text-[0.85rem] leading-relaxed text-muted">
      OHLCV, SPY/VIX, earnings dates, SEC EDGAR fundamentals: everything the model is allowed to see.
    </p>,
    <FeatureSystem key={1} modelInfo={modelInfo} />,
    <WalkForwardDiagram key={2} />,
    <p key={3} className="max-w-2xl text-[0.85rem] leading-relaxed text-muted">
      Estimates each stock&apos;s probability of beating the day&apos;s cross-sectional median return over the
      next 20 trading days.
    </p>,
    <p key={4} className="max-w-2xl text-[0.85rem] leading-relaxed text-muted">
      All ~90 equities ranked against each other, on that date, by that probability. See{" "}
      <span className="text-foreground">Does It Work?</span> for how well this sort actually holds up.
    </p>,
    <p key={5} className="max-w-2xl text-[0.85rem] leading-relaxed text-muted">
      Highest-ranked names make the cut, excluding anything within 5 trading days of an earnings report.
    </p>,
    <PortfolioConstruction key={6} metrics={metrics} />,
    <p key={7} className="max-w-2xl text-[0.85rem] leading-relaxed text-muted">
      The position holds to the next rebalance; the whole cycle advances forward in time and starts again.
    </p>,
  ];

  return (
    <div>
      <SectionHeading
        title="How the system works"
        lede="Eight stages, run once per rebalance. Click a stage for detail; Vane marks where you are."
      />

      <div className="relative">
        <div className="absolute left-0 right-0 top-[15px] hidden h-px bg-border sm:block" aria-hidden />
        <motion.div
          className="absolute top-[-14px] hidden -translate-x-1/2 sm:block"
          animate={{ left: `${(open / (STAGE_TITLES.length - 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        >
          <Vane state="travel" size={28} />
        </motion.div>

        <ol className="relative grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-2 lg:grid-cols-8">
          {STAGE_TITLES.map((title, i) => (
            <li key={title}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-expanded={open === i}
                className="group flex w-full flex-col items-start text-left"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[0.7rem] tabular-nums transition-colors ${
                    open === i ? "border-accent bg-accent text-accent-foreground" : "border-border-strong bg-background text-subtle group-hover:border-accent group-hover:text-accent"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`mt-2 text-[0.8rem] leading-snug ${open === i ? "text-foreground" : "text-muted group-hover:text-foreground"}`}>
                  {title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <motion.div
        key={open}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-6 border border-border p-5"
      >
        <div className="font-mono text-[0.75rem] tabular-nums text-accent">
          {String(open + 1).padStart(2, "0")} / {STAGE_TITLES.length}
        </div>
        <div className="mt-1.5 text-[0.95rem] font-medium text-foreground">{STAGE_TITLES[open]}</div>
        <div className="mt-3">{details[open]}</div>
      </motion.div>
    </div>
  );
}
