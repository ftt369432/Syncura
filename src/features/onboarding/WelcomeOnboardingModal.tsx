import React, { useState } from 'react';
import { Sparkles, Check, Heart, User, Shield, Camera, Plus, ArrowRight, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

const POPULAR_ALLERGIES = ['Penicillin', 'Sulfa / Bactrim', 'Aspirin / NSAIDs', 'Codeine', 'Latex', 'No Known Drug Allergies'];
const POPULAR_CONDITIONS = ['High Blood Pressure', 'Type 2 Diabetes', 'Atrial Fibrillation', 'Asthma', 'Arthritis', 'Kidney Disease'];

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBottleScanner: () => void;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenBottleScanner,
}) => {
  const { currentUser } = useAuthStore();
  const { activeProfileId, profiles, toggleAllergy, toggleChronicCondition, addProfile } = useHouseholdStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [vaultType, setVaultType] = useState<'personal' | 'parent'>('personal');
  const [patientName, setPatientName] = useState(currentUser?.fullName || 'Myself');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const handleAllergyClick = (allergy: string) => {
    if (allergy === 'No Known Drug Allergies') {
      setSelectedAllergies(['No Known Drug Allergies']);
      return;
    }
    const filtered = selectedAllergies.filter((a) => a !== 'No Known Drug Allergies');
    if (filtered.includes(allergy)) {
      setSelectedAllergies(filtered.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...filtered, allergy]);
    }
  };

  const handleConditionClick = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  const handleFinishStep2 = () => {
    // If parent was chosen, ensure parent profile exists or is renamed
    if (vaultType === 'parent' && currentProfile) {
      if (patientName.trim()) {
        currentProfile.name = patientName.trim();
        currentProfile.role = 'dependent';
        currentProfile.avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150';
      }
    } else if (currentProfile && patientName.trim()) {
      currentProfile.name = patientName.trim();
    }

    // Save allergies and conditions
    if (currentProfile) {
      currentProfile.allergies = selectedAllergies.filter((a) => a !== 'No Known Drug Allergies');
      currentProfile.chronic_conditions = selectedConditions;
    }

    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Top Celebration Banner */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-500/15 via-emerald-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-brand-500/25">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                Welcome to Syncura, {currentUser?.fullName?.split(' ')[0] || 'Friend'}!
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Let's set up your private health vault in 60 seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1 px-6 pt-3">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* ============================================================ */}
          {/* STEP 1: VAULT PURPOSE                                         */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                  Step 1 of 3
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Who are you setting this vault up for?
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  You can always add more family members later with 1 tap.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setVaultType('personal');
                    setPatientName(currentUser?.fullName || 'Myself');
                  }}
                  className={`p-4 rounded-3xl border-2 text-left transition flex flex-col justify-between space-y-3 ${
                    vaultType === 'personal'
                      ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white text-sm">Myself (Personal)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Track my daily prescriptions, vitamins & blood pressure.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVaultType('parent');
                    setPatientName('Mom');
                  }}
                  className={`p-4 rounded-3xl border-2 text-left transition flex flex-col justify-between space-y-3 ${
                    vaultType === 'parent'
                      ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center font-bold">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white text-sm">Parent / Loved One</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Caring for Mom, Dad, or spouse with caregiver reminders.
                    </p>
                  </div>
                </button>
              </div>

              {vaultType === 'parent' && (
                <div className="pt-2 animate-fadeIn">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    What should we call them?
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Mom, Dad, Grandma Ruth, Eleanor"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/25 mt-2"
              >
                <span>Continue to Health Baseline</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: 1-TAP ALLERGIES & CHRONIC CONDITIONS                  */}
          {/* ============================================================ */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full">
                  Step 2 of 3
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Safety Check: Allergies & Health Flags
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Syncura checks every bottle you scan against these safety flags to prevent fatal reactions.
                </p>
              </div>

              {/* Allergies Chips */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                  Known Drug Allergies (1-Tap to select)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_ALLERGIES.map((allergy) => {
                    const isSelected = selectedAllergies.includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => handleAllergyClick(allergy)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{allergy}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditions Chips */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                  Chronic Health Conditions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_CONDITIONS.map((cond) => {
                    const isSelected = selectedConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => handleConditionClick(cond)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand-500 text-slate-950 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishStep2}
                  className="flex-1 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-brand-500/25"
                >
                  <span>Save & Add First Medication</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: ADD FIRST MEDICATION OR FINISH                        */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn text-center">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  Profile Configured!
                </span>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Add Your First Medication
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
                  Scan any pharmacy bottle label with your camera. Our AI vision instantly captures dosage, frequency, and refills with zero typing.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBottleScanner();
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30"
                >
                  <Camera className="w-5 h-5" />
                  <span>📷 Scan Prescription Bottle Now</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition border border-slate-200 dark:border-slate-700"
                >
                  Skip & Go to Dashboard &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
