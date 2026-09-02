import { Medication, Profile } from '@/types';
import { useClinicalMemoryStore, PersistentClinicalProfile } from './clinicalMemoryStore';

export type InteractionSeverity = 
  | 'critical_allergy' 
  | 'severe_ddi' 
  | 'historical_warning' 
  | 'moderate_caution' 
  | 'food_timing_conflict' 
  | 'safe';

export interface ClinicalSafetyFinding {
  id: string;
  type: 'drug_allergy' | 'drug_drug' | 'drug_condition' | 'historical_memory' | 'food_timing';
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

export interface NewMedSafetyReport {
  overallStatus: 'critical_allergy' | 'severe_ddi' | 'historical_warning' | 'caution' | 'safe';
  findings: ClinicalSafetyFinding[];
  allergyFindings: ClinicalSafetyFinding[];
  ddiFindings: ClinicalSafetyFinding[];
  conditionFindings: ClinicalSafetyFinding[];
  historicalFindings: ClinicalSafetyFinding[];
  foodTimingFindings: ClinicalSafetyFinding[];
  checkedAllergiesCount: number;
  checkedMedsCount: number;
  checkedConditionsCount: number;
  hasMissingSafetyProfile: boolean;
}

export class ClinicalInteractionEngine {
  /**
   * Evaluates top-down clinical safety across all active medications, allergies, and conditions
   */
  static analyzeRegimenSafety(profile: Profile, medications: Medication[]): InteractionReport {
    const activeMeds = medications.filter((m) => m.profile_id === profile.id && m.is_active);
    const findings: ClinicalSafetyFinding[] = [];
    const allergies = profile.allergies || [];
    const conditions = profile.chronic_conditions || [];

    // 1. DRUG-ALLERGY CHECK
    activeMeds.forEach((med) => {
      const allergyConflicts = this.checkDrugAgainstAllergies(med.name, allergies);
      findings.push(...allergyConflicts);
    });

    // 2. DRUG-DRUG INTERACTIONS (DDI)
    const ddiConflicts = this.checkDrugDrugInteractions(activeMeds);
    findings.push(...ddiConflicts);

    // 3. DRUG-CONDITION CONTRAINDICATIONS
    activeMeds.forEach((med) => {
      const condConflicts = this.checkDrugAgainstConditions(med.name, conditions);
      findings.push(...condConflicts);
    });

    // 4. FOOD & TIMING CONFLICTS
    activeMeds.forEach((med) => {
      const foodConflicts = this.checkFoodAndTiming(med.name, med.requires_food, med.empty_stomach);
      findings.push(...foodConflicts);
    });

    const criticalCount = findings.filter(
      (f) => f.severity === 'critical_allergy' || f.severity === 'severe_ddi' || f.severity === 'historical_warning'
    ).length;
    const moderateCount = findings.filter(
      (f) => f.severity === 'moderate_caution' || f.severity === 'food_timing_conflict'
    ).length;

    return {
      overall_safety_status: criticalCount > 0 ? 'critical_warning' : moderateCount > 0 ? 'caution' : 'clear',
      total_meds_analyzed: activeMeds.length,
      critical_findings_count: criticalCount,
      moderate_findings_count: moderateCount,
      findings,
      analyzed_at: new Date().toISOString(),
    };
  }

