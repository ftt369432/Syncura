import React, { useState } from 'react';
import { MessageSquare, Mic, MicOff, Send, Users, Shield, Copy, Check, Sparkles, Volume2, HeartHandshake, QrCode, Plus, UserCheck, Pill, ArrowRight, Heart } from 'lucide-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { Profile } from '@/types';
import { CaregiverQrPairingModal } from './CaregiverQrPairingModal';
import { ProfileDemographicsModal } from './ProfileDemographicsModal';

export const FamilyMessageBoard: React.FC = () => {
  const { household, profiles, activeProfileId, setActiveProfile, openAddMemberModal, openPairingModal, messages, postFamilyMessage } = useHouseholdStore();
  const { medications } = useMedicationStore();

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [demographicsProfile, setDemographicsProfile] = useState<Profile | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  const handleSendMessage = () => {
    if (!inputText.trim() || !activeProfile || !household) return;

    postFamilyMessage({
      household_id: household.id,
      sender_profile_id: activeProfile.id,
      sender_name: activeProfile.name,
      message_type: 'text',
      content: inputText.trim(),
    });

    setInputText('');
  };

  const handleSimulateVoiceCheckIn = () => {
    if (!activeProfile || !household) return;

    setIsRecording(true);
    setTimeout(() => {
      postFamilyMessage({
        household_id: household.id,
        sender_profile_id: activeProfile.id,
        sender_name: activeProfile.name,
        message_type: 'voice_memo',
        content: '🎙️ Voice Check-In: "Feeling good today! Had breakfast and finished my morning pills."',
        audio_duration_seconds: 5,
      });
      setIsRecording(false);
    }, 2000);
  };

  const handleCopyInvite = () => {
    if (!household) return;
    navigator.clipboard.writeText(household.invite_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Family Care Circle</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {household?.name || 'Private Health Vault'} • {profiles.length} {profiles.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        <button
          onClick={openAddMemberModal}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Household Family Members Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
            Household Members & Dependents
          </h3>
          <span className="text-[11px] text-slate-400">Switch active routine anytime</span>
        </div>

        <div className="space-y-3">
          {profiles.map((p) => {
            const isActive = p.id === activeProfileId;
            const profileMeds = medications.filter((m) => m.profile_id === p.id && m.is_active);

            return (
              <div
                key={p.id}
                className={`p-4 rounded-3xl border transition shadow-sm space-y-3 ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 border-brand-500/50 shadow-brand-500/5 ring-1 ring-brand-500/30'
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        alt={p.name}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-brand-500/20"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                        {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</h4>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Viewing Routine
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 capitalize">
                          {p.role.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          {profileMeds.length} {profileMeds.length === 1 ? 'medication' : 'medications'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDemographicsProfile(p)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition"
                    title="View Demographics, Address & Insurance Cards"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                </div>

                {/* Allergies & Conditions pills */}
                {((p.allergies && p.allergies.length > 0) || (p.chronic_conditions && p.chronic_conditions.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.allergies?.map((a) => (
                      <span
                        key={a}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20"
                      >
                        Allergy: {a}
                      </span>
                    ))}
                    {p.chronic_conditions?.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Switch Action */}
                {!isActive && (
                  <button
                    onClick={() => setActiveProfile(p.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-brand-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-brand-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Switch to {p.name}'s Routine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Family Member Card */}
          <button
            onClick={openAddMemberModal}
            className="w-full p-4 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-500/5 transition text-center space-y-1 group"
          >
            <div className="w-9 h-9 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto group-hover:scale-110 transition">
              <Plus className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              + Add Parent, Spouse, or Child
            </p>
            <p className="text-[11px] text-slate-400">
              Manage their medications, health records, and dosages under one shared family vault.
            </p>
          </button>
        </div>
      </div>

      {/* Household Sharing & Pairing Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Caregiver Invite Access</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Code: <strong className="font-mono text-brand-600 dark:text-brand-400">{household?.invite_code || '101-SYNC'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPairingModalOpen(true)}
            className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition flex items-center gap-1 text-xs font-bold shadow-sm"
            title="Open Caregiver QR Pairing"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">QR Link</span>
          </button>

          <button
            onClick={handleCopyInvite}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
          >
            {copiedCode ? <Check className="w-4 h-4 text-brand-500" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Copied' : 'Share Code'}
          </button>
        </div>
      </div>

      {/* 1-Tap Quick Audio / Push-to-Talk Status Check-in */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-50 to-white dark:from-brand-950/40 dark:to-slate-900 border border-brand-500/30 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-700 dark:text-brand-300">
            <HeartHandshake className="w-4 h-4" />
            <span>1-Tap Family Voice Check-In</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Push to Talk</span>
        </div>

        <button
          onClick={handleSimulateVoiceCheckIn}
          disabled={isRecording}
          className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
            isRecording
              ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
              : 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-brand-500/20'
          }`}
        >
          <Mic className="w-4 h-4" />
          {isRecording ? 'Recording Voice Memo (5s)...' : 'Hold / Tap: "Took My Meds & Feeling Good"'}
        </button>
      </div>

      {/* Activity & Message Stream */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">Live Household Activity</h3>

        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No messages posted yet. Post a quick note or tap above to send a voice check-in!
            </div>
          ) : (
            messages.map((msg) => {
              const isVoice = msg.message_type === 'voice_memo';

              return (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{msg.sender_name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{msg.content}</p>

                  {isVoice && (
                    <div className="flex items-center gap-2 pt-1">
                      <button className="py-1 px-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-[11px] font-bold flex items-center gap-1.5 transition border border-brand-500/20">
                        <Volume2 className="w-3.5 h-3.5" />
                        Play Voice Memo ({msg.audio_duration_seconds}s)
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Text Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Send a quick note to caregivers..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 shadow-sm"
        />
        <button
          onClick={handleSendMessage}
          className="p-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold transition shrink-0 shadow-md shadow-brand-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Caregiver QR Pairing Modal */}
      <CaregiverQrPairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
      />

      {/* Demographics & Insurance Cards Modal */}
      <ProfileDemographicsModal
        isOpen={demographicsProfile !== null}
        onClose={() => setDemographicsProfile(null)}
        profile={demographicsProfile}
      />
    </div>
  );
};
