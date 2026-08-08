import {
  MarketOverviewData,
  FullStockResearchReport,
  AgentAnalysisReport,
  DailyMarketPredictionReport,
  GlobalMarketReport,
  BacktestSummaryReport
} from '../types';

const API_BASE = '/api/v1';

export async function fetchMarketOverview(): Promise<MarketOverviewData> {
  const res = await fetch(`${API_BASE}/market/overview`);
  if (!res.ok) throw new Error('Failed fetching market overview');
  return res.json();
}

export async function fetchTodayResearch() {
  const res = await fetch(`${API_BASE}/research/today`);
  if (!res.ok) throw new Error('Failed fetching today research');
  return res.json();
}

export async function fetchLongTermResearch() {
  const res = await fetch(`${API_BASE}/research/long-term`);
  if (!res.ok) throw new Error('Failed fetching long-term research');
  return res.json();
}

export async function fetchStockReport(symbol: string): Promise<FullStockResearchReport> {
  const res = await fetch(`${API_BASE}/research/${symbol}`);
  if (!res.ok) throw new Error(`Failed fetching research report for ${symbol}`);
  return res.json();
}

export async function fetchStockList() {
  const res = await fetch(`${API_BASE}/stocks`);
  if (!res.ok) throw new Error('Failed fetching stock list');
  return res.json();
}

export async function fetchAgentAnalysis(): Promise<AgentAnalysisReport> {
  const res = await fetch(`${API_BASE}/agent/analyze`);
  if (!res.ok) throw new Error('Failed executing AI Agent Analysis');
  return res.json();
}

export async function fetchDailyPredictions(): Promise<DailyMarketPredictionReport> {
  const res = await fetch(`${API_BASE}/predict/daily`);
  if (!res.ok) throw new Error('Failed fetching daily predictions');
  return res.json();
}

export async function fetchGlobalMarkets(): Promise<GlobalMarketReport> {
  const res = await fetch(`${API_BASE}/market/global`);
  if (!res.ok) throw new Error('Failed fetching global markets report');
  return res.json();
}

export async function fetchStockBacktest(symbol: string, days: number = 30): Promise<BacktestSummaryReport> {
  const res = await fetch(`${API_BASE}/predict/backtest/${symbol}?days=${days}`);
  if (!res.ok) throw new Error(`Failed fetching backtest report for ${symbol}`);
  return res.json();
}

export async function fetchPredictionHistory(symbol: string) {
  const res = await fetch(`${API_BASE}/predict/history/${symbol}`);
  if (!res.ok) throw new Error(`Failed fetching prediction history for ${symbol}`);
  return res.json();
}
