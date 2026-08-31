import React from 'react';
import { Phone, ShieldAlert, Heart, Activity, AlertOctagon, User, Droplets, CheckCircle2 } from 'lucide-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useMedicationStore } from '@/stores/useMedicationStore';

export const EmergencyTriageView: React.FC = () => {
  const { profiles, activeProfileId } = useHouseholdStore();
  const { medications } = useMedicationStore();

  const profile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const activeMeds = medications.filter((m) => m.profile_id === profile.id && m.is_active);

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      {/* Emergency Header Badge */}
      <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-sm">
        <AlertOctagon className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Emergency First Responder Pass</h2>
          <p className="text-xs text-rose-700 dark:text-rose-300/90 mt-0.5 font-medium">
            Zero-Auth public triage pass for paramedic & ER admission.
          </p>
        </div>
      </div>

      {/* Patient Emergency Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{profile.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">DOB: {profile.dob || '1952-04-12'} (Age 74)</p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Blood Type</span>
            <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{profile.blood_type || 'O+'}</p>
          </div>
        </div>

        {/* Life-Threatening Allergies */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical Allergies</span>
          <div className="flex flex-wrap gap-2">
            {profile.allergies && profile.allergies.length > 0 ? (
              profile.allergies.map((all) => (
                <span
                  key={all}
                  className="py-1 px-3 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-bold text-xs"
                >
                  ⚠️ {all}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No Known Drug Allergies (NKDA)</span>
            )}
          </div>
        </div>

        {/* Emergency Medical Notes */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clinical Alerts</span>
          <p className="text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 leading-relaxed font-medium">
            {profile.emergency_notes || 'Type 2 Diabetes. On daily anticoagulant therapy. Pacemaker inserted 2022.'}
          </p>
        </div>

        {/* 1-Tap ICE Call Button */}
        {profile.ice_contact_phone && (
          <div className="pt-2">
            <a
              href={`tel:${profile.ice_contact_phone}`}
              className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 tap-highlight"
            >
              <Phone className="w-5 h-5" />
              Call ICE Contact ({profile.ice_contact_name || 'Family'})
            </a>
          </div>
        )}
      </div>

      {/* Active Prescription Inventory for Paramedics */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Active Prescriptions ({activeMeds.length})</h3>

        <div className="space-y-2.5">
          {activeMeds.map((med) => (
            <div
              key={med.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm"
            >
              <div>
                <strong className="text-slate-900 dark:text-white font-bold">{med.name} {med.dosage_strength}</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{med.instructions}</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded border border-brand-200 dark:border-brand-500/20">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
