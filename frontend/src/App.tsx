import * as React from 'react';
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AgentHubView } from './pages/AgentHubView';
import { DashboardView } from './pages/DashboardView';
import { TodayResearchView } from './pages/TodayResearchView';
import { LongTermResearchView } from './pages/LongTermResearchView';
import { StockAnalysisView } from './pages/StockAnalysisView';
import { AgentAnalysisModal } from './components/AgentAnalysisModal';
import { AuthModal } from './components/AuthModal';
import { fetchAgentAnalysis } from './services/api';
import { AgentAnalysisReport } from './types';

export const App: React.FC = () => {
  // Default landing view is the 3 Autonomous AI Agent Command Hub
  const [activeTab, setActiveTab] = useState<string>('hub');
  const [selectedStock, setSelectedStock] = useState<string>('');

  const [agentModalOpen, setAgentModalOpen] = useState<boolean>(false);
  const [agentReport, setAgentReport] = useState<AgentAnalysisReport | null>(null);
  const [agentLoading, setAgentLoading] = useState<boolean>(false);

  // Auth Modal & User State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('stock_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('stock_user');
    setUser(null);
  };

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

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
        /* FIRST PAGE / HOME: FULL-SCREEN 3 AUTONOMOUS AI AGENT COMMAND HUB */
        <AgentHubView
          onSelectAgent={(agentId: string) => setActiveTab(agentId)}
          onOpenAuth={handleOpenAuth}
          user={user}
          onLogout={handleLogout}
        />
      ) : (
        /* SELECTED AGENT RESULTS VIEW WITH SIDEBAR & BACK BUTTON */
        <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
          {/* Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab: string) => setActiveTab(tab)}
            isOpenMobile={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
            <Header
              showBackHub={true}
              onBackToHub={() => setActiveTab('hub')}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onOpenAuth={handleOpenAuth}
              user={user}
              onLogout={handleLogout}
            />

            <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 bg-slate-50/50">
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={(u) => setUser(u)}
      />

      {/* Agent Analysis Modal */}
      <AgentAnalysisModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        onSelectStock={handleSelectStock}
        report={agentReport}
        loading={agentLoading}
      />
    </div>
  );
};

export default App;
