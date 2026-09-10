import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 font-mono text-[0.7rem] tabular-nums tracking-tight text-muted">
      {children}
    </span>
  );
}

export function SampleBadge({ children = "Sample / development data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-negative/40 bg-negative/10 px-2 py-1 text-[0.7rem] font-medium uppercase tracking-wide text-negative">
      {children}
    </span>
  );
}
