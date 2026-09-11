import type { SVGProps } from "react";

/**
 * Shared symbol language: every glyph here is built from the same slim
 * "tick" primitive as Vane's own needle body (see character/vane.tsx), so
 * the character, these icons, and the charts read as one family.
 */

type GlyphProps = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 18 18",
  fill: "none",
  "aria-hidden": true,
} as const;

export function RankGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 4.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.5 9h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.5 13.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NarrowGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 3.5l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 3.5L10 9l5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeatureGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="1.6" fill="currentColor" />
      <path d="M9 9L4 5.5M9 9l6-1M9 9l-1 6M9 9l4 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function TimeGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.5 9h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.2 2" />
      <path d="M11.5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 6.5l2 2.5-2 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EvaluateGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 4v3.2M9 13.8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function UncertaintyGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2.2 2.4" opacity="0.7" />
    </svg>
  );
}

export function CompareGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6.5l4-3 4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 11.5l-4 3-4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The raw needle sliver — the one primitive every glyph above (and Vane) derives from. */
export function TickGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 2.5L11 9l-2 6.5L7 9z" fill="currentColor" />
    </svg>
  );
}
