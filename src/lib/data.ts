import fs from "node:fs";
import path from "node:path";
import type { EquityCurveData, MetricsData, ModelInfo, PredictionsData } from "./types";

function readJson<T>(fileName: string): T | null {
  try {
    const filePath = path.join(process.cwd(), "public", "data", fileName);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getMetrics(): MetricsData | null {
  return readJson<MetricsData>("metrics.json");
}

export function getEquityCurve(): EquityCurveData | null {
  return readJson<EquityCurveData>("equity_curve.json");
}

export function getPredictions(): PredictionsData | null {
  return readJson<PredictionsData>("predictions.json");
}

export function getModelInfo(): ModelInfo | null {
  return readJson<ModelInfo>("model_info.json");
}
