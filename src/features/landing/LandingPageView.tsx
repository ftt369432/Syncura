import React, { useState } from 'react';
import { Pill, Activity, ShieldCheck, HeartHandshake, FileText, QrCode, Sparkles, Check, ArrowRight, Mic, Camera, Bluetooth, Shield, Phone, Users, Clock, Zap, Star, CheckCircle2, XCircle, LogIn, UserPlus } from 'lucide-react';

interface LandingPageViewProps {
  onLaunchApp: () => void;
  onLaunchSeniorMode: () => void;
  onLaunchAgencyMode: () => void;
  onLaunchCaregiverMode?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onOpenPricing?: () => void;
  currentUser?: { fullName?: string; email?: string; role?: string } | null;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLaunchApp,
  onLaunchSeniorMode,
  onLaunchAgencyMode,
  onLaunchCaregiverMode,
  onSignIn,
  onSignUp,
  onOpenPricing,
  currentUser,
}) => {
  const [selectedDemoTab, setSelectedDemoTab] = useState<'caregiver' | 'senior' | 'nurse'>('caregiver');

  return (
    <div className="space-y-16 pb-24 max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center pt-6 sm:pt-12 space-y-6">
        {currentUser ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold text-xs shadow-sm">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
            <span>Logged in as <strong>{currentUser.fullName}</strong> ({currentUser.role?.replace('_', ' ')})</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-800 dark:text-brand-300 font-bold text-xs shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Universal Medication Safety & Caregiver Coordination</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Remembering your meds — or caring for someone who does — shouldn't be stressful.
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          For you, your aging parents, or the whole family. Stop accidental double-doses, catch dangerous drug interactions before they happen, and keep every prescription on schedule. <strong className="text-slate-900 dark:text-white font-bold">No complicated tech, no endless typing, and zero confusion.</strong>
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {currentUser ? (
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base transition flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 hover:scale-105 transform duration-150"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={onSignUp || onLaunchApp}
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base transition flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 hover:scale-105 transform duration-150"
              >
                <span>Start Free 14-Day Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onLaunchCaregiverMode || onLaunchApp}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm hover:border-brand-500 transition shadow-sm flex items-center justify-center gap-2"
              >
                👨‍💼 Caregiver Swarm
              </button>

              <button
                onClick={onLaunchSeniorMode}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
              >
                👵 Senior & Self-Care
              </button>
            </>
          )}
        </div>

        {/* Sign In link for unauthenticated visitors */}
        {!currentUser && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Already have an account? </span>
            <button
              onClick={onSignIn}
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-500" /> Client-Side Encrypted (AES-256)
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" /> Works on Phone, Tablet & Desktop
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-500" /> Built for Personal Health, Seniors & Families
          </span>
        </div>
      </section>

      {/* Interactive Demo Personas Strip */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full">
            Test Interactive Demo Personas
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Experience Syncura through 3 unique perspectives
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Click any persona to test the live interactive app instantly with zero signup required:
          </p>
        </div>

        {/* 3 Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Persona 1: Caregiver */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-brand-500 transition shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center font-bold text-xl">
                  👨‍💼
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">David Miller</h4>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">Caregiver Son</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Manages his mom Eleanor's medication refills, tracks blood pressure Bluetooth vitals, and receives instant alerts.
              </p>
            </div>
            <button
              onClick={onLaunchCaregiverMode || onLaunchApp}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Test David's View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Persona 2: Senior */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-purple-500 transition shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-xl">
                  👵
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Eleanor Miller</h4>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Senior Patient (74)</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Large high-contrast buttons, voice push-to-talk check-ins, and clear meal-relative schedules with zero medical clutter.
              </p>
            </div>
            <button
              onClick={onLaunchSeniorMode}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Test Eleanor's View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Persona 3: Nurse */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500 transition shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-xl">
                  🩺
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Marcus Rivera, RN</h4>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Agency Charge Nurse</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Multi-patient census, CMS-compliant Electronic Visit Verification (EVV GPS), barcode medication pass, and digital eMAR.
              </p>
            </div>
            <button
              onClick={onLaunchAgencyMode}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Test Marcus's View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3 Simple Pillars */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Designed to be effortless for anyone age 8 to 88.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We stripped out all the confusing medical jargon and clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-brand-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Snap Bottle Label</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Point your phone camera at any prescription bottle. In 60 seconds, Syncura reads the pharmacy label and builds your daily schedule automatically.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-brand-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Bluetooth className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Pair Once & Forget</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Take your blood pressure or check your glucose—the app automatically picks up the readings over Bluetooth and Wi-Fi without pressing buttons.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-brand-500/50 transition">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. 1-Tap Voice Check-In</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Seniors don't want to type small text on glass. Tap one big button to send a quick voice memo: <em>"Took my morning pills and feeling great!"</em>
            </p>
          </div>
        </div>
      </section>

      {/* Comparison: The Old Frustrating Way vs. The Syncura Way */}
      <section className="p-6 sm:p-10 rounded-3xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full">
            Before vs. After
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Why families replace plastic pill organizers with Syncura
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Way */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/40 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>The Frustrating Old Way</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Scattered pill boxes that get forgotten or accidentally taken twice.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Constant frantic text messages asking: <em>"Did Mom take her morning pills?"</em></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Panic over dangerous drug interactions between over-the-counter pain meds and blood thinners.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Arriving at the doctor’s office with a shoebox full of half-labeled prescription bottles.</span>
              </li>
            </ul>
          </div>

          {/* Syncura Way */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900/40 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>The Peaceful Syncura Way</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Dynamic meal-relative alarms that adjust automatically to when breakfast or dinner actually happens.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Whole family caregiver swarm: everyone sees real-time confirmations and voice memos with 1 tap.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Clinical AI interceptor blocks toxicity and double-dosing of Tylenol and PRN medications.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>1-page printable doctor summary with 30-day verified compliance graph and vitals averages.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Everything in One Place</span>
          <h2 className="text-2xl sm:text-4xl font-black">Built for the whole care circle.</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            From the kitchen counter pill tray to the hospital emergency room.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-brand-700 dark:text-brand-400 font-bold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Meal-Relative Alarms
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Alarms adjust dynamically to your real breakfast and dinner times rather than arbitrary rigid clock alarms.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-brand-700 dark:text-brand-400 font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> PRN Toxicity Lockout
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Prevents accidental double-dosing of Tylenol and pain meds with live safety countdowns and daily ceilings.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-brand-700 dark:text-brand-400 font-bold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> 1-Page Doctor Visit Report
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Print a clean 1-page PDF summary for your doctor with 30-day verified adherence (98%) and vitals averages.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-brand-700 dark:text-brand-400 font-bold text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4" /> Clinic Intake QR
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Show one QR at check-in to auto-fill insurance and medications directly into Epic MyChart / Cerner.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-brand-700 dark:text-brand-400 font-bold text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Multi-Caregiver Swarm
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Brothers, sisters, and visiting nurses all stay on the same page with instant notifications and dose logs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <span className="text-brand-700 dark:text-brand-400 font-bold text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" /> First Responder ICE Pass
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Zero-auth emergency card for paramedics showing critical blood thinners, pacemakers, and allergies.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="pt-6 text-center space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {currentUser ? (
              <button
                onClick={onLaunchApp}
                className="py-4 px-10 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base transition shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onSignUp || onLaunchApp}
                  className="py-4 px-10 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base transition shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2"
                >
                  <span>Start Free 14-Day Trial</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onSignIn}
                  className="py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition"
                >
                  Log In to Existing Vault
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Zero setup fees • 100% Client-side encrypted • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
};
