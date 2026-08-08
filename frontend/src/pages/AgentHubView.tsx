import * as React from 'react';
import { 
  Bot, 
  Target, 
  Search, 
  Sparkles,
  ShieldCheck,
  LogIn,
  UserPlus,
  User,
  LogOut,
  ArrowRight
} from 'lucide-react';

interface AgentHubViewProps {
  onSelectAgent: (agentId: string) => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export const AgentHubView: React.FC<AgentHubViewProps> = (props: AgentHubViewProps) => {
  const { onSelectAgent, onOpenAuth, user, onLogout } = props;

  const agents = [
    {
      id: 'dashboard',
      number: 'AGENT 01',
      title: 'Daily Direction Prediction Agent',
      subtitle: '08:30 AM IST Pre-Market ML Pipeline',
      badge: 'Supervised ML Model',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      description: 'Executes pre-market directional prediction (UP / DOWN / NEUTRAL) across 2,075+ Indian equities. Evaluates overnight US market cues, Brent crude, USD/INR, real-time news NLP sentiment, and 30-day walk-forward backtesting.',
      icon: Bot,
      iconBg: 'bg-red-600 shadow-lg shadow-red-600/30',
      gradient: 'from-red-50/80 via-white to-slate-50 border-red-200 hover:border-red-500 hover:shadow-xl',
      ctaText: 'Launch Daily Direction Agent'
    },
    {
      id: 'longterm',
      number: 'AGENT 02',
      title: '5-Year Growth & Value Agent',
      subtitle: '5Y CAGR & ROE Quality Audit Engine',
      badge: '5Y CAGR Quality',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      description: 'Audits 5-year historical price channels, revenue/profit CAGR trajectories, ROE/ROCE fundamental quality, free cash flow stability, balance sheet debt, and valuation multiples.',
      icon: Target,
      iconBg: 'bg-indigo-600 shadow-lg shadow-indigo-600/30',
      gradient: 'from-indigo-50/80 via-white to-slate-50 border-indigo-200 hover:border-indigo-500 hover:shadow-xl',
      ctaText: 'Launch 5Y Growth Agent'
    },
    {
      id: 'stock',
      number: 'AGENT 03',
      title: 'Deep Equity Audit Agent',
      subtitle: '360° Multi-Dimensional Stock Report & NLP',
      badge: '360° Stock NLP',
      badgeColor: 'bg-violet-100 text-violet-700 border-violet-200',
      description: 'Performs full multi-dimensional stock report synthesis: live price quotes, technical moving averages/RSI/MACD, company financial ratios, news sentiment NLP, and AI risk breakdown.',
      icon: Search,
      iconBg: 'bg-violet-600 shadow-lg shadow-violet-600/30',
      gradient: 'from-violet-50/80 via-white to-slate-50 border-violet-200 hover:border-violet-500 hover:shadow-xl',
      ctaText: 'Launch Deep Audit Agent'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-10 flex flex-col justify-between max-w-7xl 2xl:max-w-full 2xl:px-16 mx-auto select-none">
      {/* 1. TOP BRANDING HERO HEADER */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-600 font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>STOCK ANALYSER • AI AGENT COMMAND HUB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Select Your Autonomous AI Agent
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed font-medium">
              Choose an AI Agent below. Clicking any agent card immediately executes its full quantitative machine learning or financial audit pipeline and renders its detailed interactive results dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-900 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200 flex items-center gap-1.5 text-xs font-extrabold"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-red-600" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2. AGENTS CARDS GRID - RESPONSIVE FOR PHONES, TABS, LAPTOPS & TVS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 sm:mt-8">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={`p-5 sm:p-6 rounded-2xl border bg-gradient-to-br transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm ${agent.gradient}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
                      {agent.number}
                    </span>
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${agent.badgeColor}`}>
                      {agent.badge}
                    </span>
                  </div>

                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-xl text-white shrink-0 ${agent.iconBg}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors leading-snug">
                        {agent.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-extrabold text-slate-500 mt-0.5">
                        {agent.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
                    {agent.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-extrabold text-red-600 group-hover:text-red-700">
                  <span>{agent.ctaText}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold">Run Pipeline</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FOOTER INFO BANNER */}
      <div className="mt-8 sm:mt-10 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Zero Hallucination Quantitative Engine
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              All 3 agents evaluate strict mathematical models (OHLCV indicators, ROE/ROCE quality scores, Walk-Forward backtests).
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold shrink-0">
          Indian Equities • Live Market Desk
        </span>
      </div>
    </div>
  );
};
