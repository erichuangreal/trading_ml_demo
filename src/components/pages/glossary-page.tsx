import { EvaluateGlyph } from "../icons/glyphs";
import type { PageProps } from "./types";

const TERMS = [
  {
    term: "Cross-sectional ranking",
    plain: "Comparing every stock against every other stock on the same day, rather than judging one stock against its own history.",
    precise: "At each rebalance, the model scores all ~90 equities against the same day's cross-sectional median return, then ranks them relative to each other.",
  },
  {
    term: "Walk-forward validation",
    plain: "Testing the model the way it would actually be used: train on the past, predict the future, then move forward in time and repeat.",
    precise: "Retrained every 20 trading days on an expanding window of past data only, never on data from after the period being scored.",
  },
  {
    term: "Embargo",
    plain: "A short gap left empty between training data and test data, so no future information leaks backward.",
    precise: "A 20-trading-day buffer dropped from the end of the training window, since each label already looks 20 days into the future.",
  },
  {
    term: "t-statistic (t)",
    plain: "A measure of how likely a result is to be real signal rather than random noise. Bigger (in either direction) means more confidence it isn't luck.",
    precise: "Here, t = 2.19 for the ranking edge (conventionally significant) and t = 0.66 for the raw return advantage over SPY (not significant at typical thresholds).",
  },
  {
    term: "p-value (p)",
    plain: "The probability of seeing a result this extreme purely by chance, if there were actually no real effect at all. Smaller means less likely to be chance.",
    precise: "p = 0.51 for the return advantage over SPY: essentially a coin flip's worth of confidence that the gap is real.",
  },
  {
    term: "Sharpe ratio",
    plain: "Return per unit of bumpiness. Two strategies can earn the same money, but the one with a smoother ride has a higher Sharpe ratio.",
    precise: "Annualized return divided by annualized volatility. The model's Sharpe (1.15) trails SPY's (1.77) despite a higher raw return, because its path is rougher.",
  },
  {
    term: "Basis points (bps)",
    plain: "A hundredth of a percent. 100 bps = 1%. Used because it's easier to compare small numbers precisely.",
    precise: "The modeled 15 bps round-trip transaction cost = 0.15% per trade, deducted from every reported return.",
  },
  {
    term: "Exposure",
    plain: "How much of the portfolio is actually invested at a given time, versus held back as a safety margin.",
    precise: "Ranges 20%–100%, scaled so the whole basket targets a 17.3% annualized volatility rather than always being fully invested.",
  },
  {
    term: "Drawdown",
    plain: "How far the portfolio has fallen from its highest point so far, at a given moment.",
    precise: "Measured here only at the 46 rebalance-date observations, not daily, so the real intraperiod drawdown was likely deeper than shown.",
  },
];

export function GlossaryPage(_props: PageProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
      <div className="mb-12 flex items-start gap-3">
        <EvaluateGlyph className="mt-1 text-accent" />
        <div>
          <h1 className="text-[1.9rem] font-semibold tracking-tight text-foreground sm:text-[2.3rem]">
            How to read this site
          </h1>
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted">
            Plain-language explanations first, the precise definition underneath, tied to the actual numbers used
            elsewhere on this site. Nothing here is a new claim; it&apos;s the same figures, explained.
          </p>
        </div>
      </div>

      <dl className="flex flex-col gap-0">
        {TERMS.map((t) => (
          <div key={t.term} className="border-t border-border py-6 first:border-t-0 first:pt-0">
            <dt className="text-[1rem] font-medium text-foreground">{t.term}</dt>
            <dd className="mt-2 max-w-xl text-[0.9rem] leading-relaxed text-muted">{t.plain}</dd>
            <dd className="mt-2 max-w-xl border-l-2 border-border pl-3 text-[0.8rem] leading-relaxed text-subtle">
              {t.precise}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
