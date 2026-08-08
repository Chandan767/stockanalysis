import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './pages/DashboardView';
import { TodayResearchView } from './pages/TodayResearchView';
import { LongTermResearchView } from './pages/LongTermResearchView';
import { StockAnalysisView } from './pages/StockAnalysisView';
import { AgentAnalysisModal } from './components/AgentAnalysisModal';
import { fetchAgentAnalysis } from './services/api';
import { AgentAnalysisReport } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStock, setSelectedStock] = useState<string>('TCS');

  const [agentModalOpen, setAgentModalOpen] = useState<boolean>(false);
  const [agentReport, setAgentReport] = useState<AgentAnalysisReport | null>(null);
  const [agentLoading, setAgentLoading] = useState<boolean>(false);

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setActiveTab('stock');
  };

  const handleOpenAgentModal = async () => {
    setAgentModalOpen(true);
    if (!agentReport && !agentLoading) {
      setAgentLoading(true);
      try {
        const report = await fetchAgentAnalysis();
        setAgentReport(report);
      } catch (err) {
        console.error('Agent analysis error:', err);
      } finally {
        setAgentLoading(false);
      }
    }
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
            {activeTab === 'dashboard' && (
              <DashboardView
                onSelectStock={handleSelectStock}
                onOpenAgentModal={handleOpenAgentModal}
              />
            )}
            {activeTab === 'today' && <TodayResearchView onSelectStock={handleSelectStock} />}
            {activeTab === 'longterm' && <LongTermResearchView onSelectStock={handleSelectStock} />}
            {activeTab === 'stock' && <StockAnalysisView initialSymbol={selectedStock} />}
          </div>
        </main>
      </div>

      {/* Agent Analysis Modal */}
      <AgentAnalysisModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        report={agentReport}
        loading={agentLoading}
        onSelectStock={handleSelectStock}
      />
    </div>
  );
};

export default App;
