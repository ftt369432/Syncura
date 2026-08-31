import React, { useState } from 'react';
import { Brain, Database, X, Shield, Activity, Calendar, Heart, AlertOctagon, TrendingDown, Check, Clock, Stethoscope, Sparkles } from 'lucide-react';
import { useClinicalMemoryStore } from '@/services/clinicalMemoryStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

interface ClinicalMemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalMemoryVaultModal: React.FC<ClinicalMemoryVaultModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profiles, activeProfileId } = useHouseholdStore();
  const { getMemoryForProfile } = useClinicalMemoryStore();

  const [activeTab, setActiveTab] = useState<'timeline' | 'diagnoses' | 'labs' | 'contraindications'>('timeline');

  if (!isOpen) return null;

  const profile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const memory = getMemoryForProfile(profile.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-500/10 via-brand-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Persistent Clinical Memory
                <span className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                  Active RAG Graph
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Never Re-Review • Cumulative Patient Knowledge</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persistent Memory Status Badge */}
        <div className="p-3.5 mx-6 mt-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-500/30 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="font-semibold text-purple-950 dark:text-purple-200">
              Cross-referencing {memory.chronic_diagnoses.length} chronic baselines & {memory.permanent_drug_contraindications.length} permanent rules
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
            Live Memory
          </span>
        </div>

        {/* Tab Navigation Strip */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-1.5 px-3 rounded-xl font-bold transition ${
              activeTab === 'timeline' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Milestone Timeline
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`py-1.5 px-3 rounded-xl font-bold transition ${
              activeTab === 'labs' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Lab Trajectories
          </button>
          <button
            onClick={() => setActiveTab('contraindications')}
            className={`py-1.5 px-3 rounded-xl font-bold transition ${
              activeTab === 'contraindications' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Drug Intolerances
          </button>
          <button
            onClick={() => setActiveTab('diagnoses')}
            className={`py-1.5 px-3 rounded-xl font-bold transition ${
              activeTab === 'diagnoses' ? 'bg-brand-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Diagnoses
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Tab 1: Longitudinal Milestone Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {memory.longitudinal_timeline.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm relative pl-6 border-l-4 border-l-purple-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{event.title}</span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">{event.date}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {event.clinical_summary}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                    <strong className="text-purple-700 dark:text-purple-300">Impact on Future Care:</strong> {event.impact_on_future_care}
                  </div>

                  <p className="text-[10px] text-slate-400">{event.source_institution}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Lab Trajectories */}
          {activeTab === 'labs' && (
            <div className="space-y-3">
              {memory.lab_trajectories.map((traj, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{traj.test_name}</h4>
                    <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded font-bold">
                      Goal: {traj.target_range}
                    </span>
                  </div>

                  {/* Visual Trajectory Points */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {traj.history.map((h, hIdx) => (
                      <div key={hIdx} className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">{h.date}</span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                          {h.value} <span className="text-[10px] font-normal">{traj.unit}</span>
                        </span>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          h.flag === 'normal' || h.flag === 'improved'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        }`}>
                          {h.flag}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-purple-50/50 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
                    📈 {traj.trajectory_summary}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Permanent Drug Intolerances */}
          {activeTab === 'contraindications' && (
            <div className="space-y-3">
              {memory.permanent_drug_contraindications.map((contra, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-rose-900 dark:text-rose-200 text-xs">⛔ {contra.drug_or_class}</h5>
                    <span className="text-[10px] font-mono text-rose-600 font-bold">Identified: {contra.year_identified}</span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    <strong>Documented Reaction:</strong> {contra.adverse_reaction}
                  </p>

                  <p className="text-rose-800 dark:text-rose-300 font-bold text-xs bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-rose-200/60 dark:border-rose-800">
                    🔒 <strong>Permanent Rule:</strong> {contra.rule}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Chronic Diagnoses */}
          {activeTab === 'diagnoses' && (
            <div className="space-y-2.5">
              {memory.chronic_diagnoses.map((diag, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">{diag.condition}</h5>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      ICD-10: {diag.icd10}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                    {diag.notes}
                  </p>
                  <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold block pt-0.5">
                    Diagnosed: {diag.diagnosed_year} • Active Managed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
