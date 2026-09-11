import { ResearchConclusion } from "../research-conclusion";
import { Limitations } from "../limitations";
import { Vane } from "../character/vane";
import type { PageProps } from "./types";

export function WhatILearnedPage({ metrics }: PageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
      <div className="mb-12 flex items-start gap-3">
        <Vane state="resting" size={30} className="mt-1" />
        <p className="text-[0.95rem] leading-relaxed text-muted">
          I built this because I wanted to know if I could actually make a working stock
          ranker — not to make money, and not to convince anyone of anything. Here&apos;s
          what I found, as plainly as I can put it.
        </p>
      </div>

      <ResearchConclusion metrics={metrics} />

      <div className="mt-16 border-t border-border pt-12">
        <Limitations />
      </div>
    </div>
  );
}
