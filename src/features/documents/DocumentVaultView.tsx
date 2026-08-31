import React, { useState } from 'react';
import { FileText, QrCode, Shield, Sparkles, Download, Upload, ExternalLink, Activity, Heart, UserCheck, MapPin, CreditCard, Stethoscope, Share2, Printer, Brain, Database, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useClinicalMemoryStore } from '@/services/clinicalMemoryStore';
import { useAlertsStore } from '@/stores/useAlertsStore';
import { IntakeQrModal } from '../fhir/IntakeQrModal';
import { ProfileDemographicsModal } from '../household/ProfileDemographicsModal';
import { DoctorVisitExportModal } from './DoctorVisitExportModal';
import { ClinicalMemoryVaultModal } from '../vault/ClinicalMemoryVaultModal';

export const DocumentVaultView: React.FC = () => {
  const { profiles, activeProfileId } = useHouseholdStore();
  const { getMemoryForProfile, addLabTrajectoryData, addTimelineEvent } = useClinicalMemoryStore();
  const { openInbox } = useAlertsStore();

  const [activeTier, setActiveTier] = useState<'tier2_markdown' | 'tier3_fhir' | 'tier1_legal'>('tier2_markdown');
  const [isIntakeQrOpen, setIsIntakeQrOpen] = useState(false);
  const [isDemographicsOpen, setIsDemographicsOpen] = useState(false);
  const [isDoctorExportOpen, setIsDoctorExportOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [advocateTopic, setAdvocateTopic] = useState<'labs' | 'doctor_prep'>('labs');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const memory = getMemoryForProfile(activeProfile.id);

  const handleSimulateLabUpload = () => {
    // Ingests new lab result and updates persistent memory graph
    const today = new Date().toISOString().split('T')[0];
    addLabTrajectoryData(activeProfile.id, 'HbA1c', today, 6.7, 'normal');
    addTimelineEvent(activeProfile.id, {
      date: today,
      category: 'lab_milestone',
      title: 'Quest Diagnostics Comprehensive Metabolic Ingested',
      clinical_summary: 'HbA1c improved to 6.7%, eGFR 64 mL/min confirmed stable. No medication adjustments required.',
      impact_on_future_care: 'Maintains current Metformin & Apixaban dosages safely.',
      source_institution: 'Quest Diagnostics Ingestion',
    });

    setUploadNotice('✓ New Quest Lab Record ingested & persistent clinical memory graph updated!');
    setTimeout(() => setUploadNotice(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      {/* Header & Clinical Memory / Doctor Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Health Vault & Records</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Persistent Memory, FHIR & Records</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMemoryModalOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-500/30 transition shadow-sm"
            title="Open Persistent Clinical Knowledge Graph"
          >
            <Brain className="w-3.5 h-3.5" />
            Memory Graph
          </button>

          <button
            onClick={() => setIsDoctorExportOpen(true)}
            className="flex items-center gap-1.5 py-2 px-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            Doctor Export
          </button>
        </div>
      </div>

      {uploadNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Patient Intake Quick Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              ID
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeProfile.legal_first_name || activeProfile.name} {activeProfile.legal_last_name || ''}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{activeProfile.address?.street}, {activeProfile.address?.city}, {activeProfile.address?.state}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDemographicsOpen(true)}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Demographics
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => setIsIntakeQrOpen(true)}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1"
            >
              <QrCode className="w-3 h-3" /> QR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <div>
            <span className="text-slate-400 font-medium">Primary Insurance</span>
            <p className="font-bold text-slate-900 dark:text-white truncate">{activeProfile.insurance_policies?.[0]?.provider_name || 'Medicare Part B'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Primary Doctor</span>
            <p className="font-bold text-slate-900 dark:text-white truncate">{activeProfile.care_team?.[0]?.doctor_name || 'Dr. Robert Chen'}</p>
          </div>
        </div>
      </div>

      {/* Instant Medical Records & Lab Ingestion Card */}
      <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ingest New Medical Record / Lab</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-updates persistent memory graph</p>
          </div>
        </div>

        <button
          onClick={handleSimulateLabUpload}
          className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Ingest Lab
        </button>
      </div>

      {/* 3-Tier Storage Selector */}
      <div className="p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex shadow-sm">
        <button
          onClick={() => setActiveTier('tier2_markdown')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTier === 'tier2_markdown'
              ? 'bg-brand-500 text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          AI Markdown
        </button>
        <button
          onClick={() => setActiveTier('tier3_fhir')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTier === 'tier3_fhir'
              ? 'bg-brand-500 text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          FHIR R4 JSON
        </button>
        <button
          onClick={() => setActiveTier('tier1_legal')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            activeTier === 'tier1_legal'
              ? 'bg-brand-500 text-slate-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Legal Vault
        </button>
      </div>

      {/* Tier 2: AI Knowledge Markdown View */}
      {activeTier === 'tier2_markdown' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400">
                <Sparkles className="w-4 h-4" />
                <span>Personal Health Advocate (Safe Harbor)</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Clinical Navigator</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAdvocateTopic('labs')}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition ${
                  advocateTopic === 'labs'
                    ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-500/40'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Lab Demystifier
              </button>
              <button
                onClick={() => setAdvocateTopic('doctor_prep')}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition ${
                  advocateTopic === 'doctor_prep'
                    ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-500/40'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Doctor Visit Prep
              </button>
            </div>

            {advocateTopic === 'labs' ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">Latest Metabolic Panel (Quest Diagnostics):</p>
                <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>eGFR: 64 mL/min/1.73m²</strong> — <em className="text-slate-600 dark:text-slate-300">"Normal to mildly decreased kidney function for age 74. Stable compared to last year's 62."</em></li>
                  <li><strong>HbA1c: 6.8%</strong> — <em className="text-slate-600 dark:text-slate-300">"Well within your target goal of &lt;7.0% under current Metformin 500mg BID regimen."</em></li>
                  <li><strong>Potassium: 4.4 mmol/L</strong> — <em className="text-slate-600 dark:text-slate-300">"Normal range (3.5 - 5.0). Safe with current heart medications."</em></li>
                </ul>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">Suggested Questions for Dr. Chen:</p>
                <ol className="space-y-1.5 list-decimal pl-4 leading-relaxed">
                  <li>Should we check fasting blood glucose after 3 months of taking Metformin with breakfast?</li>
                  <li>Are my recent mild morning dizziness episodes related to blood pressure timing?</li>
                  <li>Can we synchronize the refill schedule for Levothyroxine and Metformin to single pickup?</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tier 3: FHIR R4 JSON View */}
      {activeTier === 'tier3_fhir' && (
        <div className="p-4 rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 font-mono text-[11px] text-brand-300 overflow-x-auto space-y-2 max-h-80 shadow-md">
          <pre>{`{
  "resourceType": "Bundle",
  "type": "document",
  "id": "ips-prof-mom",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "name": [{ "text": "${activeProfile.name}", "family": "Miller", "given": ["Eleanor"] }],
        "gender": "${activeProfile.gender || 'female'}",
        "birthDate": "${activeProfile.dob || '1952-04-12'}",
        "address": [{ "line": ["${activeProfile.address?.street}"], "city": "${activeProfile.address?.city}", "state": "${activeProfile.address?.state}", "postalCode": "${activeProfile.address?.zip}" }]
      }
    },
    {
      "resource": {
        "resourceType": "Coverage",
        "status": "active",
        "subscriberId": "${activeProfile.insurance_policies?.[0]?.member_id || '1EG4-TE5-MK72'}",
        "payor": [{ "display": "${activeProfile.insurance_policies?.[0]?.provider_name || 'Medicare'}" }]
      }
    }
  ]
}`}</pre>
        </div>
      )}

      {/* Tier 1: Legal Encrypted Vault */}
      {activeTier === 'tier1_legal' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Client-Side Encrypted Legal Blob</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Original hospital discharge PDFs and scanned lab sheets are encrypted with your profile AES-256-GCM key before storage.
          </p>
        </div>
      )}

      {/* Modals */}
      <IntakeQrModal isOpen={isIntakeQrOpen} onClose={() => setIsIntakeQrOpen(false)} />
      <ProfileDemographicsModal
        isOpen={isDemographicsOpen}
        onClose={() => setIsDemographicsOpen(false)}
        profile={activeProfile}
      />
      <DoctorVisitExportModal
        isOpen={isDoctorExportOpen}
        onClose={() => setIsDoctorExportOpen(false)}
      />
      <ClinicalMemoryVaultModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />
    </div>
  );
};
