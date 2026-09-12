"use client";

import { useState } from "react";
import { FeatureGlyph } from "./icons/glyphs";
import type { ModelInfo } from "@/lib/types";

/** Embedded inside How It's Built's pipeline detail panel for the "Feature engineering" stage. */
export function FeatureSystem({ modelInfo }: { modelInfo: ModelInfo | null }) {
  const groups = modelInfo?.featureGroups;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!groups || groups.length === 0) return null;

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  const featureCount = modelInfo?.featureCount ?? groups.reduce((n, g) => n + g.features.length, 0);

  return (
    <div>
      <p className="max-w-2xl text-[0.85rem] leading-relaxed text-muted">
        {featureCount} engineered features across {groups.length} signal families, grouped by what each
        attempts to capture. Expand a family to see its actual feature codes.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {groups.map((group) => {
          const isOpen = expanded.has(group.group);
          return (
            <div key={group.group} className="border border-border">
              <button
                type="button"
                onClick={() => toggle(group.group)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-start gap-2.5">
                  <FeatureGlyph className="mt-0.5 shrink-0 text-accent" />
                  <div>
                    <div className="text-[0.9rem] font-medium text-foreground">{group.group}</div>
                    <p className="mt-0.5 text-[0.8rem] leading-relaxed text-muted">{group.note}</p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[0.7rem] tabular-nums text-subtle">
                  {group.features.length} · {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <div className="flex flex-wrap gap-1.5 border-t border-border p-4 pt-3">
                  {group.features.map((f) => (
                    <code key={f} className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.7rem] text-subtle">
                      {f}
                    </code>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
