import React, { useState } from 'react';
import { Mail, Lock, User, HeartPulse, Sparkles, ChevronLeft, ArrowRight } from 'lucide-react';
import { translations } from '../translations.ts';

interface AuthViewProps {
  lang: 'en' | 'ku' | 'ar';
  setLang: (l: 'en' | 'ku' | 'ar') => void;
  onNavigate: (view: string) => void;
  onAuthSuccess: (user: any) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthView({ lang, setLang, onNavigate, onAuthSuccess, initialMode = 'login' }: AuthViewProps) {
  const t = translations[lang];
  const isRtl = lang === 'ku' || lang === 'ar';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register' 
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authenication failed. Check credentials.');
      }

      // Success - update active user globally and skip directly to dashboard
      onAuthSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during auth.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRegisterDemo = async (demoRole: 'client' | 'admin') => {
    setErrorMessage('');
    setLoading(true);

    // Fast rapid signup bypass
    const demoPayload = demoRole === 'admin' 
      ? { email: 'admin@daroon.krd', password: 'admin' }
      : { email: 'rebwaraliahmer@gmail.com', password: '123' };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoPayload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onAuthSuccess(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo bypass failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-800 flex flex-col justify-center items-center p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Absolute Header with Language and Back Trigger */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between items-center z-10 w-full max-w-7xl mx-auto px-2">
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-950 bg-white rounded-xl shadow-xs border border-gray-200 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          Back to Website
        </button>
        
        {/* Languages toggler */}
        <div className="p-1 bg-white border border-gray-200 rounded-lg flex items-center gap-1 shadow-xs">
          {(['en', 'ku', 'ar'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                lang === l ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {l === 'en' ? 'EN' : l === 'ku' ? 'KU' : 'AR'}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm mt-16">
        
        {/* Brand visual header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-950 mt-4 tracking-tight">
            {mode === 'register' ? t.registerTitle : t.loginTitle}
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            {t.fastDemoSignUp}
          </p>
        </div>

        {/* Error message logs if any */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-55 text-red-700 text-xs sm:text-sm font-semibold rounded-xl border border-red-100">
            ⚠ {errorMessage}
          </div>
        )}

        {/* Primary Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {t.usernameLabel}
              </label>
              <div className="relative">
                <User className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type="text"
                  required
                  placeholder="Rebwar Ali"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all ${
                    isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {t.emailLabel}
            </label>
            <div className="relative">
              <Mail className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 ${isRtl ? 'right-4' : 'left-4'}`} />
              <input
                type="email"
                required
                placeholder="rebwaraliahmer@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all ${
                  isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 ${isRtl ? 'right-4' : 'left-4'}`} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all ${
                  isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm shadow-emerald-200 transition-all text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'register' ? t.registerBtn : t.loginBtn}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Separator */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-150"></div>
          <span className="text-[10px] text-gray-400 uppercase font-mono tracking-widest font-bold">Or</span>
          <div className="flex-1 h-px bg-gray-150"></div>
        </div>

        {/* Google Mock OAuth */}
        <button
          onClick={() => handleQuickRegisterDemo('client')}
          className="w-full py-3.5 border border-gray-200 hover:bg-gray-50 rounded-2xl text-xs font-bold text-gray-700 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.65 0 3.12.56 4.29 1.68l3.19-3.19C17.55 1.6 14.99 1 12 1 7.37 1 3.44 3.61 1.5 7.43l3.74 2.9C6.12 7.02 8.84 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.7 2.87c2.16-1.99 3.43-4.91 3.43-8.6z" />
            <path fill="#FBBC05" d="M5.24 14.67c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28l-3.74-2.9C.54 9.12 0 10.5 0 12s.54 2.88 1.5 3.91l3.74-2.9z" fillRule="evenodd" />
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.11-4.26 1.11-3.16 0-5.88-1.98-6.84-4.89l-3.74 2.9C3.44 20.39 7.37 23 12 23z" fillRule="evenodd" />
          </svg>
          Continue with Google
        </button>

        {/* Toggle Mode Button */}
        <p className="text-center text-xs text-gray-500 mt-6 block">
          {mode === 'register' ? (
            <button
              onClick={() => setMode('login')}
              className="font-bold text-emerald-600 hover:underline inline-block"
            >
              {t.haveAccount}
            </button>
          ) : (
            <button
              onClick={() => setMode('register')}
              className="font-bold text-emerald-600 hover:underline inline-block"
            >
              {t.noAccount}
            </button>
          )}
        </p>

        {/* Instant Rapid Fast Access shortcuts for testers! */}
        <div className="mt-8 pt-6 border-t border-gray-150 text-center">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">
            🧪 Fast Demo Rapid Access Trigger
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickRegisterDemo('client')}
              className="p-3 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5 border border-emerald-100"
            >
              <Sparkles className="w-4 h-4 text-emerald-500" /> Client Demo
            </button>
            <button
              onClick={() => handleQuickRegisterDemo('admin')}
              className="p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-extrabold transition-colors flex items-center justify-center gap-1.5"
            >
              🔒 System Admin
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic text-center">
            Log in instantly with preset sandbox permissions.
          </p>
        </div>

      </div>

    </div>
  );
}
