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
    <div className="min-h-screen bg-slate-50/60 p-6 lg:p-10 flex flex-col justify-between max-w-7xl mx-auto">
      {/* 1. TOP BRANDING HERO HEADER */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-600 font-extrabold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-red-600 animate-pulse" />
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

        {/* 2. FULL-SCREEN 4 AI AGENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={`p-8 rounded-3xl border bg-gradient-to-br transition-all duration-300 cursor-pointer flex flex-col justify-between group ${agent.gradient}`}
              >
                <div>
                  {/* Top Badge & Agent Number */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
                      {agent.number}
                    </span>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${agent.badgeColor}`}>
                      {agent.badge}
                    </span>
                  </div>

                  {/* Title & Icon Header */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`p-4 rounded-2xl text-white shrink-0 ${agent.iconBg}`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                        {agent.title}
                      </h2>
                      <p className="text-xs font-bold text-red-600 mt-1">
                        {agent.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Agent Description */}
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mt-4">
                    {agent.description}
                  </p>
                </div>

                {/* Bottom Launch Button */}
                <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 group-hover:text-red-600 transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Pipeline Active & Ready
                  </span>
                  <div className="px-4 py-2 bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-600/30 group-hover:bg-red-700 transition flex items-center gap-2">
                    <span>{agent.ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BOTTOM FOOTER STATUS */}
      <div className="mt-10 p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs font-semibold flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>4 Autonomous AI Agent Pipelines Active (NSE/BSE Indian Equities)</span>
        </div>
        <span className="font-mono text-red-600 font-bold">QUANT-ENGINE-V1.0</span>
      </div>
    </div>
  );
};
