import { create } from 'zustand';

export type SubscriptionTier = 'free_trial' | 'family_swarm' | 'care_concierge' | 'enterprise_agency' | 'lifetime_founder';
export type BillingCycle = 'monthly' | 'annual' | 'lifetime';
export type PaywallCategory = 'consumer' | 'enterprise';

interface BillingState {
  currentTier: SubscriptionTier;
  billingCycle: BillingCycle;
  paywallCategory: PaywallCategory;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  isPaywallOpen: boolean;
  hasLifetimeAccess: boolean;
  openPaywall: () => void;
  openEnterprisePaywall: () => void;
  closePaywall: () => void;
  setPaywallCategory: (category: PaywallCategory) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  upgradeTier: (tier: SubscriptionTier) => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  currentTier: 'free_trial',
  billingCycle: 'annual',
  paywallCategory: 'consumer',
  isTrialActive: true,
  trialDaysRemaining: 14,
  isPaywallOpen: false,
  hasLifetimeAccess: false,

  openPaywall: () => set({ isPaywallOpen: true, paywallCategory: 'consumer' }),
  openEnterprisePaywall: () => set({ isPaywallOpen: true, paywallCategory: 'enterprise' }),
  closePaywall: () => set({ isPaywallOpen: false }),

  setPaywallCategory: (category) => set({ paywallCategory: category }),
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
