import * as React from 'react';
import { Search, Bell, Activity, ArrowLeft, Menu, LogIn, UserPlus, LogOut } from 'lucide-react';

interface HeaderProps {
  onBackToHub?: () => void;
  showBackHub?: boolean;
  onToggleMobileSidebar?: () => void;
  onOpenAuth?: (mode: 'signin' | 'signup') => void;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { onBackToHub, showBackHub, onToggleMobileSidebar, onOpenAuth, user, onLogout } = props;

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm select-none gap-2">
      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 max-w-2xl">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition lg:hidden shrink-0"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {showBackHub && onBackToHub && (
          <button
            onClick={onBackToHub}
            className="px-2.5 sm:px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-red-600" />
            <span className="hidden xs:inline">3 AI Agents Hub</span>
            <span className="xs:hidden">Hub</span>
          </button>
        )}

        <div className="relative w-full min-w-[140px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600" />
          <input
            type="text"
            placeholder="Search Indian stocks (e.g. RELIANCE, TCS, INFY)..."
            className="w-full pl-9 pr-3 sm:pl-10 sm:pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-medium select-text"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          <Activity className="w-3.5 h-3.5 text-red-600" />
          <span>NSE Market Open</span>
        </div>

        <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        {user ? (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="w-8 h-8 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md shadow-red-600/30">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs font-black text-slate-900">{user.name}</span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : onOpenAuth ? (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <button
              onClick={() => onOpenAuth('signin')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-lg transition flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5 text-red-600" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg shadow-md shadow-red-600/30 transition flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5 text-white" />
              <span>Sign Up</span>
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-2 border-l border-slate-200 pl-4">
            <div className="px-3 py-1 rounded-lg bg-red-600 shadow-md shadow-red-600/30 flex items-center justify-center font-extrabold text-xs text-white">
              Stock Analyser
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
