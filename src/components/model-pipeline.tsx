"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "./ui/section";
import { Vane } from "./character/vane";

const STAGES = [
  { title: "Historical market data", detail: "OHLCV, SPY/VIX, earnings dates, SEC EDGAR fundamentals — everything the model is allowed to see." },
  { title: "Feature engineering", detail: "34 features across 10 families: momentum, trend, volatility, oscillators, range/structure, candle shape, volume, market context, earnings timing, fundamentals." },
  { title: "Walk-forward training", detail: "Retrained every 20 trading days on an expanding window of past data only, with a 20-day embargo so no label ever leaks into training." },
  { title: "XGBoost classifier", detail: "Estimates each stock's probability of beating the day's cross-sectional median return over the next 20 trading days." },
  { title: "Cross-sectional ranking", detail: "All ~90 equities ranked against each other, on that date, by that probability." },
  { title: "Top-3 selection", detail: "Highest-ranked names make the cut, excluding anything within 5 trading days of an earnings report." },
  { title: "Inverse-volatility sizing", detail: "Weighted within the basket by each pick's own volatility, then the whole basket is scaled to a 17.3% annualized vol target." },
  { title: "20-day hold, then repeat", detail: "The position holds to the next rebalance; the whole cycle advances forward in time and starts again." },
];

export function ModelPipeline() {
  const [open, setOpen] = useState(0);

  return (
    <div>
      <SectionHeading
        title="How the system works"
        lede="Eight stages, run once per rebalance. Ranking and portfolio construction are deliberately separate: the model only decides order, sizing is a downstream risk decision. Click a stage for detail."
      />

      <div className="relative">
        <div className="absolute left-0 right-0 top-[15px] hidden h-px bg-border sm:block" aria-hidden />
        <motion.div
          className="absolute top-[-14px] hidden -translate-x-1/2 sm:block"
          animate={{ left: `${(open / (STAGES.length - 1)) * 100}%` }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        >
          <Vane state="travel" size={28} />
        </motion.div>

        <ol className="relative grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-2 lg:grid-cols-8">
          {STAGES.map((stage, i) => (
            <li key={stage.title}>
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
                  {stage.title}
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
        <div className="font-mono text-[0.75rem] tabular-nums text-accent">{String(open + 1).padStart(2, "0")} / {STAGES.length}</div>
        <div className="mt-1.5 text-[0.95rem] font-medium text-foreground">{STAGES[open].title}</div>
        <div className="mt-1.5 max-w-2xl text-[0.85rem] leading-relaxed text-muted">{STAGES[open].detail}</div>
      </motion.div>
    </div>
  );
}
