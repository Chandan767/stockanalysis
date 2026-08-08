import * as React from 'react';
import { 
  Bot, 
  X, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { AgentAnalysisReport, AgentStockInsight } from '../types';

interface AgentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AgentAnalysisReport | null;
  loading: boolean;
  onSelectStock: (symbol: string) => void;
}

export const AgentAnalysisModal: React.FC<AgentAnalysisModalProps> = (props: AgentAnalysisModalProps) => {
  const { isOpen, onClose, report, loading, onSelectStock } = props;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-red-600/30 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-red-600 to-rose-600 rounded-xl text-white shadow-lg shadow-red-600/30 animate-pulse">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>Autonomous AI Agent Analysis</span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600/10 border border-red-600/30 text-red-400 text-xs font-mono font-bold">
                  5-YEAR DEEP REASONING
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Scans 5-year historical price series, 5Y CAGR trajectories, web news sentiment, and quantitative probability models.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
              <div className="text-center space-y-1">
                <p className="text-white font-semibold">Autonomous Agent is crawling web & company 5-year histories...</p>
                <p className="text-xs text-slate-400 font-mono">Evaluating 5-year CAGR, 5Y channel bounds, and daily direction probabilities</p>
              </div>
            </div>
          ) : !report ? (
            <div className="text-center py-12 text-slate-400">
              <p>Failed to execute AI Agent Analysis. Please check server connectivity.</p>
            </div>
          ) : (
            <>
              {/* Executive Summary Verdict */}
              <div className="p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-950 to-red-950/40 border border-red-600/30 flex items-start space-x-4">
                <Activity className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-red-400">Agent Market Verdict</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-red-400" />
                      {report.execution_time}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm leading-relaxed">{report.market_verdict}</p>
                </div>
              </div>

              {/* Section 1: Bullish Potential Profit Candidates */}
              {report.bullish_profit_candidates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                    <TrendingUp className="w-5 h-5" />
                    <span>High Probability Bullish Setups (Potential Profit Candidates)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.bullish_profit_candidates.map((stock: AgentStockInsight) => (
                      <div
                        key={stock.symbol}
                        onClick={() => { onClose(); onSelectStock(stock.symbol); }}
                        className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors flex items-center space-x-1.5">
                              <span>{stock.symbol}</span>
                              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">{stock.name} • {stock.sector}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Probability Score</span>
                            <span className="text-lg font-bold font-mono text-emerald-400">{stock.probability_score}/100</span>
                          </div>
                        </div>

                        {/* 5-Year Metrics Strip */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg text-[11px] font-mono text-center">
                          <div>
                            <span className="text-slate-400 block text-[9px]">5Y CAGR</span>
                            <span className="font-bold text-emerald-400">+{stock.five_year_cagr}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">5Y High</span>
                            <span className="font-bold text-white">₹{stock.five_year_high}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">5Y Low</span>
                            <span className="font-bold text-white">₹{stock.five_year_low}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{stock.agent_reasoning}</p>

                        <div className="pt-2 border-t border-slate-900 text-[11px]">
                          <span className="text-emerald-400 font-semibold">Key Advantage: </span>
                          <span className="text-slate-300">{stock.strengths[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Bearish Potential Loss Risk Candidates */}
              {report.bearish_loss_risk_candidates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
                    <TrendingDown className="w-5 h-5" />
                    <span>High Risk Bearish Setups (Potential Loss Risk Candidates)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.bearish_loss_risk_candidates.map((stock: AgentStockInsight) => (
                      <div
                        key={stock.symbol}
                        onClick={() => { onClose(); onSelectStock(stock.symbol); }}
                        className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-600/40 transition-all cursor-pointer space-y-3 group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-base group-hover:text-red-400 transition-colors flex items-center space-x-1.5">
                              <span>{stock.symbol}</span>
                              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">{stock.name} • {stock.sector}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Probability Score</span>
                            <span className="text-lg font-bold font-mono text-red-400">{stock.probability_score}/100</span>
                          </div>
                        </div>

                        {/* 5-Year Metrics Strip */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg text-[11px] font-mono text-center">
                          <div>
                            <span className="text-slate-400 block text-[9px]">5Y CAGR</span>
                            <span className="font-bold text-red-400">{stock.five_year_cagr}%</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">5Y High</span>
                            <span className="font-bold text-white">₹{stock.five_year_high}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">5Y Low</span>
                            <span className="font-bold text-white">₹{stock.five_year_low}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{stock.agent_reasoning}</p>

                        <div className="pt-2 border-t border-slate-900 text-[11px]">
                          <span className="text-red-400 font-semibold">Primary Risk: </span>
                          <span className="text-slate-300">{stock.risk_factors[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Neutral Candidates */}
              {report.neutral_candidates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-400 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <span>Neutral / Consolidation Range Candidates</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.neutral_candidates.map((stock: AgentStockInsight) => (
                      <div
                        key={stock.symbol}
                        onClick={() => { onClose(); onSelectStock(stock.symbol); }}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-white text-sm">{stock.symbol} ({stock.name})</h4>
                          <span className="text-[11px] text-slate-400">{stock.five_year_trend} • 5Y CAGR: {stock.five_year_cagr}%</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-white">{stock.probability_score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
