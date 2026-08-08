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
        <p className="text-slate-700 font-bold animate-pulse text-sm">
          Scanning 30+ Equities & overnight Global Markets (08:30 IST Engine)...
        </p>
      </div>
    );
  }

  if (error || !predictions) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl my-6">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900">Daily Prediction Engine Error</h3>
        <p className="text-slate-600 text-sm mt-1 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm transition shadow-md shadow-red-600/30"
        >
          Retry Prediction Scan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. TOP HERO HEADER & ENGINE STATUS */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-red-50/50 to-slate-50 border border-red-200 p-6 md:p-8 shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 font-bold text-xs rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                Live 08:30 AM IST Prediction Cutoff
              </span>
              <span className="text-slate-500 text-xs flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                {predictions.prediction_timestamp}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Daily Stock Direction Prediction Engine
            </h1>
            <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed font-medium">
              Automated pre-market machine-learning model classifying expected return direction
              (<span className="text-emerald-600 font-bold">UP</span> /{' '}
              <span className="text-red-600 font-bold">DOWN</span> /{' '}
              <span className="text-amber-600 font-bold">NEUTRAL</span>) across 30+ Indian equities with calibrated probability scaling.
            </p>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAgentModal}
              className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-white fill-white" />
              Autonomous Agent Analysis
            </button>
            <button
              onClick={loadData}
              className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-sm transition"
              title="Refresh Engine Scan"
            >
              <RotateCw className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">Global Market Regime</div>
            <div className="text-slate-900 font-bold text-base mt-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-600" />
              {predictions.market_regime}
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">Overnight Sentiment</div>
            <div className="text-emerald-600 font-bold text-base mt-1 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              {predictions.global_sentiment}
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">Total Equities Audited</div>
            <div className="text-slate-900 font-bold text-base mt-1 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-red-600" />
              {predictions.total_stocks_evaluated} Companies
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">Model Baseline</div>
            <div className="text-red-600 font-bold text-base mt-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-red-600" />
              v1.0 Baseline ML
            </div>
          </div>
        </div>
      </div>

      {/* 2. GLOBAL OVERNIGHT MARKETS & INTER-MARKET MACRO WIDGET */}
      {globals && globals.signals && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-red-600" />
              Global Overnight Inter-Market & Macro Cues
            </h2>
            <span className="text-xs font-semibold text-slate-500">Updates live from US, EU & Asia</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* S&P 500 */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>US S&P 500</span>
                <span>Overnight</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-slate-900">
                  {globals.signals.us_overnight_sp500_return > 0 ? '+' : ''}
                  {globals.signals.us_overnight_sp500_return}%
                </span>
                <span
                  className={`text-xs font-bold ${
                    globals.signals.us_overnight_sp500_return >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {globals.signals.us_overnight_sp500_return >= 0 ? 'Risk-On' : 'Risk-Off'}
                </span>
              </div>
            </div>

            {/* Nasdaq */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>US Nasdaq Tech</span>
                <span>Overnight</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-slate-900">
                  {globals.signals.us_overnight_nasdaq_return > 0 ? '+' : ''}
                  {globals.signals.us_overnight_nasdaq_return}%
                </span>
                <span className="text-xs text-slate-700 font-semibold truncate">
                  {globals.signals.indian_it_sector_signal}
                </span>
              </div>
            </div>

            {/* Brent Crude */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>Brent Crude Oil</span>
                <span>${globals.signals.brent_crude_price}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-slate-900">
                  {globals.signals.brent_crude_1d_change > 0 ? '+' : ''}
                  {globals.signals.brent_crude_1d_change}%
                </span>
                <span className="text-xs text-slate-700 font-semibold truncate">
                  {globals.signals.airline_fuel_impact_signal}
                </span>
              </div>
            </div>

            {/* USD / INR */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
                <span>USD / INR Exchange</span>
                <span>₹{globals.signals.usd_inr_rate}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-slate-900">
                  {globals.signals.usd_inr_1d_change > 0 ? '+' : ''}
                  {globals.signals.usd_inr_1d_change}%
                </span>
                <span className="text-xs text-slate-700 font-semibold truncate">
                  {globals.signals.fii_flow_yield_signal}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CATEGORIZED PREDICTION SECTIONS (GAINERS / LOSERS / UNCERTAIN) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              Direction Predictions for Today's Session
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Select stock card to inspect walk-forward backtest accuracy and detailed feature breakdown.
            </p>
          </div>

          {/* TAB CATEGORIES */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('gainers')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'gainers'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Potential Gainers ({predictions.top_potential_gainers.length})
            </button>

            <button
              onClick={() => setActiveTab('losers')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'losers'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Potential Losers ({predictions.top_potential_losers.length})
            </button>

            <button
              onClick={() => setActiveTab('uncertain')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'uncertain'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 bg-red-50 text-red-600 rounded border border-red-200">
                  Walk-Forward Simulation
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedBacktestSymbol} — 30-Day Model Accuracy & Backtest
                </h3>
              </div>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Zero-data-leakage historical simulation testing daily ML directional calls vs actual exchange returns.
              </p>
            </div>
          </div>

          {backtestLoading ? (
            <div className="p-8 text-center text-slate-700 font-bold animate-pulse text-sm">
              Computing 30-day walk-forward backtest simulation for {selectedBacktestSymbol}...
            </div>
          ) : backtestData ? (
            <div className="space-y-6">
              {/* ACCURACY SUMMARY METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold">Directional Accuracy</div>
                  <div className="text-emerald-600 font-extrabold text-xl mt-1">
                    {backtestData.overall_accuracy_pct}%
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold">Win Rate</div>
                  <div className="text-emerald-600 font-extrabold text-xl mt-1">
                    {backtestData.win_rate_pct}%
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold">Strategy Return</div>
                  <div
                    className={`font-extrabold text-xl mt-1 ${
                      backtestData.simulated_strategy_return_pct >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {backtestData.simulated_strategy_return_pct > 0 ? '+' : ''}
                    {backtestData.simulated_strategy_return_pct}%
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold">NIFTY 50 Benchmark</div>
                  <div className="text-slate-900 font-extrabold text-xl mt-1">
                    +{backtestData.benchmark_nifty_return_pct}%
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold">Sharpe Ratio</div>
                  <div className="text-red-600 font-extrabold text-xl mt-1">
                    {backtestData.sharpe_ratio}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-slate-500 text-xs font-semibold">Max Drawdown</div>
                  <div className="text-red-600 font-extrabold text-xl mt-1">
                    {backtestData.max_drawdown_pct}%
                  </div>
                </div>
              </div>

              {/* RECENT DAILY BACKTEST TABLE */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-800">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Trading Date</th>
                      <th className="p-3">ML Predicted</th>
                      <th className="p-3">Expected Return</th>
                      <th className="p-3">Actual Return</th>
                      <th className="p-3">Actual Direction</th>
                      <th className="p-3 text-center">Prediction Correct</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {backtestData.daily_history.slice(-8).map((step, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{step.date}</td>
                        <td className="p-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              step.predicted_direction === 'UP'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : step.predicted_direction === 'DOWN'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {step.predicted_direction}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          {step.expected_return_pct > 0 ? '+' : ''}
                          {step.expected_return_pct}%
                        </td>
                        <td className="p-3 font-bold">
                          <span
                            className={step.actual_return_pct >= 0 ? 'text-emerald-600' : 'text-red-600'}
                          >
                            {step.actual_return_pct > 0 ? '+' : ''}
                            {step.actual_return_pct}%
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">{step.actual_direction}</td>
                        <td className="p-3 text-center">
                          {step.is_correct ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600 font-bold">
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
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
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
                ? 'bg-white border-red-600 shadow-md shadow-red-600/10 ring-1 ring-red-600'
                : 'bg-white border-slate-200 hover:border-red-400 hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                    {stock.symbol}
                    <span className="text-xs font-semibold text-slate-500">({stock.sector})</span>
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 truncate max-w-[180px]">{stock.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-slate-900">₹{stock.current_price}</div>
                  <div className="text-[11px] font-bold text-slate-500">
                    Exp Return:{' '}
                    <span
                      className={
                        stock.expected_return_pct >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'
                      }
                    >
                      {stock.expected_return_pct > 0 ? '+' : ''}
                      {stock.expected_return_pct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* PROBABILITY BAR */}
              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700 flex items-center gap-1">
                    {type === 'UP' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
                    {type === 'DOWN' && <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                    {type === 'NEUTRAL' && <Activity className="w-3.5 h-3.5 text-amber-600" />}
                    Direction Probability
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {Math.round(mainProb * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
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
                    <div key={rIdx} className="text-[11px] text-slate-700 font-medium flex items-start gap-1.5">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CARD BOTTOM ACTION */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">
                Confidence: <strong className="text-slate-900">{stock.confidence}</strong>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStock(stock.symbol);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
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
