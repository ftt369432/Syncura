import React from 'react';
import { Pill, Activity, ShieldCheck, HeartHandshake, FileText, QrCode, Sparkles, Check, ArrowRight, Mic, Camera, Bluetooth, Shield, Phone, Users, Clock, Zap, Star } from 'lucide-react';

interface LandingPageViewProps {
  onLaunchApp: () => void;
  onLaunchSeniorMode: () => void;
  onLaunchAgencyMode: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onLaunchApp,
  onLaunchSeniorMode,
  onLaunchAgencyMode,
}) => {
  return (
    <div className="space-y-16 pb-20 max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center pt-8 sm:pt-14 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-700 dark:text-brand-300 font-bold text-xs shadow-sm">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Simple, Stress-Free Health & Medication Care</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Caring for aging parents shouldn’t feel like a second job.
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Manage medications, automatic vitals, and doctor visits in one simple place. <strong className="text-slate-900 dark:text-white font-bold">No complicated tech, no endless typing, and zero confusion.</strong>
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base transition flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 hover:scale-105 transform duration-150"
          >
            <span>Launch Live App</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onLaunchSeniorMode}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm hover:border-brand-500 transition shadow-sm flex items-center justify-center gap-2"
          >
            👵 Try Senior 1-Tap Experience
          </button>

          <button
            onClick={onLaunchAgencyMode}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
          >
            🩺 Agency / Nurse Demo
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-500" /> Client-Side Encrypted (AES-256)
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" /> Works on Phone, Tablet & Desktop
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-500" /> Built for Seniors & Caregivers
          </span>
        </div>
      </section>

      {/* 3 Simple Pillars (Anti-Bloat / Ease of Use) */}
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

      {/* Complete Peace of Mind Feature Grid */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-8 shadow-2xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Everything in One Place</span>
          <h2 className="text-2xl sm:text-4xl font-black">Built for the whole care circle.</h2>
          <p className="text-sm text-slate-400">
            From the kitchen counter pill tray to the hospital emergency room.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="text-brand-400 font-bold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Meal-Relative Alarms
            </span>
            <p className="text-xs text-slate-300">
              Alarms adjust dynamically to your real breakfast and dinner times rather than arbitrary rigid clock alarms.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="text-brand-400 font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> PRN Toxicity Lockout
            </span>
            <p className="text-xs text-slate-300">
              Prevents accidental double-dosing of Tylenol and pain meds with live safety countdowns and daily ceilings.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="text-brand-400 font-bold text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> 1-Page Doctor Visit Report
            </span>
            <p className="text-xs text-slate-300">
              Print a clean 1-page PDF summary for your doctor with 30-day verified adherence (98%) and vitals averages.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="text-brand-400 font-bold text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4" /> Clinic Intake QR
            </span>
            <p className="text-xs text-slate-300">
              Show one QR at check-in to auto-fill insurance and medications directly into Epic MyChart / Cerner.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="text-brand-400 font-bold text-sm flex items-center gap-2">
              <Users className="w-4 h-4" /> Multi-Caregiver Swarm
            </span>
            <p className="text-xs text-slate-300">
              Brothers, sisters, and visiting nurses all stay on the same page with instant notifications and dose logs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="text-brand-400 font-bold text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" /> First Responder ICE Pass
            </span>
            <p className="text-xs text-slate-300">
              Zero-auth emergency card for paramedics showing critical blood thinners, pacemakers, and allergies.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={onLaunchApp}
            className="py-4 px-10 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-base transition shadow-xl shadow-brand-500/25"
          >
            Get Started Now — Zero Clutter
          </button>
        </div>
      </section>
    </div>
  );
};
