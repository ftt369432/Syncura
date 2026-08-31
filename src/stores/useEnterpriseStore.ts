import { create } from 'zustand';
import { AgencyStaff, PatientCensusItem, NurseVisitSession } from '@/types/enterprise';

interface EnterpriseState {
  isEnterpriseMode: boolean;
  currentStaff: AgencyStaff;
  census: PatientCensusItem[];
  activeVisitSession: NurseVisitSession | null;
  completedVisits: NurseVisitSession[];
  toggleEnterpriseMode: () => void;
  checkInPatient: (patientId: string) => void;
  checkOutPatient: (clinicalNotes: string, witnessName?: string) => void;
  verifyWristbandScan: (scannedCode: string, expectedPatientId: string) => boolean;
}

export const useEnterpriseStore = create<EnterpriseState>((set, get) => ({
  isEnterpriseMode: false,

  currentStaff: {
    id: 'staff-1',
    name: 'Marcus Rivera, RN, BSN',
    badge_number: 'RN-8841',
    license_number: 'RN-CA-994820',
    role: 'rn_charge_nurse',
    agency_name: 'Pinnacle Home Health & Post-Acute Agency',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    is_active: true,
  },

  census: [
    {
      id: 'pat-1',
      profile_id: 'prof-mom',
      name: 'Eleanor Miller',
      room_or_address: '742 Evergreen Terr, Apt 3B (Home Visit)',
      wristband_barcode: 'PAT-MILLER-1952',
      acuity_level: 'routine',
      pending_meds_count: 2,
      next_dose_due: '08:00 AM (Breakfast)',
      vitals_status: 'stable',
      dnr_dni_status: false,
    },
    {
      id: 'pat-2',
      profile_id: 'prof-arthur',
      name: 'Arthur Pendelton',
      room_or_address: 'Room 108-A (Recovery Wing)',
      wristband_barcode: 'PAT-PENDELTON-1946',
      acuity_level: 'critical',
      pending_meds_count: 4,
      next_dose_due: '09:00 AM (Cardiac Beta Blocker)',
      vitals_status: 'needs_bp_check',
      dnr_dni_status: true,
    },
    {
      id: 'pat-3',
      profile_id: 'prof-evelyn',
      name: 'Evelyn Vance',
      room_or_address: 'Room 214-B (Post-Surgical)',
      wristband_barcode: 'PAT-VANCE-1958',
      acuity_level: 'moderate',
      pending_meds_count: 1,
      next_dose_due: '12:00 PM (Lunch)',
      vitals_status: 'abnormal_glucose',
      dnr_dni_status: false,
    },
    {
      id: 'pat-4',
      profile_id: 'prof-harold',
      name: 'Harold Brooks',
      room_or_address: '320 Magnolia Blvd (Home Visit)',
      wristband_barcode: 'PAT-BROOKS-1939',
      acuity_level: 'routine',
      pending_meds_count: 0,
      next_dose_due: '06:00 PM (Dinner)',
      vitals_status: 'stable',
      dnr_dni_status: true,
    },
  ],

  activeVisitSession: null,
  completedVisits: [],

  toggleEnterpriseMode: () => {
    set((state) => ({ isEnterpriseMode: !state.isEnterpriseMode }));
  },

  checkInPatient: (patientId: string) => {
    const patient = get().census.find((p) => p.id === patientId);
    const staff = get().currentStaff;
    if (!patient) return;

    const newSession: NurseVisitSession = {
      id: `visit-${Date.now()}`,
      staff_id: staff.id,
      staff_name: staff.name,
      patient_id: patient.id,
      patient_name: patient.name,
      check_in_time: new Date().toISOString(),
      gps_coordinates: { lat: 33.9533, lng: -117.3961 }, // Verified Riverside CA GPS for EVV
      evv_verified: true,
      meds_administered_count: 0,
      clinical_notes: '',
    };

    set({ activeVisitSession: newSession });
  },

  checkOutPatient: (clinicalNotes: string, witnessName?: string) => {
    const session = get().activeVisitSession;
    if (!session) return;

    const completed: NurseVisitSession = {
      ...session,
      check_out_time: new Date().toISOString(),
      clinical_notes: clinicalNotes,
      witness_staff_name: witnessName,
    };

    set((state) => ({
      activeVisitSession: null,
      completedVisits: [completed, ...state.completedVisits],
    }));
  },

  verifyWristbandScan: (scannedCode: string, expectedPatientId: string) => {
    const patient = get().census.find((p) => p.id === expectedPatientId);
    if (!patient) return false;
    return patient.wristband_barcode.trim().toUpperCase() === scannedCode.trim().toUpperCase();
  },
}));
