import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Globe,
  Clock,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Award
} from 'lucide-react';
import {
  DailyMarketPredictionReport,
  GlobalMarketReport,
  DailyStockPredictionItem,
  BacktestSummaryReport
} from '../types';
import {
  fetchDailyPredictions,
  fetchGlobalMarkets,
  fetchStockBacktest
} from '../services/api';

interface DashboardViewProps {
  onSelectStock: (symbol: string) => void;
  onOpenAgentModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = (props: DashboardViewProps) => {
  const { onSelectStock, onOpenAgentModal } = props;

  const [predictions, setPredictions] = useState<DailyMarketPredictionReport | null>(null);
  const [globals, setGlobals] = useState<GlobalMarketReport | null>(null);
  const [selectedBacktestSymbol, setSelectedBacktestSymbol] = useState<string>('INFY');
  const [backtestData, setBacktestData] = useState<BacktestSummaryReport | null>(null);
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'uncertain'>('gainers');

  const [loading, setLoading] = useState<boolean>(true);
  const [backtestLoading, setBacktestLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [predData, globData] = await Promise.all([
        fetchDailyPredictions(),
        fetchGlobalMarkets()
      ]);
      setPredictions(predData);
      setGlobals(globData);

      // Default backtest loading
      if (predData.top_potential_gainers.length > 0) {
        const topSym = predData.top_potential_gainers[0].symbol;
        setSelectedBacktestSymbol(topSym);
        loadBacktest(topSym);
      }
    } catch (err: any) {
      setError(err.message || 'Failed loading prediction engine');
    } finally {
      setLoading(false);
    }
  };

