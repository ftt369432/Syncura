import React, { useState, useRef, useEffect } from 'react';
import { Camera, QrCode, X, Check, ShieldAlert, Sparkles, ShieldCheck, UserCheck, Pill } from 'lucide-react';
import { PatientCensusItem } from '@/types/enterprise';

interface WristbandScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientCensusItem | null;
  onVerified: () => void;
}

export const WristbandScanModal: React.FC<WristbandScanModalProps> = ({
  isOpen,
  onClose,
  patient,
  onVerified,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'mismatch' | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setScanResult(null);
    } else {
      stopCamera();
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

  const handleSimulateWristbandScan = (isCorrect: boolean = true) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (isCorrect && patient) {
        setScanResult('success');
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1200);
      } else {
        setScanResult('mismatch');
      }
    }, 900);
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">eMAR 5-Rights Wristband Scan</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify Patient Identity Before Pass</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Target Resident</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{patient.name}</p>
              <p className="text-[11px] text-slate-500">{patient.room_or_address}</p>
            </div>
            <span className="font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg">
              {patient.wristband_barcode}
            </span>
          </div>

          <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 border-2 border-brand-500/50 m-6 rounded-2xl pointer-events-none flex items-center justify-center">
              <p className="bg-slate-900/90 text-brand-400 text-[11px] font-bold px-3 py-1 rounded-full border border-brand-500/30">
                Scan Patient Wristband or Door Tag
              </p>
            </div>

            {isScanning && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-brand-400 animate-spin" />
                <p className="text-xs font-bold text-white">Validating Barcode against eMAR Census...</p>
              </div>
            )}

            {scanResult === 'success' && (
              <div className="absolute inset-0 bg-brand-500/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-slate-950 animate-fadeIn">
                <ShieldCheck className="w-12 h-12" />
                <p className="text-base font-black">PATIENT IDENTITY VERIFIED</p>
                <p className="text-xs font-bold">5-Rights Gate Unlocked for Med Pass</p>
              </div>
            )}

            {scanResult === 'mismatch' && (
              <div className="absolute inset-0 bg-rose-600/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white animate-fadeIn">
                <ShieldAlert className="w-12 h-12" />
                <p className="text-base font-black">WRONG PATIENT WARNING</p>
                <p className="text-xs font-semibold">Barcode does not match {patient.name}</p>
              </div>
            )}
          </div>

          {/* Action trigger buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleSimulateWristbandScan(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Simulate Scan Wristband
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
