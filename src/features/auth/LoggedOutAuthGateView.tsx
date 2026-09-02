import React from 'react';
import { Lock, Shield, Sparkles, ArrowRight, UserPlus, LogIn, Heart, Check, Zap, Crown, QrCode, User } from 'lucide-react';

interface LoggedOutAuthGateViewProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onOpenPaywall: () => void;
  onDemoPreview: () => void;
  onPairQrCode: () => void;
}

export const LoggedOutAuthGateView: React.FC<LoggedOutAuthGateViewProps> = ({
  onSignIn,
  onSignUp,
  onOpenPaywall,
  onDemoPreview,
  onPairQrCode,
}) => {
  return (
    <div className="max-w-md mx-auto my-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 animate-fadeIn">
      {/* Vault Shield Icon */}
      <div className="relative mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-inner">
        <Lock className="w-8 h-8" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow">
          <Shield className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Lock Notice */}
      <div className="space-y-1.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Private Medical Vault Locked
        </span>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Sovereign Family Health Privacy
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          You are currently signed out. To safeguard patient records, medication regimens and allergy interaction graphs, all active profiles are encrypted.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onSignIn}
          className="w-full py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Your Vault</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onSignUp}
            className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            <UserPlus className="w-3.5 h-3.5 text-brand-500" />
            <span>Create Account</span>
          </button>

          <button
            onClick={onPairQrCode}
            className="py-2.5 px-3 rounded-2xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-brand-500/30 shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5 text-brand-500" />
            <span>Pair via QR Code</span>
          </button>
        </div>

        <button
          onClick={onOpenPaywall}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 hover:from-amber-500/20 hover:to-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2 border border-amber-500/30"
        >
          <Crown className="w-4 h-4 text-amber-500 fill-current" />
          <span>Early-Bird Founder's Lifetime Pass ($149 Once)</span>
        </button>
      </div>

      {/* Frictionless Demo Preview */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={onDemoPreview}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-1.5 mx-auto transition"
        >
          <span>Just exploring? Try the Interactive Demo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
