import React, { useEffect, useState } from 'react';
import { QrCode, X, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { FHIRAdapterService } from '@/services/fhirAdapterService';

interface IntakeQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntakeQrModal: React.FC<IntakeQrModalProps> = ({ isOpen, onClose }) => {
  const { profiles, activeProfileId } = useHouseholdStore();
  const { medications } = useMedicationStore();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const activeMeds = medications.filter((m) => m.profile_id === activeProfileId && m.is_active);

  useEffect(() => {
    if (isOpen && activeProfile) {
      const payloadUrl = `https://syncura.health/ips/${activeProfile.id}#shlink_key=${btoa(JSON.stringify({ v: 1, p: activeProfile.name }))}`;

      QRCode.toDataURL(payloadUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#042b27',
          light: '#ffffff',
        },
      })
        .then(setQrDataUrl)
        .catch((err: any) => console.error('QR Generation failed:', err));
    }
  }, [isOpen, activeProfile, activeMeds]);

  if (!isOpen || !activeProfile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinic Intake Check-In</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">SMART Health Link (IPS Standard)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Show this QR to clinic reception or scan to import active prescriptions and allergies directly into Epic MyChart / Cerner.
          </p>

          <div className="p-4 bg-white border border-slate-200 dark:border-none rounded-3xl inline-block shadow-xl shadow-brand-500/10 mx-auto">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="SMART Health Link QR" className="w-56 h-56 mx-auto rounded-xl" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-500 text-xs">Generating QR...</div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-300">
              <span>{activeProfile.name}</span>
              <span className="text-brand-600 dark:text-brand-400 font-bold">{activeMeds.length} Active Scripts</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Allergies: {activeProfile.allergies?.join(', ') || 'NKDA'}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                const bundle = FHIRAdapterService.generateIPSIntakeBundle(activeProfile, activeMeds);
                const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `IPS_Intake_${activeProfile.name.replace(/\s+/g, '_')}.json`;
                a.click();
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download FHIR JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
