import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, X, Check, Sparkles, AlertTriangle, Pill, Clock, Utensils, 
  ShieldCheck, AlertOctagon, ShieldAlert, PhoneCall, Mic, RefreshCw, 
  ChevronRight, Info, AlertCircle
} from 'lucide-react';
import { RxNormService, RxNormDrugMatch } from '@/services/rxNormService';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useClinicalMemoryStore } from '@/services/clinicalMemoryStore';
import { useAlertsStore } from '@/stores/useAlertsStore';
import { ClinicalInteractionEngine, ClinicalSafetyFinding, NewMedSafetyReport } from '@/services/clinicalInteractionEngine';
import { AutoMedReviewModal } from '../medications/AutoMedReviewModal';
import { QuickAllergyConditionIntakeModal } from '../household/QuickAllergyConditionIntakeModal';
import { Medication } from '@/types';

interface BottleScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BottleScannerModal: React.FC<BottleScannerModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [parsedData, setParsedData] = useState<{
    name: string;
    dosage_strength: string;
    instructions: string;
    current_stock: number;
    remaining_refills: number;
    rx_number: string;
    pharmacy_name: string;
    requires_food: boolean;
    empty_stomach: boolean;
    frequency: string;
    rxNormMatches: RxNormDrugMatch[];
  } | null>(null);

  const [reviewMedication, setReviewMedication] = useState<Medication | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [intakeFocusTab, setIntakeFocusTab] = useState<'allergies' | 'conditions' | 'voice'>('allergies');

  const { profiles, activeProfileId } = useHouseholdStore();
  const { medications, addMedication } = useMedicationStore();
  const { getMemoryForProfile } = useClinicalMemoryStore();
  const { triggerSimulatedDangerousDrugAlert } = useAlertsStore();

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const memory = getMemoryForProfile(activeProfile.id);

  // Live real-time safety report recalculated on the fly
  const safetyReport: NewMedSafetyReport | null = parsedData
    ? ClinicalInteractionEngine.analyzeNewMedicationSafety(
        {
          name: parsedData.name,
          dosage_strength: parsedData.dosage_strength,
          requires_food: parsedData.requires_food,
          empty_stomach: parsedData.empty_stomach,
        },
        activeProfile,
        medications,
        memory
      )
    : null;

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setParsedData(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access unavailable:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleSimulateScan = async (drugType: 'metformin' | 'levothyroxine' | 'amoxicillin_danger' | 'advil_danger' | 'lisinopril_hist' = 'metformin') => {
    setIsScanning(true);

    setTimeout(async () => {
      if (drugType === 'amoxicillin_danger') {
        setParsedData({
          name: 'Amoxicillin',
          dosage_strength: '500 mg',
          instructions: 'Take 1 capsule three times daily for 10 days for infection.',
          current_stock: 30,
          remaining_refills: 0,
          rx_number: 'RX-9948210',
          pharmacy_name: 'CVS Pharmacy #4820',
          requires_food: false,
          empty_stomach: false,
          frequency: 'three_times_daily',
          rxNormMatches: [{ rxcui: '70618', name: 'Amoxicillin 500 MG Oral Capsule', synonym: 'Amoxil' }],
        });
        triggerSimulatedDangerousDrugAlert();
      } else if (drugType === 'advil_danger') {
        setParsedData({
          name: 'Ibuprofen (Advil)',
          dosage_strength: '400 mg',
          instructions: 'Take 1 tablet every 6 hours as needed for joint pain.',
          current_stock: 50,
          remaining_refills: 1,
          rx_number: 'RX-1294812',
          pharmacy_name: 'Walgreens Pharmacy #1042',
          requires_food: true,
          empty_stomach: false,
          frequency: 'prn_pain',
          rxNormMatches: [{ rxcui: '5640', name: 'Ibuprofen 400 MG Oral Tablet', synonym: 'Advil' }],
        });
        triggerSimulatedDangerousDrugAlert();
      } else if (drugType === 'lisinopril_hist') {
        setParsedData({
          name: 'Lisinopril',
          dosage_strength: '10 mg',
          instructions: 'Take 1 tablet daily in the morning for blood pressure.',
          current_stock: 30,
          remaining_refills: 3,
          rx_number: 'RX-8841293',
          pharmacy_name: 'CVS Pharmacy #4820',
          requires_food: false,
          empty_stomach: false,
          frequency: 'once_daily_morning',
          rxNormMatches: [{ rxcui: '29046', name: 'Lisinopril 10 MG Oral Tablet', synonym: 'Prinivil' }],
        });
      } else if (drugType === 'levothyroxine') {
        setParsedData({
          name: 'Levothyroxine',
          dosage_strength: '50 mcg',
          instructions: 'Take 1 tablet daily in the morning on an empty stomach with a full glass of water.',
          current_stock: 90,
          remaining_refills: 2,
          rx_number: 'RX-8849102',
          pharmacy_name: 'CVS Pharmacy #4820',
          requires_food: false,
          empty_stomach: true,
          frequency: 'once_daily_morning',
          rxNormMatches: [{ rxcui: '10582', name: 'Levothyroxine Sodium 0.05 MG Oral Tablet', synonym: 'Synthroid' }],
        });
      } else {
        setParsedData({
          name: 'Metformin',
          dosage_strength: '500 mg',
          instructions: 'Take 1 tablet twice daily with meals (morning and evening).',
          current_stock: 60,
          remaining_refills: 3,
          rx_number: 'RX-9482103',
          pharmacy_name: 'Walgreens Pharmacy #1042',
          requires_food: true,
          empty_stomach: false,
          frequency: 'twice_daily',
          rxNormMatches: [{ rxcui: '860975', name: 'Metformin hydrochloride 500 MG Oral Tablet', synonym: 'Glucophage' }],
        });
      }

      setIsScanning(false);
      stopCamera();
    }, 900);
  };

  const handleSaveToCabinet = (forceOverride = false) => {
    if (!parsedData || !activeProfileId) return;

    // If critical allergy or severe DDI exists and not forced, stop
    if (
      !forceOverride &&
      safetyReport &&
      (safetyReport.overallStatus === 'critical_allergy' || safetyReport.overallStatus === 'severe_ddi')
    ) {
      triggerSimulatedDangerousDrugAlert();
      return;
    }

    const tempMed: Medication = {
      id: `med-scan-${Date.now()}`,
      profile_id: activeProfileId,
      name: parsedData.name,
      dosage_strength: parsedData.dosage_strength,
      form: 'tablet',
      instructions: parsedData.instructions,
      requires_food: parsedData.requires_food,
      empty_stomach: parsedData.empty_stomach,
      pre_alert_offset_minutes: parsedData.requires_food ? 15 : 0,
      current_stock: parsedData.current_stock,
      unit_of_measure: 'tablets',
      refill_warning_threshold: 10,
      remaining_refills: parsedData.remaining_refills,
      rx_number: parsedData.rx_number,
      pharmacy_name: parsedData.pharmacy_name,
      rxcui: parsedData.rxNormMatches[0]?.rxcui,
      is_prn: false,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    addMedication(tempMed);
    setReviewMedication(tempMed);
  };

  if (!isOpen) return null;

  const hasCriticalConflict =
    safetyReport?.overallStatus === 'critical_allergy' ||
    safetyReport?.overallStatus === 'severe_ddi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Snap Pharmacy Bottle</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Live Drug Interaction, Allergen & Memory Screen
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Form */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {!parsedData ? (
            /* Camera Live View */
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-brand-500/50 m-4 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="bg-slate-900/90 text-brand-400 text-xs px-3 py-1 rounded-full border border-brand-500/40 font-bold shadow-lg">
                    Align Pharmacy Label
                  </div>
                </div>
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-brand-400 animate-spin" />
                    <p className="text-sm font-semibold text-white">
                      OCR Label Parsing & Clinical Matrix Screening...
                    </p>
                  </div>
                )}
              </div>

              {/* Simulation Testing Bar */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block px-1">
                  1-Tap Scenarios to Test Live Interaction & Memory Screening:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulateScan('metformin')}
                    disabled={isScanning}
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:border-brand-500 border border-slate-200 dark:border-slate-700 text-left transition shadow-sm"
                  >
                    <span className="font-bold text-slate-900 dark:text-white block">Metformin 500mg</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">🟢 Safe & Meal-Anchored</span>
                  </button>

                  <button
                    onClick={() => handleSimulateScan('levothyroxine')}
                    disabled={isScanning}
                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:border-brand-500 border border-slate-200 dark:border-slate-700 text-left transition shadow-sm"
                  >
                    <span className="font-bold text-slate-900 dark:text-white block">Levothyroxine 50mcg</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">🟡 Empty Stomach Guard</span>
                  </button>

                  <button
                    onClick={() => handleSimulateScan('amoxicillin_danger')}
                    disabled={isScanning}
                    className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:border-rose-500 border border-rose-200 dark:border-rose-500/40 text-left transition shadow-sm"
                  >
                    <span className="font-bold text-rose-900 dark:text-rose-200 block">Amoxicillin 500mg</span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">🚨 Penicillin Anaphylaxis Stop</span>
                  </button>

                  <button
                    onClick={() => handleSimulateScan('advil_danger')}
                    disabled={isScanning}
                    className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:border-rose-500 border border-rose-200 dark:border-rose-500/40 text-left transition shadow-sm"
                  >
                    <span className="font-bold text-rose-900 dark:text-rose-200 block">Advil / Ibuprofen 400mg</span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">⚡ Bleeding DDI with Eliquis</span>
                  </button>
                </div>

                <button
                  onClick={() => handleSimulateScan('lisinopril_hist')}
                  disabled={isScanning}
                  className="w-full p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 hover:border-amber-500 border border-amber-200 dark:border-amber-500/40 text-left transition shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">Lisinopril 10mg</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">
                      🛡️ Historical Memory Test: Discontinued in 2021 due to cough
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                </button>
              </div>
            </div>
          ) : (
            /* Scanned Medication View with Real-Time Safety & Allergen Screen */
            <div className="space-y-4 animate-fadeIn">
              {/* Drug Identification Card */}
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-brand-700 dark:text-brand-300">
                    Verified Pharmacy Concept
                  </span>
                  <span className="text-xs font-mono font-bold bg-brand-500/20 text-brand-800 dark:text-brand-300 px-2 py-0.5 rounded">
                    RxCUI: {parsedData.rxNormMatches[0]?.rxcui || '860975'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{parsedData.name}</h4>
                  <span className="text-base font-bold text-brand-600 dark:text-brand-400">{parsedData.dosage_strength}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium">{parsedData.instructions}</p>
              </div>

              {/* ========================================================================= */}
              {/* REAL-TIME SAFETY & INTERACTION REPORT CARD (POST-SCAN) */}
              {/* ========================================================================= */}
              {safetyReport && (
                <div className="space-y-2.5">
                  {/* Missing Intake Profile Warning Banner if Empty */}
                  {safetyReport.hasMissingSafetyProfile && (
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="font-bold text-amber-900 dark:text-amber-200">
                            No Allergies or Conditions Documented
                          </p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">
                            Add them in 5 seconds to ensure complete safety screening.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIntakeFocusTab('allergies');
                          setIsIntakeModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0"
                      >
                        Add 1-Tap
                      </button>
                    </div>
                  )}

                  {/* 1. Critical Allergy Alert Interceptor */}
                  {safetyReport.allergyFindings.length > 0 && (
                    <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 space-y-3 shadow-xl animate-fadeIn">
                      <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200">
                        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                          <AlertOctagon className="w-5 h-5 stroke-[3]" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm">{safetyReport.allergyFindings[0].title}</h4>
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
                            Cross-Referenced Against Profile Allergies
                          </span>
                        </div>
                      </div>

                      <p className="text-rose-950 dark:text-rose-100 font-medium leading-relaxed">
                        {safetyReport.allergyFindings[0].description}
                      </p>

                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-500/40 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                          Clinical Mandate
                        </span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {safetyReport.allergyFindings[0].clinical_recommendation}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <a
                          href="tel:(555) 825-3000"
                          className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition"
                        >
                          <PhoneCall className="w-4 h-4" />
                          Call Prescriber (Dr. Chen)
                        </a>

                        <button
                          onClick={() => {
                            setParsedData(null);
                            startCamera();
                          }}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          Cancel Scan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Severe Drug-Drug Interaction (DDI) */}
                  {safetyReport.ddiFindings.length > 0 && (
                    <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 space-y-3 shadow-xl animate-fadeIn">
                      <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200">
                        <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
                          <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm">{safetyReport.ddiFindings[0].title}</h4>
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
                            Active Cabinet Interaction Interceptor
                          </span>
                        </div>
                      </div>

                      <p className="text-rose-950 dark:text-rose-100 font-medium leading-relaxed">
                        {safetyReport.ddiFindings[0].description}
                      </p>

                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-500/40">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {safetyReport.ddiFindings[0].clinical_recommendation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 3. Historical Persistent Memory Warning (Discontinued/Intolerant) */}
                  {safetyReport.historicalFindings.length > 0 && (
                    <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-500 space-y-2 shadow-md animate-fadeIn">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <h4 className="font-black text-sm">{safetyReport.historicalFindings[0].title}</h4>
                      </div>
                      <p className="text-amber-950 dark:text-amber-100 font-medium">
                        {safetyReport.historicalFindings[0].description}
                      </p>
                      <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-500/40 text-[11px] font-bold text-slate-900 dark:text-white">
                        Memory Rule: {safetyReport.historicalFindings[0].clinical_recommendation}
                      </div>
                    </div>
                  )}

                  {/* 4. Chronic Condition / Timing Notice */}
                  {safetyReport.conditionFindings.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/40 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                        <Info className="w-4 h-4" />
                        {safetyReport.conditionFindings[0].title}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        {safetyReport.conditionFindings[0].description}
                      </p>
                    </div>
                  )}

                  {/* 5. Safe All-Clear Badge */}
                  {!hasCriticalConflict && safetyReport.historicalFindings.length === 0 && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-1">
                      <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Live Safety Shield: All Clear
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        Cross-referenced against {safetyReport.checkedAllergiesCount} profile allergies,{' '}
                        {safetyReport.checkedMedsCount} active prescriptions, and{' '}
                        {safetyReport.checkedConditionsCount} chronic baselines.
                      </p>
                    </div>
                  )}

                  {/* Quick Tabs / Voice Update Shortcut Button */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-brand-500" />
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        Need to update {activeProfile.name.split(' ')[0]}'s allergies or medical conditions?
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIntakeFocusTab('allergies');
                        setIsIntakeModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition"
                    >
                      <Mic className="w-3 h-3" />
                      1-Tap / Voice Intake
                    </button>
                  </div>
                </div>
              )}

              {/* Medication Details Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total Count</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{parsedData.current_stock} Tablets</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Refills Left</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{parsedData.remaining_refills} Refills</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setParsedData(null);
                    startCamera();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Rescan Bottle
                </button>

                {hasCriticalConflict ? (
                  <button
                    onClick={() => handleSaveToCabinet(true)}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Doctor Override & Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleSaveToCabinet(false)}
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Save & Activate Schedule
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Allergy & Condition Intake Modal with Voice Recording */}
      <QuickAllergyConditionIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        focusTab={intakeFocusTab}
      />

      {/* Auto Med Review Modal Triggered After Safe Med Intake */}
      <AutoMedReviewModal
        isOpen={reviewMedication !== null}
        onClose={() => {
          setReviewMedication(null);
          onClose();
        }}
        medication={reviewMedication}
      />
    </div>
  );
};
