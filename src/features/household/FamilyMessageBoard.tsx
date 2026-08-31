import React, { useState } from 'react';
import { MessageSquare, Mic, MicOff, Send, Users, Shield, Copy, Check, Sparkles, Volume2, HeartHandshake, QrCode } from 'lucide-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { CaregiverQrPairingModal } from './CaregiverQrPairingModal';

export const FamilyMessageBoard: React.FC = () => {
  const { household, profiles, activeProfileId, messages, postFamilyMessage } = useHouseholdStore();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

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
      {/* Household Pairing Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{household?.name || 'Household'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Invite Code: <strong className="font-mono text-brand-600 dark:text-brand-400">{household?.invite_code}</strong>
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
            {copiedCode ? 'Copied' : 'Share'}
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
          {messages.map((msg) => {
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
          })}
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
    </div>
  );
};
