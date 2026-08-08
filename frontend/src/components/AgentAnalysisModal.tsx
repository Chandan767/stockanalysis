import * as React from 'react';
import { 
  Bot, 
  X, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ShieldAlert,
  Calendar,
  RotateCw
} from 'lucide-react';
import { AgentAnalysisReport, AgentStockInsight } from '../types';

interface AgentAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AgentAnalysisReport | null;
  loading: boolean;
  onSelectStock: (symbol: string) => void;
  onRetry?: () => void;
}

export const AgentAnalysisModal: React.FC<AgentAnalysisModalProps> = (props: AgentAnalysisModalProps) => {
  const { isOpen, onClose, report, loading, onSelectStock, onRetry } = props;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-lg shadow-red-600/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <span>Autonomous AI Agent Analysis</span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-mono font-bold">
                  5-YEAR DEEP REASONING
                </span>
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Scans 5-year historical price series, 5Y CAGR trajectories, web news sentiment, and quantitative probability models.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
              <div className="text-center space-y-1">
                <p className="text-slate-900 font-bold">Autonomous Agent is crawling web & company 5-year histories...</p>
                <p className="text-xs text-slate-500 font-mono">Evaluating 5-year CAGR, 5Y channel bounds, and daily direction probabilities</p>
              </div>
            </div>
          ) : !report ? (
            <div className="text-center py-12 text-slate-600 space-y-4">
              <p className="font-semibold text-sm">Failed to execute AI Agent Analysis. Please check server connectivity.</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition flex items-center gap-2 mx-auto"
                >
                  <RotateCw className="w-4 h-4 text-white" />
                  <span>Retry AI Agent Scan</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Executive Summary Verdict */}
              <div className="p-5 rounded-xl bg-red-50/60 border border-red-200 flex items-start space-x-4">
                <Activity className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">Agent Market Verdict</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-mono font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-red-600" />
                      {report.execution_time}
                    </span>
                  </div>
                  <p className="text-slate-900 font-semibold text-sm leading-relaxed">{report.market_verdict}</p>
                </div>
              </div>

              {/* Section 1: Bullish Potential Profit Candidates */}
              {report.bullish_profit_candidates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
                    <TrendingUp className="w-5 h-5" />
                    <span>High Probability Bullish Setups (Potential Profit Candidates)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.bullish_profit_candidates.map((stock: AgentStockInsight) => (
                      <div
                        key={stock.symbol}
                        onClick={() => { onClose(); onSelectStock(stock.symbol); }}
                        className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors flex items-center space-x-1.5">
                              <span>{stock.symbol}</span>
                              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">{stock.name} • {stock.sector}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-semibold block">Probability Score</span>
                            <span className="text-lg font-extrabold font-mono text-emerald-600">{stock.probability_score}/100</span>
                          </div>
                        </div>

                        {/* 5-Year Metrics Strip */}
                        <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-center">
                          <div>
                            <span className="text-slate-500 block text-[9px] font-bold">5Y CAGR</span>
                            <span className="font-extrabold text-emerald-600">+{stock.five_year_cagr}%</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] font-bold">5Y High</span>
                            <span className="font-bold text-slate-900">₹{stock.five_year_high}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] font-bold">5Y Low</span>
                            <span className="font-bold text-slate-900">₹{stock.five_year_low}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed font-sans">{stock.agent_reasoning}</p>

                        <div className="pt-2 border-t border-slate-200 text-[11px]">
                          <span className="text-emerald-600 font-bold">Key Advantage: </span>
                          <span className="text-slate-600 font-medium">{stock.strengths[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 2: Bearish Potential Loss Risk Candidates */}
              {report.bearish_loss_risk_candidates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-red-600 font-bold text-sm">
                    <TrendingDown className="w-5 h-5" />
                    <span>High Risk Bearish Setups (Potential Loss Risk Candidates)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.bearish_loss_risk_candidates.map((stock: AgentStockInsight) => (
                      <div
                        key={stock.symbol}
                        onClick={() => { onClose(); onSelectStock(stock.symbol); }}
                        className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-500/60 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition-colors flex items-center space-x-1.5">
                              <span>{stock.symbol}</span>
                              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">{stock.name} • {stock.sector}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 font-semibold block">Probability Score</span>
                            <span className="text-lg font-extrabold font-mono text-red-600">{stock.probability_score}/100</span>
                          </div>
                        </div>

                        {/* 5-Year Metrics Strip */}
                        <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono text-center">
                          <div>
                            <span className="text-slate-500 block text-[9px] font-bold">5Y CAGR</span>
                            <span className="font-extrabold text-red-600">{stock.five_year_cagr}%</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] font-bold">5Y High</span>
                            <span className="font-bold text-slate-900">₹{stock.five_year_high}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] font-bold">5Y Low</span>
                            <span className="font-bold text-slate-900">₹{stock.five_year_low}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 font-medium leading-relaxed font-sans">{stock.agent_reasoning}</p>

                        <div className="pt-2 border-t border-slate-200 text-[11px]">
                          <span className="text-red-600 font-bold">Primary Risk: </span>
                          <span className="text-slate-600 font-medium">{stock.risk_factors[0]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Neutral Candidates */}
              {report.neutral_candidates.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-600 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    <span>Neutral / Consolidation Range Candidates</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.neutral_candidates.map((stock: AgentStockInsight) => (
                      <div
                        key={stock.symbol}
                        onClick={() => { onClose(); onSelectStock(stock.symbol); }}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{stock.symbol} ({stock.name})</h4>
                          <span className="text-[11px] text-slate-500 font-medium">{stock.five_year_trend} • 5Y CAGR: {stock.five_year_cagr}%</span>
                        </div>
                        <span className="text-sm font-bold font-mono text-slate-800">{stock.probability_score}/100</span>
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
