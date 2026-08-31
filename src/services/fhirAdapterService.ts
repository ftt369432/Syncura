import { FHIRBundle, FHIRPatient, FHIRMedicationStatement } from '@/types/fhir';
import { Profile, Medication } from '@/types';

/**
 * Universal US Core FHIR R4 & International Patient Summary (IPS) Generator
 */
export class FHIRAdapterService {
  /**
   * Generates a complete HL7 FHIR R4 Bundle for clipboard-free clinic intake & auto-fill
   */
  static generateIPSIntakeBundle(profile: Profile, medications: Medication[]): FHIRBundle {
    const timestamp = new Date().toISOString();

    // 1. FHIR US Core Patient Resource
    const patientResource: FHIRPatient = {
      resourceType: 'Patient',
      id: profile.id,
      name: [
        {
          text: profile.name,
          family: profile.legal_last_name || profile.name.split(' ').slice(-1)[0],
          given: profile.legal_first_name ? [profile.legal_first_name] : [profile.name.split(' ')[0]],
        },
      ],
      gender: profile.gender || 'female',
      birthDate: profile.dob || '1952-04-12',
      telecom: [
        ...(profile.phone ? [{ system: 'phone', value: profile.phone, use: 'mobile' }] : []),
        ...(profile.email ? [{ system: 'email', value: profile.email, use: 'home' }] : []),
        ...(profile.ice_contact_phone ? [{ system: 'phone', value: profile.ice_contact_phone, use: 'emergency' }] : []),
      ],
    };

    // 2. FHIR Coverage Resource (Insurance & Front-Desk Billing Auto-Fill)
    const primaryInsurance = profile.insurance_policies?.[0];
    const coverageResource = primaryInsurance ? {
      resourceType: 'Coverage',
      id: `cov-${profile.id}`,
      status: 'active',
      subscriberId: primaryInsurance.member_id,
      beneficiary: { reference: `Patient/${profile.id}` },
      payor: [{ display: primaryInsurance.provider_name }],
      class: [
        ...(primaryInsurance.group_number ? [{ type: { coding: [{ code: 'group' }] }, value: primaryInsurance.group_number }] : []),
        ...(primaryInsurance.rx_bin ? [{ type: { coding: [{ code: 'rxbin' }] }, value: primaryInsurance.rx_bin }] : []),
        ...(primaryInsurance.rx_pcn ? [{ type: { coding: [{ code: 'rxpcn' }] }, value: primaryInsurance.rx_pcn }] : []),
        ...(primaryInsurance.rx_grp ? [{ type: { coding: [{ code: 'rxgroup' }] }, value: primaryInsurance.rx_grp }] : []),
      ],
    } : null;

    // 3. FHIR MedicationStatement Resources
    const medResources: FHIRMedicationStatement[] = medications.map((med) => ({
      resourceType: 'MedicationStatement',
      id: med.id,
      status: med.is_active ? 'active' : 'completed',
      medicationCodeableConcept: {
        text: `${med.name} ${med.dosage_strength}`,
        coding: med.rxcui ? [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: med.rxcui, display: med.name }] : undefined,
      },
      dosage: [
        {
          text: med.instructions,
          patientInstruction: med.instructions,
        },
      ],
      dateAsserted: timestamp,
    }));

    const entries: any[] = [
      { fullUrl: `urn:uuid:${profile.id}`, resource: patientResource },
      ...(coverageResource ? [{ fullUrl: `urn:uuid:cov-${profile.id}`, resource: coverageResource }] : []),
      ...medResources.map((m) => ({ fullUrl: `urn:uuid:${m.id}`, resource: m })),
    ];

    return {
      resourceType: 'Bundle',
      id: `ips-${profile.id}`,
      type: 'document',
      timestamp,
      entry: entries,
    };
  }
}
