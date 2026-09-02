import React, { useState, useRef } from 'react';
import { User, X, Check, Camera, Sparkles, QrCode, Plus, Heart, Shield, Calendar } from 'lucide-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { Profile } from '@/types';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', // Senior Woman
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', // Adult Man
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', // Senior Man
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', // Adult Woman
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', // Young Adult
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', // Nurse / Aide
];

const COMMON_ALLERGIES = ['Penicillin', 'Sulfa Drugs', 'Aspirin', 'NSAIDs', 'Codeine', 'Latex'];
const COMMON_CONDITIONS = ['High Blood Pressure', 'Type 2 Diabetes', 'Atrial Fibrillation', 'Arthritis', 'Kidney Disease', 'Asthma'];

export const AddFamilyMemberModal: React.FC = () => {
  const { isAddMemberModalOpen, closeAddMemberModal, addProfile, household, openPairingModal } = useHouseholdStore();

  const [name, setName] = useState('');
  const [role, setRole] = useState<'dependent' | 'caregiver' | 'self'>('dependent');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [bloodType, setBloodType] = useState('O+');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAddMemberModalOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 280;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleAllergy = (item: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const toggleCondition = (item: string) => {
    setSelectedConditions((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const mappedRole: Profile['role'] = role === 'dependent' ? 'dependent' : role === 'self' ? 'primary_admin' : 'caregiver_full';

    addProfile({
      household_id: household?.id || 'hh-101',
      name: name.trim(),
      role: mappedRole,
      dob: dob || undefined,
      gender,
      blood_type: bloodType,
      avatar_url: avatarUrl,
      allergies: selectedAllergies,
      chronic_conditions: selectedConditions,
      voice_intake_notes: [],
    });

    closeAddMemberModal();
    // Reset fields
    setName('');
    setSelectedAllergies([]);
    setSelectedConditions([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-brand-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Add Person or Family Member
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Add a parent, child, yourself, or pair via QR code
              </p>
            </div>
          </div>
          <button
            onClick={closeAddMemberModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Quick Pair Banner */}
        <div className="p-3 bg-brand-50/70 dark:bg-brand-950/40 border-b border-brand-500/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Pairing with another phone or caregiver?
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              closeAddMemberModal();
              openPairingModal();
            }}
            className="text-xs font-black text-brand-700 dark:text-brand-300 hover:underline flex items-center gap-1"
          >
            Scan QR Code &rarr;
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Avatar / Photo Picker */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt="Selected Avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-sm"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-80 hover:opacity-100 transition"
                title="Upload Photo or Take Picture"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-1.5 flex-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Choose Avatar or Upload:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition ${
                      avatarUrl === url ? 'border-brand-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Name & Role */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Name or Nickname *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mom, Dad, Robert, Grandma Helen, or Myself"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Relationship / Role Selector */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Profile Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('dependent')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition ${
                    role === 'dependent'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👵 Senior / Parent
                </button>
                <button
                  type="button"
                  onClick={() => setRole('self')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition ${
                    role === 'self'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👤 Personal (Me)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('caregiver')}
                  className={`py-2 px-2 rounded-xl border text-center font-bold transition ${
                    role === 'caregiver'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  👨‍💼 Caregiver
                </button>
              </div>
            </div>

            {/* Date of birth & Gender (Optional) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Blood Type
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Tap Allergies */}
          <div className="space-y-1.5 pt-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              1-Tap Known Allergies:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGIES.map((allergy) => {
                const isSelected = selectedAllergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {allergy}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tap Chronic Conditions */}
          <div className="space-y-1.5 pt-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              1-Tap Health Conditions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CONDITIONS.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                      isSelected
                        ? 'bg-brand-500 text-slate-950 border-brand-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Add Member to Household</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
