"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatPercent, formatShortDate } from "@/lib/format";
import type { EquityCurveData } from "@/lib/types";

function DrawdownTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload || !payload.length || !label) return null;
  return (
    <div className="border border-border-strong bg-background-raised px-3 py-2 text-[0.8rem]">
      <div className="font-mono tabular-nums text-subtle">{formatDate(label)}</div>
      <div className="mt-1 font-mono tabular-nums text-negative">{formatPercent(payload[0].value, 1)}</div>
    </div>
  );
}

export function DrawdownChart({ equityCurve }: { equityCurve: EquityCurveData | null }) {
  const data = useMemo(() => {
    if (!equityCurve) return [];
    let peak = -Infinity;
    return equityCurve.series.map((point) => {
      peak = Math.max(peak, point.topThree);
      return { date: point.date, drawdown: point.topThree / peak - 1 };
    });
  }, [equityCurve]);

  if (data.length === 0) return null;
  const worst = data.reduce((min, d) => (d.drawdown < min.drawdown ? d : min), data[0]);

  return (
    <div>
      <h3 className="text-sm font-medium text-foreground">Drawdown from peak, at each rebalance</h3>
      <p className="mt-1 max-w-2xl text-[0.8rem] leading-relaxed text-muted">
        Worst point: <span className="font-mono tabular-nums text-negative">{formatPercent(worst.drawdown, 1)}</span> on{" "}
        {formatDate(worst.date)}. This is measured only at the 46 rebalance-date observations, not daily. The real
        intraperiod drawdown was very likely deeper than this chart can show.
      </p>
      <div className="mt-3 h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fill: "var(--color-subtle)", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "var(--color-border)" }} minTickGap={50} />
            <YAxis tickFormatter={(v) => formatPercent(v, 0)} tick={{ fill: "var(--color-subtle)", fontSize: 10 }} tickLine={false} axisLine={false} width={44} />
            <Tooltip content={<DrawdownTooltip />} />
            <Area type="monotone" dataKey="drawdown" stroke="var(--color-negative)" strokeWidth={1.25} fill="var(--color-negative)" fillOpacity={0.12} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
