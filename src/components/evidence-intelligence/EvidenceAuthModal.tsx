import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  X, 
  ArrowRight, 
  AlertTriangle, 
  Loader2,
  FileCheck2,
  Info
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { SupabaseAuth, isSupabaseConfigured, getSupabaseConfigError } from '../../services/supabaseClient';

interface EvidenceAuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
  onCancel: () => void;
  pendingCount?: number;
  pendingType?: 'files' | 'text';
}

export const EvidenceAuthModal: React.FC<EvidenceAuthModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  pendingCount = 1,
  pendingType = 'files'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const configError = getSupabaseConfigError();
  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!isConfigured) {
      setErrorMsg(configError || 'Supabase configuration is missing in environment variables.');
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const result = await SupabaseAuth.signIn(cleanEmail, password);
        if (result.error) {
          setErrorMsg(result.error);
        } else if (result.user) {
          onSuccess(result.user);
        } else {
          setErrorMsg('Unable to sign in. Please verify your credentials.');
        }
      } else {
        const result = await SupabaseAuth.signUp(cleanEmail, password);
        if (result.error) {
          setErrorMsg(result.error);
        } else if (result.user) {
          // If Supabase has email confirmation enabled, session might be null until confirmed
          if (!result.session) {
            setInfoMsg('Account created! If email confirmation is enabled on your Supabase project, check your inbox. If confirmation is disabled, you can sign in immediately.');
            setMode('signin');
          } else {
            onSuccess(result.user);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-purple-950/30 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Glow ambient header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400" />

        {/* Close / Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Cancel authentication"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header & Context */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Evidence Vault Security</span>
            </div>

            <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'signin' ? 'Sign In to Upload Evidence' : 'Create Vault Account'}
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              Under the <span className="text-slate-200 font-semibold">Bharatiya Sakshya Adhiniyam (BSA 2023)</span>, uploaded records require an authenticated chain of custody and private, encrypted cloud storage.
            </p>

            {/* Pending Upload Banner */}
            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-500/20 flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="text-purple-200 font-bold">
                  {pendingType === 'files' 
                    ? `Pending upload: ${pendingCount} file${pendingCount > 1 ? 's' : ''}` 
                    : 'Pending text import'}
                </p>
                <p className="text-[11px] text-purple-300/80">
                  Will resume automatically once signed in.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Missing Warning */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Supabase Configuration Missing</span>
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                {configError || 'VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be configured in your environment.'}
              </p>
              <p className="text-[11px] text-amber-400 font-mono">
                Add them to your project's .env file to enable authentication.
              </p>
            </div>
          )}

          {/* Auth Mode Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-purple-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setInfoMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-purple-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{infoMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up Mode) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Confirm Password</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={loading}
                />
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={loading || !isConfigured}
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials…</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In & Upload' : 'Create Account & Upload'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2.5 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel & Return to Evidence Page
              </button>
            </div>

          </form>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 text-center space-y-1">
            <p>
              🔒 256-bit AES encryption at rest. Private isolated vault bucket.
            </p>
            <p>
              Row-Level Security (RLS) ensures only you can access your evidence.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
