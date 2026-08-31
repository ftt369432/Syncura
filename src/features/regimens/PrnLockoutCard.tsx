import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, PlusCircle } from 'lucide-react';
import { Medication } from '@/types';
import { useRegimenStore } from '@/stores/useRegimenStore';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

interface PrnLockoutCardProps {
  medication: Medication;
}

export const PrnLockoutCard: React.FC<PrnLockoutCardProps> = ({ medication }) => {
  const { getPrnLockoutStatus, logDose } = useRegimenStore();
  const { decrementStockForDose } = useMedicationStore();
  const { activeProfileId } = useHouseholdStore();

  const minHours = medication.prn_min_interval_hours || 6;
  const status = getPrnLockoutStatus(medication.id, minHours);

  const hoursLeft = Math.floor(status.remainingMinutes / 60);
  const minsLeft = status.remainingMinutes % 60;

  const handleTakePrnDose = () => {
    if (!activeProfileId || status.isLocked) return;
    logDose(medication.id, activeProfileId, 'taken', new Date().toISOString(), 'PRN as-needed dose');
    decrementStockForDose(medication.id);
  };

  return (
    <div className={`p-4 rounded-2xl border transition shadow-sm ${
      status.isLocked
        ? 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/30'
        : 'bg-white dark:bg-slate-900 border-brand-500/30'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            status.isLocked
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              : 'bg-brand-500/20 text-brand-600 dark:text-brand-400'
          }`}>
            {status.isLocked ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{medication.name} {medication.dosage_strength}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">PRN (As Needed) • Max 1 dose per {minHours}h</p>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
          status.isLocked
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
            : 'bg-brand-500/20 text-brand-700 dark:text-brand-300'
        }`}>
          {status.isLocked ? 'Lockout Active' : 'Safe to Redose'}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
        <div>
          {status.isLocked ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-200 font-medium">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Available in <strong className="font-mono">{hoursLeft > 0 ? `${hoursLeft}h ` : ''}{minsLeft}m</strong> ({status.safeRedoseTime})</span>
            </div>
          ) : (
            <p className="text-xs text-brand-700 dark:text-brand-300 font-medium">Minimum interval satisfied. Safe to administer.</p>
          )}
        </div>

        <button
          onClick={handleTakePrnDose}
          disabled={status.isLocked}
          className={`py-1.5 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
            status.isLocked
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-md shadow-brand-500/20'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Log PRN
        </button>
      </div>
    </div>
  );
};
