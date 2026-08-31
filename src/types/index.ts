export type ProfileRole = 'primary_admin' | 'caregiver_full' | 'caregiver_log_only' | 'dependent';

export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
}

export interface InsurancePolicy {
  provider_name: string; // e.g. "Medicare Part B" or "Blue Cross Blue Shield"
  policy_type: 'primary' | 'secondary' | 'prescription_part_d' | 'supplemental';
  member_id: string;
  group_number?: string;
  rx_bin?: string;
  rx_pcn?: string;
  rx_grp?: string;
  subscriber_name?: string;
  subscriber_relationship?: 'self' | 'spouse' | 'parent' | 'child' | 'other';
}

export interface CareTeamDoctor {
  id: string;
  doctor_name: string;
  specialty: string; // e.g. "Primary Care (PCP)", "Cardiology", "Endocrinology"
  clinic_hospital_name: string; // e.g. "UCLA Health Medical Center"
  phone: string;
  fax?: string;
  address?: string;
  portal_type?: 'epic_mychart' | 'cerner' | 'athena' | 'other';
}

export interface PreferredPharmacy {
  name: string;
  address: string;
  phone: string;
  fax?: string;
  rx_cross_street?: string;
}

export interface Profile {
  id: string;
  household_id: string;
  name: string;
  legal_first_name?: string;
  legal_last_name?: string;
  preferred_name?: string;
  avatar_url?: string;
  dob?: string;
  gender?: 'female' | 'male' | 'other' | 'unknown';
  role: ProfileRole;
  phone?: string;
  email?: string;
  address?: Address;
  insurance_policies?: InsurancePolicy[];
  care_team?: CareTeamDoctor[];
  preferred_pharmacy?: PreferredPharmacy;
  allergies?: string[];
  blood_type?: string;
  emergency_notes?: string;
  ice_contact_name?: string;
  ice_contact_phone?: string;
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
}

export type DosageForm = 'tablet' | 'capsule' | 'liquid_ml' | 'inhaler_puff' | 'insulin_unit' | 'patch' | 'drops';

export interface Medication {
  id: string;
  profile_id: string;
  name: string;
  generic_name?: string;
  rx_number?: string;
  ndc_code?: string;
  rxcui?: string;
  dosage_strength: string;
  form: DosageForm;
  instructions: string;
  requires_food: boolean;
  empty_stomach: boolean;
  pre_alert_offset_minutes?: number;
  current_stock: number;
  unit_of_measure: string;
  refill_warning_threshold: number;
  remaining_refills: number;
  pharmacy_name?: string;
  pharmacy_phone?: string;
  doctor_name?: string;
  is_prn: boolean;
  prn_min_interval_hours?: number;
  prn_max_daily_doses?: number;
  is_active: boolean;
  created_at: string;
}

export type RegimenRuleType = 'fixed_clock' | 'meal_relative' | 'prn_sliding' | 'tapering';
export type MealAnchor = 'breakfast' | 'lunch' | 'dinner' | 'bedtime';

export interface RegimenRule {
  id: string;
  medication_id: string;
  rule_type: RegimenRuleType;
  fixed_time?: string;
  meal_anchor?: MealAnchor;
  meal_offset_minutes?: number;
  dose_quantity: number;
  days_of_week?: number[];
  is_active: boolean;
}

export type DoseStatus = 'pending' | 'taken' | 'snoozed' | 'skipped' | 'missed';

export interface DoseLog {
  id: string;
  idempotency_key: string;
  medication_id: string;
  profile_id: string;
  scheduled_time: string;
  actual_time?: string;
  status: DoseStatus;
  administered_by_profile_id?: string;
  administered_by_name?: string;
  meal_correlated_time?: string;
  notes?: string;
  created_at: string;
}

export interface FamilyMessage {
  id: string;
  household_id: string;
  sender_profile_id: string;
  sender_name: string;
  message_type: 'text' | 'voice_memo' | 'auto_dose_log' | 'refill_alert' | 'meal_event';
  content: string;
  audio_url?: string;
  audio_duration_seconds?: number;
  created_at: string;
}

export interface InventoryTransaction {
  id: string;
  medication_id: string;
  tx_type: 'dose_taken' | 'recount_audit' | 'refill_added' | 'discarded_or_spilled' | 'manual_adjustment';
  qty_delta: number;
  resulting_stock: number;
  reason_code?: string;
  photo_evidence_url?: string;
  created_at: string;
}
