// Server-only: converts the FastAPI backend's snake_case JSON into this
// site's established camelCase convention (see lib/types.ts). Used by the
// Next.js API routes under app/api/live-demo/, never imported client-side.
import type { LivePick, LiveResult, LiveRun, LiveStageKey, LiveStageState } from "./live-types";

interface RawPick {
  ticker: string;
  score: number;
  volatility_20d: number;
  weight_pct: number;
  dollars: number;
}

interface RawResult {
  as_of: string;
  run_name: string;
  exposure: number;
  invested: number;
  cash: number;
  picks: RawPick[];
}

interface RawStage {
  key: LiveStageKey;
  label: string;
  state: LiveStageState;
}

export interface RawRun {
  status: "running" | "done" | "error";
  trading_day: string;
  triggered_at_et: string;
  current_stage: LiveStageKey | null;
  stages: RawStage[];
  error: { stage: string; message: string } | null;
  result: RawResult | null;
}

function transformPick(raw: RawPick): LivePick {
  return {
    ticker: raw.ticker,
    score: raw.score,
    volatility20d: raw.volatility_20d,
    weightPct: raw.weight_pct,
    dollars: raw.dollars,
  };
}

function transformResult(raw: RawResult | null): LiveResult | null {
  if (!raw) return null;
  return {
    asOf: raw.as_of,
    runName: raw.run_name,
    exposure: raw.exposure,
    invested: raw.invested,
    cash: raw.cash,
    picks: (raw.picks ?? []).map(transformPick),
  };
}

export function transformRun(raw: RawRun | null): LiveRun | null {
  if (!raw) return null;
  return {
    status: raw.status,
    tradingDay: raw.trading_day,
    triggeredAtEt: raw.triggered_at_et,
    currentStage: raw.current_stage,
    stages: (raw.stages ?? []).map((s) => ({ key: s.key, label: s.label, state: s.state })),
    error: raw.error ? { stage: raw.error.stage, message: raw.error.message } : null,
    result: transformResult(raw.result),
  };
}
