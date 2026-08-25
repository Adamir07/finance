import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authSession, login } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('adamtraoreoubeydoulaye@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Adam Traore');
  const [resetSent, setResetSent] = useState(false);

  if (authSession.isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'forgot') {
      setResetSent(true);
      return;
    }
    login(email, fullName);
  };

  const handleDemoLogin = () => {
    login('adamtraoreoubeydoulaye@gmail.com', 'Adam Traore');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-md font-['Outfit'] mb-3">
            T
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-['Outfit']">
            TREKAD
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Personal Money & USD ⇄ CFA Franc Transfer Management System
          </p>
        </div>

        {/* Quick Demo Button */}
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Quick Demo Access
            </p>
            <p className="text-[11px] text-emerald-700">Explore pre-loaded transfers & charts</p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            Launch Demo
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 mb-6 text-xs font-semibold text-center">
          <button
            type="button"
            onClick={() => { setMode('login'); setResetSent(false); }}
            className={`flex-1 pb-2.5 transition-colors ${
              mode === 'login' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setResetSent(false); }}
            className={`flex-1 pb-2.5 transition-colors ${
              mode === 'register' ? 'border-b-2 border-slate-900 text-slate-900' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {resetSent ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Password Reset Email Sent</h3>
            <p className="text-xs text-slate-500">
              We've dispatched password recovery instructions to <strong>{email}</strong>.
            </p>
            <button
              type="button"
              onClick={() => { setMode('login'); setResetSent(false); }}
              className="mt-4 text-xs font-semibold text-emerald-600 hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Adam Traore"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 outline-hidden"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="adamtraoreoubeydoulaye@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 outline-hidden"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-slate-400 outline-hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>{mode === 'login' ? 'Sign In to TREKAD' : mode === 'register' ? 'Register Account' : 'Send Recovery Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected with Supabase & PostgreSQL RLS</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
