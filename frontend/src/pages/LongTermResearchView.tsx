import * as React from 'react';
import { useState, useEffect } from 'react';
import { Target, Activity, ArrowUpRight } from 'lucide-react';
import { fetchLongTermResearch } from '../services/api';
import { LongTermScoreResult } from '../types';

interface LongTermResearchViewProps {
  onSelectStock: (symbol: string) => void;
}

export const LongTermResearchView: React.FC<LongTermResearchViewProps> = (props: LongTermResearchViewProps) => {
  const { onSelectStock } = props;

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
      <div className="flex items-center justify-center h-64 text-slate-700 font-bold text-sm space-x-2">
        <Activity className="w-5 h-5 animate-spin text-red-600" />
        <span>5Y Growth Agent evaluating long-term growth, ROE/ROCE profitability, and valuation matrices...</span>
      </div>
    );
  }

  const list: LongTermScoreResult[] = data?.all_ranked || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-600 font-bold uppercase tracking-wider mb-1">
            <Target className="w-4 h-4 text-red-600" />
            <span>Autonomous AI Agent • 5Y Growth & Value Agent</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Long-Term Wealth Compounder Agent</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Multidimensional audit evaluating 5-year revenue/profit growth trajectories, ROE/ROCE profitability, debt trends, free cash flow, and valuation multiples.
          </p>
        </div>
      </div>

      {/* Candidates List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.map((item: LongTermScoreResult) => (
          <div 
            key={item.symbol}
            onClick={() => onSelectStock(item.symbol)}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:shadow-md transition-all cursor-pointer space-y-4 group"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors flex items-center space-x-2">
                  <span>{item.symbol}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                </h3>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  item.classification.includes('Strong') || item.classification.includes('Compounder')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {item.classification}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold block">Long-Term Quality Score</span>
                <span className="text-2xl font-black font-mono text-emerald-600">{item.long_term_score}/100</span>
              </div>
            </div>

            {/* Quality Score Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 text-[10px] font-bold block">Fundamental Quality</span>
                <span className="font-mono font-black text-slate-900 text-sm">{item.fundamental_quality_score}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 text-[10px] font-bold block">Growth</span>
                <span className="font-mono font-black text-slate-900 text-sm">{item.growth_score}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 text-[10px] font-bold block">Profitability (ROE)</span>
                <span className="font-mono font-black text-slate-900 text-sm">{item.profitability_score}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 text-[10px] font-bold block">Balance Sheet</span>
                <span className="font-mono font-black text-slate-900 text-sm">{item.balance_sheet_score}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 text-[10px] font-bold block">Cash Flow</span>
                <span className="font-mono font-black text-slate-900 text-sm">{item.cash_flow_score}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-slate-500 text-[10px] font-bold block">Valuation</span>
                <span className="font-mono font-black text-slate-900 text-sm">{item.valuation_score}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
