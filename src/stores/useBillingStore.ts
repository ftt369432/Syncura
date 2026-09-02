import { create } from 'zustand';

export type SubscriptionTier = 'free_trial' | 'family_swarm' | 'care_concierge' | 'enterprise_agency' | 'lifetime_founder';
export type BillingCycle = 'monthly' | 'annual' | 'lifetime';

interface BillingState {
  currentTier: SubscriptionTier;
  billingCycle: BillingCycle;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  isPaywallOpen: boolean;
  hasLifetimeAccess: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  upgradeTier: (tier: SubscriptionTier) => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  currentTier: 'free_trial',
  billingCycle: 'annual',
  isTrialActive: true,
  trialDaysRemaining: 14,
  isPaywallOpen: false,
  hasLifetimeAccess: false,

  openPaywall: () => set({ isPaywallOpen: true }),
  closePaywall: () => set({ isPaywallOpen: false }),

  setBillingCycle: (cycle) => set({ billingCycle: cycle }),

  upgradeTier: (tier) => {
    set({
      currentTier: tier,
      isTrialActive: false,
      isPaywallOpen: false,
      hasLifetimeAccess: tier === 'lifetime_founder',
    });
  },
}));
