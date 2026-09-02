import { create } from 'zustand';

export interface MedicalTimelineEvent {
  id: string;
  date: string;
  category: 'surgery_implant' | 'diagnosis' | 'drug_intolerance' | 'lab_milestone' | 'hospital_discharge';
  title: string;
  clinical_summary: string;
  impact_on_future_care: string;
  source_institution: string;
}

export interface LabTrajectory {
  test_name: string; // e.g. "HbA1c" or "eGFR Kidney Function"
  unit: string;
  target_range: string;
  history: {
    date: string;
    value: number;
    flag: 'normal' | 'improved' | 'elevated' | 'critical';
  }[];
  trajectory_summary: string;
}

export interface PersistentClinicalProfile {
  profile_id: string;
  chronic_diagnoses: {
    condition: string;
    icd10: string;
    diagnosed_year: number;
    status: 'active_managed' | 'resolved';
    notes: string;
  }[];
  permanent_drug_contraindications: {
    drug_or_class: string;
    adverse_reaction: string;
    year_identified: number;
    rule: string;
  }[];
  lab_trajectories: LabTrajectory[];
  longitudinal_timeline: MedicalTimelineEvent[];
  last_synthesized_at: string;
}

interface ClinicalMemoryState {
  memory: Record<string, PersistentClinicalProfile>;
  getMemoryForProfile: (profileId: string) => PersistentClinicalProfile;
  addTimelineEvent: (profileId: string, event: Omit<MedicalTimelineEvent, 'id'>) => void;
  addLabTrajectoryData: (profileId: string, testName: string, date: string, value: number, flag: 'normal' | 'improved' | 'elevated') => void;
  recordDiscontinuation: (profileId: string, medName: string, reason: string) => void;
  addPermanentContraindication: (profileId: string, drugOrClass: string, adverseReaction: string, rule: string) => void;
}

