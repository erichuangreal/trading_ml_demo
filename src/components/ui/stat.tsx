import type { ReactNode } from "react";

export function Stat({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail?: ReactNode;
  tone?: "neutral" | "positive" | "negative" | "accent";
}) {
  const toneClass = {
    neutral: "text-foreground",
    positive: "text-positive",
    negative: "text-negative",
    accent: "text-accent",
  }[tone];

  return (
    <div className="flex flex-col gap-1.5 py-5 first:pt-0 sm:border-l sm:border-border sm:px-6 sm:py-0 sm:first:border-l-0 sm:first:pl-0">
      <div className="text-[0.8rem] text-muted">{label}</div>
      <div className={`font-mono text-[1.65rem] font-medium tabular-nums leading-none ${toneClass}`}>
        {value}
      </div>
      {detail ? <div className="text-[0.8rem] text-subtle">{detail}</div> : null}
    </div>
  );
}
