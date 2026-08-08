import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './pages/DashboardView';
import { TodayResearchView } from './pages/TodayResearchView';
import { LongTermResearchView } from './pages/LongTermResearchView';
import { StockAnalysisView } from './pages/StockAnalysisView';
import { WatchlistView } from './pages/WatchlistView';

export const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState('TCS');

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setActiveTab('stock');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView onSelectStock={handleSelectStock} />}
            {activeTab === 'today' && <TodayResearchView onSelectStock={handleSelectStock} />}
            {activeTab === 'longterm' && <LongTermResearchView onSelectStock={handleSelectStock} />}
            {activeTab === 'stock' && <StockAnalysisView initialSymbol={selectedStock} />}
            {activeTab === 'watchlist' && <WatchlistView onSelectStock={handleSelectStock} />}
            {activeTab === 'backtest' && (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                <h2 className="text-xl font-bold text-slate-200">Quantitative Backtesting Engine</h2>
                <p className="text-xs text-slate-400">Historical Strategy Simulation, Win Rate, CAGR & Sharpe Ratio benchmarking against NIFTY 50 (Phase 13 Module).</p>
              </div>
            )}
            {activeTab === 'news' && (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                <h2 className="text-xl font-bold text-slate-200">Market News & Sentiment Radar</h2>
                <p className="text-xs text-slate-400">Live Indian equity news feed aggregated from Economic Times, LiveMint, and Financial Express.</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="p-8 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-4">
                <h2 className="text-xl font-bold text-slate-200">Scoring Engine Configuration</h2>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Today Technical Weight</span>
                    <span className="text-indigo-400 font-bold">30%</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Long-Term Fundamental Weight</span>
                    <span className="text-emerald-400 font-bold">25%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
