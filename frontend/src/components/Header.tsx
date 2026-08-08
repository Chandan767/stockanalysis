import * as React from 'react';
import { Search, Bell, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
          <input
            type="text"
            placeholder="Search Indian stocks (e.g. RELIANCE, TCS, INFY, HDFCBANK)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/90 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse text-red-500" />
          <span>NSE Market Open</span>
        </div>

        <button className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-slate-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
        </button>

        <div className="flex items-center space-x-2 border-l border-slate-800 pl-4">
          <div className="px-3 py-1 rounded-lg bg-gradient-to-tr from-red-600 to-rose-600 shadow-md shadow-red-600/30 flex items-center justify-center font-extrabold text-xs text-white">
            Stock Analyser
          </div>
          <span className="text-xs font-bold text-white">Indian Market Desk</span>
        </div>
      </div>
    </header>
  );
};