  /**
   * Evaluates a single newly scanned or added medication against active cabinet meds,
   * documented allergies, chronic conditions, and persistent clinical memory.
   */
  static analyzeNewMedicationSafety(
    newMed: {
      name: string;
      generic_name?: string;
      dosage_strength?: string;
      requires_food?: boolean;
      empty_stomach?: boolean;
    },
    profile: Profile,
    existingActiveMeds: Medication[],
    customMemory?: PersistentClinicalProfile
  ): NewMedSafetyReport {
    const findings: ClinicalSafetyFinding[] = [];
    const allergies = profile.allergies || [];
    const conditions = profile.chronic_conditions || [];

    // Retrieve persistent clinical memory
    const memory = customMemory || useClinicalMemoryStore.getState().getMemoryForProfile(profile.id);

    // 1. CHECK HISTORICAL PERSISTENT MEMORY (Discontinued meds or known intolerances)
    const historicalFindings: ClinicalSafetyFinding[] = [];
    if (memory?.permanent_drug_contraindications) {
      const target = newMed.name.toLowerCase();
      memory.permanent_drug_contraindications.forEach((contra) => {
        const contraDrug = contra.drug_or_class.toLowerCase();
        if (target.includes(contraDrug) || contraDrug.includes(target)) {
          historicalFindings.push({
            id: `hist-${Date.now()}-${contraDrug}`,
            type: 'historical_memory',
            severity: 'historical_warning',
            title: `HISTORICAL MEMORY WARNING: ${newMed.name}`,
            medication1_name: newMed.name,
            description: `This medication was previously discontinued or documented as intolerant for ${profile.name.split(' ')[0]}. Known adverse reaction: "${contra.adverse_reaction}".`,
            clinical_recommendation: contra.rule || 'Verify with prescribing physician before re-administering this medication.',
            source_evidence: 'Syncura Persistent Clinical Memory Graph',
          });
        }
      });
    }
    findings.push(...historicalFindings);

    // 2. CHECK ALLERGIES
    const allergyFindings = this.checkDrugAgainstAllergies(newMed.name, allergies);
    findings.push(...allergyFindings);

    // 3. CHECK DRUG-DRUG INTERACTIONS against active cabinet
    const ddiFindings = this.checkNewMedAgainstExistingMeds(newMed.name, existingActiveMeds);
    findings.push(...ddiFindings);

    // 4. CHECK CHRONIC CONDITIONS
    const conditionFindings = this.checkDrugAgainstConditions(newMed.name, conditions);
    findings.push(...conditionFindings);

    // 5. CHECK FOOD & TIMING
    const foodTimingFindings = this.checkFoodAndTiming(newMed.name, newMed.requires_food, newMed.empty_stomach);
    findings.push(...foodTimingFindings);

    // Calculate Overall Status
    let overallStatus: NewMedSafetyReport['overallStatus'] = 'safe';
    if (allergyFindings.length > 0) {
      overallStatus = 'critical_allergy';
    } else if (ddiFindings.some((d) => d.severity === 'severe_ddi')) {
      overallStatus = 'severe_ddi';
    } else if (historicalFindings.length > 0) {
      overallStatus = 'historical_warning';
    } else if (conditionFindings.length > 0 || foodTimingFindings.length > 0) {
      overallStatus = 'caution';
    }

    const hasMissingSafetyProfile = allergies.length === 0 && conditions.length === 0;

    return {
      overallStatus,
      findings,
      allergyFindings,
      ddiFindings,
      conditionFindings,
      historicalFindings,
      foodTimingFindings,
      checkedAllergiesCount: allergies.length,
      checkedMedsCount: existingActiveMeds.length,
      checkedConditionsCount: conditions.length,
      hasMissingSafetyProfile,
    };
  }

  // ==========================================
  // CLINICAL PHARMACOLOGY RULES
  // ==========================================

