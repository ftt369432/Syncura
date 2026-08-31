import React, { useState } from 'react';
import { Building2, Stethoscope, QrCode, ShieldCheck, MapPin, Clock, AlertTriangle, CheckCircle2, User, ChevronRight, Play, LogOut, FileText, Sparkles, Navigation } from 'lucide-react';
import { useEnterpriseStore } from '@/stores/useEnterpriseStore';
import { PatientCensusItem } from '@/types/enterprise';
import { WristbandScanModal } from './WristbandScanModal';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

export const AgencyRosterView: React.FC = () => {
  const {
    currentStaff,
    census,
    activeVisitSession,
    checkInPatient,
    checkOutPatient,
  } = useEnterpriseStore();

  const { setActiveProfile } = useHouseholdStore();

  const [selectedPatientForScan, setSelectedPatientForScan] = useState<PatientCensusItem | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [witnessName, setWitnessName] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleStartVisit = (patient: PatientCensusItem) => {
    checkInPatient(patient.id);
    setActiveProfile(patient.profile_id);
  };

  const handleOpenScan = (patient: PatientCensusItem) => {
    setSelectedPatientForScan(patient);
    setIsScanModalOpen(true);
  };

  const handleVerifiedScan = () => {
    if (selectedPatientForScan) {
      if (!activeVisitSession || activeVisitSession.patient_id !== selectedPatientForScan.id) {
        checkInPatient(selectedPatientForScan.id);
      }
      setActiveProfile(selectedPatientForScan.profile_id);
    }
  };

  const handleCompleteCheckout = () => {
    checkOutPatient(checkoutNotes.trim() || 'Routine med pass and vitals verification completed.', witnessName.trim() || undefined);
    setIsCheckingOut(false);
    setCheckoutNotes('');
    setWitnessName('');
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      {/* Enterprise Agency Header */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentStaff.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
              alt={currentStaff.name}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-brand-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">{currentStaff.name}</h3>
                <span className="text-[10px] font-bold uppercase bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded border border-brand-500/30">
                  {currentStaff.badge_number}
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentStaff.agency_name}</p>
            </div>
          </div>

          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="On Shift & Active" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>License: <strong className="text-slate-200">{currentStaff.license_number}</strong></span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Navigation className="w-3 h-3" /> EVV GPS Billing Active
          </span>
        </div>
      </div>

      {/* Active Visit Banner / Check-Out Station */}
      {activeVisitSession && (
        <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-500 to-teal-400 text-slate-950 space-y-3 shadow-xl shadow-brand-500/20 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider">Active Patient Visit In Progress</span>
            </div>
            <span className="text-[11px] font-bold font-mono bg-slate-950/20 px-2 py-0.5 rounded">
              EVV Verified
            </span>
          </div>

          <div>
            <h4 className="text-xl font-black">{activeVisitSession.patient_name}</h4>
            <p className="text-xs font-semibold opacity-90">
              Checked in at {new Date(activeVisitSession.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • GPS: 33.9533° N, 117.3961° W
            </p>
          </div>

          {!isCheckingOut ? (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsCheckingOut(true)}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-950 text-white hover:bg-slate-900 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                Complete Visit & EVV Check-Out
              </button>
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl text-slate-900 dark:text-white space-y-3 shadow-lg">
              <h5 className="text-xs font-bold uppercase tracking-wider">Clinical Visit Signoff</h5>
              <textarea
                placeholder="Enter nursing encounter notes (e.g. Meds administered, wound care, vitals confirmed)..."
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <input
                type="text"
                placeholder="Dual-Witness RN Name (Optional for Schedule II narcotics)..."
                value={witnessName}
                onChange={(e) => setWitnessName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteCheckout}
                  className="flex-1 py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Submit Encrypted EVV Signature
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patient Census & eMAR Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
            Agency Patient Census ({census.length} Residents / Visits)
          </h3>
          <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
            Shift Med Pass Due
          </span>
        </div>

        <div className="space-y-3">
          {census.map((pat) => {
            const isCurrentlyVisited = activeVisitSession?.patient_id === pat.id;

            return (
              <div
                key={pat.id}
                className={`p-4 rounded-3xl border transition space-y-3 shadow-sm ${
                  isCurrentlyVisited
                    ? 'bg-brand-50/80 dark:bg-brand-950/30 border-brand-500/60 ring-2 ring-brand-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{pat.name}</h4>
                      {pat.dnr_dni_status && (
                        <span className="text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">
                          DNR / DNI
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{pat.room_or_address}</p>
                  </div>

                  <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {pat.wristband_barcode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Med Pass Queue</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{pat.pending_meds_count} meds pending</p>
                    <p className="text-[10px] text-slate-500">{pat.next_dose_due}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Vitals Status</span>
                    <p className={`font-bold mt-0.5 ${
                      pat.vitals_status === 'needs_bp_check' || pat.vitals_status === 'abnormal_glucose'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {pat.vitals_status === 'needs_bp_check' && '⚠️ BP Check Due'}
                      {pat.vitals_status === 'abnormal_glucose' && '⚡ CGM Variance'}
                      {pat.vitals_status === 'stable' && '✓ Vitals Stable'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleOpenScan(pat)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <QrCode className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    5-Rights Wristband Scan
                  </button>

                  <button
                    onClick={() => handleStartVisit(pat)}
                    className="py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Open Chart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Rights Wristband Scanner Modal */}
      <WristbandScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        patient={selectedPatientForScan}
        onVerified={handleVerifiedScan}
      />
    </div>
  );
};
