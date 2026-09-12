"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "@/lib/use-in-view";
import { formatDecimal, formatPercent } from "@/lib/format";
import type { MetricsData } from "@/lib/types";

const SERIES = [
  { key: "topThree" as const, label: "Model", color: "bg-accent", text: "text-accent" },
  { key: "spy" as const, label: "SPY", color: "bg-foreground", text: "text-foreground" },
  { key: "universe" as const, label: "Universe", color: "bg-subtle", text: "text-subtle" },
];

function BarRow({
  label,
  values,
  format,
  inView,
  delayBase,
}: {
  label: string;
  values: Record<"topThree" | "spy" | "universe", number>;
  format: (v: number) => string;
  inView: boolean;
  delayBase: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const max = Math.max(...Object.values(values));

  return (
    <div>
      <div className="text-[0.8rem] text-subtle">{label}</div>
      <div className="mt-2 flex flex-col gap-2">
        {SERIES.map((s, i) => (
          <div key={s.key} className="flex items-center gap-3">
            <span className={`w-14 shrink-0 font-mono text-[0.75rem] ${s.text}`}>{s.label}</span>
            <span className="relative h-3 flex-1 overflow-hidden bg-border">
              <motion.span
                className={`absolute inset-y-0 left-0 ${s.color}`}
                initial={prefersReducedMotion ? false : { width: 0 }}
                animate={{ width: inView ? `${(values[s.key] / max) * 100}%` : 0 }}
                transition={{ duration: 0.6, delay: delayBase + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span className="w-16 shrink-0 text-right font-mono text-[0.8rem] tabular-nums text-foreground">
              {format(values[s.key])}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResearchConclusion({ metrics }: { metrics: MetricsData | null }) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        What I learned
      </h2>

      {metrics ? (
        <div ref={ref} className="mt-8 grid gap-8 sm:grid-cols-2">
          <BarRow
            label="Annualized return: the model won"
            values={{
              topThree: metrics.returns.topThreeAnnualized,
              spy: metrics.returns.spyAnnualized,
              universe: metrics.returns.universeAnnualized,
            }}
            format={(v) => formatPercent(v, 1)}
            inView={inView}
            delayBase={0}
          />
          <BarRow
            label="Sharpe ratio: the model lost"
            values={{
              topThree: metrics.sharpe.topThree,
              spy: metrics.sharpe.spy,
              universe: metrics.sharpe.universe,
            }}
            format={(v) => formatDecimal(v, 2)}
            inView={inView}
            delayBase={0.15}
          />
        </div>
      ) : null}

      <p className="mt-6 max-w-2xl text-[0.9rem] leading-relaxed text-muted">
        I won on return, not on risk-adjusted return, and I don&apos;t want to bury that: the raw return
        advantage over SPY isn&apos;t statistically significant either (t&nbsp;=&nbsp;0.66, p&nbsp;=&nbsp;0.51,
        20 of 45 periods); I can&apos;t honestly call the headline number proven.
      </p>

      <div className="mt-8 grid gap-x-8 gap-y-2 border-t border-border pt-6 text-[0.85rem] leading-relaxed text-muted sm:grid-cols-2">
        <p>
          The real edge is the sort itself:{" "}
          <span className="font-mono tabular-nums text-foreground">+1.85pp</span> over the 50% baseline,
          t&nbsp;=&nbsp;2.19 across 45 independent periods: the model can tell stronger names from weaker
          ones, on data it never trained on. That&apos;s the part I&apos;m actually proud of.
        </p>
        <p>
          <span className="font-mono tabular-nums text-foreground">60.7%</span> of individual picks beat
          their day&apos;s median, and the{" "}
          <span className="font-mono tabular-nums text-foreground">+259 bps</span> top-minus-bottom spread
          is the clearest sign the ranking separates real signal from noise.
        </p>
        <p>
          Realized volatility (
          {metrics ? (metrics.realizedVolatility.topThree * 100).toFixed(1) : "N/A"}%) ran well above the
          17.3% target I sized the basket to.
        </p>
        <p>A 3-name basket concentrates idiosyncratic risk; one earnings surprise can dominate a period.</p>
      </div>
    </div>
  );
}
