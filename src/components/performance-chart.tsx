"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DotProps } from "recharts";
import { formatShortDate, formatDate } from "@/lib/format";
import type { EquityCurveData, PredictionsData } from "@/lib/types";

const SERIES = [
  { key: "topThree", label: "Model (Top 3)", color: "var(--color-accent)", width: 2.5, dash: undefined },
  { key: "spy", label: "SPY", color: "var(--color-foreground)", width: 1.5, dash: undefined },
  { key: "universe", label: "Universe (90, eq-wt)", color: "var(--color-subtle)", width: 1.25, dash: "4 3" },
] as const;

function ChartTooltip({
  active,
  payload,
  label,
  eligibleDates,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
  eligibleDates: Set<string>;
}) {
  if (!active || !payload || !payload.length || !label) return null;
  return (
    <div className="border border-border-strong bg-background-raised px-3 py-2.5 text-[0.8rem]">
      <div className="font-mono tabular-nums text-subtle">{formatDate(label)}</div>
      <div className="mt-1 flex flex-col gap-1">
        {SERIES.map((s) => {
          const point = payload.find((p) => p.dataKey === s.key);
          if (!point) return null;
          return (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                {s.label}
              </span>
              <span className="font-mono tabular-nums font-medium text-foreground">{point.value.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
      {eligibleDates.has(label) ? (
        <div className="mt-1.5 border-t border-border pt-1.5 font-mono text-[0.7rem] text-accent">
          click to open this rebalance ↗
        </div>
      ) : (
        <div className="mt-1.5 border-t border-border pt-1.5 font-mono text-[0.7rem] text-subtle">
          closing value — no rebalance starts here
        </div>
      )}
    </div>
  );
}

function EligibleDot(props: DotProps & { eligibleDates: Set<string>; selectedDate: string | null; payload?: { date: string } }) {
  const { cx, cy, payload, eligibleDates, selectedDate } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  const eligible = eligibleDates.has(payload.date);
  const selected = payload.date === selectedDate;
  if (!eligible && !selected) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={selected ? 5 : 3}
      fill={selected ? "var(--color-accent)" : "var(--color-background)"}
      stroke="var(--color-accent)"
      strokeWidth={selected ? 0 : 1.5}
    />
  );
}

export function PerformanceChart({
  equityCurve,
  predictions,
  selectedDate,
  onSelectRebalance,
}: {
  equityCurve: EquityCurveData | null;
  predictions: PredictionsData | null;
  selectedDate: string | null;
  onSelectRebalance: (date: string) => void;
}) {
  if (!equityCurve || equityCurve.series.length === 0) {
    return <p className="text-sm text-muted">The equity curve isn&apos;t available right now.</p>;
  }

  const { series } = equityCurve;
  const last = series[series.length - 1];
  const eligibleDates = new Set((predictions?.periods ?? []).map((p) => p.date));

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5 text-[0.8rem] text-muted">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
            {s.label}:{" "}
            <span className="font-mono tabular-nums font-medium text-foreground">
              {last[s.key as "topThree" | "spy" | "universe"].toFixed(1)}
            </span>
          </span>
        ))}
      </div>

      <div
        className="mt-4 h-[380px] w-full sm:h-[460px]"
        role="img"
        aria-label={`Line chart comparing cumulative growth of $100 invested in the model, SPY, and the universe from ${formatDate(series[0].date)} to ${formatDate(last.date)}. The model ended at ${last.topThree.toFixed(1)}, SPY at ${last.spy.toFixed(1)}, and the universe at ${last.universe.toFixed(1)}. ${eligibleDates.size} of the ${series.length} points open a historical rebalance.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={series}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            onClick={(state) => {
              const label = state?.activeLabel;
              if (typeof label === "string" && eligibleDates.has(label)) onSelectRebalance(label);
            }}
            style={{ cursor: "pointer" }}
          >
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fill: "var(--color-subtle)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              minTickGap={40}
            />
            <YAxis tick={{ fill: "var(--color-subtle)", fontSize: 11 }} tickLine={false} axisLine={false} width={40} domain={["auto", "auto"]} />
            <Tooltip content={<ChartTooltip eligibleDates={eligibleDates} />} cursor={{ stroke: "var(--color-border-strong)" }} />
            {selectedDate ? <ReferenceLine x={selectedDate} stroke="var(--color-accent)" strokeDasharray="3 3" strokeOpacity={0.5} /> : null}
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={s.width}
                strokeDasharray={s.dash}
                dot={s.key === "topThree" ? <EligibleDot eligibleDates={eligibleDates} selectedDate={selectedDate} /> : false}
                activeDot={{ r: 4, fill: s.color, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.75rem] text-subtle">
        <span>Model points open the historical explorer — click one, or:</span>
        <label className="flex items-center gap-2">
          <span className="sr-only">Choose a rebalance date</span>
          <select
            value={selectedDate ?? ""}
            onChange={(e) => {
              if (e.target.value) onSelectRebalance(e.target.value);
            }}
            className="border border-border bg-background px-2 py-1 font-mono text-[0.75rem] text-foreground"
          >
            <option value="" disabled>
              choose a date…
            </option>
            {(predictions?.periods ?? []).map((p) => (
              <option key={p.date} value={p.date}>
                {formatDate(p.date)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
