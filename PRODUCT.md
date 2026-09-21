# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: software engineering recruiters, ML engineering recruiters, quantitative developers/researchers, software engineers, and technical hiring managers evaluating this as a portfolio piece. A visitor should understand what the project is within ~30-60 seconds; more technical visitors should be able to inspect the ML workflow, walk-forward validation, portfolio construction, historical decisions, and performance/limitations in depth.

## Product Purpose

A public, recruiter-facing interactive demo/visualization of an existing machine-learning cross-sectional equity-ranking system. It makes an existing quantitative research project (built and run in a separate private repository) understandable, credible, and inspectable to a technical hiring audience. Success = a recruiter/engineer can, within about a minute, understand what the model does, how it was validated, what its historical results were, how those compare to benchmarks, and what its limitations are.

A second surface, the Live Demo page, extends this: rather than only showing historical backtest output, it lets a visitor trigger (or observe) the actual private pipeline genuinely retraining and re-ranking on real, current-day data, once per trading day. This exists to prove the system is real and running, not just a static export; it is still a demonstration/portfolio artifact, not a trading product.

## Positioning

This is a portfolio/engineering-demonstration site, explicitly not a trading product. It presents itself with the visual and intellectual honesty of quantitative research / institutional analytics rather than retail trading or fintech marketing; critical self-assessment of results (e.g., lower Sharpe than SPY despite higher absolute return) is part of the credibility story, not something to hide.

## Brand Commitments

This is presented explicitly as Eric's own personal project, built in his own time, not an anonymous case study or a corporate product. Confirmed voice: creative, semi-formal, personal, and confident; first person where it's about the work and the process. The tone should read as curiosity and ownership of the engineering, pride in the finished result, honest interpretation of what the results do and don't show, and an openness about wanting to keep improving it, not academic distance, not sales copy, not false modesty. Visual identity (dark background, amber accent) is a confirmed, binding foundation to preserve across any redesign; see DESIGN.md for its current expression. Personal-motivation anecdotes ("why I built this," specific stories) are never fabricated; real wording only, or omitted.

## Operating Context

- **Repository split:** The ML implementation (training, feature engineering, walk-forward backtesting, saved runs) lives in a separate private repository, `trading_ml` (sibling directory `../trading_ml`, read-only from this repo). This repository, `trading_ml_demo`, is presentation-only for the historical pages and must not require runtime access to the private repo for them.
- **Data flow (historical pages):** `trading_ml` (private) → `scripts/export_demo_data.py` (read-only from `../trading_ml`, writes only into this repo) → `trading_ml_demo/public/data/*.json` → Next.js frontend → Vercel.
- **Data files (real, present):** `public/data/metrics.json`, `public/data/equity_curve.json`, `public/data/predictions.json`, `public/data/model_info.json` all exist and carry `"sample": false`, sourced directly from the private repo's final saved walk-forward run, `v4xgboost_walkforward_2026-08-26_22-53-59` (45 real rebalance periods, 2023-01-03 to 2026-07-09). Re-run the export script to refresh from a newer saved run; never hand-edit these files.
- **Deployment (historical pages):** Static/Vercel-deployable, no backend, no database, no auth, no live market data, no server-side inference.
- **Live Demo backend (new, separate surface):** A small FastAPI service runs on Eric's own VM (not Vercel). It orchestrates `trading_ml`'s existing, unmodified pipeline scripts via subprocess (`extract_data.py` → `fundamentals.py` → `edgar_fundamentals.py` → `process_data.py` → `random_forest.py` → `predict.py`), still strictly read-only against the private repo's code (no files in `trading_ml` are edited; it only runs what a person would run by hand, and reads whatever those scripts write). This reruns the full walk-forward retrain and today's Top-3 picks with inverse-volatility sizing, once per trading day, triggered by the first visitor after 4pm ET. The result is cached (SQLite on the VM) and served to every visitor that day, both to avoid redundant ~3-minute compute and to keep yfinance/SEC EDGAR API calls to once/day regardless of traffic. The public audit log (Triggered at (ET) | Trading day | Result) and a "has today's run been triggered yet" status indicator are both real, backed by that same SQLite state, never simulated.
- **Live Demo data flow:** Browser → `trading_ml_demo`'s Next.js API route (server-side proxy; keeps the VM's address out of the client) → VM's FastAPI service → live pipeline / cached result.

## Capabilities and Constraints

**The underlying system (context, not to be rebuilt here):** a cross-sectional ML stock-ranking model. At each 20-trading-day rebalance: load historical market data → engineer 34 features (across momentum, trend, volatility, oscillators, range/structure, candle shape, volume, market context, earnings timing, and SEC EDGAR fundamentals) for ~90 NASDAQ equities → train an XGBoost classifier on historical data only (walk-forward, expanding window, 20-day embargo against label leakage) → estimate each stock's probability of beating the day's cross-sectional median return over the next 20 trading days → rank cross-sectionally → select Top 3 (excluding names within 5 trading days of earnings) → size inversely to each pick's own volatility, then scale the whole basket to a 17.3% annualized volatility target (20%-100% exposure clamp) → hold 20 trading days → repeat. Evaluated via historical out-of-sample walk-forward testing, test period 2023-01-03 to 2026-07-09, 45 independent non-overlapping rebalance periods. A 15 bps round-trip transaction cost is modeled and included in every net figure.

