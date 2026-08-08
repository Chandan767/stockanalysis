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
  CheckCircle2,
  Building2,
  Filter,
  ChevronDown
} from 'lucide-react';
import { fetchStockReport } from '../services/api';
import { FullStockResearchReport } from '../types';
import nifty500Data from '../data/nifty500_stocks.json';

interface StockAnalysisViewProps {
  initialSymbol?: string;
}

interface StockItem {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
}

// Complete Master Directory of 2,075+ Verified NSE & BSE Listed Companies
const REAL_NSE_BSE_STOCKS: StockItem[] = (nifty500Data as any[]).map((item: any) => ({
  symbol: item.symbol,
  name: item.name,
  sector: item.sector || 'NSE & BSE Equities',
  exchange: 'NSE/BSE'
}));

export const StockAnalysisView: React.FC<StockAnalysisViewProps> = (props: StockAnalysisViewProps) => {
  const { initialSymbol = 'TCS' } = props;

  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [searchInput, setSearchInput] = useState<string>(initialSymbol);
  const [report, setReport] = useState<FullStockResearchReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'technical' | 'fundamental' | 'news'>('ai');

  // Sector Directory Filter State
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [showDirectory, setShowDirectory] = useState<boolean>(true);

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

  const handleSelectFromDirectory = (selectedSym: string) => {
    setSymbol(selectedSym);
    setSearchInput(selectedSym);
  };

  // Filter stocks by sector and search query
  const filteredStocks = REAL_NSE_BSE_STOCKS.filter((st: StockItem) => {
    const matchesSector = selectedSector === 'ALL' || st.sector === selectedSector;
    const matchesQuery =
      st.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
      st.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      st.sector.toLowerCase().includes(searchInput.toLowerCase());
    return matchesSector && matchesQuery;
  });

  const sectors = ['ALL', 'Banking & Finance', 'Information Tech', 'Energy & Power', 'Automotive', 'Pharma & Healthcare', 'Consumer & Retail', 'Defense & Industrials', 'Metals & Infra', 'NSE & BSE Equities'];

  return (
    <div className="space-y-8">
      {/* 1. TOP INTERACTIVE NSE/BSE REAL STOCK DIRECTORY SELECTOR */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-600 font-extrabold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>COMPLETE NSE & BSE EQUITIES MASTER DIRECTORY ({REAL_NSE_BSE_STOCKS.length.toLocaleString('en-IN')}+ COMPANIES)</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Select Any Indian Stock for Deep Audit
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Click any company from the 2,075+ registered equities below or search any symbol to trigger Agent 04's live audit pipeline.
            </p>
          </div>

          <button
            onClick={() => setShowDirectory(!showDirectory)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Filter className="w-3.5 h-3.5 text-red-600" />
            <span>{showDirectory ? 'Hide Directory' : 'Show Directory'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDirectory ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* SEARCH FORM */}
        <form onSubmit={handleSearch} className="flex items-center space-x-3 max-w-2xl">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search ANY of the 2,075+ NSE & BSE stocks (e.g. SBIN, TCS, RELIANCE, ADANIENT, IRFC, PAYTM, SUZLON, TATAPOWER)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 font-bold"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-red-600/30 shrink-0"
          >
            Analyze
          </button>
        </form>

        {/* SECTOR FILTER TABS & STOCK CARDS GRID */}
        {showDirectory && (
          <div className="space-y-4 pt-2">
            {/* Sector Tabs */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
              {sectors.map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSector(sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedSector === sec
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {sec === 'ALL' ? `All Companies (${REAL_NSE_BSE_STOCKS.length.toLocaleString('en-IN')})` : sec}
                </button>
              ))}
            </div>

            {/* Stocks Directory Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-1">
              {filteredStocks.slice(0, 150).map((st: StockItem) => {
                const isSelected = symbol === st.symbol;
                return (
                  <div
                    key={st.symbol}
                    onClick={() => handleSelectFromDirectory(st.symbol)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-red-50/80 border-red-600 ring-1 ring-red-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-red-400 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-900">{st.symbol}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600">
                          {st.exchange}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold truncate mt-1">{st.name}</p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium truncate">{st.sector}</span>
                      <span className={`font-extrabold ${isSelected ? 'text-red-600' : 'text-slate-500'}`}>
                        {isSelected ? '● Selected' : 'Audit →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredStocks.length > 150 && (
              <p className="text-[11px] text-slate-500 font-medium text-center italic">
                Showing top 150 results matching filter. Type in the search box to pinpoint any of the {filteredStocks.length.toLocaleString('en-IN')} equities.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. REPORT BODY OR LOADING STATE */}
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
