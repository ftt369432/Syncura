import { create } from 'zustand';
import { Profile, Household, FamilyMessage, VoiceIntakeNote } from '@/types';
import { initialSeedData } from '@/data/seedData';
import { getSupabaseClient } from '@/lib/supabaseClient';

interface HouseholdState {
  household: Household | null;
  profiles: Profile[];
  activeProfileId: string | null;
  messages: FamilyMessage[];
  setActiveProfile: (profileId: string) => void;
  addProfile: (profile: Omit<Profile, 'id' | 'created_at'>) => void;
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
  toggleAllergy: (profileId: string, allergy: string) => void;
  toggleChronicCondition: (profileId: string, condition: string) => void;
  addVoiceIntakeNote: (profileId: string, note: VoiceIntakeNote) => void;
  postFamilyMessage: (message: Omit<FamilyMessage, 'id' | 'created_at'>) => void;
  setHousehold: (household: Household) => void;
}

const loadInitialProfiles = (): Profile[] => {
  try {
    const raw = localStorage.getItem('syncura_profiles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // fallback to initial seed
  }
  return initialSeedData.profiles;
};

const persistProfiles = (profiles: Profile[]) => {
  try {
    localStorage.setItem('syncura_profiles', JSON.stringify(profiles));
  } catch (e) {
    console.warn('LocalStorage profile persist warning:', e);
  }
};

const syncProfileToCloud = async (profileId: string, updates: Partial<Profile>) => {
  try {
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);
      if (error) console.warn('Supabase cloud profile sync notice:', error.message);
    }
  } catch (e) {
    // offline safe
  }
};

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  household: initialSeedData.households[0],
  profiles: loadInitialProfiles(),
  activeProfileId: 'prof-mom',
  messages: initialSeedData.familyMessages,

  setActiveProfile: (profileId: string) => {
    set({ activeProfileId: profileId });
  },

  addProfile: (profileData) => {
    const newProfile: Profile = {
      ...profileData,
      id: `prof-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => {
      const updated = [...state.profiles, newProfile];
      persistProfiles(updated);
      return { profiles: updated };
    });

    // Cloud push
    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('profiles').insert([newProfile]).then(() => {});
      }
    } catch (e) {}
  },

  updateProfile: (profileId, updates) => {
    set((state) => {
      const updated = state.profiles.map((p) =>
        p.id === profileId ? { ...p, ...updates } : p
      );
      persistProfiles(updated);
      return { profiles: updated };
    });

    syncProfileToCloud(profileId, updates);
  },

  toggleAllergy: (profileId, allergy) => {
    let updatedAllergies: string[] = [];
    set((state) => {
      const updated = state.profiles.map((p) => {
        if (p.id !== profileId) return p;
        const current = p.allergies || [];
        const exists = current.some((a) => a.toLowerCase().trim() === allergy.toLowerCase().trim());
        const list = exists
          ? current.filter((a) => a.toLowerCase().trim() !== allergy.toLowerCase().trim())
          : [...current, allergy];
        updatedAllergies = list;
        return { ...p, allergies: list };
      });
      persistProfiles(updated);
      return { profiles: updated };
    });

    syncProfileToCloud(profileId, { allergies: updatedAllergies });
  },

  toggleChronicCondition: (profileId, condition) => {
    let updatedConditions: string[] = [];
    set((state) => {
      const updated = state.profiles.map((p) => {
        if (p.id !== profileId) return p;
        const current = p.chronic_conditions || [];
        const exists = current.some((c) => c.toLowerCase().trim() === condition.toLowerCase().trim());
        const list = exists
          ? current.filter((c) => c.toLowerCase().trim() !== condition.toLowerCase().trim())
          : [...current, condition];
        updatedConditions = list;
        return { ...p, chronic_conditions: list };
      });
      persistProfiles(updated);
      return { profiles: updated };
    });

    syncProfileToCloud(profileId, { chronic_conditions: updatedConditions });
  },

  addVoiceIntakeNote: (profileId, note) => {
    let updatedNotes: VoiceIntakeNote[] = [];
    set((state) => {
      const updated = state.profiles.map((p) => {
        if (p.id !== profileId) return p;
        const currentNotes = p.voice_intake_notes || [];
        const list = [note, ...currentNotes];
        updatedNotes = list;
        return {
          ...p,
          voice_intake_notes: list,
        };
      });
      persistProfiles(updated);
      return { profiles: updated };
    });

    syncProfileToCloud(profileId, { voice_intake_notes: updatedNotes });
  },

  postFamilyMessage: (messageData) => {
    const newMessage: FamilyMessage = {
      ...messageData,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      messages: [newMessage, ...state.messages],
    }));

    try {
      const client = getSupabaseClient();
      if (client) {
        client.from('family_messages').insert([newMessage]).then(() => {});
      }
    } catch (e) {}
  },

  setHousehold: (household: Household) => {
    set({ household });
  },
}));
