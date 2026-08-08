import * as React from 'react';
import { useState, useEffect } from 'react';
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

export const StockAnalysisView: React.FC<StockAnalysisViewProps> = (props: StockAnalysisViewProps) => {
  const { initialSymbol = 'TCS' } = props;

  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [searchInput, setSearchInput] = useState<string>(initialSymbol);
  const [report, setReport] = useState<FullStockResearchReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center space-x-3 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search symbol (e.g. TCS, RELIANCE, INFY)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 font-bold"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-red-600/30"
          >
            Analyze
          </button>
        </form>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">Quick Select:</span>
          {quickStocks.map((s) => (
            <button
              key={s}
              onClick={() => { setSymbol(s); setSearchInput(s); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                symbol === s
                  ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-700 font-bold text-sm space-x-2">
          <Activity className="w-5 h-5 animate-spin text-red-600" />
          <span>Fetching live market quotes & technical indicators for {symbol}...</span>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
          <p className="text-sm font-bold text-red-600">{error}</p>
          <button
            onClick={() => loadStockReport(symbol)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/30"
          >
            Retry Live Data Fetch
          </button>
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* Header Stock Price Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-black text-slate-900">{report.name}</h1>
                <span className="px-2.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-600 font-mono text-xs font-bold">
                  {report.symbol}.NS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-1">NSE Equities • Indian Stock Market</p>

              <div className="flex items-baseline space-x-4 mt-4">
                <span className="text-3xl font-black font-mono text-slate-900">
                  ₹{report.quote.price.toLocaleString('en-IN')}
                </span>
                <span className={`text-sm font-extrabold font-mono ${report.quote.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {report.quote.change >= 0 ? '+' : ''}{report.quote.change} ({report.quote.percent_change}%)
                </span>
              </div>
            </div>

            {/* Score Badges */}
            <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-center px-4 border-r border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Today Score</span>
                <span className="text-2xl font-black font-mono text-red-600">
                  {report.today_score.today_opportunity_score}/100
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block">
                  {report.today_score.bias}
                </span>
              </div>

              <div className="text-center px-4">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Long-Term Score</span>
                <span className="text-2xl font-black font-mono text-emerald-600">
                  {report.long_term_score.long_term_score}/100
                </span>
                <span className="text-[10px] text-slate-600 font-bold block truncate max-w-[120px]">
                  {report.long_term_score.classification}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 space-x-6">
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
                  className={`pb-3 text-sm font-extrabold flex items-center space-x-2 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600 font-black'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
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
                <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-emerald-700 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Identified Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs font-semibold text-slate-900">
                    {report.ai_summary.strengths.map((st: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-red-50/80 border border-red-200 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-red-700 font-black text-sm">
                    <ShieldAlert className="w-5 h-5" />
                    <span>Identified Risks</span>
                  </div>
                  <ul className="space-y-2 text-xs font-semibold text-slate-900">
                    {report.ai_summary.risks.map((rk: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>{rk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Analytical Views */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Analytical Views Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-red-600 block mb-1">Technical View</span>
                    <p className="text-slate-800 font-medium leading-relaxed">{report.ai_summary.technical_view}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-emerald-600 block mb-1">Fundamental View</span>
                    <p className="text-slate-800 font-medium leading-relaxed">{report.ai_summary.fundamental_view}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Technical Analysis */}
          {activeTab === 'technical' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block text-[10px]">SMA 20</span>
                <span className="text-slate-900 text-sm font-black">₹{report.technical_analysis.sma_20}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block text-[10px]">SMA 50</span>
                <span className="text-slate-900 text-sm font-black">₹{report.technical_analysis.sma_50}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block text-[10px]">RSI (14)</span>
                <span className="text-red-600 text-sm font-black">{report.technical_analysis.rsi_14}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block text-[10px]">MACD Histogram</span>
                <span className="text-emerald-600 text-sm font-black">{report.technical_analysis.macd_hist}</span>
              </div>
            </div>
          )}

          {/* Tab 3: Fundamental Analysis */}
          {activeTab === 'fundamental' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block text-[10px]">P/E Ratio</span>
                <span className="text-slate-900 text-sm font-black">{report.fundamental_analysis.pe_ratio}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block text-[10px]">Return on Equity (ROE)</span>
                <span className="text-emerald-600 text-sm font-black">{report.fundamental_analysis.roe}%</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block text-[10px]">Debt / Equity</span>
                <span className="text-slate-900 text-sm font-black">{report.fundamental_analysis.debt_to_equity}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 font-bold block text-[10px]">Revenue Growth YoY</span>
                <span className="text-slate-900 text-sm font-black">{report.fundamental_analysis.revenue_growth_yoy}%</span>
              </div>
            </div>
          )}

          {/* Tab 4: News & Sentiment */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              {report.recent_news.map((item: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-sm text-slate-900">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{item.summary}</p>
                  <p className="text-[11px] text-red-600 font-bold italic">Reason: {item.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
