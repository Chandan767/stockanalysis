import * as React from 'react';
import { Search, Bell, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Indian stocks (e.g. RELIANCE, TCS, INFY, HDFCBANK)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>NSE Market Open</span>
        </div>

        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
          <div className="px-2.5 py-1 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white">
            Stock Analyser
          </div>
          <span className="text-xs font-semibold text-slate-300">Indian Market Desk</span>
        </div>
      </div>
    </header>
  );
};
