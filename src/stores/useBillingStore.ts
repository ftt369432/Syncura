import { create } from 'zustand';

export type SubscriptionTier = 'free_trial' | 'family_swarm' | 'care_concierge' | 'enterprise_agency';

interface BillingState {
  currentTier: SubscriptionTier;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  isPaywallOpen: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  upgradeTier: (tier: SubscriptionTier) => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  currentTier: 'free_trial',
  isTrialActive: true,
  trialDaysRemaining: 14,
  isPaywallOpen: false,

  openPaywall: () => set({ isPaywallOpen: true }),
  closePaywall: () => set({ isPaywallOpen: false }),

  upgradeTier: (tier) => {
    set({ currentTier: tier, isTrialActive: false, isPaywallOpen: false });
  },
}));
