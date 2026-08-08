import * as React from 'react';
import { 
  Bot, 
  Zap, 
  TrendingUp, 
  Target, 
  Search 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props: SidebarProps) => {
  const { activeTab, setActiveTab } = props;

  const agentItems = [
    {
      id: 'dashboard',
      label: 'Daily Direction Agent',
      desc: '08:30 IST ML Pipeline',
      icon: Bot
    },
    {
      id: 'today',
      label: 'Intraday Momentum Agent',
      desc: 'Volume Surge & Technicals',
      icon: TrendingUp
    },
    {
      id: 'longterm',
      label: '5Y Growth & Value Agent',
      desc: '5Y CAGR & Quality Audit',
      icon: Target
    },
    {
      id: 'stock',
      label: 'Deep Equity Audit Agent',
      desc: '360° Stock NLP & Ratios',
      icon: Search
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Brand Header */}
      <div className="h-16 flex items-center space-x-3 px-6 border-b border-slate-200">
        <div className="p-2 bg-red-600 rounded-lg text-white shadow-md shadow-red-600/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-black text-sm text-slate-900 tracking-wide uppercase">STOCK ANALYSER</h1>
          <p className="text-[10px] text-red-600 font-bold tracking-wider">AI AGENT ENGINE</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-red-600" />
          <span>4 Autonomous AI Agents</span>
        </div>
        {agentItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start space-x-3 p-3 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm font-bold ring-1 ring-red-200'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold leading-snug">{item.label}</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-slate-100 m-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-700 font-bold">Autonomous Pipeline</span>
          <span className="text-red-600 text-[10px] font-mono font-bold">LIVE AGENTS</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Click any agent to execute full quantitative & machine learning pipeline inside.
        </p>
      </div>
    </aside>
  );
};
