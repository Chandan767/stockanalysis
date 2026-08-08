import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AgentHubView } from './pages/AgentHubView';
import { DashboardView } from './pages/DashboardView';
import { TodayResearchView } from './pages/TodayResearchView';
import { LongTermResearchView } from './pages/LongTermResearchView';
import { StockAnalysisView } from './pages/StockAnalysisView';
import { AgentAnalysisModal } from './components/AgentAnalysisModal';
import { fetchAgentAnalysis } from './services/api';
import { AgentAnalysisReport } from './types';

export const App: React.FC = () => {
  // Default landing view is the 4 Autonomous AI Agent Command Hub
  const [activeTab, setActiveTab] = useState<string>('hub');
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
      loadAgentReport();
    }
  };

  const loadAgentReport = async () => {
    setAgentLoading(true);
    try {
      const report = await fetchAgentAnalysis();
      setAgentReport(report);
    } catch (err) {
      console.error('Agent analysis error:', err);
      setAgentReport(null);
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {activeTab === 'hub' ? (
        /* FIRST PAGE / HOME: FULL-SCREEN 4 AUTONOMOUS AI AGENT COMMAND HUB */
        <AgentHubView
          onSelectAgent={(agentId: string) => setActiveTab(agentId)}
          onOpenAgentModal={handleOpenAgentModal}
        />
      ) : (
        /* SELECTED AGENT RESULTS VIEW WITH SIDEBAR & BACK BUTTON */
        <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
          {/* Sidebar Navigation with 4 Agent Cards */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab: string) => setActiveTab(tab)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
            <Header
              showBackHub={true}
              onBackToHub={() => setActiveTab('hub')}
            />

            <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="max-w-7xl mx-auto">
                {activeTab === 'dashboard' && (
                  <DashboardView
                    onSelectStock={handleSelectStock}
                    onOpenAgentModal={handleOpenAgentModal}
                    onLaunchAgentTab={(tab: string) => setActiveTab(tab)}
                  />
                )}
                {activeTab === 'today' && (
                  <TodayResearchView onSelectStock={handleSelectStock} />
                )}
                {activeTab === 'longterm' && (
                  <LongTermResearchView onSelectStock={handleSelectStock} />
                )}
                {activeTab === 'stock' && (
                  <StockAnalysisView initialSymbol={selectedStock} />
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* Agent Analysis Modal */}
      <AgentAnalysisModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        report={agentReport}
        loading={agentLoading}
        onSelectStock={handleSelectStock}
        onRetry={loadAgentReport}
      />
    </div>
  );
};

export default App;
