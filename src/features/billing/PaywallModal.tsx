import React, { useState } from 'react';
import { Shield, Sparkles, Check, X, CreditCard, ArrowRight, Star, HeartHandshake, Building2, Lock, Zap, Gift, Crown, Clock, AlertTriangle, UserCheck, Stethoscope } from 'lucide-react';
import { useBillingStore, SubscriptionTier, BillingCycle, PaywallCategory } from '@/stores/useBillingStore';

export const PaywallModal: React.FC = () => {
  const {
    isPaywallOpen,
    closePaywall,
    upgradeTier,
    billingCycle,
    setBillingCycle,
    paywallCategory,
    setPaywallCategory,
  } = useBillingStore();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('family_swarm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [facilityNpi, setFacilityNpi] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay'>('card');

  if (!isPaywallOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      let tierToSet: SubscriptionTier = selectedPlan;
      if (paywallCategory === 'enterprise') {
        tierToSet = 'enterprise_agency';
      } else if (billingCycle === 'lifetime') {
        tierToSet = 'lifetime_founder';
      }

      upgradeTier(tierToSet);
      setIsProcessing(false);
      setSuccessNotice(
        paywallCategory === 'enterprise'
          ? '🏢 Enterprise Agency eMAR & EVV license activated! Commercial census unlocked.'
          : billingCycle === 'lifetime'
          ? '🎉 Welcome Founding Member! You now have Lifetime VIP access to Syncura.'
          : '✓ 14-Day Free Trial activated! Your family is protected with Syncura.'
      );
      setTimeout(() => {
        setSuccessNotice(null);
        closePaywall();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-brand-500/20">
              {paywallCategory === 'enterprise' ? <Building2 className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                {paywallCategory === 'enterprise' ? 'Commercial Healthcare & Agency Licensing' : 'Choose Your Syncura Plan'}
                <span className="text-[10px] uppercase font-black bg-brand-500/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
                  {paywallCategory === 'enterprise' ? 'B2B eMAR' : 'Risk-Free'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {paywallCategory === 'enterprise'
                  ? 'CMS-Compliant EVV, Multi-Resident Census & State Audit Logs'
                  : '14-Day Free Trial or Founding Member Lifetime Pass'}
              </p>
            </div>
          </div>
          <button onClick={closePaywall} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commercial vs Domestic Bracket Switcher */}
        <div className="px-6 pt-4">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-1 text-center font-bold text-xs">
            <button
              type="button"
              onClick={() => {
                setPaywallCategory('consumer');
                setSelectedPlan('family_swarm');
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                paywallCategory === 'consumer'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>👨‍👩‍👧‍👦 Personal & Family</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPaywallCategory('enterprise');
                setSelectedPlan('enterprise_agency');
              }}
              className={`py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                paywallCategory === 'enterprise'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>🏢 Health Organization ($199)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs">
          {successNotice && (
            <div className="p-4 rounded-2xl bg-brand-500 text-slate-950 font-black flex items-center gap-2.5 shadow-lg animate-fadeIn">
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* BRACKET A: HEALTHCARE AGENCIES & COMMERCIAL ORGANIZATIONS     */}
          {/* ============================================================ */}
          {paywallCategory === 'enterprise' ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Anti-Freeloading Hardwall Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h5 className="font-black text-xs">Commercial Healthcare Entity License Policy</h5>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    Consumer free trials and Lifetime Founder coupons are strictly prohibited for commercial use. Health organizations, home health agencies, assisted living facilities, and nurse staffing registries are legally required to maintain an active Enterprise eMAR license.
                  </p>
                </div>
              </div>

              {/* Enterprise Plan Card */}
              <div className="p-5 rounded-3xl border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 space-y-3.5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Building2 className="w-3 h-3" /> Certified Agency Bracket
                    </span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">Enterprise Agency eMAR & EVV</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Unlimited patient census, nurse med pass & state compliance</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">$199</span>
                    <span className="text-[11px] text-slate-500 font-semibold"> / month</span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">+ $15 / active nurse seat</p>
                  </div>
                </div>

                <ul className="space-y-2 pt-1 text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>CMS Electronic Visit Verification (EVV) with GPS Geofencing</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>5-Rights Barcode Wristband Scanner</strong> (Patient ID safety lock)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Multi-Resident Shift Census Roster</strong> (Unlimited beds & homes)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Schedule II Narcotic Dual-Witness Sign-Off</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Signed HIPAA Business Associate Agreement (BAA)</strong></span>
                  </li>
                </ul>
              </div>

              {/* Organization Verification Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Agency / Facility Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pinnacle Home Health LLC"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Facility NPI or State License #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NPI-194820194"
                    value={facilityNpi}
                    onChange={(e) => setFacilityNpi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* BRACKET B: DOMESTIC FAMILY & PERSONAL CARE                    */
            /* ============================================================ */
            <div className="space-y-4 animate-fadeIn">
              {/* Domestic Non-Commercial Notice */}
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-500 shrink-0" />
                <span><strong>Domestic Non-Commercial License:</strong> For families caring for up to 5 relatives. Commercial agencies require the Agency Bracket.</span>
              </div>

              {/* Billing Interval Toggle (Monthly / Annual / Lifetime) */}
              <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-1 text-center font-bold">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`py-2 px-1 rounded-xl transition ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Monthly ($9.99)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`py-2 px-1 rounded-xl transition flex flex-col items-center justify-center relative ${
                    billingCycle === 'annual'
                      ? 'bg-brand-500 text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Annual ($89/yr)</span>
                  <span className="text-[9px] font-black uppercase tracking-tight opacity-90">Save 26%</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle('lifetime');
                    setSelectedPlan('lifetime_founder');
                  }}
                  className={`py-2 px-1 rounded-xl transition flex flex-col items-center justify-center relative ${
                    billingCycle === 'lifetime'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md ring-2 ring-amber-400/40'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3 fill-current" /> Lifetime
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-tight opacity-90">$149 Once</span>
                </button>
              </div>

              {/* Lifetime Pass or Monthly/Annual */}
              {billingCycle === 'lifetime' ? (
                <div className="p-5 rounded-3xl border-2 border-amber-500 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent space-y-3.5 shadow-sm ring-2 ring-amber-500/20 animate-fadeIn">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-current" /> Early-Bird Founder's Pass (First 250 Families)
                      </span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1">Pay Once, Protect Forever</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Domestic family license • Zero monthly subscription fees</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-amber-600 dark:text-amber-400">$149</div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">One-Time Fee</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 pt-1 text-slate-700 dark:text-slate-200">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Permanent Family Vault for up to 5 family members</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Permanent Access to AI Health Advocate & Voice Intake</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>All Future Consumer Updates Included</strong></span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Plan 1: Family Swarm */}
                  <div
                    onClick={() => setSelectedPlan('family_swarm')}
                    className={`p-4 md:p-5 rounded-3xl border-2 cursor-pointer transition space-y-2.5 relative shadow-sm ${
                      selectedPlan === 'family_swarm'
                        ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                          Most Popular For Families
                        </span>
                        <h4 className="text-base md:text-lg font-black text-slate-900 dark:text-white">Family Swarm Care</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Complete coordination for aging parents & siblings</p>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {billingCycle === 'annual' ? '$89' : '$9.99'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          {billingCycle === 'annual' ? ' / year' : ' / month'}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 pt-1 text-slate-700 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-brand-500 shrink-0" />
                        <span><strong>14-Day Free Trial</strong> (Cancel anytime with 1 tap)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-brand-500 shrink-0" />
                        <span><strong>Bottle Label OCR & Clinical Allergy Shield</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Payment Method / Credit Card Form */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-500" />
                Payment Method
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                <Lock className="w-3 h-3 text-emerald-500" /> 256-Bit SSL Encrypted
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  paymentMethod === 'card'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Credit / Debit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`py-2 px-3 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                  paymentMethod === 'apple_pay'
                    ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span> Pay / G Pay</span>
              </button>
            </div>

            {/* Credit Card Input Fields */}
            {paymentMethod === 'card' ? (
              <div className="space-y-2.5 pt-1">
                <div>
                  <input
                    type="text"
                    placeholder="Cardholder Full Name"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Card Number (0000 0000 0000 0000)"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-mono font-medium focus:outline-none focus:border-brand-500 tracking-wider"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-mono font-medium focus:outline-none focus:border-brand-500 text-center"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="CVC / CVV"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-mono font-medium focus:outline-none focus:border-brand-500 text-center"
                  />
                </div>
              </div>
            ) : (
              <div className="py-3 text-center text-slate-500 space-y-1">
                <Zap className="w-5 h-5 text-brand-500 mx-auto fill-current" />
                <p className="font-bold text-slate-700 dark:text-slate-300 text-xs">Ready for Apple Pay / Google Pay</p>
                <p className="text-[10px]">1-Tap biometric authentication upon checkout.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Checkout Action */}
        <div className="p-5 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5">
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm md:text-base transition flex items-center justify-center gap-2 shadow-xl ${
              paywallCategory === 'enterprise'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
                : billingCycle === 'lifetime'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25'
                : 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-brand-500/25'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current animate-spin" /> Authorizing Payment...
              </span>
            ) : paywallCategory === 'enterprise' ? (
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Activate Enterprise Agency License ($199/mo)
              </span>
            ) : billingCycle === 'lifetime' ? (
              <span className="flex items-center gap-2">
                <Crown className="w-4 h-4 fill-current" /> Claim Lifetime Founder's Pass ($149)
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" />
                Start 14-Day Free Trial ({billingCycle === 'annual' ? '$89/yr' : '$9.99/mo'} after)
              </span>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-brand-500" /> Powered by Stripe • Terms of Service & Commercial Use Policies Apply
          </p>
        </div>
      </div>
    </div>
  );
};
