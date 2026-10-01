import { create } from 'zustand';
import { Medication, InventoryTransaction } from '@/types';
import { differenceInDays, addDays } from 'date-fns';
import { useClinicalMemoryStore } from '@/services/clinicalMemoryStore';
import { initialSeedData } from '@/data/seedData';

interface MedicationState {
  medications: Medication[];
  transactions: InventoryTransaction[];
  addMedication: (medication: Omit<Medication, 'id' | 'created_at'>) => void;
  updateStock: (medicationId: string, newStock: number, reason: string, txType?: InventoryTransaction['tx_type']) => void;
  decrementStockForDose: (medicationId: string) => void;
  discontinueMedication: (medicationId: string, reason?: string) => void;
  calculateBurnRateHorizon: (medicationId: string, dailyDoseCount?: number) => {
    daysRemaining: number;
    estimatedRunoutDate: string;
    isLowStock: boolean;
  };
  getMedicationsForProfile: (profileId: string) => Medication[];
  resetToEmpty: () => void;
  loadDemoMedications: () => void;
}

const loadInitialMedications = (): Medication[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('syncura_medications') : null;
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

const persistMedications = (meds: Medication[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncura_medications', JSON.stringify(meds));
    }
  } catch (e) {}
};

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: loadInitialMedications(),
  transactions: [],

  addMedication: (medData) => {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => {
      const updated = [newMed, ...state.medications];
      persistMedications(updated);
      return {
        medications: updated,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            medication_id: newMed.id,
            tx_type: 'refill_added',
            qty_delta: newMed.current_stock,
            resulting_stock: newMed.current_stock,
            reason_code: 'initial_intake',
            created_at: new Date().toISOString(),
          },
          ...state.transactions,
        ],
      };
    });
  },

  updateStock: (medicationId, newStock, reason, txType = 'manual_adjustment') => {
    set((state) => {
      const med = state.medications.find((m) => m.id === medicationId);
      if (!med) return state;

      const delta = newStock - med.current_stock;
      const updatedMeds = state.medications.map((m) =>
        m.id === medicationId ? { ...m, current_stock: newStock } : m
      );
      persistMedications(updatedMeds);
      return {
        medications: updatedMeds,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            medication_id: medicationId,
            tx_type: txType,
            qty_delta: delta,
            resulting_stock: newStock,
            reason_code: reason,
            created_at: new Date().toISOString(),
          },
          ...state.transactions,
        ],
      };
    });
  },

  decrementStockForDose: (medicationId) => {
    const med = get().medications.find((m) => m.id === medicationId);
    if (!med) return;
    const newStock = Math.max(0, med.current_stock - 1);
    get().updateStock(medicationId, newStock, 'dose_administered', 'dose_taken');
  },

  discontinueMedication: (medicationId, reason) => {
    const med = get().medications.find((m) => m.id === medicationId);
    if (!med) return;

    set((state) => {
      const updatedMeds = state.medications.map((m) =>
        m.id === medicationId ? { ...m, is_active: false } : m
      );
      persistMedications(updatedMeds);
      return { medications: updatedMeds };
    });

    // Recalibrate persistent clinical memory
    try {
      useClinicalMemoryStore.getState().recordDiscontinuation(
        med.profile_id,
        med.name,
        reason || 'Discontinued by patient/caregiver order'
      );
    } catch (e) {
      console.warn('Memory calibration log skipped:', e);
    }
  },

  calculateBurnRateHorizon: (medicationId, dailyDoseCount = 1) => {
    const med = get().medications.find((m) => m.id === medicationId);
    if (!med || dailyDoseCount <= 0) {
      return { daysRemaining: 0, estimatedRunoutDate: 'N/A', isLowStock: false };
    }

    const daysRemaining = Math.floor(med.current_stock / dailyDoseCount);
    const runoutDate = addDays(new Date(), daysRemaining);
    const isLowStock = daysRemaining <= med.refill_warning_threshold;

    return {
      daysRemaining,
      estimatedRunoutDate: runoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isLowStock,
    };
  },

  getMedicationsForProfile: (profileId) => {
    return get().medications.filter((m) => m.profile_id === profileId && m.is_active);
  },

  resetToEmpty: () => {
    persistMedications([]);
    set({ medications: [], transactions: [] });
  },

  loadDemoMedications: () => {
    persistMedications(initialSeedData.medications);
    set({ medications: initialSeedData.medications, transactions: [] });
  },
}));
