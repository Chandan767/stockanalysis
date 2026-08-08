import * as React from 'react';
import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Filter, ArrowUpRight, AlertCircle } from 'lucide-react';
import { fetchTodayResearch } from '../services/api';
import { TodayScoreResult } from '../types';

interface TodayResearchViewProps {
  onSelectStock: (symbol: string) => void;
}

export const TodayResearchView: React.FC<TodayResearchViewProps> = (props: TodayResearchViewProps) => {
  const { onSelectStock } = props;

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
      <div className="flex items-center justify-center h-64 text-slate-700 font-bold text-sm space-x-2">
        <Activity className="w-5 h-5 animate-spin text-red-600" />
        <span>Scanning intraday technical setups & volume surges...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <button
          onClick={() => loadTodayData()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/30"
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
  if (filter === 'bullish') filteredList = allCandidates.filter((s) => s.bias === 'Bullish');
  if (filter === 'bearish') filteredList = allCandidates.filter((s) => s.bias === 'Bearish');
  if (filter === 'breakouts') filteredList = allCandidates.filter((s) => s.breakout_candidate);
  if (filter === 'volume') filteredList = allCandidates.filter((s) => s.unusual_volume);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <span>Today's Market Opportunity Scanner</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Quantitative scoring evaluating intraday momentum, volume surges, breakout patterns, and sector tailwinds.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <Filter className="w-4 h-4 text-slate-500 ml-2" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            All Setups ({allCandidates.length})
          </button>
          <button
            onClick={() => setFilter('bullish')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'bullish' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Bullish
          </button>
          <button
            onClick={() => setFilter('bearish')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'bearish' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Bearish
          </button>
        </div>
      </div>

      {/* Grid of Opportunity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item: TodayScoreResult) => {
          const isBullish = item.bias === 'Bullish';
          return (
            <div
              key={item.symbol}
              onClick={() => onSelectStock(item.symbol)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:shadow-md transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-red-600 transition-colors flex items-center space-x-1.5">
                    <span>{item.symbol}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                  </h3>
                  <span className="text-xs font-bold text-slate-500">{item.bias} Bias</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold block">Opportunity Score</span>
                  <span
                    className={`text-xl font-black font-mono ${
                      isBullish ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {item.today_opportunity_score}/100
                  </span>
                </div>
              </div>

              {/* Score Breakdown Bar */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-600">Technical Score</span>
                  <span className="font-bold text-slate-900">{item.technical_score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Momentum Score</span>
                  <span className="font-bold text-slate-900">{item.momentum_score}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Volume Score</span>
                  <span className="font-bold text-slate-900">{item.volume_score}/100</span>
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {item.breakout_candidate && (
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                    Breakout Setup
                  </span>
                )}
                {item.unusual_volume && (
                  <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                    Unusual Volume Surge
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
