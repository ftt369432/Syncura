import React, { useState } from 'react';
import { User, X, MapPin, Shield, Phone, Mail, Stethoscope, Building, Pill, CreditCard, Edit3, Check, Copy, Sparkles, Download, ShieldAlert, Activity, Mic, Play, Pause } from 'lucide-react';
import { Profile } from '@/types';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { QuickAllergyConditionIntakeModal } from './QuickAllergyConditionIntakeModal';

interface ProfileDemographicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export const ProfileDemographicsModal: React.FC<ProfileDemographicsModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { updateProfile } = useHouseholdStore();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  if (!isOpen || !profile) return null;

  const handlePlayVoice = (id: string, text: string) => {
    if (playingVoiceId === id) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingVoiceId(null);
    utterance.onerror = () => setPlayingVoiceId(null);
    setPlayingVoiceId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinical ID & Intake Demographics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Auto-Fill & Hospital Interoperability Record</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Patient Hero Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-4 shadow-sm">
            <img
              src={profile.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
              alt={profile.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-slate-900 dark:text-white truncate">{profile.legal_first_name || profile.name} {profile.legal_last_name || ''}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                  {profile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                DOB: <strong className="text-slate-800 dark:text-slate-200">{profile.dob || '1952-04-12'}</strong> • Sex: <strong className="text-slate-800 dark:text-slate-200 uppercase">{profile.gender || 'female'}</strong> • Blood: <strong className="text-rose-600 dark:text-rose-400">{profile.blood_type || 'O+'}</strong>
              </p>
            </div>
          </div>

          {/* Section 0: Clinical Allergies, Health Issues & Voice Intake */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Allergies & Chronic Health Shield
              </h4>
              <button
                onClick={() => setIsIntakeModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition shadow-sm"
              >
                <Mic className="w-3 h-3" />
                1-Tap & Voice Edit
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-3 shadow-sm">
              {/* Allergies */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
                  Documented Allergies ({profile.allergies?.length || 0})
                </span>
                {profile.allergies && profile.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.allergies.map((all, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 font-bold text-[11px]"
                      >
                        ⚠️ {all}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    No known drug allergies (NKDA) documented. Tap above to add with 1 tap.
                  </p>
                )}
              </div>

              {/* Chronic Conditions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block">
                  Chronic Conditions ({profile.chronic_conditions?.length || 0})
                </span>
                {profile.chronic_conditions && profile.chronic_conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.chronic_conditions.map((cond, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-500/40 text-sky-800 dark:text-sky-300 font-bold text-[11px]"
                      >
                        🩺 {cond}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    No chronic baselines documented. Tap above to select.
                  </p>
                )}
              </div>

              {/* Saved Voice Memos */}
              {profile.voice_intake_notes && profile.voice_intake_notes.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    Spoken Health Intake Memos ({profile.voice_intake_notes.length})
                  </span>
                  <div className="space-y-1.5">
                    {profile.voice_intake_notes.slice(0, 2).map((v) => (
                      <div
                        key={v.id}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]"
                      >
                        <p className="truncate flex-1 font-medium text-slate-700 dark:text-slate-300 pr-2 italic">
                          "{v.transcript}"
                        </p>
                        <button
                          onClick={() => handlePlayVoice(v.id, v.transcript)}
                          className="px-2 py-0.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 font-bold text-[10px] shrink-0 flex items-center gap-1"
                        >
                          {playingVoiceId === v.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {playingVoiceId === v.id ? 'Stop' : 'Listen'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Residential Address & Contact Info */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              Residential Address & Contact
            </h4>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Home Address</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {profile.address?.street} {profile.address?.unit ? `, ${profile.address.unit}` : ''}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    {profile.address?.city}, {profile.address?.state} {profile.address?.zip}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('Address', `${profile.address?.street}, ${profile.address?.city}, ${profile.address?.state} ${profile.address?.zip}`)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500 transition text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedField === 'Address' ? <Check className="w-3.5 h-3.5 text-brand-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Phone</span>
                  <p className="font-bold text-slate-900 dark:text-white">{profile.phone || '+1 (555) 723-8891'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Email</span>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{profile.email || 'eleanor.miller52@gmail.com'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Health Insurance & Billing Cards */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-sky-500" />
              Insurance & Pharmacy Coverage
            </h4>

            <div className="space-y-2">
              {profile.insurance_policies?.map((ins, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{ins.provider_name}</span>
                    <span className="text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded">
                      {ins.policy_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Member / Subscriber ID</span>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">{ins.member_id}</p>
                    </div>
                    {ins.group_number && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Group #</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white">{ins.group_number}</p>
                      </div>
                    )}
                  </div>

                  {ins.rx_bin && (
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1">
                      <span>RxBIN: <strong>{ins.rx_bin}</strong></span>
                      <span>RxPCN: <strong>{ins.rx_pcn}</strong></span>
                      <span>RxGrp: <strong>{ins.rx_grp}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Care Team Doctors & Hospital Portals */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-500" />
              Primary Physicians & Specialists
            </h4>

            <div className="space-y-2">
              {profile.care_team?.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between shadow-sm">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{doc.doctor_name}</h5>
                    <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">{doc.specialty}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{doc.clinic_hospital_name} • {doc.phone}</p>
                  </div>

                  <a
                    href={`tel:${doc.phone}`}
                    className="p-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Preferred Pharmacy */}
          {profile.preferred_pharmacy && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Pill className="w-3 h-3 text-brand-500" /> Preferred Pharmacy
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{profile.preferred_pharmacy.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{profile.preferred_pharmacy.address}</p>
                </div>
                <a
                  href={`tel:${profile.preferred_pharmacy.phone}`}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-500 text-xs font-bold transition flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {profile.preferred_pharmacy.phone}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <QuickAllergyConditionIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
      />
    </div>
  );
};
