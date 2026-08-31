import { create } from 'zustand';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';
export type AlertCategory = 'drug_allergy' | 'drug_interaction' | 'prn_safety' | 'inventory_runout' | 'vital_telemetry';

export interface ClinicalAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  patient_name: string;
  description: string;
  action_label?: string;
  action_type?: 'call_doctor' | 'refill_rx' | 'switch_med' | 'dismiss';
  contact_phone?: string;
  is_read: boolean;
  created_at: string;
}

interface AlertsState {
  alerts: ClinicalAlert[];
  isInboxOpen: boolean;
  openInbox: () => void;
  closeInbox: () => void;
  markAsRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  triggerSimulatedDangerousDrugAlert: () => void;
  getUnreadCount: () => number;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [
    {
      id: 'alt-1',
      category: 'inventory_runout',
      severity: 'high',
      title: 'Low Stock Runout: Metformin 500mg',
      patient_name: 'Eleanor Miller',
      description: 'Only 14 tablets remaining (7 days of supply left). 1 refill remaining at CVS Pharmacy.',
      action_label: 'Call CVS to Refill',
      action_type: 'refill_rx',
      contact_phone: '(555) 789-0123',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'alt-2',
      category: 'drug_interaction',
      severity: 'medium',
      title: 'Absorption Timing Conflict: Levothyroxine',
      patient_name: 'Eleanor Miller',
      description: 'Levothyroxine must be taken 30-60 minutes before morning breakfast to prevent up to 50% absorption loss.',
      action_label: 'Adjust Meal Anchor',
      action_type: 'switch_med',
      is_read: false,
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'alt-3',
      category: 'prn_safety',
      severity: 'info',
      title: 'PRN Safety Lockout Active: Tylenol Extra Strength',
      patient_name: 'Eleanor Miller',
      description: '6-hour interval enforced between doses. Max daily ceiling is 4,000 mg (safe liver threshold).',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],

  isInboxOpen: false,

  openInbox: () => set({ isInboxOpen: true }),
  closeInbox: () => set({ isInboxOpen: false }),

  markAsRead: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)),
    }));
  },

  dismissAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId),
    }));
  },

  triggerSimulatedDangerousDrugAlert: () => {
    const newCriticalAlert: ClinicalAlert = {
      id: `alt-danger-${Date.now()}`,
      category: 'drug_allergy',
      severity: 'critical',
      title: '🚨 CRITICAL ALLERGY STOP: Amoxicillin 500mg',
      patient_name: 'Eleanor Miller',
      description: 'PATIENT HAS DOCUMENTED PENICILLIN ANAPHYLAXIS. Administration of Amoxicillin will trigger severe life-threatening airway constriction. DO NOT ADMINISTER.',
      action_label: 'Call Dr. Chen Immediately',
      action_type: 'call_doctor',
      contact_phone: '(555) 825-3000',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      alerts: [newCriticalAlert, ...state.alerts],
      isInboxOpen: true,
    }));
  },

  getUnreadCount: () => {
    return get().alerts.filter((a) => !a.is_read).length;
  },
}));
