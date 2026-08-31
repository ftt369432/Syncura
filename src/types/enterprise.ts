export type EnterpriseRole = 'rn_charge_nurse' | 'lpn_nurse' | 'cna_caregiver' | 'medical_director' | 'agency_admin';

export interface AgencyStaff {
  id: string;
  name: string;
  badge_number: string;
  license_number: string; // e.g. "RN-CA-948210"
  role: EnterpriseRole;
  agency_name: string; // e.g. "Golden Gate Home Health & Hospice"
  avatar_url?: string;
  is_active: boolean;
}

export interface PatientCensusItem {
  id: string;
  profile_id: string;
  name: string;
  room_or_address: string; // e.g. "Room 204-B" or "742 Evergreen Terrace"
  wristband_barcode: string; // e.g. "PAT-MILLER-1952"
  acuity_level: 'routine' | 'moderate' | 'critical';
  pending_meds_count: number;
  next_dose_due: string;
  vitals_status: 'stable' | 'needs_bp_check' | 'abnormal_glucose';
  dnr_dni_status: boolean;
}

export interface NurseVisitSession {
  id: string;
  staff_id: string;
  staff_name: string;
  patient_id: string;
  patient_name: string;
  check_in_time: string;
  check_out_time?: string;
  gps_coordinates?: { lat: number; lng: number };
  evv_verified: boolean; // Electronic Visit Verification for Medicaid/Medicare CMS billing
  meds_administered_count: number;
  clinical_notes: string;
  witness_staff_name?: string; // For controlled substances (Schedules II-IV)
}