export const useClinicalMemoryStore = create<ClinicalMemoryState>((set, get) => ({
  memory: {
    'prof-mom': {
      profile_id: 'prof-mom',
      chronic_diagnoses: [
        {
          condition: 'Type 2 Diabetes Mellitus',
          icd10: 'E11.9',
          diagnosed_year: 2018,
          status: 'active_managed',
          notes: 'Well-controlled under Metformin 500mg BID and dietary carbohydrate management.',
        },
        {
          condition: 'Non-Valvular Atrial Fibrillation',
          icd10: 'I48.0',
          diagnosed_year: 2021,
          status: 'active_managed',
          notes: 'Maintained on Apixaban (Eliquis) 5mg BID for thromboembolism prevention. Zero CVA/TIA episodes.',
        },
        {
          condition: 'Primary Hypothyroidism',
          icd10: 'E03.9',
          diagnosed_year: 2016,
          status: 'active_managed',
          notes: 'Euthyroid on Levothyroxine 50mcg daily morning regimen.',
        },
        {
          condition: 'Bilateral Knee Osteoarthritis',
          icd10: 'M17.0',
          diagnosed_year: 2019,
          status: 'active_managed',
          notes: 'Managed with Acetaminophen PRN. Oral NSAIDs strictly avoided due to Apixaban.',
        },
      ],
      permanent_drug_contraindications: [
        {
          drug_or_class: 'Penicillins & Beta-Lactam Antibiotics',
          adverse_reaction: 'Anaphylaxis (Airway edema, severe urticaria)',
          year_identified: 1984,
          rule: 'CRITICAL STOP: Never re-prescribe or administer penicillin class.',
        },
        {
          drug_or_class: 'Lisinopril (ACE Inhibitors)',
          adverse_reaction: 'Persistent intractable dry cough & pharyngeal irritation',
          year_identified: 2021,
          rule: 'Avoid ACE inhibitor class; ARB or Calcium Channel Blocker preferred if BP adjustment needed.',
        },
        {
          drug_or_class: 'Oral NSAIDs (Ibuprofen / Naproxen / Meloxicam)',
          adverse_reaction: 'High gastrointestinal bleeding risk when combined with Apixaban',
          year_identified: 2021,
          rule: 'Permanent contraindication while on daily anticoagulant therapy.',
        },
      ],
      lab_trajectories: [
        {
          test_name: 'HbA1c (Glycated Hemoglobin)',
          unit: '%',
          target_range: '< 7.0%',
          history: [
            { date: '2025-02-15', value: 7.4, flag: 'elevated' },
            { date: '2025-08-20', value: 7.1, flag: 'improved' },
            { date: '2026-02-10', value: 6.8, flag: 'normal' },
          ],
          trajectory_summary: 'Consistently improving trajectory from 7.4% down to 6.8% under Metformin 500mg BID meal-adherence routine.',
        },
        {
          test_name: 'eGFR Kidney Function',
          unit: 'mL/min/1.73m²',
          target_range: '> 60 mL/min',
          history: [
            { date: '2025-02-15', value: 61, flag: 'normal' },
            { date: '2025-08-20', value: 62, flag: 'normal' },
            { date: '2026-02-10', value: 64, flag: 'normal' },
          ],
          trajectory_summary: 'Stable renal clearance (64 mL/min) safe for ongoing standard-dose Metformin and Apixaban.',
        },
      ],
      longitudinal_timeline: [
        {
          id: 'time-1',
          date: '2022-06-14',
          category: 'surgery_implant',
          title: 'St. Jude CRT-D Dual-Chamber Pacemaker Implantation',
          clinical_summary: 'Successful subcutaneous transvenous pacemaker insertion for tachy-brady syndrome at Riverside Heart Institute.',
          impact_on_future_care: 'Strict caution with MRI machines (Device is MRI-conditional with pre-programming). Ongoing Merlin@home bedside telemetry.',
          source_institution: 'Riverside Heart & Vascular Institute',
        },
        {
          id: 'time-2',
          date: '2021-11-04',
          category: 'drug_intolerance',
          title: 'Lisinopril Discontinued & Documented',
          clinical_summary: 'Patient developed chronic unremitting cough 3 weeks post initiation.',
          impact_on_future_care: 'Permanent medical alert added. Switched to lifestyle + beta-blocker protocol.',
          source_institution: 'UCLA Health Primary Care',
        },
        {
          id: 'time-3',
          date: '2026-02-10',
          category: 'lab_milestone',
          title: 'Comprehensive Metabolic & Lipid Panel Normalization',
          clinical_summary: 'Quest Diagnostics panel confirmed HbA1c 6.8% and normal potassium (4.4 mmol/L).',
          impact_on_future_care: 'Current drug regimens reaffirmed by Dr. Robert Chen without dosage increase.',
          source_institution: 'Quest Diagnostics',
        },
      ],
      last_synthesized_at: new Date().toISOString(),
    },
  },

  getMemoryForProfile: (profileId) => {
    return get().memory[profileId] || get().memory['prof-mom'];
  },

  addTimelineEvent: (profileId, event) => {
    const newEvt: MedicalTimelineEvent = {
      ...event,
      id: `time-${Date.now()}`,
    };
    set((state) => {
      const existing = state.memory[profileId] || state.memory['prof-mom'];
      return {
        memory: {
          ...state.memory,
          [profileId]: {
            ...existing,
            longitudinal_timeline: [newEvt, ...existing.longitudinal_timeline],
            last_synthesized_at: new Date().toISOString(),
          },
        },
      };
    });
  },

  addLabTrajectoryData: (profileId, testName, date, value, flag) => {
    set((state) => {
      const existing = state.memory[profileId] || state.memory['prof-mom'];
      const updatedTrajectories = existing.lab_trajectories.map((traj) => {
        if (traj.test_name.toLowerCase().includes(testName.toLowerCase())) {
          return {
            ...traj,
            history: [...traj.history, { date, value, flag }],
          };
        }
        return traj;
      });

      return {
        memory: {
          ...state.memory,
          [profileId]: {
            ...existing,
            lab_trajectories: updatedTrajectories,
            last_synthesized_at: new Date().toISOString(),
          },
        },
      };
    });
  },

  recordDiscontinuation: (profileId, medName, reason) => {
    const today = new Date().toISOString().split('T')[0];
    const year = new Date().getFullYear();
    set((state) => {
      const existing = state.memory[profileId] || state.memory['prof-mom'];
      const newTimelineEvent: MedicalTimelineEvent = {
        id: `time-disc-${Date.now()}`,
        date: today,
        category: 'drug_intolerance',
        title: `${medName} Discontinued & Logged in Memory`,
        clinical_summary: `Patient discontinued ${medName}. Reason: ${reason || 'Doctor adjusted regimen / intolerance'}.`,
        impact_on_future_care: `Auto-adjusted clinical matrix: Any past interaction warnings cleared. Re-prescription guard active.`,
        source_institution: 'Syncura Sovereign Clinical Memory',
      };

      const newContraindication = {
        drug_or_class: medName,
        adverse_reaction: reason || 'Discontinued due to clinical intolerance or provider order',
        year_identified: year,
        rule: `CAUTION: Previously discontinued (${reason || 'clinical order'}). Verify with prescribing doctor before restarting.`,
      };

      return {
        memory: {
          ...state.memory,
          [profileId]: {
            ...existing,
            permanent_drug_contraindications: [
              newContraindication,
              ...existing.permanent_drug_contraindications.filter(
                (c) => c.drug_or_class.toLowerCase() !== medName.toLowerCase()
              ),
            ],
            longitudinal_timeline: [newTimelineEvent, ...existing.longitudinal_timeline],
            last_synthesized_at: new Date().toISOString(),
          },
        },
      };
    });
  },

  addPermanentContraindication: (profileId, drugOrClass, adverseReaction, rule) => {
    set((state) => {
      const existing = state.memory[profileId] || state.memory['prof-mom'];
      return {
        memory: {
          ...state.memory,
          [profileId]: {
            ...existing,
            permanent_drug_contraindications: [
              {
                drug_or_class: drugOrClass,
                adverse_reaction: adverseReaction,
                year_identified: new Date().getFullYear(),
                rule,
              },
              ...existing.permanent_drug_contraindications,
            ],
            last_synthesized_at: new Date().toISOString(),
          },
        },
      };
    });
  },
}));
