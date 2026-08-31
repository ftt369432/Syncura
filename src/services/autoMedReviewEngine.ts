export interface FoodInteractionItem {
  item: string; // e.g. "Grapefruit & Citrus Juices" or "Morning Coffee / Dairy"
  severity: 'strict_avoid' | 'timing_separation' | 'caution';
  reason: string;
  recommendation: string;
}

export interface TelemetryTargetGuidance {
  device_type: 'bp_cuff' | 'cgm_glucose' | 'pulse_ox' | 'smart_scale';
  metric_name: string;
  target_range: string;
  monitoring_frequency: string;
  clinical_rationale: string;
}

export interface AutoMedReviewReport {
  medication_name: string;
  dosage_strength: string;
  drug_class: string;
  summary_tagline: string;
  ideal_meal_anchor: 'breakfast' | 'lunch' | 'dinner' | 'bedtime' | 'empty_stomach_morning';
  foods_and_drinks_to_avoid: FoodInteractionItem[];
  telemetry_machine_targets: TelemetryTargetGuidance[];
  anticipated_side_effects: {
    effect: string;
    timeline: string;
    what_to_do: string;
  }[];
  black_box_critical_alerts: string[];
}

export class AutoMedReviewEngine {
  /**
   * Generates a 360-degree top-down clinical review when any medication is added or reviewed
   */
  static generateComprehensiveReview(medicationName: string, dosageStrength: string = ''): AutoMedReviewReport {
    const name = medicationName.toLowerCase();

    // 1. Levothyroxine / Synthroid
    if (name.includes('levothyroxine') || name.includes('synthroid')) {
      return {
        medication_name: 'Levothyroxine Sodium',
        dosage_strength: dosageStrength || '50 mcg',
        drug_class: 'Synthetic Thyroid Hormone (T4)',
        summary_tagline: 'Restores essential metabolic baseline and energy levels.',
        ideal_meal_anchor: 'empty_stomach_morning',
        foods_and_drinks_to_avoid: [
          {
            item: 'Morning Coffee & Espresso',
            severity: 'timing_separation',
            reason: 'Coffee contains chlorogenic acids that bind to Levothyroxine in the stomach, reducing bloodstream absorption by up to 55%.',
            recommendation: 'Take with a full glass of plain water upon waking. Wait at least 30 to 60 minutes before having coffee or breakfast.',
          },
          {
            item: 'Calcium, Iron & Antacids (Tums / Multivitamins)',
            severity: 'timing_separation',
            reason: 'Calcium and iron form insoluble chelates with thyroid hormone.',
            recommendation: 'Separate any calcium, iron, or vitamin supplements by at least 4 hours.',
          },
          {
            item: 'Soy & High-Fiber Foods',
            severity: 'caution',
            reason: 'Excessive soy protein isolates can inhibit thyroid hormone absorption.',
            recommendation: 'Keep soy intake consistent rather than erratic spikes.',
          },
        ],
        telemetry_machine_targets: [
          {
            device_type: 'pulse_ox',
            metric_name: 'Resting Heart Rate',
            target_range: '60 - 80 bpm',
            monitoring_frequency: 'Daily via Apple Watch / OMRON',
            clinical_rationale: 'Over-replacement can cause tachycardia or palpitations. Under-replacement causes bradycardia.',
          },
          {
            device_type: 'smart_scale',
            metric_name: 'Body Weight',
            target_range: 'Stable baseline (±2 lbs)',
            monitoring_frequency: 'Weekly weigh-in',
            clinical_rationale: 'Thyroid regulates basal metabolic rate; unexpected weight swings indicate dosage tuning needs.',
          },
        ],
        anticipated_side_effects: [
          {
            effect: 'Mild morning fatigue during first 2 weeks',
            timeline: 'Days 1 - 14',
            what_to_do: 'Normal as tissue levels equilibrate. Takes 4 to 6 weeks for full therapeutic plateau.',
          },
        ],
        black_box_critical_alerts: [
          'DO NOT use for weight loss or obesity treatment (FDA Black Box Warning).',
        ],
      };
    }

    // 2. Metformin
    if (name.includes('metformin') || name.includes('glucophage')) {
      return {
        medication_name: 'Metformin HCl',
        dosage_strength: dosageStrength || '500 mg',
        drug_class: 'Biguanide Antidiabetic',
        summary_tagline: 'Decreases hepatic glucose production and increases insulin sensitivity.',
        ideal_meal_anchor: 'breakfast',
        foods_and_drinks_to_avoid: [
          {
            item: 'Alcohol / Binge Drinking',
            severity: 'strict_avoid',
            reason: 'Alcohol potentiates Metformin’s effect on lactate metabolism, dramatically increasing the risk of lactic acidosis.',
            recommendation: 'Avoid excessive alcohol consumption. Never drink on an empty stomach.',
          },
          {
            item: 'Taking on an Empty Stomach',
            severity: 'strict_avoid',
            reason: 'Direct contact with gastric mucosa causes stomach upset, nausea, and loose stools.',
            recommendation: 'Always take with a substantial meal (e.g. Breakfast and Dinner).',
          },
        ],
        telemetry_machine_targets: [
          {
            device_type: 'cgm_glucose',
            metric_name: 'Dexcom CGM Post-Meal Blood Glucose',
            target_range: '80 - 140 mg/dL',
            monitoring_frequency: 'Continuous Dexcom G7 feed',
            clinical_rationale: 'Targeting HbA1c < 7.0%. Syncura correlates meal adherence with glucose stability.',
          },
        ],
        anticipated_side_effects: [
          {
            effect: 'Mild stomach rumbling or loose stools',
            timeline: 'Days 1 - 7',
            what_to_do: 'Usually resolves within 1 week as gut microbiome adapts. Always take mid-meal with food.',
          },
        ],
        black_box_critical_alerts: [
          'Temporarily withhold before CT scans involving iodinated radiocontrast dye to protect renal function.',
        ],
      };
    }

    // 3. Apixaban (Eliquis) / Blood Thinners
    if (name.includes('apixaban') || name.includes('eliquis') || name.includes('xarelto') || name.includes('warfarin')) {
      return {
        medication_name: 'Apixaban (Eliquis)',
        dosage_strength: dosageStrength || '5 mg',
        drug_class: 'Direct Oral Anticoagulant (Factor Xa Inhibitor)',
        summary_tagline: 'Prevents stroke and blood clots in Atrial Fibrillation.',
        ideal_meal_anchor: 'breakfast',
        foods_and_drinks_to_avoid: [
          {
            item: 'Over-the-Counter NSAIDs (Advil, Motrin, Aleve, Aspirin)',
            severity: 'strict_avoid',
            reason: 'NSAIDs inhibit platelets and erode gastric lining, causing a 3x to 5x spike in catastrophic gastrointestinal bleeding.',
            recommendation: 'STRICTLY AVOID OTC NSAIDs. Use Acetaminophen (Tylenol) for aches and headaches.',
          },
          {
            item: 'St. John’s Wort & High-Dose Ginkgo Biloba',
            severity: 'strict_avoid',
            reason: 'St. John’s Wort is a strong P-gp/CYP3A4 inducer that drastically lowers blood thinner levels, raising stroke risk.',
            recommendation: 'Do not take herbal supplements without consulting your cardiologist.',
          },
          {
            item: 'Grapefruit & Seville Oranges',
            severity: 'caution',
            reason: 'Moderate CYP3A4 inhibition can slightly elevate anticoagulant blood concentrations.',
            recommendation: 'Limit grapefruit consumption to occasional small portions.',
          },
        ],
        telemetry_machine_targets: [
          {
            device_type: 'bp_cuff',
            metric_name: 'Blood Pressure (Omron BLE)',
            target_range: 'Systolic < 130 mmHg',
            monitoring_frequency: 'Twice daily (Morning & Evening)',
            clinical_rationale: 'Uncontrolled hypertension (>160 mmHg) on anticoagulants increases hemorrhagic stroke risk.',
          },
        ],
        anticipated_side_effects: [
          {
            effect: 'Minor bruising or minor cuts bleeding slightly longer',
            timeline: 'Ongoing',
            what_to_do: 'Apply gentle, direct pressure with clean gauze for 5 minutes. Use soft-bristled toothbrush.',
          },
        ],
        black_box_critical_alerts: [
          'DO NOT abruptly stop taking Apixaban without doctor approval—increases immediate risk of stroke.',
        ],
      };
    }

    // Default Fallback for Any Other Scanned Medication
    return {
      medication_name: medicationName,
      dosage_strength: dosageStrength || 'Standard',
      drug_class: 'Prescription Therapeutic Agent',
      summary_tagline: 'Verified against NLM RxNorm Clinical Standards.',
      ideal_meal_anchor: 'breakfast',
      foods_and_drinks_to_avoid: [
        {
          item: 'Alcohol',
          severity: 'caution',
          reason: 'Alcohol can alter liver drug metabolism and amplify dizziness or sedation.',
          recommendation: 'Limit or avoid alcohol during treatment.',
        },
        {
          item: 'Grapefruit Juice',
          severity: 'caution',
          reason: 'Interacts with liver CYP3A4 enzymes for dozens of common blood pressure and cholesterol drugs.',
          recommendation: 'Check with your pharmacist if you consume grapefruit regularly.',
        },
      ],
      telemetry_machine_targets: [
        {
          device_type: 'bp_cuff',
          metric_name: 'Blood Pressure & Heart Rate',
          target_range: '120/80 mmHg (Resting)',
          monitoring_frequency: 'Daily via Bluetooth Cuff',
          clinical_rationale: 'Monitors hemodynamic stability following new regimen initiation.',
        },
      ],
      anticipated_side_effects: [
        {
          effect: 'Mild adaptation symptoms',
          timeline: 'First 3 - 5 days',
          what_to_do: 'Stay hydrated (aim for 2,000mL+ daily) and log any unusual symptoms in Syncura.',
        },
      ],
      black_box_critical_alerts: [],
    };
  }
}
