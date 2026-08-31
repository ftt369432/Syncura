import React, { useState } from 'react';
import { Cloud, Database, Check, X, Shield, RefreshCw, Key, Link2, Copy, Sparkles, AlertTriangle, ExternalLink, HardDrive } from 'lucide-react';
import { useCloudConfigStore } from '@/stores/useCloudConfigStore';

interface CloudConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudConnectionModal: React.FC<CloudConnectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    backendMode,
    supabaseUrl,
    supabaseAnonKey,
    connectionStatus,
    lastError,
    setBackendMode,
    saveSupabaseConfig,
    testConnection,
    seedCloudDatabase,
    disconnectCloud,
  } = useCloudConfigStore();

  const [inputUrl, setInputUrl] = useState(supabaseUrl);
  const [inputKey, setInputKey] = useState(supabaseAnonKey);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndConnect = async () => {
    if (!inputUrl.trim() || !inputKey.trim()) return;
    setIsSaving(true);
    await saveSupabaseConfig(inputUrl.trim(), inputKey.trim());
    setIsSaving(false);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedNotice(null);
    const result = await seedCloudDatabase();
    setIsSeeding(false);
    setSeedNotice(result.message);
  };

  const sampleSqlSnippet = `-- Syncura Multi-Tenant Core Schema
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'dependent',
  dob DATE,
  blood_type TEXT,
  allergies TEXT[],
  emergency_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage_strength TEXT NOT NULL,
  instructions TEXT NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  is_prn BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Supabase Cloud Database</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">PostgreSQL Multi-Tenant Backend & Auth</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Active Mode Selector Strip */}
          <div className="p-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex">
            <button
              onClick={() => setBackendMode('supabase_live')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                backendMode === 'supabase_live'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Live Supabase Cloud
            </button>
            <button
              onClick={() => setBackendMode('local_demo')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                backendMode === 'local_demo'
                  ? 'bg-brand-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              Local Demo (In-Memory)
            </button>
          </div>

          {/* Status Alert */}
          {connectionStatus === 'connected' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between font-semibold">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected to Supabase PostgreSQL
              </span>
              <button
                onClick={disconnectCloud}
                className="text-[11px] text-slate-500 hover:text-rose-600 underline font-bold"
              >
                Disconnect
              </button>
            </div>
          )}

          {lastError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Connection Warning</p>
                <p className="text-[11px] opacity-90">{lastError}</p>
              </div>
            </div>
          )}

          {/* Credentials Inputs */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Supabase Project Credentials
            </h4>

            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                Project URL (HTTPS)
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                Anon Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveAndConnect}
                disabled={isSaving}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                {isSaving ? 'Connecting...' : 'Save & Verify Handshake'}
              </button>
            </div>
          </div>

          {/* Database Setup & Seed Tool */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">
                Database Schema & Initial Seed
              </h4>
              <button
                onClick={handleCopySql}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedSql ? 'Copied SQL' : 'Copy SQL Schema'}
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Once your Supabase project tables are created, click below to populate the live database with the Eleanor Miller test household.
            </p>

            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              {isSeeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Seed Clinical Records to Supabase
            </button>

            {seedNotice && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg text-center">
                {seedNotice}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
