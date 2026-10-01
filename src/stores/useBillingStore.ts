import { create } from 'zustand';
import { RevenueCatService, SyncuraPackageType } from '@/services/revenuecatService';

export type SubscriptionTier =
  | 'free_trial'
  | 'family_swarm'
  | 'care_concierge'
  | 'enterprise_agency'
  | 'lifetime_founder';

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
  activeEntitlements: string[];
  isRevenueCatReady: boolean;

  openPaywall: () => void;
  openEnterprisePaywall: () => void;
  closePaywall: () => void;
  setPaywallCategory: (category: PaywallCategory) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  upgradeTier: (tier: SubscriptionTier) => void;
  initializeRevenueCat: (userId?: string) => Promise<void>;
  purchaseViaRevenueCat: (pkg: SyncuraPackageType) => Promise<{ success: boolean; message: string }>;
  redeemJudgePromoCode: (code: string) => { valid: boolean; message: string };
  restorePurchases: () => Promise<boolean>;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  currentTier: 'free_trial',
  billingCycle: 'annual',
  paywallCategory: 'consumer',
  isTrialActive: true,
  trialDaysRemaining: 14,
  isPaywallOpen: false,
  hasLifetimeAccess: false,
  activeEntitlements: [],
  isRevenueCatReady: false,

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

  initializeRevenueCat: async (userId?: string) => {
    await RevenueCatService.initialize(userId);
    const state = RevenueCatService.getCachedState();
    
    let activeTier: SubscriptionTier = get().currentTier;
    if (state.isAgency) activeTier = 'enterprise_agency';
    else if (state.isLifetime) activeTier = 'lifetime_founder';
    else if (state.isPro) activeTier = 'family_swarm';

    set({
      isRevenueCatReady: true,
      activeEntitlements: state.activeEntitlements,
      currentTier: activeTier,
      hasLifetimeAccess: state.isLifetime,
      isTrialActive: !state.isPro && !state.isAgency && !state.isLifetime,
    });
  },

  purchaseViaRevenueCat: async (pkg: SyncuraPackageType) => {
    const result = await RevenueCatService.purchasePackage(pkg);
    if (result.success) {
      get().upgradeTier(result.tier);
      set({
        activeEntitlements: RevenueCatService.getCachedState().activeEntitlements,
      });
    }
    return { success: result.success, message: result.message };
  },

  redeemJudgePromoCode: (code: string) => {
    const res = RevenueCatService.redeemJudgeCode(code);
    if (res.valid && res.tier) {
      get().upgradeTier(res.tier);
      set({
        activeEntitlements: RevenueCatService.getCachedState().activeEntitlements,
      });
    }
    return { valid: res.valid, message: res.message };
  },

  restorePurchases: async () => {
    const res = await RevenueCatService.restorePurchases();
    if (res.success) {
      const state = RevenueCatService.getCachedState();
      let activeTier: SubscriptionTier = 'family_swarm';
      if (state.isAgency) activeTier = 'enterprise_agency';
      else if (state.isLifetime) activeTier = 'lifetime_founder';

      get().upgradeTier(activeTier);
      set({ activeEntitlements: res.activeEntitlements });
      return true;
    }
    return false;
  },
}));
