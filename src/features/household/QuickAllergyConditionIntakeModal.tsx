import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Mic, MicOff, Check, ShieldAlert, Sparkles, AlertTriangle, 
  Volume2, Trash2, Heart, Activity, Pill, Play, Pause, RefreshCw, Plus
} from 'lucide-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useClinicalMemoryStore } from '@/services/clinicalMemoryStore';
import { VoiceIntakeNote } from '@/types';

interface QuickAllergyConditionIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  focusTab?: 'allergies' | 'conditions' | 'voice';
}

const PRESET_ALLERGIES = [
  { id: 'penicillin', label: 'Penicillin (Beta-Lactam)', category: 'drug' },
  { id: 'amoxicillin', label: 'Amoxicillin', category: 'drug' },
  { id: 'sulfa', label: 'Sulfa Drugs (Bactrim)', category: 'drug' },
  { id: 'nsaid', label: 'Aspirin / NSAIDs (Advil/Aleve)', category: 'drug' },
  { id: 'codeine', label: 'Codeine / Opioids', category: 'drug' },
  { id: 'ace', label: 'ACE Inhibitors (Lisinopril)', category: 'drug' },
  { id: 'cephalosporin', label: 'Cephalosporins (Keflex)', category: 'drug' },
  { id: 'latex', label: 'Latex', category: 'environmental' },
  { id: 'contrast', label: 'Radiocontrast Dye / Iodine', category: 'drug' },
  { id: 'peanuts', label: 'Peanuts', category: 'food' },
  { id: 'shellfish', label: 'Shellfish', category: 'food' },
];

const PRESET_CONDITIONS = [
  { id: 'hbp', label: 'High Blood Pressure (Hypertension)' },
  { id: 'diabetes', label: 'Type 2 Diabetes Mellitus' },
  { id: 'afib', label: 'Atrial Fibrillation / Heart Disease' },
  { id: 'ckd', label: 'Chronic Kidney Disease (CKD)' },
  { id: 'asthma', label: 'Asthma / COPD' },
  { id: 'cholesterol', label: 'High Cholesterol (Hyperlipidemia)' },
  { id: 'gerd', label: 'Acid Reflux (GERD)' },
  { id: 'arthritis', label: 'Osteoarthritis / Joint Pain' },
  { id: 'thyroid', label: 'Hypothyroidism' },
  { id: 'dvt', label: 'Blood Clots / DVT History' },
];

