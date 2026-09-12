---
name: ML Equity Ranking System
description: Dark/amber research-instrument identity, evolved with one character ("Vane," a seeking compass-needle), a shared symbol language, and five distinctly composed pages in place of one long scroll.
status: SHIPPED: verified against the built code (2026-09-10): five pages, Vane, the tick-based glyph set, and per-page composition are all live; lint/typecheck/build clean; graph-click <-> explorer linking, Back/Forward, deep-links, and invalid-view fallback confirmed via interaction testing.
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
  accent-glow: "rgba(202,160,87,0.35)"
  positive: "#7FAE82"
  negative: "#C9776F"
typography:
  sans: { family: "Geist, ui-sans-serif, sans-serif", weight: [400,500,600] }
  mono: { family: "Geist Mono, ui-monospace, monospace", weight: 400, feature: "tnum 1" }
radius: { chip: "4px (Tailwind default 'rounded')", container: "0px (structural blocks stay square-cornered)" }
shadow: "none; hairline borders and the accent glow are the only depth cues"
motion:
  library: framer-motion
  page-transition: "220ms opacity/y crossfade"
  character: "spring-based rotation/opacity on Vane; idle sweep, point, travel, rest states"
  reveal: "outcome reveal is a deliberate step (button/keypress), not a hover or an autoplay"
---

# Design Brief: ML Equity Ranking System

## 1. Project purpose and design thesis

A personal quantitative-research case study, presented the way its builder actually feels about it: proud, curious, precise. The dark/amber "research instrument" identity from the very first build stays: it's recognizable and it suits the subject, but it no longer has to mean "restrained to the point of anonymous." Personality lives in one consistent character and a small family of project-specific symbols, not in decoration bolted onto panels.

**Design thesis: The Instrument and Its Needle.** The existing visual world already reads like a precision instrument: hairline borders, tabular data, a single glowing accent, the walk-forward diagram's train/embargo/test ticks. This round leans into that literally: introduces **Vane**, a small amber compass-needle character that seeks and points at signal, built from the same "tick" primitive as a new shared symbol set (rank, narrow-to-three, feature, time/embargo, evaluate, uncertainty, compare). Character, icons, and charts are all one family: a needle is a rank-tick is a nav glyph is Vane's own body.

**Superseded from the prior round:** "not heavily animated," "page transitions only," "no visual or copy changes," "every component must remain unchanged," "the design earns trust by not being lively." Those were the right call for a narrow reorg; they are not a ceiling on this round. What's still true: no §-numbering/footnote/paper language, no trading-terminal ticker tape, no reintroduction of the Live Board's indigo/coral/rounded-16px/medal-tint system (that direction is stashed, not part of this one).

**Feeling to hit:** curiosity, ownership, pride, and honesty about limits: a builder who understands the work well enough to make it fun to explore, not just legible.

## 2. Verified content and data constraints

All four `public/data/*.json` files are real (`"sample": false"`), from the private repo's final saved walk-forward run. Nothing here has changed.

| File | Verified fields | Supports |
|---|---|---|
| `metrics.json` | returns/Sharpe (model/SPY/universe), excess return, sorting edge, rank accuracy, significance, Top-1/3/15 comparison | Overview headline, Performance, Does It Work? stats |
| `equity_curve.json` | 46-pt series (model/SPY/universe), sampled only at rebalance dates | Performance chart, derived per-rebalance drawdown |
| `predictions.json` | 45 rebalances × 3 real picks: ticker, score, realized percentile, next-20d return, exposure, portfolio/SPY/universe returns | Does It Work? explorer, Overview mini-demo |
| `model_info.json` | model type, universe size, 34 features / 10 families, validation method | How It's Built |

**Critical mapping, verified against real records (periods 0, 1, 44):** `equity_curve.series[i]` is the portfolio's NAV *entering* `predictions.periods[i]` (same date); `equity_curve.series[i+1]` is its NAV after that period's 20-day hold: `predictions.periods[i].portfolioReturn` reconciles exactly with `series[i+1]/series[i] - 1`. The 46th equity point (2026-08-06) closes period 44 but starts no period of its own: it is not a selectable graph point in the explorer link (§6). Any derived drawdown is therefore sampled only at 20-trading-day rebalance marks, not daily, and must say so wherever it's labeled.