  private static checkDrugAgainstAllergies(drugName: string, allergies: string[]): ClinicalSafetyFinding[] {
    const findings: ClinicalSafetyFinding[] = [];
    const name = drugName.toLowerCase();

    allergies.forEach((allergy) => {
      const a = allergy.toLowerCase();

      // Penicillin & Beta-Lactams
      if (
        (a.includes('penicillin') || a.includes('amoxicillin')) &&
        (name.includes('amoxicillin') || name.includes('ampicillin') || name.includes('augmentin') || name.includes('penicillin') || name.includes('amoxil') || name.includes('piperacillin'))
      ) {
        findings.push({
          id: `allergy-pen-${Date.now()}`,
          type: 'drug_allergy',
          severity: 'critical_allergy',
          title: `🚨 CRITICAL ALLERGY INTERCEPT: ${drugName}`,
          medication1_name: drugName,
          description: `Patient profile lists "${allergy}". ${drugName} is a beta-lactam penicillin-class antibiotic with severe anaphylaxis and airway compromise risk.`,
          clinical_recommendation: 'DO NOT DISPENSE OR TAKE. Contact doctor immediately for non-beta-lactam alternative (e.g. Azithromycin, Doxycycline).',
          source_evidence: 'FDA Black Box Warning & NLM RxNorm Cross-Reactivity Database',
        });
      }

      // Sulfa / Sulfonamides
      if (
        a.includes('sulfa') &&
        (name.includes('bactrim') || name.includes('sulfamethoxazole') || name.includes('sulfadiazine') || name.includes('septra') || name.includes('trimethoprim-sulfa'))
      ) {
        findings.push({
          id: `allergy-sulfa-${Date.now()}`,
          type: 'drug_allergy',
          severity: 'critical_allergy',
          title: `🚨 CRITICAL SULFA ALLERGY: ${drugName}`,
          medication1_name: drugName,
          description: `Patient has documented allergy to "${allergy}". ${drugName} contains sulfonamide moieties capable of triggering severe Stevens-Johnson syndrome or anaphylaxis.`,
          clinical_recommendation: 'Halt medication pass. Request non-sulfonamide antibiotic from prescribing clinician.',
          source_evidence: 'NLM DailyMed Contraindications Registry',
        });
      }

      // Aspirin & NSAIDs
      if (
        (a.includes('aspirin') || a.includes('nsaid') || a.includes('ibuprofen')) &&
        (name.includes('ibuprofen') || name.includes('advil') || name.includes('motrin') || name.includes('naproxen') || name.includes('aleve') || name.includes('meloxicam') || name.includes('aspirin') || name.includes('celebrex') || name.includes('diclofenac'))
      ) {
        findings.push({
          id: `allergy-nsaid-${Date.now()}`,
          type: 'drug_allergy',
          severity: 'critical_allergy',
          title: `🚨 NSAID / ASPIRIN HYPERSENSITIVITY: ${drugName}`,
          medication1_name: drugName,
          description: `Patient documented allergy to "${allergy}". ${drugName} is an NSAID that can trigger severe bronchospasm, angioedema, or urticaria.`,
          clinical_recommendation: 'Avoid all oral and topical NSAIDs. Utilize Acetaminophen (Tylenol) for analgesia.',
          source_evidence: 'American Academy of Allergy, Asthma & Immunology (AAAAI) Guidelines',
        });
      }

      // Codeine & Opioids
      if (
        (a.includes('codeine') || a.includes('opioid') || a.includes('morphine')) &&
        (name.includes('codeine') || name.includes('tramadol') || name.includes('morphine') || name.includes('hydrocodone') || name.includes('oxycodone') || name.includes('norco') || name.includes('percocet') || name.includes('tylenol #3'))
      ) {
        findings.push({
          id: `allergy-opioid-${Date.now()}`,
          type: 'drug_allergy',
          severity: 'critical_allergy',
          title: `🚨 OPIOID HYPERSENSITIVITY: ${drugName}`,
          medication1_name: drugName,
          description: `Patient has documented sensitivity or allergy to "${allergy}". ${drugName} is an opiate derivative with severe respiratory depression and hypersensitivity risks.`,
          clinical_recommendation: 'Hold dose. Consult prescriber for non-opioid multimodal pain management.',
          source_evidence: 'FDA Drug Safety Communication',
        });
      }

      // ACE Inhibitors (Lisinopril)
      if (
        (a.includes('ace inhibitor') || a.includes('lisinopril')) &&
        (name.includes('lisinopril') || name.includes('enalapril') || name.includes('ramipril') || name.includes('benazepril') || name.includes('captopril'))
      ) {
        findings.push({
          id: `allergy-ace-${Date.now()}`,
          type: 'drug_allergy',
          severity: 'critical_allergy',
          title: `🚨 ACE INHIBITOR INTOLERANCE: ${drugName}`,
          medication1_name: drugName,
          description: `Patient has documented intolerance/allergy to "${allergy}". ${drugName} can cause life-threatening laryngeal angioedema or intractable cough.`,
          clinical_recommendation: 'Substitute with Angiotensin Receptor Blocker (ARB like Losartan) or CCB under cardiology guidance.',
          source_evidence: 'AHA/ACC Hypertension Guidelines',
        });
      }
    });

    return findings;
  }

