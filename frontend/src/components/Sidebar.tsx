import * as React from 'react';
import { 
  Bot, 
  Zap, 
  TrendingUp, 
  Target, 
  Search,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props: SidebarProps) => {
  const { activeTab, setActiveTab } = props;

  const agentCards = [
    {
      id: 'dashboard',
      number: 'AGENT 01',
      title: 'Daily Direction Agent',
      badge: '08:30 IST ML',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      description: 'Supervised ML direction pipeline (UP / DOWN / NEUTRAL)',
      icon: Bot,
      accentColor: 'text-red-600',
      iconBg: 'bg-red-600'
    },
    {
      id: 'today',
      number: 'AGENT 02',
      title: 'Intraday Momentum Agent',
      badge: 'Volume Surge',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      description: 'Intraday technicals, volume spikes & breakout setups',
      icon: TrendingUp,
      accentColor: 'text-emerald-600',
      iconBg: 'bg-emerald-600'
    },
    {
      id: 'longterm',
      number: 'AGENT 03',
      title: '5Y Growth & Value Agent',
      badge: '5Y CAGR Audit',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      description: '5-year historical CAGR, ROE quality & debt trends',
      icon: Target,
      accentColor: 'text-indigo-600',
      iconBg: 'bg-indigo-600'
    },
    {
      id: 'stock',
      number: 'AGENT 04',
      title: 'Deep Equity Audit Agent',
      badge: '360° Stock NLP',
      badgeColor: 'bg-violet-100 text-violet-700 border-violet-200',
      description: 'Full multi-dimensional stock report & NLP sentiment',
      icon: Search,
      accentColor: 'text-violet-600',
      iconBg: 'bg-violet-600'
    }
  ];

  // Only display the currently active running agent card in sidebar to eliminate confusion!
  const visibleCards = agentCards.filter((agent) => agent.id === activeTab);
  const activeAgent = visibleCards[0] || agentCards[0];

  const Icon = activeAgent.icon;

  return (
    <aside className="w-72 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 shadow-sm shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center space-x-3 px-5 border-b border-slate-200">
        <div className="p-2 bg-red-600 rounded-lg text-white shadow-md shadow-red-600/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-black text-sm text-slate-900 tracking-wide uppercase">STOCK ANALYSER</h1>
          <p className="text-[10px] text-red-600 font-bold tracking-wider">ACTIVE AGENT DESK</p>
        </div>
      </div>

      {/* Active Running Agent Card Section */}
      <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        <div className="px-1 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Active Agent Pipeline
          </span>
          <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-extrabold uppercase">
            Running
          </span>
        </div>

        {/* The Single Active Agent Card */}
        <div className="p-5 rounded-2xl border bg-red-50/60 border-red-500 shadow-md ring-1 ring-red-500 relative overflow-hidden">
          {/* Card Top Strip */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {activeAgent.number}
            </span>
            <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${activeAgent.badgeColor}`}>
              {activeAgent.badge}
            </span>
          </div>

          {/* Card Title & Icon */}
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl text-white shadow-md shrink-0 mt-0.5 ${activeAgent.iconBg}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-red-700 leading-snug">
                {activeAgent.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">
                {activeAgent.description}
              </p>
            </div>
          </div>

          {/* Running Status Badge */}
          <div className="mt-4 pt-3 border-t border-red-200 flex items-center justify-between text-xs font-extrabold text-red-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              • Agent Running
            </span>
            <ArrowRight className="w-4 h-4 text-red-600" />
          </div>
        </div>

        {/* Switch Agent Button */}
        <button
          onClick={() => setActiveTab('hub')}
          className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-red-600" />
          <span>Switch Agent (4 Agents Hub)</span>
        </button>
      </nav>

      {/* Bottom Status Card */}
      <div className="p-3.5 border-t border-slate-100 m-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-700 font-bold">Autonomous Engine</span>
          <span className="text-emerald-600 text-[10px] font-mono font-bold">ACTIVE</span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
          Single active agent focus mode enabled. Click 'Switch Agent' to change agents.
        </p>
      </div>
    </aside>
  );
};
