import { create } from 'zustand';
import { RegimenRule, DoseLog, DoseStatus } from '@/types';
import { differenceInMinutes, differenceInHours, addMinutes, format } from 'date-fns';
import { initialSeedData } from '@/data/seedData';
import { useMedicationStore } from './useMedicationStore';

interface RegimenState {
  rules: RegimenRule[];
  doseLogs: DoseLog[];
  mealTimes: {
    breakfast: string; // "08:30"
    lunch: string;     // "12:30"
    dinner: string;    // "18:30"
    bedtime: string;   // "22:00"
  };
  updateMealTime: (anchor: 'breakfast' | 'lunch' | 'dinner' | 'bedtime', timeStr: string) => void;
  addRule: (rule: Omit<RegimenRule, 'id' | 'created_at'>) => void;
  logDose: (medicationId: string, profileId: string, status: DoseStatus, scheduledTime: string, notes?: string) => void;
  getPrnLockoutStatus: (medicationId: string, minIntervalHours: number) => {
    isLocked: boolean;
    remainingMinutes: number;
    lastDoseTime: string | null;
    safeRedoseTime: string | null;
  };
  getTodayTimeline: (profileId: string) => Array<{
    medicationId: string;
    ruleId: string;
    targetTime: string;
    displayTime: string;
    mealLabel?: string;
    doseQuantity: number;
    status: DoseStatus;
    logId?: string;
  }>;
  resetToEmpty: () => void;
  loadDemoRegimen: () => void;
}

const loadInitialRules = (): RegimenRule[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('syncura_regimen_rules') : null;
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

const persistRules = (rules: RegimenRule[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncura_regimen_rules', JSON.stringify(rules));
    }
  } catch (e) {}
};

const loadInitialDoseLogs = (): DoseLog[] => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('syncura_dose_logs') : null;
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

const persistDoseLogs = (logs: DoseLog[]) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syncura_dose_logs', JSON.stringify(logs));
    }
  } catch (e) {}
};

export const useRegimenStore = create<RegimenState>((set, get) => ({
  rules: loadInitialRules(),
  doseLogs: loadInitialDoseLogs(),
  mealTimes: {
    breakfast: '08:30',
    lunch: '12:30',
    dinner: '18:30',
    bedtime: '22:00',
  },

  updateMealTime: (anchor, timeStr) => {
    set((state) => ({
      mealTimes: {
        ...state.mealTimes,
        [anchor]: timeStr,
      },
    }));
  },

  addRule: (ruleData) => {
    const newRule: RegimenRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
    };
    set((state) => {
      const updated = [...state.rules, newRule];
      persistRules(updated);
      return { rules: updated };
    });
  },

  logDose: (medicationId, profileId, status, scheduledTime, notes) => {
    const newLog: DoseLog = {
      id: `log-${Date.now()}`,
      idempotency_key: `${profileId}_${medicationId}_${scheduledTime}`,
      medication_id: medicationId,
      profile_id: profileId,
      scheduled_time: scheduledTime,
      actual_time: new Date().toISOString(),
      status,
      administered_by_name: 'Patient/Caregiver',
      notes,
      created_at: new Date().toISOString(),
    };

    set((state) => {
      const updated = [newLog, ...state.doseLogs];
      persistDoseLogs(updated);
      return { doseLogs: updated };
    });
  },

  getPrnLockoutStatus: (medicationId, minIntervalHours) => {
    const logs = get().doseLogs.filter(
      (l) => l.medication_id === medicationId && l.status === 'taken'
    );

    if (logs.length === 0) {
      return { isLocked: false, remainingMinutes: 0, lastDoseTime: null, safeRedoseTime: null };
    }

    // Sort by latest actual_time
    const latest = logs.sort(
      (a, b) => new Date(b.actual_time || b.created_at).getTime() - new Date(a.actual_time || a.created_at).getTime()
    )[0];

    const lastTime = new Date(latest.actual_time || latest.created_at);
    const safeTime = addMinutes(lastTime, minIntervalHours * 60);
    const now = new Date();

    const diffMinutes = differenceInMinutes(safeTime, now);

    return {
      isLocked: diffMinutes > 0,
      remainingMinutes: Math.max(0, diffMinutes),
      lastDoseTime: format(lastTime, 'h:mm a'),
      safeRedoseTime: format(safeTime, 'h:mm a'),
    };
  },

  getTodayTimeline: (profileId) => {
    const { rules, mealTimes, doseLogs } = get();
    if (!profileId) return [];

    // Filter rules to only include medications that belong to this profile
    const profileMeds = useMedicationStore.getState().getMedicationsForProfile(profileId);
    const profileMedIds = new Set(profileMeds.map((m) => m.id));
    const relevantRules = rules.filter((r) => profileMedIds.has(r.medication_id) && r.is_active);

    if (relevantRules.length === 0) return [];

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    return relevantRules.map((rule) => {
      let targetTime = '09:00';
      let mealLabel: string | undefined;

      if (rule.rule_type === 'meal_relative' && rule.meal_anchor) {
        const baseMealTime = mealTimes[rule.meal_anchor] || '08:00';
        const [hours, minutes] = baseMealTime.split(':').map(Number);
        const mealDate = new Date();
        mealDate.setHours(hours, minutes, 0, 0);
        const adjustedDate = addMinutes(mealDate, rule.meal_offset_minutes || 0);
        targetTime = format(adjustedDate, 'HH:mm');

        const offset = rule.meal_offset_minutes || 0;
        if (offset < 0) {
          mealLabel = `${Math.abs(offset)}m before ${rule.meal_anchor}`;
        } else if (offset > 0) {
          mealLabel = `${offset}m with ${rule.meal_anchor}`;
        } else {
          mealLabel = `with ${rule.meal_anchor}`;
        }
      } else if (rule.fixed_time) {
        targetTime = rule.fixed_time.slice(0, 5);
      }

      // Check if logged for today for this specific profile
      const existingLog = doseLogs.find((l) => l.medication_id === rule.medication_id && l.profile_id === profileId);
      const isTaken = existingLog && existingLog.status === 'taken';
      const status: DoseStatus = isTaken ? 'taken' : 'pending';

      return {
        medicationId: rule.medication_id,
        ruleId: rule.id,
        targetTime,
        displayTime: format(new Date(`${todayStr}T${targetTime}:00`), 'h:mm a'),
        mealLabel,
        doseQuantity: rule.dose_quantity,
        status,
        logId: existingLog?.id,
      };
    }).sort((a, b) => a.targetTime.localeCompare(b.targetTime));
  },

  resetToEmpty: () => {
    persistRules([]);
    persistDoseLogs([]);
    set({ rules: [], doseLogs: [] });
  },

  loadDemoRegimen: () => {
    persistRules(initialSeedData.regimenRules);
    persistDoseLogs(initialSeedData.doseLogs);
    set({ rules: initialSeedData.regimenRules, doseLogs: initialSeedData.doseLogs });
  },
}));
