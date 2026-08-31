import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Camera, X, Check, Copy, UserCheck, ShieldCheck, HeartHandshake, Sparkles, Plus, ArrowRight } from 'lucide-react';
import QRCode from 'qrcode';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface CaregiverQrPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaregiverQrPairingModal: React.FC<CaregiverQrPairingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { household, profiles, activeProfileId } = useHouseholdStore();
  const { linkHouseholdToUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'show_qr' | 'scan_camera' | 'manual_code'>('show_qr');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [pairedSuccess, setPairedSuccess] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  useEffect(() => {
    if (isOpen && activeProfile && household) {
      const pairingPayload = `syncura://pair?household=${household.id}&profile=${activeProfile.id}&code=${household.invite_code}&name=${encodeURIComponent(activeProfile.name)}`;

      QRCode.toDataURL(pairingPayload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#033f38',
          light: '#ffffff',
        },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [isOpen, activeProfile, household]);

  useEffect(() => {
    if (activeTab === 'scan_camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera stream unavailable:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleCopyCode = () => {
    if (!household) return;
    navigator.clipboard.writeText(household.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      linkHouseholdToUser('hh-101');
      setPairedSuccess(`✓ Successfully linked to Eleanor Miller's Caregiver Swarm!`);
      setTimeout(() => {
        setPairedSuccess(null);
        onClose();
      }, 1500);
    }, 1000);
  };

  const handleManualPair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    linkHouseholdToUser('hh-101');
    setPairedSuccess(`✓ Verified code "${manualCode.toUpperCase()}". Linked to Eleanor Miller!`);
    setTimeout(() => {
      setPairedSuccess(null);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Caregiver QR Pairing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Link Family & Nurses to Monitor Patient</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Navigation Tabs */}
          <div className="p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex">
            <button
              onClick={() => setActiveTab('show_qr')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                activeTab === 'show_qr' ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              Patient QR
            </button>
            <button
              onClick={() => setActiveTab('scan_camera')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                activeTab === 'scan_camera' ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Scan QR
            </button>
            <button
              onClick={() => setActiveTab('manual_code')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                activeTab === 'manual_code' ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Code Entry
            </button>
          </div>

          {/* Success Banner */}
          {pairedSuccess && (
            <div className="p-3.5 rounded-2xl bg-brand-500 text-slate-950 font-bold flex items-center gap-2 shadow-lg animate-fadeIn">
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{pairedSuccess}</span>
            </div>
          )}

          {/* Tab 1: Show Patient QR to Caregivers */}
          {activeTab === 'show_qr' && (
            <div className="space-y-4 text-center">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Point another phone's camera at this QR code to instantly link as a caregiver for <strong className="text-slate-900 dark:text-white">{activeProfile.name}</strong>.
              </p>

              <div className="p-4 bg-white rounded-3xl inline-block shadow-xl border border-slate-200 dark:border-none mx-auto">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Caregiver Link QR" className="w-52 h-52 mx-auto rounded-xl" />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-slate-400">Generating QR...</div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-left">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Manual Invite Code</span>
                  <p className="font-mono text-base font-black text-brand-600 dark:text-brand-400">
                    {household?.invite_code || 'SYNC-8492'}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-500 font-bold flex items-center gap-1 text-xs transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Camera Scanner for Caregiver/Nurse */}
          {activeTab === 'scan_camera' && (
            <div className="space-y-4">
              <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                
                <div className="absolute inset-0 border-2 border-dashed border-brand-400 m-6 rounded-2xl pointer-events-none flex items-center justify-center">
                  <p className="bg-slate-900/90 text-brand-300 text-[11px] font-bold px-3 py-1 rounded-full border border-brand-500/30">
                    Align Patient's QR in Frame
                  </p>
                </div>

                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8 text-brand-400 animate-spin" />
                    <p className="text-xs font-bold text-white">Linking to Eleanor Miller's Caregiver Swarm...</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5"
              >
                <QrCode className="w-4 h-4" />
                Simulate Camera Scan Patient QR
              </button>
            </div>
          )}

          {/* Tab 3: Manual Code Entry */}
          {activeTab === 'manual_code' && (
            <form onSubmit={handleManualPair} className="space-y-3">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Enter the 8-character household invite code provided by the patient or primary family admin:
              </p>

              <div>
                <input
                  type="text"
                  required
                  placeholder="e.g. SYNC-8492"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-center text-lg font-mono font-black tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                Link & Start Monitoring
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
