import { create } from 'zustand';
import { Medication, InventoryTransaction } from '@/types';
import { differenceInDays, addDays } from 'date-fns';
import { useClinicalMemoryStore } from '@/services/clinicalMemoryStore';

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
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [
    {
      id: 'med-1',
      profile_id: 'prof-mom',
      name: 'Levothyroxine',
      generic_name: 'Levothyroxine Sodium',
      dosage_strength: '50 mcg',
      form: 'tablet',
      instructions: 'Take 1 tablet daily in the morning on an empty stomach with a full glass of water.',
      requires_food: false,
      empty_stomach: true,
      pre_alert_offset_minutes: 30,
      current_stock: 24,
      unit_of_measure: 'tablets',
      refill_warning_threshold: 7,
      remaining_refills: 2,
      rx_number: 'RX-9823412',
      pharmacy_name: 'CVS Pharmacy #4128',
      pharmacy_phone: '(555) 789-0123',
      doctor_name: 'Dr. Robert Chen, MD',
      is_prn: false,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'med-2',
      profile_id: 'prof-mom',
      name: 'Metformin',
      generic_name: 'Metformin HCl',
      dosage_strength: '500 mg',
      form: 'tablet',
      instructions: 'Take 1 tablet twice daily with meals (Breakfast and Dinner).',
      requires_food: true,
      empty_stomach: false,
      pre_alert_offset_minutes: 15,
      current_stock: 14,
      unit_of_measure: 'tablets',
      refill_warning_threshold: 6,
      remaining_refills: 1,
      rx_number: 'RX-7734109',
      pharmacy_name: 'CVS Pharmacy #4128',
      pharmacy_phone: '(555) 789-0123',
      doctor_name: 'Dr. Robert Chen, MD',
      is_prn: false,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'med-3',
      profile_id: 'prof-mom',
      name: 'Acetaminophen (Tylenol)',
      generic_name: 'Acetaminophen',
      dosage_strength: '500 mg',
      form: 'tablet',
      instructions: 'Take 1-2 tablets as needed for arthritis pain. Do not exceed 4,000mg per 24 hours. Wait at least 6 hours between doses.',
      requires_food: false,
      empty_stomach: false,
      current_stock: 48,
      unit_of_measure: 'tablets',
      refill_warning_threshold: 10,
      remaining_refills: 4,
      is_prn: true,
      prn_min_interval_hours: 6,
      prn_max_daily_doses: 6,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ],
  transactions: [],

  addMedication: (medData) => {
    const newMed: Medication = {
      ...medData,
      id: `med-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      medications: [newMed, ...state.medications],
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
    }));
  },

  updateStock: (medicationId, newStock, reason, txType = 'manual_adjustment') => {
    set((state) => {
      const med = state.medications.find((m) => m.id === medicationId);
      if (!med) return state;

      const delta = newStock - med.current_stock;
      return {
        medications: state.medications.map((m) =>
          m.id === medicationId ? { ...m, current_stock: newStock } : m
        ),
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

    set((state) => ({
      medications: state.medications.map((m) =>
        m.id === medicationId ? { ...m, is_active: false } : m
      ),
    }));

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
}));