No live data; no result outside the one cited run; nothing invented.

## 3. Information architecture

Persistent top nav, five pages, URL-synced with real browser history (`pushState`, not `replaceState`, for page navigation: Back/Forward must retrace actual visits). A `?rebalance=` param carries the selected historical date between Performance and Does It Work?.

| Page | Question | Composition idea (see §6) |
|---|---|---|
| **Overview** | What did I build, and why is it worth exploring? | Asymmetric hero: headline + Vane's introduction on one side, a compact real mini-demo (one rebalance, three picks, one outcome) on the other. No stat-row-plus-card-grid. |
| **Performance** | How did it actually do? | The equity chart is the page: full-width, tall, annotated, clickable points. Benchmark table and derived drawdown live below as a quieter reading pass, not another card grid. |
| **Does It Work?** | Is the ranking real, or luck? | Two-part: a compact statistical case up top (rank accuracy, spread, significance: dense, small, confident), then the full-width interactive pick explorer as the page's real center of gravity. |
| **How It's Built** | What's under the hood? | A single continuous horizontal pipeline diagram (data → features → training → ranking → sizing → hold) that Vane travels along; each stage expands in place for depth instead of eight identical cards. |
| **What I Learned** | Honest takeaway, in my own words | Editorial, quiet, generous whitespace: first-person reflection, Vane at rest in a corner, limitations as progressive disclosure rather than a grid of ten. |

## 4. The character: Vane

**What it is:** a slim amber needle on a pivot, like a compass or a weathervane arrow, not an animal, not a robot, not an emoji, not a floating chat bubble. It's built from the same tick-glyph primitive as the symbol set (§5), so it reads as *of* this system rather than pasted onto it. Justification for the metaphor: the whole project is about seeking a signal and pointing at what ranks highest: a needle that swings toward the strongest reading is the literal mechanism, not a decorative animal standing in for it.

**Personality:** curious, quietly confident, never smug. It searches before it settles: a small wobble before it commits to a direction, and it holds still and dims when the visitor is reading rather than choosing.

