import { create } from 'zustand';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useHouseholdStore } from './useHouseholdStore';
import { useMedicationStore } from './useMedicationStore';
import { useRegimenStore } from './useRegimenStore';
import { useAlertsStore } from './useAlertsStore';

export type UserAccountRole = 'family_admin' | 'family_caregiver' | 'senior_patient' | 'enterprise_nurse';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserAccountRole;
  licenseNumber?: string;
  avatarUrl?: string;
  linkedHouseholdIds: string[];
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserSession | null;
  isLoading: boolean;
  error: string | null;
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  signupWithCredentials: (data: {
    email: string;
    fullName: string;
    role: UserAccountRole;
    licenseNumber?: string;
    password?: string;
  }) => Promise<boolean>;
  loginAsDemoPersona: (persona: 'david_caregiver' | 'eleanor_senior' | 'marcus_nurse') => void;
  logout: () => void;
  linkHouseholdToUser: (householdId: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: true, // Default to demo session for instant testing
  currentUser: {
    id: 'user-david-101',
    email: 'david.miller@pinnacle.com',
    fullName: 'David Miller',
    role: 'family_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    linkedHouseholdIds: ['hh-101'],
    createdAt: new Date().toISOString(),
  },
  isLoading: false,
  error: null,
  isOnboardingOpen: false,

  openOnboarding: () => set({ isOnboardingOpen: true }),
  closeOnboarding: () => set({ isOnboardingOpen: false }),

  loginWithEmail: async (email: string, password?: string) => {
    set({ isLoading: true, error: null });
    const supabase = getSupabaseClient();

    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          const session: UserSession = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
            role: data.user.user_metadata?.role || 'family_admin',
            licenseNumber: data.user.user_metadata?.license_number,
            linkedHouseholdIds: ['hh-101'],
            createdAt: data.user.created_at,
          };
          set({ isAuthenticated: true, currentUser: session, isLoading: false });
          return true;
        }
      } catch (err: any) {
        console.warn('Supabase auth sign in error, fallback to local:', err.message);
      }
    }

    // Local fallback matching demo personas or generic user
    let session: UserSession;
    if (email.toLowerCase().includes('david')) {
      session = {
        id: 'user-david-101',
        email,
        fullName: 'David Miller (Caregiver Son)',
        role: 'family_admin',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        linkedHouseholdIds: ['hh-101'],
        createdAt: new Date().toISOString(),
      };
      useHouseholdStore.getState().loadDemoHousehold();
      useMedicationStore.getState().loadDemoMedications();
      useRegimenStore.getState().loadDemoRegimen();
      useAlertsStore.getState().loadDemoAlerts();
    } else {
      session = {
        id: `user-${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        role: 'family_admin',
        linkedHouseholdIds: ['hh-101'],
        createdAt: new Date().toISOString(),
      };
    }

    set({ isAuthenticated: true, currentUser: session, isLoading: false });
    return true;
  },

  signupWithCredentials: async (data) => {
    set({ isLoading: true, error: null });
    const supabase = getSupabaseClient();

    // 1. Initialize fresh, clean stores for this new user
    useHouseholdStore.getState().initializeCleanHousehold(
      data.fullName,
      data.role === 'senior_patient' ? 'primary_admin' : 'primary_admin'
    );
    useMedicationStore.getState().resetToEmpty();
    useRegimenStore.getState().resetToEmpty();
    useAlertsStore.getState().resetToEmpty();

    const newHouseholdId = useHouseholdStore.getState().household?.id || 'hh-101';

    if (supabase && data.password) {
      try {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: data.role,
              license_number: data.licenseNumber,
            },
          },
        });

        if (error) throw error;

        if (authData.user) {
          const session: UserSession = {
            id: authData.user.id,
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            licenseNumber: data.licenseNumber,
            linkedHouseholdIds: [newHouseholdId],
            createdAt: new Date().toISOString(),
          };
          set({ isAuthenticated: true, currentUser: session, isLoading: false, isOnboardingOpen: true });
          return true;
        }
      } catch (err: any) {
        console.warn('Supabase sign up error, using fallback:', err.message);
      }
    }

    // Local fallback signup
    const session: UserSession = {
      id: `user-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      licenseNumber: data.licenseNumber,
      linkedHouseholdIds: [newHouseholdId],
      createdAt: new Date().toISOString(),
    };
    set({ isAuthenticated: true, currentUser: session, isLoading: false, isOnboardingOpen: true });
    return true;
  },

  loginAsDemoPersona: (persona) => {
    if (persona === 'david_caregiver') {
      set({
        isAuthenticated: true,
        currentUser: {
          id: 'user-david-101',
          email: 'david.miller@pinnacle.com',
          fullName: 'David Miller (Caregiver Son)',
          role: 'family_admin',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          linkedHouseholdIds: ['hh-101'],
          createdAt: new Date().toISOString(),
        },
        isOnboardingOpen: false,
      });
      useHouseholdStore.getState().loadDemoHousehold();
      useMedicationStore.getState().loadDemoMedications();
      useRegimenStore.getState().loadDemoRegimen();
      useAlertsStore.getState().loadDemoAlerts();
    } else if (persona === 'eleanor_senior') {
      set({
        isAuthenticated: true,
        currentUser: {
          id: 'user-eleanor-52',
          email: 'eleanor.miller52@gmail.com',
          fullName: 'Eleanor Miller (Patient)',
          role: 'senior_patient',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          linkedHouseholdIds: ['hh-101'],
          createdAt: new Date().toISOString(),
        },
        isOnboardingOpen: false,
      });
      useHouseholdStore.getState().loadDemoHousehold();
      useMedicationStore.getState().loadDemoMedications();
      useRegimenStore.getState().loadDemoRegimen();
      useAlertsStore.getState().loadDemoAlerts();
    } else if (persona === 'marcus_nurse') {
      set({
        isAuthenticated: true,
        currentUser: {
          id: 'staff-1',
          email: 'marcus.rivera.rn@pinnaclehealth.org',
          fullName: 'Marcus Rivera, RN, BSN',
          role: 'enterprise_nurse',
          licenseNumber: 'RN-CA-994820',
          avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
          linkedHouseholdIds: ['hh-101'],
          createdAt: new Date().toISOString(),
        },
        isOnboardingOpen: false,
      });
      useHouseholdStore.getState().loadDemoHousehold();
      useMedicationStore.getState().loadDemoMedications();
      useRegimenStore.getState().loadDemoRegimen();
      useAlertsStore.getState().loadDemoAlerts();
    }
  },

  logout: () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    set({ isAuthenticated: false, currentUser: null, isOnboardingOpen: false });
  },

  linkHouseholdToUser: (householdId) => {
    set((state) => {
      if (!state.currentUser) return state;
      const ids = state.currentUser.linkedHouseholdIds.includes(householdId)
        ? state.currentUser.linkedHouseholdIds
        : [...state.currentUser.linkedHouseholdIds, householdId];
      return {
        currentUser: {
          ...state.currentUser,
          linkedHouseholdIds: ids,
        },
      };
    });
  },
}));
