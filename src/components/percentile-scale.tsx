"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Shared 0-1 percentile axis: used both for the aggregate dot plot (Does It
 * Work?) and the explorer's reveal animation, so "here's where it landed"
 * always means the same visual position across the site.
 */
export function PercentileAxis({ height = 64, children }: { height?: number; children: ReactNode }) {
  return (
    <div className="mt-2">
      <div className="relative w-full" style={{ height }}>
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
        <div className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-border-strong" />
        <div className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-border-strong" />
        <div className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 bg-border-strong" />
        {children}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[0.7rem] tabular-nums text-subtle">
        <span>0.0 (worst)</span>
        <span>0.5 (no skill)</span>
        <span>1.0 (best)</span>
      </div>
    </div>
  );
}

export function PercentileDot({
  pct,
  size = 8,
  color = "bg-accent",
  delay = 0,
  title,
  animateIn = true,
}: {
  pct: number;
  size?: number;
  color?: string;
  delay?: number;
  title?: string;
  animateIn?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const play = animateIn && !prefersReducedMotion;

  return (
    <motion.div
      className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${color}`}
      style={{ width: size, height: size }}
      initial={play ? { left: "50%", opacity: 0 } : false}
      animate={{ left: `${pct * 100}%`, opacity: 1 }}
      transition={{ duration: play ? 0.6 : 0, delay, ease: [0.22, 1, 0.36, 1] }}
      title={title}
    />
  );
}
