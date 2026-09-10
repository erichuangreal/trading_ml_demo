import { Section, SectionHeading } from "./ui/section";
import type { ModelInfo } from "@/lib/types";

export function FeatureSystem({ modelInfo }: { modelInfo: ModelInfo | null }) {
  const groups = modelInfo?.featureGroups;
  if (!groups || groups.length === 0) return null;

  return (
    <Section id="features">
      <SectionHeading
        title={`Feature system — ${modelInfo?.featureCount ?? groups.reduce((n, g) => n + g.features.length, 0)} engineered features across ${groups.length} signal families`}
        lede="Grouped by what each family attempts to capture, not listed as a flat wall of indicator names."
      />

      <dl className="divide-y divide-border border-t border-border">
        {groups.map((group) => (
          <div key={group.group} className="grid gap-2 py-5 sm:grid-cols-[180px_1fr] sm:gap-6">
            <dt className="text-[0.9rem] font-medium text-foreground">{group.group}</dt>
            <dd>
              <p className="text-[0.85rem] leading-relaxed text-muted">{group.note}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {group.features.map((f) => (
                  <code
                    key={f}
                    className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.7rem] text-subtle"
                  >
                    {f}
                  </code>
                ))}
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
