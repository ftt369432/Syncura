/**
 * Biometric Telemetry & Medical Device Types for Syncura
 * Covers BLE Medical Devices, CGMs, Implants, Wearables, and Mobile Health Aggregators.
 */

export type BiometricMetricType = 
  | 'blood_pressure'
  | 'blood_glucose'
  | 'heart_rate'
  | 'spo2'
  | 'body_temperature'
  | 'weight'
  | 'steps'
  | 'sleep'
  | 'water_intake'
  | 'pacemaker_event';

export type DeviceConnectionType = 'bluetooth_ble' | 'health_connect' | 'apple_health' | 'wifi_cloud' | 'nfc_implant' | 'manual';

export interface ConnectedHealthDevice {
  id: string;
  name: string;
  device_type: 'bp_cuff' | 'cgm_glucose' | 'smart_scale' | 'pulse_ox' | 'pacemaker_monitor' | 'smartwatch' | 'smart_bottle';
  connection_type: DeviceConnectionType;
  brand_model: string; // e.g. "Omron Evolv BLE", "Dexcom G7", "Apple Watch Ultra", "Medtronic MyCareLink"
  battery_level?: number;
  last_synced_at: string;
  is_connected: boolean;
}

export interface BiometricReading {
  id: string;
  profile_id: string;
  metric_type: BiometricMetricType;
  timestamp: string;
  source_device_id?: string;
  source_device_name?: string;
  
  // Specific values
  systolic_mmhg?: number;
  diastolic_mmhg?: number;
  pulse_bpm?: number;
  glucose_mg_dl?: number;
  glucose_trend?: 'rising_fast' | 'rising' | 'flat' | 'falling' | 'falling_fast';
  spo2_percentage?: number;
  weight_lbs?: number;
  temperature_f?: number;
  
  // Daily aggregations
  step_count?: number;
  sleep_minutes?: number;
  deep_sleep_minutes?: number;
  water_ml?: number;
  
  // Clinical interpretation
  flag?: 'normal' | 'low' | 'elevated' | 'high' | 'critical';
  notes?: string;
}

export interface MedicationBiometricCorrelation {
  medication_id: string;
  medication_name: string;
  metric_name: string;
  correlation_summary: string;
  adherence_impact_percentage: number;
}
