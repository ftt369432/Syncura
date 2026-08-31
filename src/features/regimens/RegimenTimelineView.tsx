import React, { useState } from 'react';
import { Check, Clock, Utensils, Droplets, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Plus, UserCheck, Shield, Share2, Volume2, VolumeX } from 'lucide-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { useRegimenStore } from '@/stores/useRegimenStore';
import { VoiceAlarmService } from '@/services/voiceAlarmService';
import { PrnLockoutCard } from './PrnLockoutCard';
import { BottleScannerModal } from '../vision/BottleScannerModal';
import { ProfileDemographicsModal } from '../household/ProfileDemographicsModal';
import { DoctorVisitExportModal } from '../documents/DoctorVisitExportModal';

export const RegimenTimelineView: React.FC = () => {
  const { profiles, activeProfileId, setActiveProfile } = useHouseholdStore();
  const { medications, decrementStockForDose } = useMedicationStore();
  const { getTodayTimeline, logDose, mealTimes, updateMealTime } = useRegimenStore();

  const [scannerOpen, setScannerOpen] = useState(false);
  const [demographicsOpen, setDemographicsOpen] = useState(false);
  const [doctorExportOpen, setDoctorExportOpen] = useState(false);
  const [showMealAdjuster, setShowMealAdjuster] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const timeline = activeProfileId ? getTodayTimeline(activeProfileId) : [];

  // Find next pending dose
  const nextPending = timeline.find((item) => item.status === 'pending');
  const nextMed = nextPending ? medications.find((m) => m.id === nextPending.medicationId) : null;

  // PRN Medications
  const prnMeds = medications.filter((m) => m.profile_id === activeProfileId && m.is_prn);

  const handleTakeDose = (medicationId: string, scheduledTime: string) => {
    if (!activeProfileId) return;
    const med = medications.find((m) => m.id === medicationId);
    logDose(medicationId, activeProfileId, 'taken', scheduledTime, '1-tap home administration');
    decrementStockForDose(medicationId);

    if (med) {
      VoiceAlarmService.speakDoseTakenConfirmation(med.name);
    }
  };

  const handlePlayVoiceReminder = () => {
    if (!nextMed || !activeProfile) return;
    setIsSpeaking(true);
    VoiceAlarmService.speakMedicationReminder(activeProfile.name, nextMed.name, nextMed.instructions);
    setTimeout(() => setIsSpeaking(false), 4000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      {/* Profile Selector Strip with Demographics & Export Trigger */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProfile(p.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl transition text-xs font-bold whitespace-nowrap shadow-sm ${
                p.id === activeProfileId
                  ? 'bg-brand-500 text-slate-950 ring-2 ring-brand-500/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <img
                src={p.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                alt={p.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{p.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setDoctorExportOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-brand-500 transition shadow-sm"
            title="Export Doctor Visit Summary"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDemographicsOpen(true)}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-brand-500 transition shadow-sm"
            title="View Patient Demographics, Address & Insurance Cards"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScannerOpen(true)}
            className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition"
            title="Scan Prescription Bottle"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Next-Dose Action Card */}
      {nextPending && nextMed ? (
        <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-brand-500/40 shadow-xl shadow-brand-500/5 dark:shadow-brand-500/10 overflow-hidden pulse-dose">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-brand-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Next Dose • {nextPending.displayTime}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {nextPending.mealLabel && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <Utensils className="w-3 h-3" />
                  {nextPending.mealLabel}
                </span>
              )}

              {/* Voice Read Aloud Button */}
              <button
                onClick={handlePlayVoiceReminder}
                className="p-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 transition flex items-center gap-1 text-xs font-bold shadow-sm"
                title="Listen to Spoken Senior Voice Reminder"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce text-brand-500' : ''}`} />
                <span className="text-[11px] hidden sm:inline">Read Aloud</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 mb-6">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">{nextMed.name}</h2>
            <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{nextMed.dosage_strength} ({nextPending.doseQuantity} tablet)</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">{nextMed.instructions}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleTakeDose(nextMed.id, nextPending.targetTime)}
              className="flex-1 py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-base transition flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 tap-highlight"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              TAKE DOSE NOW
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up for Today!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">All scheduled doses for Eleanor have been logged.</p>
        </div>
      )}

      {/* Floating Meal Trigger Fast Adjuster */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Breakfast Anchor: {mealTimes.breakfast}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Alarms auto-shift with your meal routine</p>
          </div>
        </div>

        <button
          onClick={() => setShowMealAdjuster(!showMealAdjuster)}
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          {showMealAdjuster ? 'Close' : 'Adjust'}
        </button>
      </div>

      {showMealAdjuster && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 shadow-md">
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Breakfast</label>
            <input
              type="time"
              value={mealTimes.breakfast}
              onChange={(e) => updateMealTime('breakfast', e.target.value)}
              className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Dinner</label>
            <input
              type="time"
              value={mealTimes.dinner}
              onChange={(e) => updateMealTime('dinner', e.target.value)}
              className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {/* Today's Chronological Routine */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Today's Schedule</h3>
        
        <div className="space-y-2.5">
          {timeline.map((item) => {
            const med = medications.find((m) => m.id === item.medicationId);
            if (!med) return null;

            const isTaken = item.status === 'taken';

            return (
              <div
                key={item.ruleId}
                className={`p-4 rounded-2xl border transition flex items-center justify-between shadow-sm ${
                  isTaken
                    ? 'bg-slate-100/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isTaken
                      ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {isTaken ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${isTaken ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {med.name}
                      </h4>
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{med.dosage_strength}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.displayTime}</span>
                      {item.mealLabel && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium border border-slate-200/60 dark:border-slate-700">
                          {item.mealLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!isTaken ? (
                  <button
                    onClick={() => handleTakeDose(med.id, item.targetTime)}
                    className="py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition"
                  >
                    Take
                  </button>
                ) : (
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Taken</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PRN Safety Guard Section */}
      {prnMeds.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">PRN (As-Needed) Safety Guard</h3>
          <div className="space-y-2.5">
            {prnMeds.map((med) => (
              <PrnLockoutCard key={med.id} medication={med} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <BottleScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
      <ProfileDemographicsModal
        isOpen={demographicsOpen}
        onClose={() => setDemographicsOpen(false)}
        profile={activeProfile}
      />
      <DoctorVisitExportModal
        isOpen={doctorExportOpen}
        onClose={() => setDoctorExportOpen(false)}
      />
    </div>
  );
};
