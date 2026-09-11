---
name: ML Equity Ranking System
description: A dense, hairline-bordered dark dashboard with a single amber accent — quantitative-research precision, not decoration. Restructured from one long scroll into a persistent top-nav + five pages.
status: PROPOSED — reverting from the "Live Board" direction back to the original dark/amber system (the first commit) per explicit instruction, and adding a persistent top-nav + five-page split in place of the single long scroll. Code has been reverted to the original visual system already (working tree matches commit 50b3ec2); the page-split and limitations trim described below are NOT yet built — this document only, per instruction.
colors:
  background: "#0A0A0B"
  background-raised: "#131316"
  foreground: "#F2F2F4"
  muted: "#9A9AA2"
  subtle: "#6D6D76"
  border: "rgba(255,255,255,0.10)"
  border-strong: "rgba(255,255,255,0.18)"
  accent: "#CAA057"
  accent-strong: "#E2B96F"
  accent-foreground: "#171208"
  positive: "#7FAE82"
  negative: "#C9776F"
typography:
  sans: { family: "Geist, ui-sans-serif, sans-serif", weight: [400,500,600] }
  mono: { family: "Geist Mono, ui-monospace, monospace", weight: 400, feature: "tnum 1" }
radius: { chip: "4px (Tailwind default 'rounded', tags/code/tooltips only)", container: "0px (structural blocks are square-cornered)" }
shadow: none — flat hairline borders only, deliberately no elevation
motion:
  page-transition: "180ms opacity crossfade, no layout animation, no reorder gesture"
---

# Design Brief: ML Equity Ranking System

## 1. Project purpose and design thesis

A personal quantitative-research case study, presented with the restraint of an internal research memo: dark ground, one accent color used sparingly, hairline borders, tabular data given real typographic weight. The credibility comes from precision and honesty, not from decoration.

**Design thesis: The Research Memo.** Square-cornered hairline-bordered blocks, one amber accent reserved for the headline number and active/focus states, everything else in foreground/muted/subtle grays. Motion is minimal and functional (page transitions only) — the design earns trust by being calm and legible, not by being lively.

