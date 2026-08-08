import * as React from 'react';
import { 
  Bot, 
  Zap, 
  TrendingUp, 
  Target, 
  Search,
  ArrowRight
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

  return (
    <aside className="w-72 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 shadow-sm shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center space-x-3 px-5 border-b border-slate-200">
        <div className="p-2 bg-red-600 rounded-lg text-white shadow-md shadow-red-600/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-black text-sm text-slate-900 tracking-wide uppercase">STOCK ANALYSER</h1>
          <p className="text-[10px] text-red-600 font-bold tracking-wider">SELECT AGENT CARD</p>
        </div>
      </div>

      {/* 4 Agent Cards Container */}
      <nav className="flex-1 px-3 py-5 space-y-3 overflow-y-auto">
        <div className="px-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-red-600" />
            Choose AI Agent
          </span>
          <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">4 Active</span>
        </div>

        {agentCards.map((agent) => {
          const Icon = agent.icon;
          const isActive = activeTab === agent.id;

          return (
            <div
              key={agent.id}
              onClick={() => setActiveTab(agent.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                isActive
                  ? 'bg-red-50/60 border-red-500 shadow-md ring-1 ring-red-500'
                  : 'bg-slate-50/80 border-slate-200 hover:border-red-400 hover:bg-white hover:shadow-sm'
              }`}
            >
              {/* Card Top Strip */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">
                  {agent.number}
                </span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${agent.badgeColor}`}>
                  {agent.badge}
                </span>
              </div>

              {/* Card Title & Icon */}
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-xl text-white shadow-sm shrink-0 mt-0.5 ${agent.iconBg}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className={`text-xs font-black leading-snug transition-colors ${
                    isActive ? 'text-red-700' : 'text-slate-900 group-hover:text-red-600'
                  }`}>
                    {agent.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Card Bottom CTA */}
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-bold">
                <span className={isActive ? 'text-red-600' : 'text-slate-500 group-hover:text-slate-800'}>
                  {isActive ? '● Agent Running' : 'Click to Run Agent'}
                </span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                  isActive ? 'text-red-600 translate-x-0.5' : 'text-slate-400 group-hover:text-red-600 group-hover:translate-x-1'
                }`} />
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom Status Card */}
      <div className="p-3.5 border-t border-slate-100 m-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-700 font-bold">Autonomous Engine</span>
          <span className="text-red-600 text-[10px] font-mono font-bold">READY</span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
          Select any agent card to launch its full pipeline on the main screen.
        </p>
      </div>
    </aside>
  );
};
