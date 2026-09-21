import { ResearchConclusion } from "../research-conclusion";
import { Limitations } from "../limitations";
import { Vane } from "../character/vane";
import type { PageProps } from "./types";

export function WhatILearnedPage({ metrics }: PageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
      <div className="mb-12">
        <Vane state="resting" size={30} />
      </div>

      <ResearchConclusion metrics={metrics} />

      <div className="mt-16 border-t border-border pt-12">
        <Limitations />
      </div>
    </div>
  );
}
