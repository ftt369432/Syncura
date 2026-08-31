import { create } from 'zustand';
import { RegimenRule, DoseLog, DoseStatus } from '@/types';
import { differenceInMinutes, differenceInHours, addMinutes, format } from 'date-fns';

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
}

export const useRegimenStore = create<RegimenState>((set, get) => ({
  rules: [
    {
      id: 'rule-1',
      medication_id: 'med-1', // Levothyroxine (Empty stomach before breakfast)
      rule_type: 'meal_relative',
      meal_anchor: 'breakfast',
      meal_offset_minutes: -30, // 30 mins before breakfast
      dose_quantity: 1,
      is_active: true,
    },
    {
      id: 'rule-2',
      medication_id: 'med-2', // Metformin (With breakfast)
      rule_type: 'meal_relative',
      meal_anchor: 'breakfast',
      meal_offset_minutes: 15, // 15 mins with/after breakfast
      dose_quantity: 1,
      is_active: true,
    },
    {
      id: 'rule-3',
      medication_id: 'med-2', // Metformin (With dinner)
      rule_type: 'meal_relative',
      meal_anchor: 'dinner',
      meal_offset_minutes: 15,
      dose_quantity: 1,
      is_active: true,
    },
  ],
  doseLogs: [
    {
      id: 'log-1',
      idempotency_key: `prof-mom_med-1_${new Date().toISOString().split('T')[0]}_0800`,
      medication_id: 'med-1',
      profile_id: 'prof-mom',
      scheduled_time: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      actual_time: new Date(new Date().setHours(8, 5, 0, 0)).toISOString(),
      status: 'taken',
      administered_by_name: 'Eleanor (Self)',
      created_at: new Date(new Date().setHours(8, 5, 0, 0)).toISOString(),
    },
  ],
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
    set((state) => ({
      rules: [...state.rules, newRule],
    }));
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
      administered_by_name: 'Eleanor (Self)',
      notes,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      doseLogs: [newLog, ...state.doseLogs],
    }));
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
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    return rules.map((rule) => {
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

      // Check if logged for today
      const existingLog = doseLogs.find((l) => l.medication_id === rule.medication_id);
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
}));
