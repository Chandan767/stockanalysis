import * as React from 'react';
import { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess?: (user: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Form State
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreeTerms) {
        setError('Please agree to the Terms of Service.');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const userName = mode === 'signup' ? name : (email.split('@')[0] || 'Trader');
      const userData = { name: userName, email };
      
      localStorage.setItem('stock_user', JSON.stringify(userData));
      
      setSuccessMsg(mode === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
      
      if (onAuthSuccess) {
        onAuthSuccess(userData);
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn select-none">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md my-auto overflow-hidden relative flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-slate-900 p-4 sm:p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-black tracking-wider uppercase text-red-200 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-red-200" />
            <span>STOCK ANALYSER SECURE AUTH</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {mode === 'signin' ? 'Welcome Back' : 'Create Free Account'}
          </h2>
          <p className="text-[11px] sm:text-xs text-red-100/90 font-medium mt-0.5 leading-snug">
            {mode === 'signin' 
              ? 'Sign in to access your quantitative market research' 
              : 'Unlock full 360° AI equity scanning & institutional reports'}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition ${
              mode === 'signin'
                ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition ${
              mode === 'signup'
                ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body - Scrollable if screen height is small */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-extrabold text-red-600 flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-extrabold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="trader@stockanalyser.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] sm:text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-red-600 focus:ring-1 focus:ring-red-600 transition"
                />
              </div>
            </div>
          )}

          {mode === 'signin' ? (
            <div className="flex items-center justify-between text-[11px] sm:text-xs pt-0.5">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="font-extrabold text-red-600 hover:text-red-700 transition"
              >
                Forgot Password?
              </button>
            </div>
          ) : (
            <div className="text-[11px] sm:text-xs pt-0.5">
              <label className="flex items-start space-x-2 cursor-pointer font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <span>I agree to the <span className="font-extrabold text-slate-900">Terms of Service</span> & <span className="font-extrabold text-slate-900">Privacy Policy</span></span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 mt-3"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to Account' : 'Create My Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Social Auth Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase tracking-widest font-black text-slate-400">or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={() => {
              const demoUser = { name: 'Google Trader', email: 'user@gmail.com' };
              localStorage.setItem('stock_user', JSON.stringify(demoUser));
              if (onAuthSuccess) onAuthSuccess(demoUser);
              onClose();
            }}
            className="w-full py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.74-2.09-6.68-4.91H1.32v3.15C3.3 21.32 7.37 24 12 24z"/>
              <path fill="#FBBC05" d="M5.32 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.56H1.32C.48 8.24 0 10.06 0 12s.48 3.76 1.32 5.44l4-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.3 2.68 1.32 6.56l4 3.15c.94-2.82 3.58-4.96 6.68-4.96z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Footer Toggle Link */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 text-center text-xs font-semibold text-slate-600 shrink-0">
          {mode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className="font-extrabold text-red-600 hover:text-red-700 uppercase tracking-wider ml-1"
              >
                Sign Up Free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(null); }}
                className="font-extrabold text-red-600 hover:text-red-700 uppercase tracking-wider ml-1"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
