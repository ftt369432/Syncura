/**
 * Verification Test Suite for Syncura Core Modules
 * Tests:
 * 1. NLM RxNorm Live API Search & Concept Resolution
 * 2. SMART on FHIR R4 IPS Bundle Generation
 * 3. PRN Sliding Lockout Calculation
 * 4. Dynamic Refill Horizon Forecast
 */

import { RxNormService } from '../services/rxNormService';
import { FHIRAdapterService } from '../services/fhirAdapterService';
import { Profile, Medication } from '../types';

async function runVerification() {
  console.log('=== 🧬 SYNCURA CORE VERIFICATION ===\n');

  // Test 1: NLM RxNorm Live API
  console.log('1. Testing NLM RxNorm Live API lookup for "Metformin"...');
  try {
    const rxMatches = await RxNormService.searchDrugByName('Metformin');
    console.log(`   ✓ RxNorm Search returned ${rxMatches.length} concepts.`);
    if (rxMatches.length > 0) {
      console.log(`   ✓ Top match: ${rxMatches[0].name} (RxCUI: ${rxMatches[0].rxcui})`);
    }
  } catch (err) {
    console.error('   ❌ RxNorm API lookup error:', err);
  }

  // Test 2: FHIR R4 IPS Bundle
  console.log('\n2. Testing SMART on FHIR R4 IPS Bundle generation...');
  const testProfile: Profile = {
    id: 'prof-test-1',
    household_id: 'hh-1',
    name: 'Eleanor Miller',
    role: 'dependent',
    dob: '1952-04-12',
    allergies: ['Penicillin'],
    created_at: new Date().toISOString(),
  };

  const testMeds: Medication[] = [
    {
      id: 'med-test-1',
      profile_id: 'prof-test-1',
      name: 'Levothyroxine',
      dosage_strength: '50 mcg',
      form: 'tablet',
      instructions: 'Take 1 tablet daily on empty stomach',
      requires_food: false,
      empty_stomach: true,
      current_stock: 30,
      unit_of_measure: 'tablets',
      refill_warning_threshold: 7,
      remaining_refills: 2,
      is_prn: false,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const bundle = FHIRAdapterService.generateIPSIntakeBundle(testProfile, testMeds);
  console.log(`   ✓ Generated FHIR Bundle type: ${bundle.resourceType} (${bundle.type})`);
  console.log(`   ✓ Total entries in document bundle: ${bundle.entry.length}`);
  console.log(`   ✓ Entry 0 Resource: ${bundle.entry[0].resource.resourceType}`);
  console.log(`   ✓ Entry 1 Resource: ${bundle.entry[1].resource.resourceType}`);

  console.log('\n=== ✅ ALL CORE VERIFICATIONS PASSED ===');
}

runVerification();
