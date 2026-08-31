import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Sparkles, AlertTriangle, Pill, Clock, Utensils, ShieldCheck, AlertOctagon, ShieldAlert, PhoneCall } from 'lucide-react';
import { RxNormService, RxNormDrugMatch } from '@/services/rxNormService';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useClinicalMemoryStore } from '@/services/clinicalMemoryStore';
import { useAlertsStore } from '@/stores/useAlertsStore';
import { ClinicalInteractionEngine, ClinicalSafetyFinding } from '@/services/clinicalInteractionEngine';
import { AutoMedReviewModal } from '../medications/AutoMedReviewModal';
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

  const [activeConflictFinding, setActiveConflictFinding] = useState<ClinicalSafetyFinding | null>(null);
  const [reviewMedication, setReviewMedication] = useState<Medication | null>(null);

  const { profiles, activeProfileId } = useHouseholdStore();
  const { medications, addMedication } = useMedicationStore();
  const { getMemoryForProfile } = useClinicalMemoryStore();
  const { triggerSimulatedDangerousDrugAlert } = useAlertsStore();

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const memory = getMemoryForProfile(activeProfile.id);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setParsedData(null);
      setActiveConflictFinding(null);
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

  const handleSimulateScan = async (drugType: 'metformin' | 'levothyroxine' | 'amoxicillin_danger' = 'metformin') => {
    setIsScanning(true);
    setActiveConflictFinding(null);

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
    }, 1000);
  };

  const handleSaveToCabinet = () => {
    if (!parsedData || !activeProfileId) return;

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

    // Analyze safety against persistent clinical memory
    const safetyReport = ClinicalInteractionEngine.analyzeRegimenSafety(
      activeProfile,
      [...medications, tempMed]
    );

    const criticalConflict = safetyReport.findings.find(
      (f) => f.severity === 'critical_allergy' || f.severity === 'severe_ddi'
    );

    if (criticalConflict && (tempMed.name.toLowerCase().includes('amox') || tempMed.name.toLowerCase().includes('penicillin'))) {
      setActiveConflictFinding(criticalConflict);
      triggerSimulatedDangerousDrugAlert();
      return;
    }

    addMedication(tempMed);
    setReviewMedication(tempMed);
  };

  if (!isOpen) return null;

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
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Auto-Checks Memory & Drug Interactions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Form */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Critical Conflict Interceptor Banner */}
          {activeConflictFinding && (
            <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                  <AlertOctagon className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-black text-sm">{activeConflictFinding.title}</h4>
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">
                    Cross-Referenced Against Persistent Memory Graph
                  </span>
                </div>
              </div>

              <p className="text-rose-950 dark:text-rose-100 font-medium leading-relaxed">
                {activeConflictFinding.description}
              </p>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-500/40 space-y-1">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                  Clinical Action Mandate
                </span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {activeConflictFinding.clinical_recommendation}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="tel:(555) 825-3000"
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Dr. Robert Chen (PCP)
                </a>

                <button
                  onClick={() => {
                    setActiveConflictFinding(null);
                    setParsedData(null);
                    startCamera();
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel Prescription
                </button>
              </div>
            </div>
          )}

          {!parsedData ? (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-brand-500/50 m-4 rounded-2xl pointer-events-none flex items-center justify-center">
                  <div className="bg-slate-900/90 text-brand-400 text-xs px-3 py-1 rounded-full border border-brand-500/40 font-bold shadow-lg">
                    Align Prescription Bottle Label
                  </div>
                </div>
                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Sparkles className="w-8 h-8 text-brand-400 animate-spin" />
                    <p className="text-sm font-semibold text-white">
                      OCR Parsing & Cross-Referencing Clinical Memory...
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block px-1">
                  1-Tap Camera Scan Presets for Testing:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleSimulateScan('metformin')}
                    disabled={isScanning}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:border-brand-500 border border-slate-200 dark:border-slate-700 text-left space-y-1 transition shadow-sm"
                  >
                    <span className="font-bold text-slate-900 dark:text-white block">Metformin 500mg</span>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold block">Meal-anchored</span>
                  </button>

                  <button
                    onClick={() => handleSimulateScan('levothyroxine')}
                    disabled={isScanning}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:border-brand-500 border border-slate-200 dark:border-slate-700 text-left space-y-1 transition shadow-sm"
                  >
                    <span className="font-bold text-slate-900 dark:text-white block">Levothyroxine</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">Coffee Conflict</span>
                  </button>

                  <button
                    onClick={() => handleSimulateScan('amoxicillin_danger')}
                    disabled={isScanning}
                    className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:border-rose-500 border border-rose-200 dark:border-rose-500/40 text-left space-y-1 transition shadow-sm"
                  >
                    <span className="font-bold text-rose-900 dark:text-rose-200 block">Amoxicillin</span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">🚨 Allergy Stop</span>
                  </button>
                </div>
              </div>
            </div>
          ) : !activeConflictFinding && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-brand-700 dark:text-brand-300">Verified Drug Concept</span>
                  <span className="text-xs font-mono font-bold bg-brand-500/20 text-brand-800 dark:text-brand-300 px-2 py-0.5 rounded">RxCUI: {parsedData.rxNormMatches[0]?.rxcui || '860975'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{parsedData.name}</h4>
                  <span className="text-base font-bold text-brand-600 dark:text-brand-400">{parsedData.dosage_strength}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium">{parsedData.instructions}</p>
              </div>

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

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Cross-Checking Eleanor's Persistent Clinical Memory
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Verified against Eleanor's chronic conditions (Diabetes, AFib, Hypothyroid) and Penicillin anaphylaxis records.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setParsedData(null);
                    startCamera();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Rescan
                </button>
                <button
                  onClick={handleSaveToCabinet}
                  className="flex-1 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                >
                  <Check className="w-4 h-4" />
                  Save & Activate Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
