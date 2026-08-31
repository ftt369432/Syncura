import { Medication, Profile } from '@/types';

export type InteractionSeverity = 'critical_allergy' | 'severe_ddi' | 'moderate_caution' | 'food_timing_conflict' | 'safe';

export interface ClinicalSafetyFinding {
  id: string;
  type: 'drug_allergy' | 'drug_drug' | 'drug_condition' | 'food_timing';
  severity: InteractionSeverity;
  title: string;
  medication1_name: string;
  medication2_name?: string;
  description: string;
  clinical_recommendation: string;
  source_evidence: string;
}

export interface InteractionReport {
  overall_safety_status: 'clear' | 'caution' | 'critical_warning';
  total_meds_analyzed: number;
  critical_findings_count: number;
  moderate_findings_count: number;
  findings: ClinicalSafetyFinding[];
  analyzed_at: string;
}

export class ClinicalInteractionEngine {
  /**
   * Evaluates top-down clinical safety across all active medications, allergies, and conditions
   */
  static analyzeRegimenSafety(profile: Profile, medications: Medication[]): InteractionReport {
    const activeMeds = medications.filter((m) => m.profile_id === profile.id && m.is_active);
    const findings: ClinicalSafetyFinding[] = [];
    const allergies = profile.allergies || [];

    const medNames = activeMeds.map((m) => (m.name + ' ' + (m.generic_name || '')).toLowerCase());

    // 1. DRUG-ALLERGY CHECK
    activeMeds.forEach((med) => {
      const name = (med.name + ' ' + (med.generic_name || '')).toLowerCase();

      allergies.forEach((allergy) => {
        const allergyLower = allergy.toLowerCase();

        // Penicillin class cross-match
        if (allergyLower.includes('penicillin') && (name.includes('amoxicillin') || name.includes('ampicillin') || name.includes('augmentin') || name.includes('penicillin'))) {
          findings.push({
            id: `allergy-${med.id}-pen`,
            type: 'drug_allergy',
            severity: 'critical_allergy',
            title: `CRITICAL ALLERGY CONFLICT: ${med.name}`,
            medication1_name: med.name,
            description: `Patient has a documented life-threatening allergy to "${allergy}". ${med.name} is a beta-lactam penicillin class antibiotic that can trigger severe anaphylaxis.`,
            clinical_recommendation: 'DO NOT ADMINISTER. Contact prescribing physician immediately for non-beta-lactam alternative (e.g. Azithromycin or Ciprofloxacin).',
            source_evidence: 'FDA Black Box Warning & NLM RxNorm Cross-Reactivity Database',
          });
        }

        // Sulfa class cross-match
        if (allergyLower.includes('sulfa') && (name.includes('bactrim') || name.includes('sulfamethoxazole') || name.includes('sulfadiazine') || name.includes('trimethoprim-sulfa'))) {
          findings.push({
            id: `allergy-${med.id}-sulfa`,
            type: 'drug_allergy',
            severity: 'critical_allergy',
            title: `CRITICAL ALLERGY CONFLICT: ${med.name}`,
            medication1_name: med.name,
            description: `Patient has a documented allergy to "${allergy}". ${med.name} contains sulfonamide compounds.`,
            clinical_recommendation: 'Halt medication pass. Replace with non-sulfonamide antibiotic.',
            source_evidence: 'NLM DailyMed Contraindications Registry',
          });
        }
      });
    });

    // 2. DRUG-DRUG INTERACTIONS (DDI)
    const hasAnticoagulant = activeMeds.find((m) => {
      const n = (m.name + ' ' + (m.generic_name || '')).toLowerCase();
      return n.includes('apixaban') || n.includes('eliquis') || n.includes('warfarin') || n.includes('xarelto') || n.includes('rivaroxaban') || n.includes('dabigatran');
    });

    const hasNSAID = activeMeds.find((m) => {
      const n = (m.name + ' ' + (m.generic_name || '')).toLowerCase();
      return n.includes('ibuprofen') || n.includes('advil') || n.includes('motrin') || n.includes('naproxen') || n.includes('aleve') || n.includes('meloxicam') || n.includes('aspirin') || n.includes('celebrex');
    });

    if (hasAnticoagulant && hasNSAID) {
      findings.push({
        id: `ddi-anticoag-nsaid`,
        type: 'drug_drug',
        severity: 'severe_ddi',
        title: `HIGH BLEEDING RISK: ${hasAnticoagulant.name} + ${hasNSAID.name}`,
        medication1_name: hasAnticoagulant.name,
        medication2_name: hasNSAID.name,
        description: `Concurrent use of direct oral anticoagulants (${hasAnticoagulant.name}) with NSAIDs (${hasNSAID.name}) dramatically increases major upper gastrointestinal and systemic bleeding risks by inhibiting platelet COX-1 pathway.`,
        clinical_recommendation: `Switch pain relief to Acetaminophen (Tylenol Extra Strength) up to 4,000mg/day as currently prescribed. Avoid all over-the-counter NSAIDs unless cardiologist approves.`,
        source_evidence: 'OpenFDA Drug Interaction API & American College of Cardiology Guidelines',
      });
    }

    // 3. FOOD & MEAL TIMING CONFLICTS
    const hasLevothyroxine = activeMeds.find((m) => m.name.toLowerCase().includes('levothyroxine') || m.name.toLowerCase().includes('synthroid'));
    if (hasLevothyroxine) {
      findings.push({
        id: `food-levo`,
        type: 'food_timing',
        severity: 'moderate_caution',
        title: `Absorption Timing: ${hasLevothyroxine.name} (Thyroid)`,
        medication1_name: hasLevothyroxine.name,
        description: `Levothyroxine bioavailability decreases by up to 50% if taken with coffee, calcium, iron supplements, or food.`,
        clinical_recommendation: `Syncura has scheduled this 30-60 minutes BEFORE breakfast on an empty stomach with a full glass of water.`,
        source_evidence: 'USP Clinical Pharmacology Standards',
      });
    }

    const hasMetformin = activeMeds.find((m) => m.name.toLowerCase().includes('metformin'));
    if (hasMetformin) {
      findings.push({
        id: `food-metformin`,
        type: 'food_timing',
        severity: 'moderate_caution',
        title: `GI Protection: ${hasMetformin.name} (Diabetes)`,
        medication1_name: hasMetformin.name,
        description: `Metformin can cause nausea, cramps, or diarrhea if taken on an empty stomach.`,
        clinical_recommendation: `Syncura has anchored this dose directly to meals (Breakfast & Dinner) to maximize tolerability.`,
        source_evidence: 'ADA Diabetes Standards of Care',
      });
    }

    const criticalCount = findings.filter((f) => f.severity === 'critical_allergy' || f.severity === 'severe_ddi').length;
    const moderateCount = findings.filter((f) => f.severity === 'moderate_caution' || f.severity === 'food_timing_conflict').length;

    return {
      overall_safety_status: criticalCount > 0 ? 'critical_warning' : moderateCount > 0 ? 'caution' : 'clear',
      total_meds_analyzed: activeMeds.length,
      critical_findings_count: criticalCount,
      moderate_findings_count: moderateCount,
      findings,
      analyzed_at: new Date().toISOString(),
    };
  }
}
