export type LiveStageKey =
  | "extract_data"
  | "fundamentals"
  | "edgar_fundamentals"
  | "process_data"
  | "random_forest"
  | "predict";

export type LiveStageState = "pending" | "running" | "done" | "error";

export interface LiveStage {
  key: LiveStageKey;
  label: string;
  state: LiveStageState;
}

export interface LivePick {
  ticker: string;
  score: number;
  volatility20d: number;
  weightPct: number;
  dollars: number;
}

export interface LiveResult {
  asOf: string;
  runName: string;
  exposure: number;
  invested: number;
  cash: number;
  picks: LivePick[];
}

export interface LiveRun {
  status: "running" | "done" | "error";
  tradingDay: string;
  triggeredAtEt: string;
  currentStage: LiveStageKey | null;
  stages: LiveStage[];
  error: { stage: string; message: string } | null;
  result: LiveResult | null;
}

export interface LiveStatus {
  dateEt: string;
  isTradingDay: boolean;
  marketClosed: boolean;
  triggeredToday: boolean;
  run: LiveRun | null;
  latestCompletedRun: LiveRun | null;
}

export interface AuditLogEntry {
  triggeredAtEt: string;
  tradingDay: string;
  result: string;
}
