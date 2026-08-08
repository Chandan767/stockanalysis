export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percent_change: number;
  high_52w?: number;
  low_52w?: number;
  market_cap?: number;
  volume: number;
  timestamp: string;
}

export interface TodayScoreResult {
  symbol: string;
  technical_score: number;
  momentum_score: number;
  volume_score: number;
  market_trend_score: number;
  sector_score: number;
  news_score: number;
  today_opportunity_score: number;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: 'High' | 'Medium' | 'Low';
  breakout_candidate: boolean;
  unusual_volume: boolean;
}

export interface LongTermScoreResult {
  symbol: string;
  fundamental_quality_score: number;
  growth_score: number;
  profitability_score: number;
  balance_sheet_score: number;
  cash_flow_score: number;
  valuation_score: number;
  management_score: number;
  long_term_score: number;
  classification: string;
}

export interface TechnicalIndicatorResults {
  symbol: string;
  last_price: number;
  sma_20?: number;
  sma_50?: number;
  sma_100?: number;
  sma_200?: number;
  ema_12?: number;
  ema_26?: number;
  ema_50?: number;
  rsi_14?: number;
  macd?: number;
  macd_signal?: number;
  macd_hist?: number;
  bb_upper?: number;
  bb_middle?: number;
  bb_lower?: number;
  atr_14?: number;
  volume_ratio?: number;
  trend_20_50: string;
  trend_50_200: string;
  support_level?: number;
  resistance_level?: number;
}

export interface CompanyFundamentalData {
  symbol: string;
  period_date: string;
  market_cap?: number;
  pe_ratio?: number;
  pb_ratio?: number;
  ev_to_ebitda?: number;
  peg_ratio?: number;
  roe?: number;
  roce?: number;
  debt_to_equity?: number;
  interest_coverage?: number;
  revenue_growth_yoy?: number;
  profit_growth_yoy?: number;
  eps_growth_yoy?: number;
  operating_margin?: number;
  net_margin?: number;
  free_cash_flow?: number;
  promoter_holding?: number;
  ii_holding?: number;
}

export interface NewsSentimentItem {
  title: string;
  summary?: string;
  url?: string;
  source?: string;
  published_at: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  sentiment_score: number;
  reason: string;
}

export interface AISummaryReport {
  strengths: string[];
  risks: string[];
  technical_view: string;
  fundamental_view: string;
  news_view: string;
  short_term_view: string;
  long_term_view: string;
  important_things_to_watch: string[];
}

export interface FullStockResearchReport {
  symbol: string;
  name: string;
  quote: StockQuote;
  today_score: TodayScoreResult;
  long_term_score: LongTermScoreResult;
  technical_analysis: TechnicalIndicatorResults;
  fundamental_analysis: CompanyFundamentalData;
  recent_news: NewsSentimentItem[];
  ai_summary: AISummaryReport;
}

export interface AgentStockInsight {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  target_price_1y: number;
  pe_ratio: number;
  roe: number;
  revenue_growth_3y: number;
  profit_growth_3y: number;
  debt_to_equity: number;
  free_cash_flow: number;
  rsi_14: number;
  sma_20_50_cross: string;
  five_year_high: number;
  five_year_low: number;
  five_year_trend: string;
  probability_score: number;
  predicted_direction?: 'UP' | 'DOWN' | 'NEUTRAL';
  up_probability?: number;
  down_probability?: number;
  neutral_probability?: number;
  expected_return_pct?: number;
  expected_return_low?: number;
  expected_return_high?: number;
  projected_bias: string;
  confidence: string;
  agent_reasoning: string;
  strengths: string[];
  risk_factors: string[];
}

export interface AgentAnalysisReport {
  execution_time: string;
  total_stocks_analyzed: number;
  market_verdict: string;
  bullish_profit_candidates: AgentStockInsight[];
  bearish_loss_risk_candidates: AgentStockInsight[];
  neutral_candidates: AgentStockInsight[];
}

export interface DailyStockPredictionItem {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  predicted_direction: 'UP' | 'DOWN' | 'NEUTRAL';
  up_probability: number;
  down_probability: number;
  neutral_probability: number;
  expected_return_pct: number;
  expected_return_low: number;
  expected_return_high: number;
  confidence: 'High' | 'Medium' | 'Low';
  primary_reasons: string[];
  risk_factors: string[];
  model_version: string;
}

export interface DailyMarketPredictionReport {
  prediction_date: string;
  prediction_timestamp: string;
  market_regime: string;
  global_sentiment: string;
  total_stocks_evaluated: number;
  top_potential_gainers: DailyStockPredictionItem[];
  top_potential_losers: DailyStockPredictionItem[];
  uncertain_stocks: DailyStockPredictionItem[];
}

export interface GlobalMarketItem {
  key: string;
  symbol: string;
  name: string;
  region: string;
  price: number;
  change_1d: number;
  percent_change_1d: number;
  return_5d?: number;
  volatility_20d?: number;
  status: string;
}

export interface InterMarketSignals {
  us_overnight_sp500_return: number;
  us_overnight_nasdaq_return: number;
  us_vix_level: number;
  us_10y_yield: number;
  brent_crude_price: number;
  brent_crude_1d_change: number;
  usd_inr_rate: number;
  usd_inr_1d_change: number;
  indian_it_sector_signal: string;
  airline_fuel_impact_signal: string;
  fii_flow_yield_signal: string;
  global_risk_regime: string;
}

export interface GlobalNewsItem {
  title: string;
  summary: string;
  source: string;
  region: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  impact_reason: string;
}

export interface GlobalMarketReport {
  timestamp: string;
  items: GlobalMarketItem[];
  signals: InterMarketSignals;
  live_news_feed?: GlobalNewsItem[];
}

export interface DailyBacktestStep {
  date: string;
  symbol: string;
  predicted_direction: string;
  up_probability: number;
  expected_return_pct: number;
  actual_open: number;
  actual_close: number;
  actual_return_pct: number;
  actual_direction: string;
  is_correct: boolean;
  simulated_strategy_return: number;
}

export interface BacktestSummaryReport {
  symbol: string;
  period_days: number;
  total_evaluations: number;
  overall_accuracy_pct: number;
  up_precision_pct: number;
  down_precision_pct: number;
  win_rate_pct: number;
  mean_absolute_error_pct: number;
  simulated_strategy_return_pct: number;
  benchmark_nifty_return_pct: number;
  outperformance_vs_nifty_pct: number;
  sharpe_ratio: number;
  max_drawdown_pct: number;
  daily_history: DailyBacktestStep[];
}
