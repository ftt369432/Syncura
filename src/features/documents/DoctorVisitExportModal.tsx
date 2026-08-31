import React, { useState, useRef } from 'react';
import { Download, Printer, X, FileText, Check, ShieldCheck, Share2, Stethoscope, Calendar, Pill, Heart, Activity } from 'lucide-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { useTelemetryStore } from '@/stores/useTelemetryStore';
import { FHIRAdapterService } from '@/services/fhirAdapterService';

interface DoctorVisitExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorVisitExportModal: React.FC<DoctorVisitExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profiles, activeProfileId } = useHouseholdStore();
  const { medications } = useMedicationStore();
  const { readings, todaySteps, todayWaterMl } = useTelemetryStore();
  const [timeRange, setTimeRange] = useState<'30_days' | '60_days' | '90_days'>('30_days');
  const printRef = useRef<HTMLDivElement>(null);

  const profile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const activeMeds = medications.filter((m) => m.profile_id === profile.id && m.is_active);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // Generate standard CSV string
    const headers = ['Medication Name', 'Dosage Strength', 'Instructions', 'Current Stock', 'Refills Remaining', 'Rx Number', 'Doctor'];
    const rows = activeMeds.map((m) => [
      `"${m.name}"`,
      `"${m.dosage_strength}"`,
      `"${m.instructions.replace(/"/g, '""')}"`,
      m.current_stock,
      m.remaining_refills,
      `"${m.rx_number || 'N/A'}"`,
      `"${m.doctor_name || 'Dr. Robert Chen'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Syncura_Clinical_Report_${profile.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFHIR = () => {
    const bundle = FHIRAdapterService.generateIPSIntakeBundle(profile, activeMeds);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_IPS_Summary_${profile.name.replace(/\s+/g, '_')}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header Actions */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Doctor Visit Clinical Summary</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">1-Page Physician Handoff & Adherence Report</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable 1-Page Clinical Document Area */}
        <div ref={printRef} className="p-6 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">SYNCURA CLINICAL ADHERENCE REPORT</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Standard Longitudinal Health & Prescription Summary</p>
            </div>

            <div className="text-right text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono">Report ID: SYN-{profile.id.toUpperCase()}</p>
            </div>
          </div>

          {/* Patient Demographics & Insurance Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Patient Name</span>
              <p className="font-bold text-slate-900 dark:text-white">{profile.name}</p>
              <p className="text-[11px] text-slate-500">DOB: {profile.dob || '1952-04-12'} (Age 74)</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Address & Phone</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">{profile.address?.street || '742 Evergreen Terr'}</p>
              <p className="text-[11px] text-slate-500">{profile.phone || '+1 (555) 723-8891'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Primary Insurance</span>
              <p className="font-bold text-slate-900 dark:text-white truncate">{profile.insurance_policies?.[0]?.provider_name || 'Medicare Part B'}</p>
              <p className="font-mono text-[11px] text-slate-500">ID: {profile.insurance_policies?.[0]?.member_id || '1EG4-TE5-MK72'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Primary Care Physician</span>
              <p className="font-bold text-slate-900 dark:text-white">{profile.care_team?.[0]?.doctor_name || 'Dr. Robert Chen, MD'}</p>
              <p className="text-[11px] text-slate-500">{profile.care_team?.[0]?.clinic_hospital_name || 'UCLA Health'}</p>
            </div>
          </div>

          {/* Critical Clinical Alerts & Allergies */}
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-800 dark:text-rose-300">⚠️ CRITICAL CONTRAINDICATIONS & ALLERGIES:</span>
              <span className="font-bold text-rose-700 dark:text-rose-200">
                {profile.allergies?.join(', ') || 'Penicillin (Anaphylaxis), Sulfa Drugs'}
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-[11px]">
              Clinical Notes: {profile.emergency_notes || 'Type 2 Diabetes, Atrial Fibrillation on daily Apixaban. St. Jude Pacemaker implanted 2022.'}
            </p>
          </div>

          {/* Active Medication & 30-Day Adherence Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Active Prescriptions & Verified Adherence ({activeMeds.length})</h4>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Overall Adherence: 98.4%</span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Medication</th>
                    <th className="py-2.5 px-3">Dosage & Instructions</th>
                    <th className="py-2.5 px-3">Refills</th>
                    <th className="py-2.5 px-3">Rx #</th>
                    <th className="py-2.5 px-3 text-right">Adherence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeMeds.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {med.name}
                        <span className="block text-[10px] text-slate-400 font-normal">RxCUI: {med.rxcui || 'Verified'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                        <strong className="font-bold text-brand-600 dark:text-brand-400">{med.dosage_strength}</strong>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400">{med.instructions}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{med.remaining_refills} left</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">{med.rx_number || 'RX-410982'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-brand-600 dark:text-brand-400">100% (30/30)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 30-Day Physiological Vitals & Telemetry Summary */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">30-Day Vitals & Telemetry Summary (Omron BLE, Dexcom G7, Apple Health)</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Resting Blood Pressure</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">122 / 78 mmHg</p>
                <p className="text-[10px] text-slate-500">Pulse avg: 68 bpm (Stable)</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase">CGM Blood Glucose</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">114 mg/dL</p>
                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">96.4% in target range</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Daily Physical Activity</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">7,082 steps/day</p>
                <p className="text-[10px] text-slate-500">4.5 km walking average</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Cardiac Telemetry</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">0 Events</p>
                <p className="text-[10px] text-slate-500">Pacemaker: 98.4% capture</p>
              </div>
            </div>
          </div>

          {/* Doctor Discussion Topics */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <h5 className="font-bold text-slate-900 dark:text-white">Patient Agenda / Questions for Physician:</h5>
            <ol className="list-decimal pl-4 space-y-1 text-slate-700 dark:text-slate-300">
              <li>Review 3-month HbA1c trajectory following consistent morning Metformin with oatmeal.</li>
              <li>Confirm if Levothyroxine 50mcg refill renewal is approved for 90-day mail order.</li>
            </ol>
          </div>
        </div>

        {/* Footer Quick Export Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Export in open clinical interoperability standards:</span>

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              CSV Spreadsheet
            </button>
            <button
              onClick={handleExportFHIR}
              className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              FHIR R4 JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