  const loadBacktest = async (symbol: string) => {
    setBacktestLoading(true);
    try {
      const bData = await fetchStockBacktest(symbol, 30);
      setBacktestData(bData);
    } catch (e) {
      console.error(e);
    } finally {
      setBacktestLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectBacktest = (symbol: string) => {
    setSelectedBacktestSymbol(symbol);
    loadBacktest(symbol);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-white font-medium animate-pulse text-sm">
          Scanning 30+ Equities & overnight Global Markets (08:30 IST Engine)...
        </p>
      </div>
    );
  }

  if (error || !predictions) {
    return (
      <div className="p-8 text-center bg-red-950/40 border border-red-600/50 rounded-xl my-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white">Daily Prediction Engine Error</h3>
        <p className="text-slate-300 text-sm mt-1 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-sm transition"
        >
          Retry Prediction Scan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO HEADER & ENGINE STATUS */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-red-950/40 to-slate-950 border border-red-600/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/15 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-red-600/10 border border-red-600/30 text-red-400 font-bold text-xs rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Live 08:30 AM IST Prediction Cutoff
              </span>
              <span className="text-slate-300 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                {predictions.prediction_timestamp}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Daily Stock Direction Prediction Engine
            </h1>
            <p className="text-slate-200 text-sm mt-2 max-w-2xl leading-relaxed">
              Automated pre-market machine-learning model classifying expected return direction
              (<span className="text-emerald-400 font-bold">UP</span> /{' '}
              <span className="text-red-400 font-bold">DOWN</span> /{' '}
              <span className="text-amber-400 font-bold">NEUTRAL</span>) across 30+ Indian equities with calibrated probability scaling.
            </p>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAgentModal}
              className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-white fill-white" />
              Autonomous Agent Analysis
            </button>
            <button
              onClick={loadData}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 transition"
              title="Refresh Engine Scan"
            >
              <RotateCw className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs font-medium">Global Market Regime</div>
            <div className="text-white font-bold text-base mt-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-400" />
              {predictions.market_regime}
            </div>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs font-medium">Overnight Sentiment</div>
            <div className="text-emerald-400 font-bold text-base mt-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              {predictions.global_sentiment}
            </div>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs font-medium">Total Equities Audited</div>
            <div className="text-white font-bold text-base mt-1 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-red-400" />
              {predictions.total_stocks_evaluated} Companies
            </div>
          </div>
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-xs font-medium">Model Baseline</div>
            <div className="text-red-300 font-bold text-base mt-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-red-500" />
              v1.0 Baseline ML
            </div>
          </div>
        </div>
      </div>

      {/* 2. GLOBAL OVERNIGHT MARKETS & INTER-MARKET MACRO WIDGET */}
      {globals && globals.signals && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-500" />
              Global Overnight Inter-Market & Macro Cues
            </h2>
            <span className="text-xs text-slate-400">Updates live from US, EU & Asia</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* S&P 500 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>US S&P 500</span>
                <span className="text-slate-400">Overnight</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">
                  {globals.signals.us_overnight_sp500_return > 0 ? '+' : ''}
                  {globals.signals.us_overnight_sp500_return}%
                </span>
                <span
                  className={`text-xs font-bold ${
                    globals.signals.us_overnight_sp500_return >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {globals.signals.us_overnight_sp500_return >= 0 ? 'Risk-On' : 'Risk-Off'}
                </span>
              </div>
            </div>

            {/* Nasdaq */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>US Nasdaq Tech</span>
                <span className="text-slate-400">Overnight</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">
                  {globals.signals.us_overnight_nasdaq_return > 0 ? '+' : ''}
                  {globals.signals.us_overnight_nasdaq_return}%
                </span>
                <span className="text-xs text-slate-300 font-medium truncate">
                  {globals.signals.indian_it_sector_signal}
                </span>
              </div>
            </div>

            {/* Brent Crude */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Brent Crude Oil</span>
                <span className="text-slate-400">${globals.signals.brent_crude_price}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">
                  {globals.signals.brent_crude_1d_change > 0 ? '+' : ''}
                  {globals.signals.brent_crude_1d_change}%
                </span>
                <span className="text-xs text-slate-300 font-medium truncate">
                  {globals.signals.airline_fuel_impact_signal}
                </span>
              </div>
            </div>

            {/* USD / INR */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>USD / INR Exchange</span>
                <span className="text-slate-400">₹{globals.signals.usd_inr_rate}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white">
                  {globals.signals.usd_inr_1d_change > 0 ? '+' : ''}
                  {globals.signals.usd_inr_1d_change}%
                </span>
                <span className="text-xs text-slate-300 font-medium truncate">
                  {globals.signals.fii_flow_yield_signal}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CATEGORIZED PREDICTION SECTIONS (GAINERS / LOSERS / UNCERTAIN) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              Direction Predictions for Today's Session
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Select stock card to inspect walk-forward backtest accuracy and detailed feature breakdown.
            </p>
          </div>

          {/* TAB CATEGORIES */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('gainers')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'gainers'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Potential Gainers ({predictions.top_potential_gainers.length})
            </button>

            <button
              onClick={() => setActiveTab('losers')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'losers'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Potential Losers ({predictions.top_potential_losers.length})
            </button>

            <button
              onClick={() => setActiveTab('uncertain')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'uncertain'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Uncertain ({predictions.uncertain_stocks.length})
            </button>
          </div>
        </div>

        {/* CARDS GRID */}
        {activeTab === 'gainers' && (
          <PredictionStockGrid
            items={predictions.top_potential_gainers}
            selectedSymbol={selectedBacktestSymbol}
            onSelectBacktest={handleSelectBacktest}
            onSelectStock={onSelectStock}
            type="UP"
          />
        )}

        {activeTab === 'losers' && (
          <PredictionStockGrid
            items={predictions.top_potential_losers}
            selectedSymbol={selectedBacktestSymbol}
            onSelectBacktest={handleSelectBacktest}
            onSelectStock={onSelectStock}
            type="DOWN"
          />
        )}

        {activeTab === 'uncertain' && (
          <PredictionStockGrid
            items={predictions.uncertain_stocks}
            selectedSymbol={selectedBacktestSymbol}
            onSelectBacktest={handleSelectBacktest}
            onSelectStock={onSelectStock}
            type="NEUTRAL"
          />
        )}
      </div>

      {/* 4. INTERACTIVE MODEL BACKTESTING & ACCURACY DASHBOARD */}
      {selectedBacktestSymbol && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 bg-red-600/20 text-red-300 rounded border border-red-600/30">
                  Walk-Forward Simulation
                </span>
                <h3 className="text-xl font-bold text-white">
                  {selectedBacktestSymbol} — 30-Day Model Accuracy & Backtest
                </h3>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Zero-data-leakage historical simulation testing daily ML directional calls vs actual exchange returns.
              </p>
            </div>
          </div>

          {backtestLoading ? (
            <div className="p-8 text-center text-white animate-pulse text-sm">
              Computing 30-day walk-forward backtest simulation for {selectedBacktestSymbol}...
            </div>
          ) : backtestData ? (
            <div className="space-y-6">
              {/* ACCURACY SUMMARY METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs">Directional Accuracy</div>
                  <div className="text-emerald-400 font-extrabold text-xl mt-1">
                    {backtestData.overall_accuracy_pct}%
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs">Win Rate</div>
                  <div className="text-emerald-400 font-extrabold text-xl mt-1">
                    {backtestData.win_rate_pct}%
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs">Strategy Return</div>
                  <div
                    className={`font-extrabold text-xl mt-1 ${
                      backtestData.simulated_strategy_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {backtestData.simulated_strategy_return_pct > 0 ? '+' : ''}
                    {backtestData.simulated_strategy_return_pct}%
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs">NIFTY 50 Benchmark</div>
                  <div className="text-white font-extrabold text-xl mt-1">
                    +{backtestData.benchmark_nifty_return_pct}%
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs">Sharpe Ratio</div>
                  <div className="text-red-400 font-extrabold text-xl mt-1">
                    {backtestData.sharpe_ratio}
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400 text-xs">Max Drawdown</div>
                  <div className="text-red-400 font-extrabold text-xl mt-1">
                    {backtestData.max_drawdown_pct}%
                  </div>
                </div>
              </div>

              {/* RECENT DAILY BACKTEST TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Trading Date</th>
                      <th className="p-3">ML Predicted</th>
                      <th className="p-3">Expected Return</th>
                      <th className="p-3">Actual Return</th>
                      <th className="p-3">Actual Direction</th>
                      <th className="p-3 text-center">Prediction Correct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {backtestData.daily_history.slice(-8).map((step, idx) => (
                      <tr key={idx} className="hover:bg-slate-950/60">
                        <td className="p-3 font-medium text-white">{step.date}</td>
                        <td className="p-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              step.predicted_direction === 'UP'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : step.predicted_direction === 'DOWN'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {step.predicted_direction}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-200">
                          {step.expected_return_pct > 0 ? '+' : ''}
                          {step.expected_return_pct}%
                        </td>
                        <td className="p-3 font-bold">
                          <span
                            className={step.actual_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}
                          >
                            {step.actual_return_pct > 0 ? '+' : ''}
                            {step.actual_return_pct}%
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-white">{step.actual_direction}</td>
                        <td className="p-3 text-center">
                          {step.is_correct ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                              Miss
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

/* PREDICTION STOCK GRID COMPONENT */
interface PredictionStockGridProps {
  items: DailyStockPredictionItem[];
  selectedSymbol: string;
  onSelectBacktest: (symbol: string) => void;
  onSelectStock: (symbol: string) => void;
  type: 'UP' | 'DOWN' | 'NEUTRAL';
}

const PredictionStockGrid: React.FC<PredictionStockGridProps> = (props: PredictionStockGridProps) => {
  const { items, selectedSymbol, onSelectBacktest, onSelectStock, type } = props;

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
        No equities categorized under this direction regime for today's trading session.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((stock: DailyStockPredictionItem) => {
        const isSelected = selectedSymbol === stock.symbol;
        const mainProb =
          type === 'UP'
            ? stock.up_probability
            : type === 'DOWN'
            ? stock.down_probability
            : stock.neutral_probability;

        return (
          <div
            key={stock.symbol}
            onClick={() => onSelectBacktest(stock.symbol)}
            className={`p-5 rounded-2xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              isSelected
                ? 'bg-slate-900 border-red-500 shadow-lg shadow-red-600/20'
                : 'bg-slate-950 border-slate-800 hover:border-red-600/40 hover:bg-slate-900/60'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                    {stock.symbol}
                    <span className="text-xs font-normal text-slate-400">({stock.sector})</span>
                  </h4>
                  <p className="text-xs text-slate-400 truncate max-w-[180px]">{stock.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-white">₹{stock.current_price}</div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    Exp Return:{' '}
                    <span
                      className={
                        stock.expected_return_pct >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'
                      }
                    >
                      {stock.expected_return_pct > 0 ? '+' : ''}
                      {stock.expected_return_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* PROBABILITY BAR */}
              <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    {type === 'UP' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                    {type === 'DOWN' && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                    {type === 'NEUTRAL' && <Activity className="w-3.5 h-3.5 text-amber-400" />}
                    Direction Probability
                  </span>
                  <span className="font-extrabold text-white">
                    {Math.round(mainProb * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.round(stock.up_probability * 100)}%` }}
                    className="bg-emerald-500 h-full"
                    title={`UP: ${Math.round(stock.up_probability * 100)}%`}
                  />
                  <div
                    style={{ width: `${Math.round(stock.neutral_probability * 100)}%` }}
                    className="bg-amber-500 h-full"
                    title={`NEUTRAL: ${Math.round(stock.neutral_probability * 100)}%`}
                  />
                  <div
                    style={{ width: `${Math.round(stock.down_probability * 100)}%` }}
                    className="bg-red-600 h-full"
                    title={`DOWN: ${Math.round(stock.down_probability * 100)}%`}
                  />
                </div>
              </div>

              {/* PRIMARY DRIVER REASONS */}
              {stock.primary_reasons && stock.primary_reasons.length > 0 && (
                <div className="mt-3 space-y-1">
                  {stock.primary_reasons.slice(0, 2).map((reason: string, rIdx: number) => (
                    <div key={rIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CARD BOTTOM ACTION */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Confidence: <strong className="text-white">{stock.confidence}</strong>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStock(stock.symbol);
                }}
                className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                Deep Research &rarr;
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
