import { create } from 'zustand';
import { ConnectedHealthDevice, BiometricReading, MedicationBiometricCorrelation } from '@/types/telemetry';

export interface WaterLogEntry {
  id: string;
  timestamp: string;
  amountMl: number;
  label: string;
}

interface TelemetryState {
  devices: ConnectedHealthDevice[];
  readings: BiometricReading[];
  waterLogs: WaterLogEntry[];
  correlations: MedicationBiometricCorrelation[];
  todayWaterMl: number;
  todaySteps: number;
  todaySleepMinutes: number;
  autoSyncEnabled: boolean;
  lastAutoCapturedToast: { message: string; timestamp: string } | null;
  toggleAutoSync: () => void;
  triggerSimulatedAutoCapture: () => void;
  dismissToast: () => void;
  addDevice: (device: Omit<ConnectedHealthDevice, 'id'>) => void;
  addReading: (reading: Omit<BiometricReading, 'id' | 'timestamp'>) => void;
  logWater: (amountMl: number, label?: string) => void;
  getLatestReading: (metricType: BiometricReading['metric_type']) => BiometricReading | undefined;
  getHistoryForMetric: (metricType: BiometricReading['metric_type']) => BiometricReading[];
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  devices: [
    {
      id: 'dev-bp-1',
      name: 'Omron Evolv Wireless Cuff',
      device_type: 'bp_cuff',
      connection_type: 'bluetooth_ble',
      brand_model: 'Omron BP7000 BLE',
      battery_level: 88,
      last_synced_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      is_connected: true,
    },
    {
      id: 'dev-cgm-1',
      name: 'Dexcom G7 Continuous Monitor',
      device_type: 'cgm_glucose',
      connection_type: 'bluetooth_ble',
      brand_model: 'Dexcom G7 Sensor',
      battery_level: 95,
      last_synced_at: new Date(Date.now() - 60000 * 5).toISOString(),
      is_connected: true,
    },
    {
      id: 'dev-watch-1',
      name: 'Apple Watch Series 9',
      device_type: 'smartwatch',
      connection_type: 'apple_health',
      brand_model: 'Apple Watch (WatchOS 10)',
      battery_level: 72,
      last_synced_at: new Date().toISOString(),
      is_connected: true,
    },
    {
      id: 'dev-implant-1',
      name: 'St. Jude Medical CRT-D Pacemaker',
      device_type: 'pacemaker_monitor',
      connection_type: 'nfc_implant',
      brand_model: 'Merlin@home Bedside Transmitter',
      last_synced_at: new Date(Date.now() - 86400000).toISOString(),
      is_connected: true,
    },
  ],

  readings: [
    {
      id: 'bp-1',
      profile_id: 'prof-mom',
      metric_type: 'blood_pressure',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      source_device_name: 'Omron Evolv BLE (Zero-Touch)',
      systolic_mmhg: 122,
      diastolic_mmhg: 78,
      pulse_bpm: 68,
      flag: 'normal',
      notes: 'Auto-captured when cuff finished measurement.',
    },
    {
      id: 'bp-2',
      profile_id: 'prof-mom',
      metric_type: 'blood_pressure',
      timestamp: new Date(Date.now() - 86400000 - 3600000 * 2).toISOString(),
      source_device_name: 'Omron Evolv BLE',
      systolic_mmhg: 124,
      diastolic_mmhg: 80,
      pulse_bpm: 70,
      flag: 'normal',
    },
    {
      id: 'bp-3',
      profile_id: 'prof-mom',
      metric_type: 'blood_pressure',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      source_device_name: 'Omron Evolv BLE',
      systolic_mmhg: 128,
      diastolic_mmhg: 82,
      pulse_bpm: 72,
      flag: 'normal',
    },
    {
      id: 'cgm-1',
      profile_id: 'prof-mom',
      metric_type: 'blood_glucose',
      timestamp: new Date(Date.now() - 60000 * 15).toISOString(),
      source_device_name: 'Dexcom G7 (Auto-WiFi)',
      glucose_mg_dl: 114,
      glucose_trend: 'flat',
      flag: 'normal',
      notes: 'Auto-pushed from Dexcom Continuous Sensor',
    },
    {
      id: 'cgm-2',
      profile_id: 'prof-mom',
      metric_type: 'blood_glucose',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      source_device_name: 'Dexcom G7 (Auto-WiFi)',
      glucose_mg_dl: 128,
      glucose_trend: 'rising',
      flag: 'normal',
      notes: 'Post-breakfast oatmeal with blueberries',
    },
    {
      id: 'step-1',
      profile_id: 'prof-mom',
      metric_type: 'steps',
      timestamp: new Date().toISOString(),
      source_device_name: 'Apple Watch Series 9',
      step_count: 7420,
      notes: '4.8 km walked • Auto-synced in background',
    },
    {
      id: 'sleep-1',
      profile_id: 'prof-mom',
      metric_type: 'sleep',
      timestamp: new Date().toISOString(),
      source_device_name: 'Apple Watch Series 9',
      sleep_minutes: 450,
      deep_sleep_minutes: 110,
      notes: 'Auto-synced upon wake-up alarm',
    },
  ],