  private static checkDrugDrugInteractions(activeMeds: Medication[]): ClinicalSafetyFinding[] {
    const findings: ClinicalSafetyFinding[] = [];

    const hasAnticoagulant = activeMeds.find((m) => {
      const n = (m.name + ' ' + (m.generic_name || '')).toLowerCase();
      return n.includes('apixaban') || n.includes('eliquis') || n.includes('warfarin') || n.includes('xarelto') || n.includes('rivaroxaban') || n.includes('dabigatran') || n.includes('plavix') || n.includes('clopidogrel');
    });

    const hasNSAID = activeMeds.find((m) => {
      const n = (m.name + ' ' + (m.generic_name || '')).toLowerCase();
      return n.includes('ibuprofen') || n.includes('advil') || n.includes('motrin') || n.includes('naproxen') || n.includes('aleve') || n.includes('meloxicam') || n.includes('aspirin') || n.includes('celebrex') || n.includes('diclofenac');
    });

    if (hasAnticoagulant && hasNSAID) {
      findings.push({
        id: `ddi-anticoag-nsaid`,
        type: 'drug_drug',
        severity: 'severe_ddi',
        title: `HIGH BLEEDING RISK: ${hasAnticoagulant.name} + ${hasNSAID.name}`,
        medication1_name: hasAnticoagulant.name,
        medication2_name: hasNSAID.name,
        description: `Concurrent direct oral anticoagulant (${hasAnticoagulant.name}) with NSAID (${hasNSAID.name}) dramatically increases major upper gastrointestinal and systemic bleeding risks.`,
        clinical_recommendation: `Switch pain relief to Acetaminophen (Tylenol Extra Strength). Avoid all over-the-counter NSAIDs.`,
        source_evidence: 'OpenFDA Drug Interaction API & American College of Cardiology Guidelines',
      });
    }

    // Potassium + ACE/ARB
    const hasACE = activeMeds.find((m) => {
      const n = (m.name + ' ' + (m.generic_name || '')).toLowerCase();
      return n.includes('lisinopril') || n.includes('losartan') || n.includes('valsartan') || n.includes('spironolactone');
    });
    const hasPotassium = activeMeds.find((m) => {
      const n = (m.name + ' ' + (m.generic_name || '')).toLowerCase();
      return n.includes('potassium') || n.includes('klor-con') || n.includes('k-dur');
    });

    if (hasACE && hasPotassium) {
      findings.push({
        id: `ddi-potassium-ace`,
        type: 'drug_drug',
        severity: 'severe_ddi',
        title: `HYPERKALEMIA RISK: ${hasACE.name} + ${hasPotassium.name}`,
        medication1_name: hasACE.name,
        medication2_name: hasPotassium.name,
        description: `Concurrent renin-angiotensin inhibition and potassium supplementation can cause life-threatening cardiac arrhythmias from severe hyperkalemia.`,
        clinical_recommendation: `Monitor serum potassium and renal function closely. Adjust potassium dosage under lab guidance.`,
        source_evidence: 'FDA Black Box Warning & American Heart Association',
      });
    }

    return findings;
  }

