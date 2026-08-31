import React, { useState } from 'react';
import { Shield, Sparkles, Check, X, CreditCard, ArrowRight, Star, HeartHandshake, Building2, Lock, Zap } from 'lucide-react';
import { useBillingStore, SubscriptionTier } from '@/stores/useBillingStore';

export const PaywallModal: React.FC = () => {
  const { isPaywallOpen, closePaywall, upgradeTier, currentTier } = useBillingStore();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('family_swarm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isPaywallOpen) return null;

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradeTier(selectedPlan);
      setIsProcessing(false);
      setSuccessNotice('✓ Subscription active! Thank you for protecting your family with Syncura.');
      setTimeout(() => {
        setSuccessNotice(null);
        closePaywall();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-brand-500/20">
              S
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Choose Your Syncura Plan
                <span className="text-[10px] uppercase font-bold bg-brand-500/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded">
                  14-Day Trial
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cancel anytime • 100% Zero-Knowledge Privacy</p>
            </div>
          </div>
          <button onClick={closePaywall} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Selector Grid */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {successNotice && (
            <div className="p-3.5 rounded-2xl bg-brand-500 text-slate-950 font-black flex items-center gap-2 shadow-lg animate-fadeIn">
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Plan 1: Family Swarm */}
          <div
            onClick={() => setSelectedPlan('family_swarm')}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition space-y-3 relative shadow-sm ${
              selectedPlan === 'family_swarm'
                ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Most Popular for Families
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Family Swarm Care</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Complete coordination for aging parents & siblings</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">$9.99</span>
                <span className="text-[11px] text-slate-500 font-semibold"> / month</span>
                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">or $89/year (Save 25%)</p>
              </div>
            </div>

            <ul className="space-y-1.5 pt-1 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-500 shrink-0" />
                <span><strong>Unlimited Caregivers</strong> (Brothers, sisters, adult children)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-500 shrink-0" />
                <span><strong>60-Second Bottle Label OCR</strong> (Scan pharmacy bottles)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-500 shrink-0" />
                <span><strong>Zero-Touch Vitals Sync</strong> (Omron BLE, Dexcom CGM, Apple Watch)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-brand-500 shrink-0" />
                <span><strong>1-Tap Voice Check-Ins</strong> & Push-to-Talk Memos</span>
              </li>
            </ul>
          </div>

          {/* Plan 2: Care Concierge */}
          <div
            onClick={() => setSelectedPlan('care_concierge')}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition space-y-3 relative shadow-sm ${
              selectedPlan === 'care_concierge'
                ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Advanced Advocacy
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Care Concierge</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI Health Navigator + Printable Doctor Reports</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">$24.99</span>
                <span className="text-[11px] text-slate-500 font-semibold"> / month</span>
              </div>
            </div>

            <ul className="space-y-1.5 pt-1 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span>Everything in Family Swarm</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span><strong>1-Page Printable Doctor Visit Summaries (PDF)</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span><strong>AI Lab Demystifier & Doctor Visit Prep Navigator</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-500 shrink-0" />
                <span><strong>HL7 FHIR R4 JSON & SMART Health Link Export</strong></span>
              </li>
            </ul>
          </div>

          {/* Plan 3: Enterprise Agency eMAR */}
          <div
            onClick={() => setSelectedPlan('enterprise_agency')}
            className={`p-5 rounded-3xl border-2 cursor-pointer transition space-y-3 relative shadow-sm ${
              selectedPlan === 'enterprise_agency'
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Home Health & Recovery Centers
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">Enterprise Agency eMAR</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Electronic Visit Verification & Nurse Med Pass</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-slate-900 dark:text-white">$199</span>
                <span className="text-[11px] text-slate-500 font-semibold"> / mo + $15/seat</span>
              </div>
            </div>

            <ul className="space-y-1.5 pt-1 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>CMS Electronic Visit Verification (EVV) with GPS Geofencing</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>5-Rights Barcode Wristband Scanner</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Multi-Resident Shift Census Roster</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>Schedule II Narcotic Dual-Witness Signoff</strong></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Checkout Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base transition flex items-center justify-center gap-2 shadow-xl shadow-brand-500/25"
          >
            <Zap className="w-5 h-5 fill-current" />
            {isProcessing ? 'Activating Subscription...' : 'Start 14-Day Free Trial (1-Tap Apple/Google Pay)'}
          </button>

          <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-brand-500" /> Powered by Stripe & RevenueCat • Encrypted Zero-Knowledge Privacy
          </p>
        </div>
      </div>
    </div>
  );
};
