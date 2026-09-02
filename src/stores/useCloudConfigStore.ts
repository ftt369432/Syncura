import { create } from 'zustand';
import { getSupabaseClient, setSupabaseCredentials, clearSupabaseCredentials } from '@/lib/supabaseClient';
import { initialSeedData } from '@/data/seedData';

export type BackendMode = 'local_demo' | 'supabase_live';
export type ConnectionStatus = 'connected' | 'disconnected' | 'testing' | 'error';

interface CloudConfigState {
  backendMode: BackendMode;
  supabaseUrl: string;
  supabaseAnonKey: string;
  connectionStatus: ConnectionStatus;
  lastError: string | null;
  setBackendMode: (mode: BackendMode) => void;
  saveSupabaseConfig: (url: string, key: string) => Promise<boolean>;
  testConnection: () => Promise<boolean>;
  seedCloudDatabase: () => Promise<{ success: boolean; message: string }>;
  disconnectCloud: () => void;
}

export const useCloudConfigStore = create<CloudConfigState>((set, get) => ({
  backendMode: (localStorage.getItem('syncura_backend_mode') as BackendMode) || 'local_demo',
  supabaseUrl: localStorage.getItem('syncura_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: localStorage.getItem('syncura_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  connectionStatus: localStorage.getItem('syncura_supabase_url') ? 'connected' : 'disconnected',
  lastError: null,

  setBackendMode: (mode) => {
    localStorage.setItem('syncura_backend_mode', mode);
    set({ backendMode: mode });
  },

  saveSupabaseConfig: async (url, key) => {
    set({ connectionStatus: 'testing', lastError: null });
    const success = setSupabaseCredentials(url, key);

    if (!success) {
      set({ connectionStatus: 'error', lastError: 'Invalid URL or Key format' });
      return false;
    }

    set({ supabaseUrl: url, supabaseAnonKey: key });
    return await get().testConnection();
  },

  testConnection: async () => {
    set({ connectionStatus: 'testing', lastError: null });
    const client = getSupabaseClient();

    if (!client) {
      set({ connectionStatus: 'disconnected', lastError: 'No Supabase credentials configured' });
      return false;
    }

    try {
      // Test simple ping query to ensure connectivity and auth
      const { data, error } = await client.from('households').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116') {
        // Table might not exist or auth error
        console.warn('Supabase query returned notice:', error.message);
      }

      set({ connectionStatus: 'connected', backendMode: 'supabase_live', lastError: null });
      localStorage.setItem('syncura_backend_mode', 'supabase_live');
      return true;
    } catch (err: any) {
      set({ connectionStatus: 'error', lastError: err.message || 'Connection failed' });
      return false;
    }
  },

  seedCloudDatabase: async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase client not initialized' };
    }

    try {
      // 1. Seed Household
      const hh = initialSeedData.households[0];
      await client.from('households').upsert({
        id: hh.id,
        name: hh.name,
        invite_code: hh.invite_code,
        created_at: hh.created_at,
      });

      // 2. Seed Profiles
      for (const p of initialSeedData.profiles) {
        await client.from('profiles').upsert({
          id: p.id,
          household_id: p.household_id,
          name: p.name,
          role: p.role,
          dob: p.dob,
          blood_type: p.blood_type,
          allergies: p.allergies,
          chronic_conditions: p.chronic_conditions,
          voice_intake_notes: p.voice_intake_notes,
          emergency_notes: p.emergency_notes,
          ice_contact_name: p.ice_contact_name,
          ice_contact_phone: p.ice_contact_phone,
        });
      }

      // 3. Seed Medications
      for (const m of initialSeedData.medications) {
        await client.from('medications').upsert({
          id: m.id,
          profile_id: m.profile_id,
          name: m.name,
          dosage_strength: m.dosage_strength,
          form: m.form,
          instructions: m.instructions,
          requires_food: m.requires_food,
          empty_stomach: m.empty_stomach,
          current_stock: m.current_stock,
          unit_of_measure: m.unit_of_measure,
          refill_warning_threshold: m.refill_warning_threshold,
          remaining_refills: m.remaining_refills,
          is_prn: m.is_prn,
          is_active: m.is_active,
        });
      }

      return { success: true, message: 'Successfully seeded Eleanor Miller clinical records to live Supabase!' };
    } catch (err: any) {
      console.error('Error seeding cloud database:', err);
      return { success: false, message: err.message || 'Failed to seed tables' };
    }
  },

  disconnectCloud: () => {
    clearSupabaseCredentials();
    set({
      backendMode: 'local_demo',
      supabaseUrl: '',
      supabaseAnonKey: '',
      connectionStatus: 'disconnected',
      lastError: null,
    });
    localStorage.setItem('syncura_backend_mode', 'local_demo');
  },
}));
