import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Activity, 
  BarChart2, 
  BookOpen, 
  Newspaper, 
  Cpu, 
  ShieldAlert, 
  CheckCircle2
} from 'lucide-react';
import { fetchStockReport } from '../services/api';
import { FullStockResearchReport } from '../types';

interface StockAnalysisViewProps {
  initialSymbol?: string;
}

export const StockAnalysisView: React.FC<StockAnalysisViewProps> = ({ initialSymbol = 'TCS' }) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState(initialSymbol);
  const [report, setReport] = useState<FullStockResearchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'technical' | 'fundamental' | 'news'>('ai');

  const loadStockReport = (sym: string) => {
    setLoading(true);
    setError(null);
    fetchStockReport(sym)
      .then(setReport)
      .catch((err) => {
        console.error(err);
        setError(`Live market data request failed for "${sym}". Please verify the symbol or try again.`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStockReport(symbol);
  }, [symbol]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
    }
  };

  const quickStocks = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ICICIBANK'];

  return (
    <div className="space-y-8">
      {/* Search Bar & Quick Tickers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <form onSubmit={handleSearch} className="flex items-center space-x-3 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search symbol (e.g. TCS, RELIANCE, INFY)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            Analyze
          </button>
        </form>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Quick Select:</span>
          {quickStocks.map((s) => (
            <button
              key={s}
              onClick={() => { setSymbol(s); setSearchInput(s); }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                symbol === s
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm space-x-2">
          <Activity className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Fetching live market quotes & technical indicators for {symbol}...</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-400">{error}</p>
          <button
            onClick={() => loadStockReport(symbol)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-all"
          >
            Retry Live Data Fetch
          </button>
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* Header Stock Price Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-100">{report.name}</h1>
                <span className="px-2.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono text-xs font-bold">
                  {report.symbol}.NS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">NSE Equities • Indian Stock Market</p>

              <div className="flex items-baseline space-x-4 mt-4">
                <span className="text-3xl font-bold font-mono text-slate-100">
                  ₹{report.quote.price.toLocaleString('en-IN')}
                </span>
                <span className={`text-sm font-bold font-mono ${report.quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {report.quote.change >= 0 ? '+' : ''}{report.quote.change} ({report.quote.percent_change}%)
                </span>
              </div>
            </div>

            {/* Score Badges */}
            <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-center px-4 border-r border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Today Score</span>
                <span className="text-2xl font-bold font-mono text-indigo-400">
                  {report.today_score.today_opportunity_score}/100
                </span>
                <span className="text-[10px] text-emerald-400 font-medium block">
                  {report.today_score.bias}
                </span>
              </div>

              <div className="text-center px-4">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Long-Term Score</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {report.long_term_score.long_term_score}/100
                </span>
                <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[120px]">
                  {report.long_term_score.classification}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 space-x-6">
            {[
              { id: 'ai', label: 'AI Structured Report', icon: Cpu },
              { id: 'technical', label: 'Technical Analysis', icon: BarChart2 },
              { id: 'fundamental', label: 'Fundamental Ratios', icon: BookOpen },
              { id: 'news', label: 'News & Sentiment', icon: Newspaper },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400 font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: AI Structured Summary */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Strengths & Risks Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Identified Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {report.ai_summary.strengths.map((st, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5" />
                    <span>Identified Risks</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {report.ai_summary.risks.map((rk, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{rk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Analytical Views */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Analytical Views Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <span className="font-semibold text-indigo-400 block mb-1">Technical View</span>
                    <p className="text-slate-300 leading-relaxed">{report.ai_summary.technical_view}</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                    <span className="font-semibold text-emerald-400 block mb-1">Fundamental View</span>
                    <p className="text-slate-300 leading-relaxed">{report.ai_summary.fundamental_view}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Technical Analysis */}
          {activeTab === 'technical' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SMA 20</span>
                <span className="text-slate-200 text-sm font-bold">₹{report.technical_analysis.sma_20}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SMA 50</span>
                <span className="text-slate-200 text-sm font-bold">₹{report.technical_analysis.sma_50}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">RSI (14)</span>
                <span className="text-indigo-400 text-sm font-bold">{report.technical_analysis.rsi_14}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MACD Histogram</span>
                <span className="text-emerald-400 text-sm font-bold">{report.technical_analysis.macd_hist}</span>
              </div>
            </div>
          )}

          {/* Tab 3: Fundamental Analysis */}
          {activeTab === 'fundamental' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">P/E Ratio</span>
                <span className="text-slate-200 text-sm font-bold">{report.fundamental_analysis.pe_ratio}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Return on Equity (ROE)</span>
                <span className="text-emerald-400 text-sm font-bold">{report.fundamental_analysis.roe}%</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Debt / Equity</span>
                <span className="text-slate-200 text-sm font-bold">{report.fundamental_analysis.debt_to_equity}</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Revenue Growth YoY</span>
                <span className="text-slate-200 text-sm font-bold">{report.fundamental_analysis.revenue_growth_yoy}%</span>
              </div>
            </div>
          )}

          {/* Tab 4: News & Sentiment */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              {report.recent_news.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-100">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{item.summary}</p>
                  <p className="text-[11px] text-indigo-400 italic">Reason: {item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
