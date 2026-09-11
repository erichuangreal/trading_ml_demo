import type { EquityCurveData, MetricsData, ModelInfo, PredictionsData } from "@/lib/types";
import type { ViewId } from "../app-shell";

export interface PageProps {
  metrics: MetricsData | null;
  equityCurve: EquityCurveData | null;
  predictions: PredictionsData | null;
  modelInfo: ModelInfo | null;
  rebalance: string | null;
  selectRebalance: (date: string | null, opts?: { navigateTo?: ViewId }) => void;
  navigate: (view: ViewId) => void;
}