**Confirmed headline results (from the real export, `public/data/metrics.json`, sourced from the private repo's final saved run):** Top-3 annualized return 33.8%; SPY annualized return 24.3%; equal-weight universe annualized return 28.8%; Top-3 Sharpe 1.15; SPY Sharpe 1.77; universe Sharpe 1.51; annualized net excess return vs SPY +9.5%; sorting edge (median-split rank-accuracy edge over the 50% baseline) +1.85pp; rank accuracy 51.85%; mean actual percentile of Top-3 selections 0.5474; % of Top-3 selections beating the median 60.74%; top-minus-bottom-3 spread +259 bps/period.

**Statistical significance (important nuance, drives the site's "Results Interpretation" honesty):** the cross-sectional sorting edge is significant (t ≈ 2.19 across 45 periods). The raw return advantage over SPY is *not* statistically significant (t ≈ 0.66, p ≈ 0.51); Top 3 beat SPY in only 20 of 45 periods, close to a coin flip. The most defensible result is the ranking signal, not the headline return number; never let site copy imply otherwise.

**Hard constraints on this repo:**
- Never merge with or expose the private `trading_ml` implementation (training scripts, model files, raw datasets, credentials, private notes). The Live Demo backend may *run* that repo's scripts via subprocess but must never edit, copy, or reimplement their logic; it stays read-only against `trading_ml`'s code.
- Never fabricate or invent returns, benchmark results, ticker selections, predictions, dates, Sharpe ratios, equity curves, model metrics, audit-log entries, or run timestamps. Missing fields are omitted or shown as N/A, never silently filled. This applies equally to the Live Demo's real-time output and audit log.
- Not a live trading platform, brokerage, signal service, or recommendation engine: no BUY/SELL/current-recommendation language anywhere, including on the Live Demo page. The historical pages show explicitly historical/out-of-sample predictions; the Live Demo page shows the model's genuine current-day output, clearly labeled as such (see Product Principles) with its own disclaimer, never framed as advice to act on.
- Historical-page tech stack is frozen: Next.js (App Router) + TypeScript + Tailwind CSS + Recharts + static JSON, deployed to Vercel, with no backend/database/auth/live-data/server-side-inference of its own. The one confirmed exception is the Live Demo page: its Next.js code stays a thin server-side proxy only (no inference logic in this repo, nothing on Vercel does ML work); the actual retraining and inference happen entirely in the private `trading_ml` repo via a FastAPI wrapper on Eric's own VM. No new backend/database/auth/live-data is added anywhere else in this repo.
- Scope beyond the Live Demo page is frozen to shipping the historical demo; no redesigning or retraining the ML system outside of what the Live Demo's daily pipeline run already does.

## Evidence on Hand

`public/data/*.json` (metrics, equity_curve, predictions, model_info) are real, present, and marked `"sample": false`, generated by `scripts/export_demo_data.py` from `../trading_ml`'s final saved walk-forward run. The UI reads these files as its sole source of truth for anything presented as a real result; nothing is hard-coded in components. If a future export ever needs to ship with placeholder data (e.g. before a newer run's export lands), it must carry `"sample": true` and the UI must surface that clearly; the current files do not need this. If a metric or field is unavailable, display N/A rather than inventing or estimating it.

The Live Demo page's data (today's picks, exposure, weights, dollar sizing, and the audit log) is not a static export: it comes live from the VM's FastAPI service each time it's requested, sourced from that day's real pipeline run (or the cached result of it). The same "real data only, N/A over fabrication" rule applies to it.

## Product Principles

1. **Data integrity over completeness.** Never fabricate or backfill a missing figure; omit or show N/A. Real exported JSON (historical pages) or the real VM-backed API response (Live Demo) is the only source of truth for anything presented as an actual result.
2. **Research honesty over salesmanship.** Present results critically (e.g., lower Sharpe than SPY despite higher absolute return); credibility to a technical audience matters more than looking impressive.
3. **Clear separation of historical vs. live, honestly labeled.** The historical pages show explicitly historical, out-of-sample model output, never framed as a current recommendation. The Live Demo page is the one deliberate exception: it shows the model's genuine, current-day retrained output, clearly labeled as live and dated, with its own disclaimer, and still never framed as investment advice or a signal to act on.
4. **Presentation-only boundary, except where the Live Demo explicitly needs a backend.** The historical pages never need the private `trading_ml` implementation at runtime or build time; they consume static exported JSON only. The Live Demo page is the sole exception, and even it only *runs* `trading_ml`'s existing scripts read-only from a backend on Eric's own VM; it never copies or reimplements their logic into this repo.
5. **Recruiter-first clarity, researcher-depth on demand.** A visitor understands the project's premise in under a minute; a technical visitor can drill into methodology, walk-forward validation, and limitations without being forced to.
6. **Compute and rate-limit discipline on the Live Demo.** The live pipeline (~3 minutes, live yfinance/SEC EDGAR calls) runs at most once per trading day regardless of visitor traffic; every visitor after the first that day sees the cached result, both to bound compute cost and to avoid a shared VM IP getting rate-limited or blocked by those providers.

## Accessibility & Inclusion

Semantic HTML, proper heading structure, accessible labels, keyboard-accessible selectors (e.g. the historical rebalance-date picker), sufficient text contrast, and accessible chart descriptions are required; this is a general "should work well for all visitors" requirement, not a compliance mandate from a named standard.
