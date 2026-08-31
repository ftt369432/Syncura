/**
 * FHIR R4 Interfaces for US Core & International Patient Summary (IPS)
 */

export interface FHIRIdentifier {
  system?: string;
  value: string;
}

export interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRQuantity {
  value: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRDosageInstruction {
  text?: string;
  patientInstruction?: string;
  timing?: {
    repeat?: {
      frequency?: number;
      period?: number;
      periodUnit?: string;
      when?: string[];
    }
  };
  doseAndRate?: Array<{
    doseQuantity?: FHIRQuantity;
  }>;
}

export interface FHIRMedicationStatement {
  resourceType: 'MedicationStatement';
  id?: string;
  status: 'active' | 'completed' | 'entered-in-error' | 'intended' | 'stopped' | 'on-hold';
  medicationCodeableConcept?: FHIRCodeableConcept;
  dosage?: FHIRDosageInstruction[];
  effectiveDateTime?: string;
  dateAsserted?: string;
}

export interface FHIRPatient {
  resourceType: 'Patient';
  id?: string;
  identifier?: FHIRIdentifier[];
  name?: Array<{
    text?: string;
    family?: string;
    given?: string[];
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
}

export interface FHIRAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id?: string;
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  type?: 'allergy' | 'intolerance';
  category?: string[];
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code?: FHIRCodeableConcept;
  reaction?: Array<{
    manifestation?: FHIRCodeableConcept[];
    severity?: 'mild' | 'moderate' | 'severe';
  }>;
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id?: string;
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  code?: FHIRCodeableConcept;
  onsetDateTime?: string;
}

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource: FHIRPatient | FHIRMedicationStatement | FHIRAllergyIntolerance | FHIRCondition | any;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  id?: string;
  type: 'document' | 'collection' | 'searchset' | 'transaction';
  timestamp?: string;
  entry: FHIRBundleEntry[];
}
