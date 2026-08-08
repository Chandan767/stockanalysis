import * as React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Zap 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props: SidebarProps) => {
  const { activeTab, setActiveTab } = props;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: "Today's Research", icon: TrendingUp },
    { id: 'longterm', label: 'Long-Term Research', icon: Target },
    { id: 'stock', label: 'Stock Analysis', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center space-x-3 px-6 border-b border-slate-800">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-100 tracking-wide uppercase">STOCK ANALYSER</h1>
          <p className="text-[10px] text-indigo-400 font-medium">INDIA RESEARCH PLATFORM</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Research Modes
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-slate-900 m-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400 font-medium">Prediction Engine</span>
          <span className="text-emerald-400 text-[10px] font-mono">STOCK-ANALYSER-V1</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Pre-market machine learning direction prediction engine active.
        </p>
      </div>
    </aside>
  );
};
