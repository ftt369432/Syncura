import React from 'react';
import { X, Sparkles, AlertOctagon, AlertTriangle, Utensils, Activity, Radio, Shield, Heart, Zap, Check, Pill, Coffee } from 'lucide-react';
import { AutoMedReviewEngine, AutoMedReviewReport } from '@/services/autoMedReviewEngine';
import { Medication } from '@/types';

interface AutoMedReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication | null;
}

export const AutoMedReviewModal: React.FC<AutoMedReviewModalProps> = ({
  isOpen,
  onClose,
  medication,
}) => {
  if (!isOpen || !medication) return null;

  const review: AutoMedReviewReport = AutoMedReviewEngine.generateComprehensiveReview(
    medication.name,
    medication.dosage_strength
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Auto Med Review
                <span className="text-[10px] uppercase font-bold bg-brand-500/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded">
                  Clinical AI
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Food Conflicts, Telemetry Targets & Precautions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Drug Hero Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300">
                {review.drug_class}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                Anchor: {review.ideal_meal_anchor.toUpperCase().replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">{review.medication_name}</h4>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{review.dosage_strength}</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 italic">{review.summary_tagline}</p>
          </div>

          {/* Section 1: Foods & Drinks to Avoid */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-500" />
              Foods, Drinks & Supplements to Avoid
            </h4>

            <div className="space-y-2">
              {review.foods_and_drinks_to_avoid.map((food, idx) => {
                const isStrict = food.severity === 'strict_avoid';

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border space-y-1.5 shadow-sm ${
                      isStrict
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/30'
                        : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isStrict ? 'text-rose-900 dark:text-rose-200' : 'text-amber-900 dark:text-amber-200'}`}>
                        ⚠️ {food.item}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        isStrict ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                      }`}>
                        {food.severity.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      <strong>Why:</strong> {food.reason}
                    </p>

                    <p className="text-brand-800 dark:text-brand-300 font-bold bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      💡 <strong>Action:</strong> {food.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Machine Telemetry & Biometric Feedback Loop */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-brand-500" />
              Connected Machine Guidance (BLE Cuffs & CGMs)
            </h4>

            <div className="space-y-2">
              {review.telemetry_machine_targets.map((target, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-brand-500" />
                      {target.metric_name}
                    </span>
                    <span className="text-[10px] font-bold font-mono bg-brand-500/10 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded border border-brand-500/20">
                      Goal: {target.target_range}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {target.clinical_rationale}
                  </p>

                  <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 pt-1">
                    <span>📡 Frequency: {target.monitoring_frequency}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Anticipated Side Effects */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
              What to Expect in the First 7–14 Days
            </h4>

            <div className="space-y-2">
              {review.anticipated_side_effects.map((side, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{side.effect}</span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">{side.timeline}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>What to do:</strong> {side.what_to_do}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: FDA Black Box Warnings */}
          {review.black_box_critical_alerts.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-1">
              <span className="font-black flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" /> FDA Precautionary Notice
              </span>
              <p className="text-[11px] leading-relaxed opacity-95">
                {review.black_box_critical_alerts[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