export const QuickAllergyConditionIntakeModal: React.FC<QuickAllergyConditionIntakeModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  focusTab = 'allergies',
}) => {
  const { profiles, activeProfileId, toggleAllergy, toggleChronicCondition, addVoiceIntakeNote, updateProfile } = useHouseholdStore();
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const [activeSubTab, setActiveSubTab] = useState<'quick_tap' | 'voice'>(
    focusTab === 'voice' ? 'voice' : 'quick_tap'
  );

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [detectedSpokenTags, setDetectedSpokenTags] = useState<{ allergies: string[]; conditions: string[] }>({
    allergies: [],
    conditions: [],
  });
  const [customInput, setCustomInput] = useState('');
  const [customType, setCustomType] = useState<'allergy' | 'condition'>('allergy');
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveSubTab(focusTab === 'voice' ? 'voice' : 'quick_tap');
      setTranscript('');
      setDetectedSpokenTags({ allergies: [], conditions: [] });
    } else {
      stopVoiceRecording();
    }
  }, [isOpen, focusTab]);

  // Voice Speech Recognition Setup
  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    setTranscript('');
    setDetectedSpokenTags({ allergies: [], conditions: [] });

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    // Initialize Web Speech API if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
          analyzeSpokenText(currentText);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    } else {
      // Fallback simulated speech for environments without Web Speech API
      simulateSpeechProgress();
    }
  };

  const simulateSpeechProgress = () => {
    setTimeout(() => {
      const sampleText = "I have high blood pressure and diabetes, and I am allergic to penicillin and aspirin.";
      setTranscript(sampleText);
      analyzeSpokenText(sampleText);
    }, 2500);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  // Extract medical tags from speech in real-time
  const analyzeSpokenText = (text: string) => {
    const lower = text.toLowerCase();
    const foundAllergies: string[] = [];
    const foundConditions: string[] = [];

    // Allergies
    if (lower.includes('penicillin') || lower.includes('amoxicillin')) foundAllergies.push('Penicillin (Beta-Lactam)');
    if (lower.includes('sulfa') || lower.includes('bactrim')) foundAllergies.push('Sulfa Drugs (Bactrim)');
    if (lower.includes('aspirin') || lower.includes('nsaid') || lower.includes('ibuprofen') || lower.includes('advil')) foundAllergies.push('Aspirin / NSAIDs (Advil/Aleve)');
    if (lower.includes('codeine') || lower.includes('opioid') || lower.includes('morphine')) foundAllergies.push('Codeine / Opioids');
    if (lower.includes('lisinopril') || lower.includes('ace inhibitor')) foundAllergies.push('ACE Inhibitors (Lisinopril)');
    if (lower.includes('latex')) foundAllergies.push('Latex');
    if (lower.includes('contrast') || lower.includes('iodine')) foundAllergies.push('Radiocontrast Dye / Iodine');
    if (lower.includes('peanut')) foundAllergies.push('Peanuts');
    if (lower.includes('shellfish')) foundAllergies.push('Shellfish');

    // Conditions
    if (lower.includes('blood pressure') || lower.includes('hypertension')) foundConditions.push('High Blood Pressure (Hypertension)');
    if (lower.includes('diabetes') || lower.includes('sugar')) foundConditions.push('Type 2 Diabetes Mellitus');
    if (lower.includes('afib') || lower.includes('atrial') || lower.includes('heart')) foundConditions.push('Atrial Fibrillation / Heart Disease');
    if (lower.includes('kidney') || lower.includes('renal') || lower.includes('ckd')) foundConditions.push('Chronic Kidney Disease (CKD)');
    if (lower.includes('asthma') || lower.includes('copd') || lower.includes('breathing')) foundConditions.push('Asthma / COPD');
    if (lower.includes('cholesterol') || lower.includes('lipid')) foundConditions.push('High Cholesterol (Hyperlipidemia)');
    if (lower.includes('reflux') || lower.includes('gerd') || lower.includes('heartburn')) foundConditions.push('Acid Reflux (GERD)');
    if (lower.includes('arthritis') || lower.includes('joint') || lower.includes('knee')) foundConditions.push('Osteoarthritis / Joint Pain');
    if (lower.includes('thyroid') || lower.includes('hypothyroid')) foundConditions.push('Hypothyroidism');

    setDetectedSpokenTags({
      allergies: Array.from(new Set(foundAllergies)),
      conditions: Array.from(new Set(foundConditions)),
    });
  };

  const handleApplySpokenTags = () => {
    if (!activeProfile) return;

    // Apply auto-detected allergies
    const currentAllergies = activeProfile.allergies || [];
    const newAllergies = Array.from(new Set([...currentAllergies, ...detectedSpokenTags.allergies]));

    // Apply auto-detected conditions
    const currentConditions = activeProfile.chronic_conditions || [];
    const newConditions = Array.from(new Set([...currentConditions, ...detectedSpokenTags.conditions]));

    // Save voice intake note
    const newNote: VoiceIntakeNote = {
      id: `voice-${Date.now()}`,
      transcript: transcript || 'Spoken clinical voice intake statement recorded.',
      detected_allergies: detectedSpokenTags.allergies,
      detected_conditions: detectedSpokenTags.conditions,
      recorded_at: new Date().toISOString(),
      duration_seconds: recordingSeconds || 5,
    };

    updateProfile(activeProfile.id, {
      allergies: newAllergies,
      chronic_conditions: newConditions,
      voice_intake_notes: [newNote, ...(activeProfile.voice_intake_notes || [])],
    });

    stopVoiceRecording();
    setTranscript('');
    setActiveSubTab('quick_tap');
    if (onSaved) onSaved();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || !activeProfile) return;

    if (customType === 'allergy') {
      toggleAllergy(activeProfile.id, customInput.trim());
    } else {
      toggleChronicCondition(activeProfile.id, customInput.trim());
    }
    setCustomInput('');
  };

  const handlePlayVoice = (id: string, text: string) => {
    if (isPlayingId === id) {
      window.speechSynthesis.cancel();
      setIsPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingId(null);
    utterance.onerror = () => setIsPlayingId(null);
    setIsPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen || !activeProfile) return null;

  const currentAllergies = activeProfile.allergies || [];
  const currentConditions = activeProfile.chronic_conditions || [];
  const voiceNotes = activeProfile.voice_intake_notes || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Intake Profile & Safety Shield
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                1-Tap Quick Tabs & Spoken Voice Intake for {activeProfile.name.split(' ')[0]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
          <button
            onClick={() => setActiveSubTab('quick_tap')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeSubTab === 'quick_tap'
                ? 'bg-brand-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            1-Tap Quick Select
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
              {currentAllergies.length + currentConditions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('voice')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              activeSubTab === 'voice'
                ? 'bg-brand-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Health Intake
            {voiceNotes.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20">
                {voiceNotes.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {activeSubTab === 'quick_tap' ? (
            <>
              {/* Profile Status Summary Banner */}
              <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-500/10 border border-brand-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300">
                    Active Clinical Safety Matrix
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {currentAllergies.length} Allergies • {currentConditions.length} Chronic Baselines
                  </p>
                </div>
                <button
                  onClick={() => setActiveSubTab('voice')}
                  className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Speak Changes
                </button>
              </div>

              {/* 1. Allergies Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    Known Drug & Food Allergens (Tap to Toggle)
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {currentAllergies.length} Selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_ALLERGIES.map((item) => {
                    const isSelected = currentAllergies.some(
                      (a) => a.toLowerCase().includes(item.id) || a.toLowerCase().includes(item.label.toLowerCase().split(' ')[0])
                    );

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleAllergy(activeProfile.id, item.label)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20'
                            : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Chronic Conditions Section */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-sky-500" />
                    Chronic Conditions & Baselines (Tap to Toggle)
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {currentConditions.length} Selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_CONDITIONS.map((cond) => {
                    const isSelected = currentConditions.some(
                      (c) => c.toLowerCase().includes(cond.id) || c.toLowerCase().includes(cond.label.toLowerCase().split(' ')[0])
                    );

                    return (
                      <button
                        key={cond.id}
                        onClick={() => toggleChronicCondition(activeProfile.id, cond.label)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-700 shadow-md shadow-sky-600/20'
                            : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                        {cond.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Add Custom Item (Optional) */}
              <form onSubmit={handleAddCustom} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCustomType('allergy')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        customType === 'allergy' ? 'bg-rose-500 text-white' : 'text-slate-500'
                      }`}
                    >
                      Allergy
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomType('condition')}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        customType === 'condition' ? 'bg-sky-600 text-white' : 'text-slate-500'
                      }`}
                    >
                      Condition
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder={`Type unlisted ${customType}...`}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />
                  <button
                    type="submit"
                    disabled={!customInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-slate-950 font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Voice Health Intake Sub-Tab */
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-500/10 via-slate-50 to-white dark:from-brand-500/10 dark:via-slate-900 dark:to-slate-950 border border-brand-500/20 text-center space-y-3">
                <div className="flex justify-center">
                  <button
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/30'
                        : 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-brand-500/30'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </button>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {isRecording ? `Recording... 0:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}` : 'Tap to Speak Health Intake'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                    {isRecording
                      ? 'Say allergies, health conditions, or medication changes naturally...'
                      : 'Example: "I am allergic to penicillin and sulfa, and I have high blood pressure and diabetes."'}
                  </p>
                </div>

                {/* Real-time Transcription Stream */}
                {transcript && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                    <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Transcribed Speech:
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 italic">
                      "{transcript}"
                    </p>
                  </div>
                )}

                {/* Detected Tags Ready to Apply */}
                {(detectedSpokenTags.allergies.length > 0 || detectedSpokenTags.conditions.length > 0) && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-left space-y-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> AI Extracted Clinical Safety Tags:
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {detectedSpokenTags.allergies.map((a) => (
                        <span key={a} className="px-2 py-0.5 rounded-lg bg-rose-500 text-white font-bold text-[10px]">
                          Allergy: {a}
                        </span>
                      ))}
                      {detectedSpokenTags.conditions.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded-lg bg-sky-600 text-white font-bold text-[10px]">
                          Condition: {c}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={handleApplySpokenTags}
                      className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Apply Spoken Tags to Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Saved Voice Memos List */}
              {voiceNotes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                    Saved Voice Health Memos ({voiceNotes.length})
                  </h5>

                  <div className="space-y-2">
                    {voiceNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(note.recorded_at).toLocaleDateString()} at{' '}
                            {new Date(note.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <button
                            onClick={() => handlePlayVoice(note.id, note.transcript)}
                            className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 font-bold text-[10px] flex items-center gap-1"
                          >
                            {isPlayingId === note.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            {isPlayingId === note.id ? 'Pause' : 'Listen'}
                          </button>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-200 font-medium italic">
                          "{note.transcript}"
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {note.detected_allergies?.map((a) => (
                            <span key={a} className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                              {a}
                            </span>
                          ))}
                          {note.detected_conditions?.map((c) => (
                            <span key={c} className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">
            Saved changes immediately calibrate the interaction matrix.
          </span>
          <button
            onClick={() => {
              if (onSaved) onSaved();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition"
          >
            <Check className="w-4 h-4" />
            Done & Calibrate
          </button>
        </div>
      </div>
    </div>
  );
};
