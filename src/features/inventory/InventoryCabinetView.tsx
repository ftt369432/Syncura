import React, { useState } from 'react';
import { Pill, AlertTriangle, Layers, Calendar, Phone, Plus, ShieldCheck, Sparkles, RefreshCw, FileSearch, Utensils } from 'lucide-react';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { Medication } from '@/types';
import { PillTrayCounterModal } from '../vision/PillTrayCounterModal';
import { BottleScannerModal } from '../vision/BottleScannerModal';
import { AutoMedReviewModal } from '../medications/AutoMedReviewModal';

export const InventoryCabinetView: React.FC = () => {
  const { activeProfileId } = useHouseholdStore();
  const { medications, calculateBurnRateHorizon } = useMedicationStore();

  const [selectedMedForAudit, setSelectedMedForAudit] = useState<Medication | null>(null);
  const [selectedMedForReview, setSelectedMedForReview] = useState<Medication | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isBottleScanOpen, setIsBottleScanOpen] = useState(false);

  const activeMeds = medications.filter((m) => m.profile_id === activeProfileId && m.is_active);

  const handleLaunchAudit = (med: Medication) => {
    setSelectedMedForAudit(med);
    setIsAuditModalOpen(true);
  };

  const handleLaunchReview = (med: Medication) => {
    setSelectedMedForReview(med);
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Medicine Cabinet</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Inventory, Burn Horizon & AI Review</p>
        </div>

        <button
          onClick={() => setIsBottleScanOpen(true)}
          className="flex items-center gap-2 py-2 px-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Add Script
        </button>
      </div>

      {/* Medication List */}
      <div className="space-y-4">
        {activeMeds.map((med) => {
          const horizon = calculateBurnRateHorizon(med.id, med.is_prn ? 1 : 2);

          return (
            <div
              key={med.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{med.name}</h3>
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{med.dosage_strength}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{med.instructions}</p>
                    {med.rx_number && (
                      <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded mt-1.5 inline-block border border-slate-200 dark:border-slate-700">
                        Rx: {med.rx_number}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchReview(med)}
                  className="py-1.5 px-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold text-[11px] flex items-center gap-1 border border-brand-500/30 transition shadow-sm"
                  title="Auto Pharmacotherapy & Food Interaction Review"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Review
                </button>
              </div>

              {/* Dynamic Burn Horizon Metric Strip */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Current Stock</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-black text-slate-900 dark:text-white">{med.current_stock}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{med.unit_of_measure}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Runout Horizon</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className={`text-sm font-bold ${horizon.isLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {horizon.daysRemaining} days left
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Depletes: {horizon.estimatedRunoutDate}</p>
                </div>
              </div>

              {/* Warnings / Refill Alerts */}
              {horizon.isLowStock && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Low Stock Warning ({med.remaining_refills} refills left)</span>
                  </div>

                  {med.pharmacy_phone && (
                    <a
                      href={`tel:${med.pharmacy_phone}`}
                      className="text-xs font-bold text-amber-700 dark:text-amber-300 underline flex items-center gap-1 hover:text-amber-800 dark:hover:text-amber-200"
                    >
                      <Phone className="w-3 h-3" />
                      Refill
                    </a>
                  )}
                </div>
              )}

              {/* Actions: Pill Recount Audit */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleLaunchAudit(med)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Physical Pill Count Audit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <PillTrayCounterModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        medication={selectedMedForAudit}
      />
      <BottleScannerModal
        isOpen={isBottleScanOpen}
        onClose={() => setIsBottleScanOpen(false)}
      />
      <AutoMedReviewModal
        isOpen={selectedMedForReview !== null}
        onClose={() => setSelectedMedForReview(null)}
        medication={selectedMedForReview}
      />
    </div>
  );
};
