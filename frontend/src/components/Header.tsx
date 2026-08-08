import * as React from 'react';
import { Search, Bell, Activity, ArrowLeft, Bot } from 'lucide-react';

interface HeaderProps {
  onBackToHub?: () => void;
  showBackHub?: boolean;
}

export const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { onBackToHub, showBackHub } = props;

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-4 flex-1 max-w-2xl">
        {showBackHub && onBackToHub && (
          <button
            onClick={onBackToHub}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-red-600" />
            <span>4 AI Agents Hub</span>
          </button>
        )}

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
          <input
            type="text"
            placeholder="Search Indian stocks (e.g. RELIANCE, TCS, INFY, HDFCBANK)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-medium"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          <Activity className="w-3.5 h-3.5 animate-pulse text-red-600" />
          <span>NSE Market Open</span>
        </div>

        <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
        </button>

        <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
          <div className="px-3 py-1 rounded-lg bg-red-600 shadow-md shadow-red-600/30 flex items-center justify-center font-extrabold text-xs text-white">
            Stock Analyser
          </div>
          <span className="text-xs font-bold text-slate-800">Indian Market Desk</span>
        </div>
      </div>
    </header>
  );
};
