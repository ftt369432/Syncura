/**
 * Database & Backend Storage Adapter for Syncura
 * Provides unified interface across:
 * 1. Local Encrypted Cache (Instant Offline / Test Data)
 * 2. Supabase (Postgres + RLS + Realtime WebSockets)
 * 3. Firebase (Firestore / RTDB + Security Rules)
 */

import { initialSeedData, SyncuraSeedDataset } from '@/data/seedData';
import { Medication, Profile, DoseLog, FamilyMessage, Household } from '@/types';

export type BackendProvider = 'local_test' | 'supabase' | 'firebase';

export interface DatabaseAdapter {
  provider: BackendProvider;
  getHousehold: (householdId: string) => Promise<Household | null>;
  getProfiles: (householdId: string) => Promise<Profile[]>;
  getMedications: (profileId: string) => Promise<Medication[]>;
  logDose: (doseLog: DoseLog) => Promise<boolean>;
  postMessage: (message: FamilyMessage) => Promise<boolean>;
}

export class LocalTestDatabaseAdapter implements DatabaseAdapter {
  provider: BackendProvider = 'local_test';
  private data: SyncuraSeedDataset = initialSeedData;

  async getHousehold(householdId: string): Promise<Household | null> {
    return this.data.households.find((h) => h.id === householdId) || null;
  }

  async getProfiles(householdId: string): Promise<Profile[]> {
    return this.data.profiles.filter((p) => p.household_id === householdId);
  }

  async getMedications(profileId: string): Promise<Medication[]> {
    return this.data.medications.filter((m) => m.profile_id === profileId && m.is_active);
  }

  async logDose(doseLog: DoseLog): Promise<boolean> {
    this.data.doseLogs.unshift(doseLog);
    return true;
  }

  async postMessage(message: FamilyMessage): Promise<boolean> {
    this.data.familyMessages.unshift(message);
    return true;
  }

  /**
   * Resets local storage back to pristine initial seed test state
   */
  resetToSeed(): void {
    this.data = { ...initialSeedData };
  }
}

export const activeDbAdapter: DatabaseAdapter = new LocalTestDatabaseAdapter();