**States (one reusable asset, four poses via rotation/opacity/glow, not four separate drawings):**
1. **Idle**: gentle ±12° sweep, low glow. Default/persistent, small, in the nav corner on every page.
2. **Alert / pointing**: snaps toward a target (a rank-1 pick, the newest chart point), glow brightens, tiny overshoot-and-settle.
3. **Traveling**: moves along a path (the How It's Built pipeline) with a short fading trail behind it, like a compass needle sliding along a bearing.
4. **Resting**: dimmed, minimal sweep, on What I Learned and anywhere dense reading needs to stay uninterrupted.

**Role per page:** Overview: introduces itself in one short line near the headline, then orients toward the mini-demo's top pick. Performance: rests near the chart's latest point. Does It Work?: its main job: swings to point at rank 1 when a rebalance is chosen, and its glow intensity echoes (never replaces) the reveal's magnitude; color for win/loss stays on the existing `positive`/`negative` tokens, Vane's ring is a low-opacity accent tint only. How It's Built: travels the pipeline as a position indicator. What I Learned: resting, corner presence.

**Where it steps aside:** never overlaps a number, a table, or a comparison; freezes to a static glow dot under `prefers-reduced-motion`; fully `aria-hidden`: everything it points at already has real text/ARIA carrying the same information, so hiding it loses nothing.

**Production:** code-native SVG + framer-motion, no image-generation tool needed or available. One component, prop-driven state, kept in `src/components/character/`.

## 5. Symbol language

One shared primitive: a slim tick/sliver, Vane's own needle shape: recombined into a small glyph set, used sparingly (page/nav markers, pipeline-stage icons, a handful of inline callouts), never one-per-heading:

| Glyph | Built from | Used for |
|---|---|---|
| Rank | three ticks, descending length | ordering, Top-3 selection |
| Narrow | two ticks converging | the ~90-to-3 selection step |
| Feature | a tick radiating from a small node | feature engineering |
| Time/embargo | a tick crossing a gap | walk-forward's train/embargo boundary |
| Evaluate | a tick centered in a ring | grading realized outcomes |
| Uncertainty | a faint dashed tick | limitations, N/A states |
| Compare | two mirrored ticks | model-vs-benchmark |

All single-color (`currentColor`), stroke-based, ~1.5px weight, sized to sit inline with text or as small standalone marks: never a decorative icon bolted onto a heading that doesn't need one.

## 6. Visual composition: how the five pages actually differ

Preserves background/accent/type from the original build; changes how content occupies the page so it stops reading as "bordered panel, repeat."

- **Overview:** asymmetric split, not centered hero-then-stack. Real whitespace above and below the headline. The mini-demo (§7) is the one place Overview gets dense; everything else stays open.
- **Performance:** one dominant full-bleed chart area (tall, generous margin, no card wrapper around it) with the benchmark table and drawdown note below as plain ruled rows: dense only where the reading is genuinely comparative.
- **Does It Work?:** compact stat row up top (small, confident, not the page's climax), then the explorer gets the rest of the page's height and width: it's the destination, not a scrolled-past section.
- **How It's Built:** one continuous horizontal diagram instead of a card grid; expand-in-place for depth (feature groups, sizing math) instead of every stage being an identically-sized box.
- **What I Learned:** the quietest page: no borders-as-hierarchy, generous line length, first-person prose leads, limitations collapse behind "show more" rather than filling the viewport.

Chart series identity stays exactly as established: accent (`#CAA057`) for the model, `foreground`/`muted` for benchmarks, `positive`/`negative` reserved strictly for return sign: no decorative recoloring of real values, ever.

## 7. Does It Work?: the pick explorer (this round's core interaction)

1. Choose a saved rebalance date (chip strip with prev/next, deterministic default = **earliest** available period, not the best-performing one).
2. See the three real Top-3 picks for that date, with what was known *at prediction time* (rank, score, sizing) visually separated from what's known only *afterward* (realized percentile, next-20d return).
3. Select an individual pick to inspect it: selecting never recomputes or implies a different portfolio; it only expands detail on a name already chosen.
4. A deliberate reveal step (not autoplay, not hover-only) shows the realized outcome; once revealed for a period, it stays visible and stable.
5. Compare the period's portfolio result against SPY, shown at the same time, same prominence: losses rendered exactly as clearly as gains.
6. A "reveal all" affordance shows every pick's outcome without three separate clicks.

**Graph → explorer link:** clicking an eligible point on the Performance chart (any of the 45 points that start a period, not the closing-only 46th) sets `?rebalance=` and either scrolls to / opens the explorer inline, or links to Does It Work? with that date pre-selected; the selection persists across the page boundary. A plain `<select>`/chip fallback exists for anyone who doesn't or can't use graph-point interaction: the graph is never the *only* way in.

No invented attribution: a score is a score, never re-explained as "because of feature X."

## 8. How It's Built

One horizontal pipeline (data → 34 features across 10 families → walk-forward training → cross-sectional ranking → Top-3 selection → inverse-vol sizing → 20-day hold): the real eight stages already documented, now one continuous diagram Vane travels along rather than eight identical bordered cards. Feature families expand in place (click to see the family's actual feature codes) instead of dumping all 34 into one grid. Terms get a one-line plain-language gloss alongside the precise one. Attribution stays factual: Eric built the pipeline; XGBoost, pandas, scikit-learn are named as the libraries used, never implied as his own inventions.

## 9. What I Learned

First-person rewrite of the existing "what worked / what didn't / what this suggests" content: same real figures, reframed as reflection rather than a lab report's conclusion. A concise 3-headline limitations set up front (statistical significance, concentration risk, no live execution: the highest-signal, least-overlapping trio) with the remaining real caveats (regime dependence, signal decay, volatility-target lag, universe construction, small sample) behind a "show more": nothing dropped, just sequenced. No claim of "proven" beyond what one saved backtest's t-statistic actually supports.

## 10. Navigation and state

Real routes or a client switcher (implementer's call; likely the latter, matching this codebase's existing `?view=` precedent) but with `pushState` for page changes so Back/Forward retrace actual navigation: `replaceState` is reserved only for same-page parameter refinement (e.g., moving the rebalance chip selection while already on Does It Work?), not for page-to-page moves. Direct links to any `?view=` (+ `?rebalance=` where relevant) render the right page and selection on load; an unknown/invalid param falls back to the deterministic default rather than erroring. Current page is marked in the nav (accent + underline, no sliding pill). Reload preserves the same state a fresh link would. Page changes scroll to top; in-page content includes its own next-step links so the header isn't the only way forward.

## 11. Motion

One grammar, reused rather than invented per spot: page-level crossfade (~220ms), Vane's four states (spring-based, never a fixed-duration tween that fights natural settling), a deliberate reveal step in the explorer, and a orchestrated (not looping) diagram-travel on How It's Built. No forced intro wait: content and nav are usable immediately, Vane's first sweep plays alongside, never gating. No scroll-hijacking, no perpetual motion beside dense text, no animated number that implies an intermediate value that doesn't exist, no full reveal replay on a small follow-up interaction. `prefers-reduced-motion` removes all of it in favor of instant final states with identical content.

## 12. Delight (small, after the core works)

A small number of specific, project-true details layered on once the explorer/graph-link/nav work: e.g., Vane's idle wobble getting very slightly quicker the longer a visitor lingers on Does It Work? (curiosity rewarded, not gamified), a small "first time here" one-line acknowledgment from Vane on Overview that never recurs in the same session. No confetti, no unrelated effects, no per-click animation tax. Personality survives with motion off: a static Vane and stat glyphs still read as this project's identity.

## 13. Accessibility

Vane and all decorative glyphs: `aria-hidden`. Every fact Vane visually emphasizes exists as real text/ARIA elsewhere. Full keyboard access to the nav, chart point selection (with a non-graph fallback), and the explorer's date/pick/reveal controls; visible accent focus rings. `prefers-reduced-motion` yields full content with zero character/travel/reorder motion. Reading order matches visual order at every width; nav scrolls horizontally before wrapping on mobile.

## 14. Scope and sequence

Build all five pages complete: no placeholders, no deferral. Reuse working logic verbatim: `lib/data.ts`, `lib/types.ts`, `lib/format.ts`, all `public/data/*.json`, the export script, the dark/amber token system (extended, not replaced). Rewrite substantially: the historical explorer (selection/reveal/linking), the performance chart (prominence, click-to-select, annotations). Add: Vane, the symbol set, the nav/routing shell, per-page compositions. New dependency: `framer-motion` (justified by orchestrated character/reveal motion this round is built around).

## 15. Acceptance criteria

- Dark/amber identity still immediately recognizable as the same project.
- Vane appears consistently across all five pages with a clear, non-decorative role, and is fully hidden from assistive tech without losing information.
- The symbol set is visibly one family across nav, pipeline, and Vane.
- Graph point selection and the explorer's selection are the same state, kept in sync, with a working non-graph fallback.
- Explorer default period is the earliest date, not the best-performing one.
- Drawdown (if shown) is explicitly labeled as sampled at rebalance frequency, not daily.
- Back/Forward retrace real navigation; reload preserves state; invalid params fall back safely.
- No two main pages share the same title-plus-stat-row-plus-card-grid composition.
- All five pages are complete, real, and free of placeholder content.
- `prefers-reduced-motion` yields full content with no character or reveal motion.

## 16. Decisions and open questions

**Approved:** keep dark/amber; add Vane, the symbol language, five distinct compositions, orchestrated motion (2026-09-10, explicit and detailed instruction). This document supersedes the prior "page-split only" plan's motion/copy/component restrictions.

**Owned by implementation, not re-litigated here:** exact pixel dimensions of Vane, exact SVG paths for each glyph, exact spring constants: these are build-time craft decisions consistent with the direction above.

**Blocking:** none: implementation is complete; this document has been re-synced against the shipped build, not just the pre-build plan.
