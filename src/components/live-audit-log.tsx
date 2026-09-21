"use client";

import type { AuditLogEntry } from "@/lib/live-types";

function formatEtTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LiveAuditLog({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-[0.85rem] text-subtle">No trading day has triggered a run yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[480px] text-left text-[0.8rem]">
        <thead>
          <tr className="border-b border-border text-[0.75rem] text-subtle">
            <th className="px-4 py-3 font-normal sm:px-5">Triggered at (ET)</th>
            <th className="px-4 py-3 font-normal sm:px-5">Trading day</th>
            <th className="px-4 py-3 font-normal sm:px-5">Result</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={`${entry.tradingDay}-${i}`} className={i > 0 ? "border-t border-border" : undefined}>
              <td className="px-4 py-3 font-mono tabular-nums text-muted sm:px-5">
                {formatEtTimestamp(entry.triggeredAtEt)}
              </td>
              <td className="px-4 py-3 font-mono tabular-nums text-muted sm:px-5">{entry.tradingDay}</td>
              <td className="px-4 py-3 font-mono tabular-nums text-foreground sm:px-5">{entry.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
