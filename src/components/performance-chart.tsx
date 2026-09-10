"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Section, SectionHeading } from "./ui/section";
import { formatShortDate, formatDate } from "@/lib/format";
import type { EquityCurveData } from "@/lib/types";

const SERIES = [
  { key: "topThree", label: "ML Top-3 portfolio", color: "var(--color-accent)", width: 2.25 },
  { key: "spy", label: "SPY", color: "#c7c7cf", width: 1.5 },
  { key: "universe", label: "Universe (90, eq-wt)", color: "#6d6d76", width: 1.5 },
] as const;

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded border border-border-strong bg-background-raised px-3 py-2.5 text-[0.8rem] shadow-none">
      <div className="mb-1.5 font-mono tabular-nums text-subtle">{formatDate(label)}</div>
      <div className="flex flex-col gap-1">
        {SERIES.map((s) => {
          const point = payload.find((p) => p.dataKey === s.key);
          if (!point) return null;
          return (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted">
                <span
                  className="inline-block h-[2px] w-3"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                {s.label}
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {point.value.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PerformanceChart({ equityCurve }: { equityCurve: EquityCurveData | null }) {
  if (!equityCurve || equityCurve.series.length === 0) {
    return (
      <Section id="performance">
        <SectionHeading title="Portfolio performance" />
        <p className="text-sm text-muted">Equity curve unavailable — public/data/equity_curve.json is missing.</p>
      </Section>
    );
  }

  const { series } = equityCurve;
  const last = series[series.length - 1];

  return (
    <Section id="performance">
      <SectionHeading
        title="Portfolio performance"
        lede="Normalized to 100 at the start of the test window. Each point compounds the prior 20-trading-day period's realized, cost-adjusted return."
      />

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 text-[0.8rem] text-muted">
        <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
          <span aria-hidden className="inline-block h-[2px] w-3 translate-y-[-4px] bg-accent" />
          ML Top-3 ended at{" "}
          <span className="font-mono tabular-nums text-foreground">{last.topThree.toFixed(1)}</span>
        </span>
        <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
          <span aria-hidden className="inline-block h-[2px] w-3 translate-y-[-4px] bg-[#c7c7cf]" />
          SPY at <span className="font-mono tabular-nums text-foreground">{last.spy.toFixed(1)}</span>
        </span>
        <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
          <span aria-hidden className="inline-block h-[2px] w-3 translate-y-[-4px] bg-[#6d6d76]" />
          Universe at <span className="font-mono tabular-nums text-foreground">{last.universe.toFixed(1)}</span>
        </span>
      </div>

      <div
        className="mt-6 h-[340px] w-full sm:h-[420px]"
        role="img"
        aria-label={`Line chart comparing cumulative growth of $100 invested in the ML Top-3 portfolio, SPY, and the equal-weight universe from ${formatDate(
          series[0].date
        )} to ${formatDate(last.date)}. The ML Top-3 portfolio ended at ${last.topThree.toFixed(
          1
        )}, SPY at ${last.spy.toFixed(1)}, and the universe at ${last.universe.toFixed(1)}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              stroke="var(--color-border)"
              strokeDasharray="0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border-strong)" }} />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={s.width}
                dot={false}
                activeDot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-6 max-w-2xl text-[0.85rem] leading-relaxed text-muted">
        The Top-3 line accumulates faster than either benchmark for most of the
        window, but its path is visibly rougher — consistent with a basket of
        three names carrying more idiosyncratic risk than a diversified index,
        even after inverse-volatility sizing and vol targeting. That extra
        bumpiness is the direct cause of its lower Sharpe ratio despite the
        higher ending value.
      </p>

      <p className="mt-3 text-[0.8rem] text-subtle">
        Historical out-of-sample walk-forward results. Modeled transaction costs
        (15 bps round-trip) are included.
      </p>
    </Section>
  );
}