  waterLogs: [
    {
      id: 'w-1',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      amountMl: 500,
      label: 'Post-walk hydration bottle',
    },
    {
      id: 'w-2',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      amountMl: 250,
      label: 'Green tea with breakfast',
    },
    {
      id: 'w-3',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      amountMl: 500,
      label: 'Morning water glass with Levothyroxine',
    },
  ],

  correlations: [
    {
      medication_id: 'med-2',
      medication_name: 'Metformin 500mg',
      metric_name: 'Post-Prandial Glucose',
      correlation_summary: 'Average blood glucose is 114 mg/dL when Metformin is taken with breakfast vs 146 mg/dL on delayed days.',
      adherence_impact_percentage: 28,
    },
    {
      medication_id: 'med-3',
      medication_name: 'Apixaban 5mg',
      metric_name: 'Cardiac Telemetry & Steps',
      correlation_summary: 'Zero arrhythmia episodes detected by pacemaker telemetry during 100% adherence over the past 30 days.',
      adherence_impact_percentage: 100,
    },
  ],

  todayWaterMl: 1750,
  todaySteps: 7420,
  todaySleepMinutes: 450,
  autoSyncEnabled: true,
  lastAutoCapturedToast: null,

  toggleAutoSync: () => {
    set((state) => ({ autoSyncEnabled: !state.autoSyncEnabled }));
  },

  dismissToast: () => {
    set({ lastAutoCapturedToast: null });
  },

  triggerSimulatedAutoCapture: () => {
    const systolic = Math.round(118 + Math.random() * 6);
    const diastolic = Math.round(74 + Math.random() * 5);
    const pulse = Math.round(66 + Math.random() * 6);

    const newReading: BiometricReading = {
      id: `bp-auto-${Date.now()}`,
      profile_id: 'prof-mom',
      metric_type: 'blood_pressure',
      timestamp: new Date().toISOString(),
      source_device_name: 'Omron Evolv BLE (Zero-Touch)',
      systolic_mmhg: systolic,
      diastolic_mmhg: diastolic,
      pulse_bpm: pulse,
      flag: 'normal',
      notes: 'Ambiently detected measurement from Omron BLE cuff.',
    };

    set((state) => ({
      readings: [newReading, ...state.readings],
      lastAutoCapturedToast: {
        message: `✨ Auto-Captured: ${systolic}/${diastolic} mmHg (Pulse: ${pulse} bpm) from Omron Cuff`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    }));
  },

  addDevice: (deviceData) => {
    const newDev: ConnectedHealthDevice = {
      ...deviceData,
      id: `dev-${Date.now()}`,
    };
    set((state) => ({ devices: [newDev, ...state.devices] }));
  },

  addReading: (readingData) => {
    const newReading: BiometricReading = {
      ...readingData,
      id: `read-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ readings: [newReading, ...state.readings] }));
  },

  logWater: (amountMl, label = 'Water Glass') => {
    const newEntry: WaterLogEntry = {
      id: `w-${Date.now()}`,
      timestamp: new Date().toISOString(),
      amountMl,
      label,
    };
    set((state) => ({
      todayWaterMl: state.todayWaterMl + amountMl,
      waterLogs: [newEntry, ...state.waterLogs],
    }));
  },

  getLatestReading: (metricType) => {
    return get().readings.find((r) => r.metric_type === metricType);
  },

  getHistoryForMetric: (metricType) => {
    return get().readings
      .filter((r) => r.metric_type === metricType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
}));
