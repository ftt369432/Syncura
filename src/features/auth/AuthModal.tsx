import React, { useState } from 'react';
import { User, Key, Mail, Shield, Check, X, Stethoscope, Heart, Lock, Sparkles, Building2, UserPlus, LogIn, LogOut } from 'lucide-react';
import { useAuthStore, UserAccountRole } from '@/stores/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    isAuthenticated,
    loginWithEmail,
    signupWithCredentials,
    loginAsDemoPersona,
    logout,
    isLoading,
  } = useAuthStore();

  const [mode, setMode] = useState<'switch_persona' | 'login' | 'signup'>('switch_persona');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserAccountRole>('family_caregiver');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;

    const success = await signupWithCredentials({
      email: email.trim(),
      fullName: fullName.trim(),
      role,
      licenseNumber: role === 'enterprise_nurse' ? licenseNumber.trim() : undefined,
      password: password || 'Syncura2026!',
    });

    if (success) {
      setFeedback('Account created and credentialed successfully!');
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    await loginWithEmail(email.trim(), password);
    setFeedback('Logged in successfully!');
    setTimeout(() => {
      onClose();
      setFeedback(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Account & Authentication</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Log In, Log Out & Role Credentialing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Active User Card with Prominent Log Out Button */}
          {isAuthenticated && currentUser ? (
            <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-500/30 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-brand-700 dark:text-brand-300">Currently Logged In</span>
                <span className="text-[10px] font-bold bg-brand-500/20 text-brand-800 dark:text-brand-200 px-2 py-0.5 rounded">
                  {currentUser.role.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt={currentUser.fullName}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/30"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{currentUser.fullName}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{currentUser.email}</p>
                  {currentUser.licenseNumber && (
                    <span className="text-[10px] font-mono text-slate-500">License: {currentUser.licenseNumber}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMode('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                Log Out of Syncura
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center font-bold text-slate-600 dark:text-slate-300">
              You are currently logged out.
            </div>
          )}

          {/* Mode Selector Tabs */}
          <div className="p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex">
            <button
              onClick={() => setMode('switch_persona')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                mode === 'switch_persona' ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              1-Tap Personas
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                mode === 'login' ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Log In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1 ${
                mode === 'signup' ? 'bg-brand-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up
            </button>
          </div>

          {/* Tab 1: 1-Tap Quick Personas */}
          {mode === 'switch_persona' && (
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Switch Active Role & Account
              </h4>

              {/* Persona 1: David Caregiver */}
              <button
                onClick={() => {
                  loginAsDemoPersona('david_caregiver');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left flex items-center justify-between transition group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
                    👨‍💼
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">David Miller (Family Caregiver)</h5>
                    <p className="text-[11px] text-slate-500">Managing Eleanor's prescriptions & vitals</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded">Family Admin</span>
              </button>

              {/* Persona 2: Eleanor Senior */}
              <button
                onClick={() => {
                  loginAsDemoPersona('eleanor_senior');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left flex items-center justify-between transition group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                    👵
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">Eleanor Miller (Patient - Age 74)</h5>
                    <p className="text-[11px] text-slate-500">1-Tap voice check-ins & meal schedules</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded">Patient</span>
              </button>

              {/* Persona 3: Marcus RN Nurse */}
              <button
                onClick={() => {
                  loginAsDemoPersona('marcus_nurse');
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-brand-500 text-left flex items-center justify-between transition group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    🩺
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs">Marcus Rivera, RN (Charge Nurse)</h5>
                    <p className="text-[11px] text-slate-500">Pinnacle Home Health • EVV GPS Enabled</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">RN License</span>
              </button>
            </div>
          )}

          {/* Tab 2: Standard Email / Password Log In */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com or nurse@agency.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5 mt-2"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Signing in...' : 'Log In to Syncura'}
              </button>
            </form>
          )}

          {/* Tab 3: New Account Sign Up & Credentialing */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Miller or Dr. Elena Rostova"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@healthcare.org or family@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Credentialed Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserAccountRole)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="family_admin">Primary Family Caregiver (Full Admin)</option>
                  <option value="family_caregiver">Family Member / Secondary Caregiver</option>
                  <option value="senior_patient">Senior / Independent Patient</option>
                  <option value="enterprise_nurse">Registered Nurse / Clinical Staff (eMAR)</option>
                </select>
              </div>

              {role === 'enterprise_nurse' && (
                <div>
                  <label className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                    State RN / LPN License Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RN-CA-948210"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5 mt-2"
              >
                <Shield className="w-4 h-4" />
                {isLoading ? 'Creating Account...' : 'Create & Credential Account'}
              </button>

              {feedback && (
                <p className="text-center font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 p-2 rounded-xl">
                  {feedback}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
