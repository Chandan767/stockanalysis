import { useState, useEffect } from 'react';
import { Bookmark, ArrowUpRight, Activity } from 'lucide-react';
import { fetchStockReport } from '../services/api';
import { FullStockResearchReport } from '../types';

interface WatchlistViewProps {
  onSelectStock: (symbol: string) => void;
}

export const WatchlistView = ({ onSelectStock }: WatchlistViewProps) => {
  const [symbols] = useState<string[]>(['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ICICIBANK']);
  const [reports, setReports] = useState<FullStockResearchReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all(symbols.map((sym) => fetchStockReport(sym)))
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [symbols]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>My Watchlist</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Saved Equities & Live Metrics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time price changes, intraday opportunity scores, and long-term quality ratings for your tracked stocks.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm space-x-2">
          <Activity className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Fetching watchlist quotes and scores...</span>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Current Price</th>
                <th className="px-6 py-4">Day Change</th>
                <th className="px-6 py-4">Today Score</th>
                <th className="px-6 py-4">Long-Term Score</th>
                <th className="px-6 py-4">Trend</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {reports.map((item) => (
                <tr 
                  key={item.symbol}
                  onClick={() => onSelectStock(item.symbol)}
                  className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-slate-100 font-sans">
                    <div>
                      <span>{item.symbol}</span>
                      <span className="text-[10px] text-slate-500 block font-normal">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-200">₹{item.quote.price.toLocaleString('en-IN')}</td>
                  <td className={`px-6 py-4 font-bold ${item.quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.quote.change >= 0 ? '+' : ''}{item.quote.change} ({item.quote.percent_change}%)
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                      {item.today_score.today_opportunity_score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                      {item.long_term_score.long_term_score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 font-sans text-slate-300">{item.today_score.bias}</td>
                  <td className="px-6 py-4 text-right font-sans">
                    <button className="text-slate-500 hover:text-indigo-400 transition-colors">
                      <ArrowUpRight className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
