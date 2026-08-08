import { useState, useEffect } from 'react';
import { Target, Activity, ArrowUpRight } from 'lucide-react';
import { fetchLongTermResearch } from '../services/api';
import { LongTermScoreResult } from '../types';

interface LongTermResearchViewProps {
  onSelectStock: (symbol: string) => void;
}

export const LongTermResearchView = ({ onSelectStock }: LongTermResearchViewProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLongTermResearch()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm space-x-2">
        <Activity className="w-5 h-5 animate-spin text-indigo-500" />
        <span>Evaluating long-term growth, ROE/ROCE profitability, and valuation matrices...</span>
      </div>
    );
  }

  const list: LongTermScoreResult[] = data?.all_ranked || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Research Mode • Long-Term Stock Research</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Long-Term Quality Scoring Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Multidimensional evaluation of revenue/profit growth, ROE/ROCE profitability, debt trends, free cash flow, and valuation multiples.
          </p>
        </div>
      </div>

      {/* Candidates List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((item) => (
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
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold ${
                  item.classification.includes('Strong') 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {item.classification}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Long-Term Score</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{item.long_term_score}/100</span>
              </div>
            </div>

            {/* Quality Score Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center">
                <span className="text-slate-500 text-[10px] block">Fundamental Quality</span>
                <span className="font-mono font-bold text-slate-200">{item.fundamental_quality_score}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center">
                <span className="text-slate-500 text-[10px] block">Growth</span>
                <span className="font-mono font-bold text-slate-200">{item.growth_score}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center">
                <span className="text-slate-500 text-[10px] block">Profitability (ROE)</span>
                <span className="font-mono font-bold text-slate-200">{item.profitability_score}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center">
                <span className="text-slate-500 text-[10px] block">Balance Sheet</span>
                <span className="font-mono font-bold text-slate-200">{item.balance_sheet_score}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center">
                <span className="text-slate-500 text-[10px] block">Cash Flow</span>
                <span className="font-mono font-bold text-slate-200">{item.cash_flow_score}</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 text-center">
                <span className="text-slate-500 text-[10px] block">Valuation</span>
                <span className="font-mono font-bold text-slate-200">{item.valuation_score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
