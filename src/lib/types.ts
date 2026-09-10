export interface StrategyComparisonRow {
  strategy: string;
  annualizedReturn: number;
  sharpe: number;
  meanExposure: number;
  sortingSpreadBps: number;
}

export interface SignificanceInfo {
  sortingEdgeTStat: number;
  returnVsSpyTStat: number;
  returnVsSpyPValue: number;
  periodsWonVsSpy: number;
  periodsTotal: number;
  note: string;
}

export interface MetricsData {
  sample: boolean;
  source?: string;
  testStart: string;
  testEnd: string;
  rebalancePeriods: number;
  universeSize: number;
  topN: number;
  rebalanceDays: number;
  model: string;
  trainTarget: string;
  positionSizing: string;
  transactionCostsIncluded: boolean;
  roundTripCostBps: number;
  returns: {
    topThreeAnnualized: number;
    spyAnnualized: number;
    universeAnnualized: number;
  };
  sharpe: {
    topThree: number;
    spy: number;
    universe: number;
  };
  excessReturn: {
    vsSpy: number;
    vsUniverse: number;
  };
  sortingEdge: number;
  rankAccuracy: number;
  topMinusBottomSpreadBps: number;
  meanActualPercentileTopThree: number;
  pctTopThreeBeatingMedian: number;
  realizedVolatility: {
    topThree: number;
    spy: number;
    universe: number;
  };
  strategyComparison: StrategyComparisonRow[];
  significance: SignificanceInfo;
}

export interface EquityCurvePoint {
  date: string;
  topThree: number;
  spy: number;
  universe: number;
}

export interface EquityCurveData {
  sample: boolean;
  note?: string;
  startValue: number;
  series: EquityCurvePoint[];
}

export interface PredictionPick {
  rank: number;
  ticker: string;
  score: number;
  actualPercentile: number;
  next20dReturn: number;
  volatility20d: number;
}

export interface PredictionPeriod {
  date: string;
  picks: PredictionPick[];
  exposure: number;
  portfolioReturn: number;
  spyReturn: number;
  universeReturn: number;
  excessReturnVsSpy: number;
  meanActualPercentile: number;
  beatMedianCount: number;
}

export interface PredictionsData {
  sample: boolean;
  note?: string;
  periods: PredictionPeriod[];
}

export interface FeatureGroup {
  group: string;
  features: string[];
  note: string;
}

export interface ModelInfo {
  sample: boolean;
  model: string;
  objective?: string;
  universeSize: number;
  topN: number;
  rebalanceDays: number;
  testStart: string;
  testEnd: string;
  positionSizing: string;
  transactionCostsIncluded: boolean;
  roundTripCostBps: number;
  validation?: string;
  earningsExclusion?: string;
  featureCount?: number;
  featureGroups?: FeatureGroup[];
}