  private static checkNewMedAgainstExistingMeds(newDrugName: string, existingMeds: Medication[]): ClinicalSafetyFinding[] {
    const findings: ClinicalSafetyFinding[] = [];
    const n = newDrugName.toLowerCase();

    const isNewAnticoagulant = n.includes('apixaban') || n.includes('eliquis') || n.includes('warfarin') || n.includes('xarelto') || n.includes('rivaroxaban') || n.includes('plavix');
    const isNewNSAID = n.includes('ibuprofen') || n.includes('advil') || n.includes('motrin') || n.includes('naproxen') || n.includes('aleve') || n.includes('meloxicam') || n.includes('aspirin') || n.includes('celebrex') || n.includes('diclofenac');
    const isNewACE = n.includes('lisinopril') || n.includes('losartan') || n.includes('valsartan') || n.includes('spironolactone');
    const isNewPotassium = n.includes('potassium') || n.includes('klor-con');

    existingMeds.forEach((m) => {
      const existingName = (m.name + ' ' + (m.generic_name || '')).toLowerCase();

      // New NSAID + Existing Anticoagulant
      if (isNewNSAID && (existingName.includes('apixaban') || existingName.includes('eliquis') || existingName.includes('warfarin') || existingName.includes('xarelto'))) {
        findings.push({
          id: `ddi-new-nsaid-anticoag-${m.id}`,
          type: 'drug_drug',
          severity: 'severe_ddi',
          title: `CRITICAL BLEEDING INTERACTION: ${newDrugName} + ${m.name}`,
          medication1_name: newDrugName,
          medication2_name: m.name,
          description: `Patient is actively taking anticoagulant (${m.name}). Adding NSAID (${newDrugName}) exponentially multiplies gastrointestinal hemorrhage and bleeding risks.`,
          clinical_recommendation: `DO NOT START without cardiologist sign-off. Use Acetaminophen (Tylenol) for pain.`,
          source_evidence: 'OpenFDA Drug Interaction API & American College of Cardiology',
        });
      }

      // New Anticoagulant + Existing NSAID
      if (isNewAnticoagulant && (existingName.includes('ibuprofen') || existingName.includes('advil') || existingName.includes('naproxen') || existingName.includes('aspirin'))) {
        findings.push({
          id: `ddi-new-anticoag-nsaid-${m.id}`,
          type: 'drug_drug',
          severity: 'severe_ddi',
          title: `CRITICAL BLEEDING INTERACTION: ${newDrugName} + ${m.name}`,
          medication1_name: newDrugName,
          medication2_name: m.name,
          description: `Starting anticoagulant (${newDrugName}) while taking NSAID (${m.name}) dramatically increases severe hemorrhage risk.`,
          clinical_recommendation: `Discontinue ${m.name} from daily cabinet. Use Acetaminophen for pain.`,
          source_evidence: 'OpenFDA Drug Interaction API & ACC Guidelines',
        });
      }

      // New Potassium + Existing ACE/ARB
      if (isNewPotassium && (existingName.includes('lisinopril') || existingName.includes('losartan') || existingName.includes('spironolactone'))) {
        findings.push({
          id: `ddi-potassium-${m.id}`,
          type: 'drug_drug',
          severity: 'severe_ddi',
          title: `POTASSIUM OVERLOAD HAZARD: ${newDrugName} + ${m.name}`,
          medication1_name: newDrugName,
          medication2_name: m.name,
          description: `Combining potassium with ${m.name} risks dangerous hyperkalemia and heart arrhythmias.`,
          clinical_recommendation: `Obtain serum electrolyte blood panel before regular administration.`,
          source_evidence: 'Clinical Pharmacology Standards',
        });
      }
    });

    return findings;
  }