**This reverts the "Live Board" direction** (indigo/coral, rounded-16px cards, layout-reorder animation, three-font system) which shipped and was then explicitly rejected. Do not reintroduce indigo/coral, rounded cards, medal-tint chips, or reorder/layout animation — those belong to the superseded direction (preserved in git stash, not deleted, in case it's ever wanted again, but not part of this direction).

**Explicitly not:** an academic paper (no §-numbering, footnotes, abstract block, citation language), a trading terminal or ticker tape, colorful/playful, or heavily animated.

**Feeling to hit:** rigor, precision, quiet confidence — a builder who understands their work well enough to present it plainly.

## 2. Verified content and data constraints

Unchanged — all four `public/data/*.json` files are real (`"sample": false`), sourced from `metrics.json.source`. Nothing here has changed from prior verification.

| File | Verified fields | Supports |
|---|---|---|
| `metrics.json` | returns/Sharpe (model/SPY/universe), excess return, sorting edge, rank accuracy, significance, Top-1/3/15 comparison | Executive result, ranking-quality stats |
| `equity_curve.json` | 46-pt normalized series, model/SPY/universe | Performance chart |
| `predictions.json` | 45 rebalances × 3 real picks: ticker, score, realized percentile, next-20d return, per-period returns, exposure | Historical decision explorer, scatter |
| `model_info.json` | model type, universe size, 34 features / 10 families, validation method | Feature system, model pipeline |

No live data; no result outside the one cited run; nothing invented.

## 3. Information architecture — the actual change requested

**Before:** one persistent header + eleven sections stacked in a single long scroll (Research Header → Executive Result → Performance Chart → Ranking Quality → Historical Decision Explorer → Model Pipeline → Walk-Forward Diagram → Feature System → Portfolio Construction → Research Conclusion → Limitations → Site Footer).

**After:** a persistent top nav with five pages, URL-synced (`?view=`), reusing every existing section verbatim — this is a reorganization of already-built content, not new content. All five pages ship at once (no deferral): everything they need already exists in code today.

| Page | Question | Contains (existing components, unmodified) |
|---|---|---|
| **Overview** | What is this, in 30 seconds? | Research Header (hero + headline stat block) + Executive Result |
| **Performance** | How did it actually do? | Performance Chart |
| **Does It Work?** | Is the ranking real, or luck? | Ranking Quality (stats + scatter) + Historical Decision Explorer |
| **How It's Built** | What's under the hood? | Model Pipeline + Walk-Forward Diagram + Feature System + Portfolio Construction |
| **What I Learned** | Honest takeaway + reflection | Research Conclusion ("Results interpretation") + Limitations (trimmed to 3, see §7) |

Site Footer stays persistent under every page, as it is today.

## 4. Navigation and page-transition behavior

- **Top nav:** a persistent header row above the existing per-page header content — site name/logo on the left, five page labels as plain text (not pills/chips — no rounded-full treatment, consistent with the square-cornered system), active page marked with the amber accent (color + a 1px underline), inactive pages in `muted`. No sliding/animated indicator — a static color change is enough; this direction does not do layout-animation chrome.
- **URL sync:** `?view=overview|performance|does-it-work|how-its-built|what-i-learned`, same `replaceState` pattern already proven in this codebase.
- **Transition:** the outgoing page content fades out and the new one fades in, ~180ms opacity-only crossfade, no slide/scale/layout animation. `prefers-reduced-motion` removes the crossfade entirely (instant swap) — same as fading, just duration 0.
- **Mobile:** nav row scrolls horizontally rather than wrapping (proven pattern from the prior build); logo truncates before nav labels do.

## 5. Visual system

| Role | Value |
|---|---|
| Background / Raised panel | `#0A0A0B` / `#131316` |
| Foreground / Muted / Subtle | `#F2F2F4` / `#9A9AA2` / `#6D6D76` |
| Border / Border-strong | `rgba(255,255,255,0.10)` / `rgba(255,255,255,0.18)` |
| Accent (the one highlight color) | `#CAA057`, strong variant `#E2B96F`, on-accent text `#171208` |
| Positive / Negative (return sign, functional only) | `#7FAE82` / `#C9776F` (muted, not saturated — consistent with the restrained palette) |

Type: Geist (sans, body + headings) · Geist Mono (all data — figures, dates, tickers — `tabular-nums`). No display/body/data three-font split; two families total. Square corners on structural blocks (headers, stat blocks, chart containers); `rounded` (4px, Tailwind default) only on small inline chips/tags/code. No shadow anywhere — hairline borders provide all separation.

**Rule:** the accent color is reserved for (a) the single headline stat, (b) the active nav item, (c) focus rings, (d) chart series identity for "the model." It is never used decoratively or repeated as background fill on large areas — scarcity is what keeps it meaningful in a mostly-grayscale system.

## 6. Components and composition (unchanged from what's built; only relocated)

- **Header/nav:** new — persistent across all five pages, holds the page switcher.
- **Research Header:** unchanged, now lives inside the Overview page only (not repeated per-page).
- **Executive Result, Performance Chart, Ranking Quality, Historical Decision Explorer, Model Pipeline, Walk-Forward Diagram, Feature System, Portfolio Construction, Research Conclusion:** unchanged content and styling, each relocated into exactly one page per §3's table. No visual or copy changes to any of these beyond what §7 specifies for Limitations.
- **Site Footer:** unchanged, persistent under every page.

## 7. Limitations — trimmed to 3

The current build lists 10 limitations as a flat grid. Per instruction, cut to the 3 most decision-relevant, each covering a distinct axis of doubt (statistical validity, tail risk, real-world execution gap) rather than overlapping caveats:

1. **Statistical significance** — "The raw return advantage over SPY does not clear a conventional significance bar (t = 0.66, p = 0.51) — the ranking edge itself does (t = 2.19, +1.85pp over the 50% baseline). Treat the return figure as descriptive, the ranking edge as the proven result."
2. **Concentration risk** — "A 3-name basket lets a single idiosyncratic move dominate a period's return — the worst single-name outcome in this test lost 15.8% against a universe that gained 2.5% the same period."
3. **No live execution** — "This is a backtest, not a live track record. A flat 15 bps round-trip cost is modeled; real slippage, fills, market impact, and taxes are not."

Dropped (still true, but redundant with the three above or lower-signal for a first read): small sample, regime dependence, signal decay, volatility-target lag, universe construction. Nothing dropped was inaccurate — this is a prioritization for a shorter list, not a retraction.

Layout: same flat grid treatment as today, just 3 items instead of 10 (likely 1 column or 3-across rather than the current 2-column grid — implementer's call at build time).

## 8. Writing and tone

Unchanged from what's shipped: first person, direct, quantitative — precise about method and honest about limits, no oversell. No copy changes required by this instruction beyond the Limitations trim in §7.

## 9. Responsive and accessible behavior

Reading order matches visual order at every width. Top nav scrolls horizontally before wrapping (same proven pattern as before); logo truncates rather than wraps. Full keyboard access to the nav and the historical decision explorer; visible amber focus rings (already implemented via `:focus-visible`). Body text contrast against `#0A0A0B`/`#131316` already measured and passing for foreground/muted/subtle/accent. `prefers-reduced-motion` removes the page-transition crossfade in favor of an instant swap — content and function identical either way.

## 10. Scope and sequence

**This instruction (design-only):** this document. No code changes made as part of this step.

**Next build step, when approved:** add a persistent top-nav/page-shell component; split `src/app/page.tsx`'s single render into five page groupings per §3's table (either five route-level views behind a client switcher, reusing the `?view=` pattern already proven in this codebase, or five actual Next.js routes — implementer's call, no strong preference stated); trim `src/components/limitations.tsx`'s data array to the 3 items in §7; no other component needs content or visual changes.

**Reuse as-is, unchanged:** every existing section component's internals, `lib/data.ts`, `lib/types.ts`, `lib/format.ts`, all `public/data/*.json`, the export script, the dark/amber token system in `globals.css` (already reverted and matches this document).

**Out of scope:** reintroducing indigo/coral or any Live Board visual element, new data, auth, live data, dependency changes.

## 11. Acceptance criteria

- A persistent top nav lets a visitor jump directly to any of the five pages; the current page is visually distinct via the accent color.
- Every one of the eleven existing sections still appears exactly once, unmodified, in the page assigned to it in §3.
- Limitations shows exactly 3 items, using the exact copy in §7.
- No indigo, coral, rounded-16px cards, medal-tint chips, or layout-reorder animation anywhere — this is the dark/amber system, unchanged from the original commit, plus navigation.
- `prefers-reduced-motion` yields an instant page swap with identical content.
- Mobile nav never wraps to a second line.

## 12. Decisions and open questions

**Approved:** revert to the original dark/amber "Research Memo" visual system (explicit instruction, 2026-09-10); add a persistent top nav; split the single long scroll into five pages reusing existing content verbatim; trim Limitations to 3 (exact copy in §7).

**Assumption stated, not yet confirmed:** the specific 3 limitations chosen in §7 are this document's recommendation (highest-signal, least-overlapping) — confirm before build if a different 3 are preferred. Also unconfirmed: whether the five pages should be implemented as a client-side switcher (matching the `?view=` pattern already proven in this codebase) or as real Next.js routes — either is compatible with this document; defaulting to the client-switcher pattern as the lower-risk, already-proven option unless told otherwise.

**Blocking:** none for documentation; awaiting explicit go-ahead to build (per instruction, this step is design-only).
