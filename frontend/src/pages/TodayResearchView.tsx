import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Filter, ArrowUpRight, AlertCircle } from 'lucide-react';
import { fetchTodayResearch } from '../services/api';
import { TodayScoreResult } from '../types';

interface TodayResearchViewProps {
  onSelectStock: (symbol: string) => void;
}

export const TodayResearchView = ({ onSelectStock }: TodayResearchViewProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'breakouts' | 'volume'>('all');

  const loadTodayData = () => {
    setLoading(true);
    setError(null);
    fetchTodayResearch()
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError('Failed fetching live market scanner results. Please check your network and retry.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTodayData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm space-x-2">
        <Activity className="w-5 h-5 animate-spin text-indigo-500" />
        <span>Scanning intraday technical setups & volume surges...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-400">{error}</p>
        <button
          onClick={() => loadTodayData()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-all"
        >
          Retry Market Scan
        </button>
      </div>
    );
  }

  const allCandidates: TodayScoreResult[] = [
    ...(data?.bullish_candidates || []),
    ...(data?.bearish_candidates || [])
  ];

  let filteredList = allCandidates;
  if (filter === 'bullish') filteredList = allCandidates.filter(c => c.bias === 'Bullish');
  if (filter === 'bearish') filteredList = allCandidates.filter(c => c.bias === 'Bearish');
  if (filter === 'breakouts') filteredList = allCandidates.filter(c => c.breakout_candidate);
  if (filter === 'volume') filteredList = allCandidates.filter(c => c.unusual_volume);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Research Mode • Today's Market</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Today's Market Research Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Probability-style Opportunity Scores based on technical setup, momentum, volume surges, sector strength, and news sentiment.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-2 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Analytical probability scores — not guaranteed financial returns.</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <span className="text-xs text-slate-500 font-medium mr-2 flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1" /> Filter:
        </span>
        {[
          { id: 'all', label: 'All Candidates' },
          { id: 'bullish', label: 'Bullish Setups' },
          { id: 'bearish', label: 'Bearish Setups' },
          { id: 'breakouts', label: 'Breakout Candidates' },
          { id: 'volume', label: 'Unusual Volume' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Candidates List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredList.map((item) => (
          <div 
            key={item.symbol}
            onClick={() => onSelectStock(item.symbol)}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer space-y-4 group"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center space-x-2">
                  <span>{item.symbol}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.bias === 'Bullish' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    Bias: {item.bias}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Confidence: {item.confidence}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Today's Score</span>
                <span className="text-2xl font-bold font-mono text-indigo-400">{item.today_opportunity_score}/100</span>
              </div>
            </div>

            {/* Score Breakdown Bars */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Technical (30%)</span>
                  <span className="font-mono text-slate-200">{item.technical_score}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${item.technical_score}%` }} />
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Momentum (20%)</span>
                  <span className="font-mono text-slate-200">{item.momentum_score}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.momentum_score}%` }} />
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Volume (15%)</span>
                  <span className="font-mono text-slate-200">{item.volume_score}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${item.volume_score}%` }} />
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Sector (10%)</span>
                  <span className="font-mono text-slate-200">{item.sector_score}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${item.sector_score}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
