import * as React from 'react';
import { 
  Bot, 
  TrendingUp, 
  Target, 
  Search, 
  Zap, 
  ArrowRight, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface AgentHubViewProps {
  onSelectAgent: (agentId: string) => void;
  onOpenAgentModal: () => void;
}

export const AgentHubView: React.FC<AgentHubViewProps> = (props: AgentHubViewProps) => {
  const { onSelectAgent, onOpenAgentModal } = props;

  const agents = [
    {
      id: 'dashboard',
      number: 'AGENT 01',
      title: 'Daily Direction Prediction Agent',
      subtitle: '08:30 AM IST Pre-Market ML Pipeline',
      badge: 'Supervised ML Model',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
      description: 'Executes pre-market directional prediction (UP / DOWN / NEUTRAL) across 30+ Indian equities. Evaluates overnight US market cues, Brent crude, USD/INR, news NLP sentiment, and 30-day walk-forward backtesting.',
      icon: Bot,
      iconBg: 'bg-red-600 shadow-lg shadow-red-600/30',
      gradient: 'from-red-50/80 via-white to-slate-50 border-red-200 hover:border-red-500 hover:shadow-xl',
      ctaText: 'Launch Daily Direction Agent'
    },
    {
      id: 'today',
      number: 'AGENT 02',
      title: 'Intraday Momentum & Breakout Agent',
      subtitle: 'Intraday Volume Surge & Technical Scanner',
      badge: 'Real-Time Intraday',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      description: 'Scans live technical indicators, 20/50 SMA golden crosses, RSI momentum surges, volume spikes, and high-opportunity breakout setups for active daily session trading.',
      icon: TrendingUp,
      iconBg: 'bg-emerald-600 shadow-lg shadow-emerald-600/30',
      gradient: 'from-emerald-50/80 via-white to-slate-50 border-emerald-200 hover:border-emerald-500 hover:shadow-xl',
      ctaText: 'Launch Intraday Momentum Agent'
    },
    {
      id: 'longterm',
      number: 'AGENT 03',
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
      number: 'AGENT 04',
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
    <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10 flex flex-col justify-between max-w-7xl mx-auto select-none">
      {/* 1. TOP BRANDING HERO HEADER */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-600 font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              <span>STOCK ANALYSER • AI AGENT COMMAND HUB</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Select Your Autonomous AI Agent
            </h1>
            <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed font-medium">
              Choose an AI Agent below. Clicking any agent card immediately executes its full quantitative machine learning or financial audit pipeline and renders its detailed interactive results dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAgentModal}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-white fill-white" />
              Run Autonomous Web Reasoning Agent
            </button>
          </div>
        </div>

        {/* 2. AGENTS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={`p-6 rounded-2xl border bg-gradient-to-br transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm ${agent.gradient}`}
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
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-red-600 transition-colors">
                        {agent.title}
                      </h3>
                      <p className="text-xs font-extrabold text-slate-500 mt-0.5">
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
      <div className="mt-10 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Zero Hallucination Quantitative Engine
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              All 4 agents evaluate strict mathematical models (OHLCV indicators, ROE/ROCE quality scores, Walk-Forward backtests).
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
