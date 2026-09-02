import { create } from 'zustand';
import { Profile, Household, FamilyMessage, VoiceIntakeNote } from '@/types';
import { initialSeedData } from '@/data/seedData';

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

export const useHouseholdStore = create<HouseholdState>((set) => ({
  household: initialSeedData.households[0],
  profiles: initialSeedData.profiles,
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
    set((state) => ({
      profiles: [...state.profiles, newProfile],
    }));
  },

  updateProfile: (profileId, updates) => {
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === profileId ? { ...p, ...updates } : p
      ),
    }));
  },

  toggleAllergy: (profileId, allergy) => {
    set((state) => ({
      profiles: state.profiles.map((p) => {
        if (p.id !== profileId) return p;
        const current = p.allergies || [];
        const exists = current.some((a) => a.toLowerCase().trim() === allergy.toLowerCase().trim());
        const updated = exists
          ? current.filter((a) => a.toLowerCase().trim() !== allergy.toLowerCase().trim())
          : [...current, allergy];
        return { ...p, allergies: updated };
      }),
    }));
  },

  toggleChronicCondition: (profileId, condition) => {
    set((state) => ({
      profiles: state.profiles.map((p) => {
        if (p.id !== profileId) return p;
        const current = p.chronic_conditions || [];
        const exists = current.some((c) => c.toLowerCase().trim() === condition.toLowerCase().trim());
        const updated = exists
          ? current.filter((c) => c.toLowerCase().trim() !== condition.toLowerCase().trim())
          : [...current, condition];
        return { ...p, chronic_conditions: updated };
      }),
    }));
  },

  addVoiceIntakeNote: (profileId, note) => {
    set((state) => ({
      profiles: state.profiles.map((p) => {
        if (p.id !== profileId) return p;
        const currentNotes = p.voice_intake_notes || [];
        return {
          ...p,
          voice_intake_notes: [note, ...currentNotes],
        };
      }),
    }));
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
  },

  setHousehold: (household: Household) => {
    set({ household });
  },
}));
