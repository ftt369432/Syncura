import { create } from 'zustand';
import { Profile, Household, FamilyMessage } from '@/types';
import { initialSeedData } from '@/data/seedData';

interface HouseholdState {
  household: Household | null;
  profiles: Profile[];
  activeProfileId: string | null;
  messages: FamilyMessage[];
  setActiveProfile: (profileId: string) => void;
  addProfile: (profile: Omit<Profile, 'id' | 'created_at'>) => void;
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
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