  private static checkDrugAgainstConditions(drugName: string, conditions: string[]): ClinicalSafetyFinding[] {
    const findings: ClinicalSafetyFinding[] = [];
    const n = drugName.toLowerCase();

    conditions.forEach((cond) => {
      const c = cond.toLowerCase();

      // Hypertension + Decongestants / NSAIDs
      if (
        (c.includes('hypertension') || c.includes('high blood pressure') || c.includes('hbp')) &&
        (n.includes('pseudoephedrine') || n.includes('sudafed') || n.includes('phenylephrine') || n.includes('ibuprofen') || n.includes('naproxen'))
      ) {
        findings.push({
          id: `cond-hbp-${Date.now()}`,
          type: 'drug_condition',
          severity: 'moderate_caution',
          title: `HYPERTENSION ELEVATION RISK: ${drugName}`,
          medication1_name: drugName,
          description: `Patient has documented "${cond}". ${drugName} causes vasoconstriction or renal fluid retention that can spike blood pressure.`,
          clinical_recommendation: `Monitor BP daily. Prefer Coricidin HBP for decongestion, or Acetaminophen for aches.`,
          source_evidence: 'American Heart Association (AHA) Warnings',
        });
      }

      // Kidney Disease (CKD) + NSAIDs
      if (
        (c.includes('kidney') || c.includes('ckd') || c.includes('renal')) &&
        (n.includes('ibuprofen') || n.includes('advil') || n.includes('naproxen') || n.includes('meloxicam') || n.includes('aleve'))
      ) {
        findings.push({
          id: `cond-ckd-${Date.now()}`,
          type: 'drug_condition',
          severity: 'severe_ddi',
          title: `ACUTE KIDNEY INJURY RISK: ${drugName}`,
          medication1_name: drugName,
          description: `Patient has baseline "${cond}". NSAIDs inhibit renal prostaglandins, reducing glomerular filtration and causing acute decompensation.`,
          clinical_recommendation: `Avoid all NSAIDs. Safe alternative: Acetaminophen.`,
          source_evidence: 'National Kidney Foundation (NKF) Clinical Guidelines',
        });
      }

      // Asthma + Beta Blockers
      if (
        (c.includes('asthma') || c.includes('copd')) &&
        (n.includes('propranolol') || n.includes('timolol') || n.includes('nadolol') || n.includes('carvedilol'))
      ) {
        findings.push({
          id: `cond-asthma-${Date.now()}`,
          type: 'drug_condition',
          severity: 'severe_ddi',
          title: `BRONCHOSPASM CONTRAINDICATION: ${drugName}`,
          medication1_name: drugName,
          description: `Patient has "${cond}". Non-selective beta-blockers block beta-2 pulmonary receptors, potentially triggering severe life-threatening asthma attacks.`,
          clinical_recommendation: `Use cardioselective beta-blocker (e.g. Metoprolol Tartrate) or alternative class if cardiac therapy needed.`,
          source_evidence: 'Global Initiative for Asthma (GINA) Standards',
        });
      }
    });

    return findings;
  }

  private static checkFoodAndTiming(drugName: string, requiresFood?: boolean, emptyStomach?: boolean): ClinicalSafetyFinding[] {
    const findings: ClinicalSafetyFinding[] = [];
    const n = drugName.toLowerCase();

    if (n.includes('levothyroxine') || n.includes('synthroid') || emptyStomach) {
      findings.push({
        id: `food-levo`,
        type: 'food_timing',
        severity: 'food_timing_conflict',
        title: `Absorption Fasting Rule: ${drugName}`,
        medication1_name: drugName,
        description: `Bioavailability decreases up to 50% if taken with coffee, calcium, iron, or meals.`,
        clinical_recommendation: `Syncura schedules this 30-60 minutes BEFORE breakfast on an empty stomach with a full glass of water.`,
        source_evidence: 'USP Clinical Pharmacology Standards',
      });
    }

    if (n.includes('metformin') || requiresFood) {
      findings.push({
        id: `food-metformin`,
        type: 'food_timing',
        severity: 'food_timing_conflict',
        title: `GI Tolerability Rule: ${drugName}`,
        medication1_name: drugName,
        description: `Can cause stomach cramping, nausea, or diarrhea if taken on an empty stomach.`,
        clinical_recommendation: `Syncura anchors this dose directly to meals (Breakfast & Dinner).`,
        source_evidence: 'ADA Diabetes Standards of Care',
      });
    }

    return findings;
  }
}
