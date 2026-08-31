import React, { useState, useRef, useEffect } from 'react';
import { Pill, Activity, ShieldCheck, FileText, HeartHandshake, PhoneCall, Sun, Moon, Sparkles, Building2, User, Cloud, Database, QrCode, Shield, Home, LayoutDashboard, Zap, Bell, ChevronDown, Check, LogOut, ArrowRight } from 'lucide-react';
import { RegimenTimelineView } from '@/features/regimens/RegimenTimelineView';
import { BiometricTelemetryHubView } from '@/features/telemetry/BiometricTelemetryHubView';
import { InventoryCabinetView } from '@/features/inventory/InventoryCabinetView';
import { FamilyMessageBoard } from '@/features/household/FamilyMessageBoard';
import { DocumentVaultView } from '@/features/documents/DocumentVaultView';
import { EmergencyTriageView } from '@/features/emergency/EmergencyTriageView';
import { AgencyRosterView } from '@/features/enterprise/AgencyRosterView';
import { LandingPageView } from '@/features/landing/LandingPageView';
import { CloudConnectionModal } from '@/features/cloud/CloudConnectionModal';
import { AuthModal } from '@/features/auth/AuthModal';
import { CaregiverQrPairingModal } from '@/features/household/CaregiverQrPairingModal';
import { PaywallModal } from '@/features/billing/PaywallModal';
import { ClinicalAlertsInboxModal } from '@/features/alerts/ClinicalAlertsInboxModal';
import { AiHealthCompanionModal } from '@/features/ai/AiHealthCompanionModal';
import { useThemeStore } from '@/stores/useThemeStore';
import { useEnterpriseStore } from '@/stores/useEnterpriseStore';
import { useCloudConfigStore } from '@/stores/useCloudConfigStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useBillingStore } from '@/stores/useBillingStore';
import { useAlertsStore } from '@/stores/useAlertsStore';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('app');
  const [activeTab, setActiveTab] = useState<'today' | 'vitals' | 'cabinet' | 'family' | 'vault' | 'emergency' | 'agency'>('today');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLogoMenuOpen, setIsLogoMenuOpen] = useState(false);
  const [isProfileQuickMenuOpen, setIsProfileQuickMenuOpen] = useState(false);

  const logoMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useThemeStore();
  const { isEnterpriseMode, toggleEnterpriseMode } = useEnterpriseStore();
  const { connectionStatus } = useCloudConfigStore();
  const { currentUser, loginAsDemoPersona, logout } = useAuthStore();
  const { openPaywall } = useBillingStore();
  const { openInbox, getUnreadCount } = useAlertsStore();

  const unreadAlerts = getUnreadCount();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (logoMenuRef.current && !logoMenuRef.current.contains(event.target as Node)) {
        setIsLogoMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileQuickMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      {/* Top Streamlined Header - Compact, Elegant, Zero Horizontal Overflow */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          
          {/* Left Side: Brand Logo with Unified Mode Switcher Dropdown */}
          <div className="relative" ref={logoMenuRef}>
            <button
              onClick={() => setIsLogoMenuOpen(!isLogoMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
                S
              </div>
              <div className="text-left flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  Syncura
                </h1>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-500/30">
                  {currentView === 'landing' ? 'Overview' : isEnterpriseMode ? 'Enterprise' : 'Family'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition" />
              </div>
            </button>

            {/* Logo Dropdown Menu */}
            {isLogoMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 text-xs space-y-1 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Workspace & View Switcher
                </div>

                <button
                  onClick={() => {
                    setCurrentView('landing');
                    setIsLogoMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center justify-between transition ${
                    currentView === 'landing' ? 'bg-brand-500 text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-4 h-4" /> Overview
                  </span>
                  {currentView === 'landing' && <Check className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    if (isEnterpriseMode) toggleEnterpriseMode();
                    setCurrentView('app');
                    setActiveTab('today');
                    setIsLogoMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center justify-between transition ${
                    currentView === 'app' && !isEnterpriseMode ? 'bg-brand-500 text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Pill className="w-4 h-4" /> Family Care Mode (Personal)
                  </span>
                  {currentView === 'app' && !isEnterpriseMode && <Check className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    if (!isEnterpriseMode) toggleEnterpriseMode();
                    setCurrentView('app');
                    setActiveTab('agency');
                    setIsLogoMenuOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center justify-between transition ${
                    currentView === 'app' && isEnterpriseMode ? 'bg-brand-500 text-slate-950' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Enterprise Agency (eMAR / EVV)
                  </span>
                  {currentView === 'app' && isEnterpriseMode && <Check className="w-4 h-4" />}
                </button>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      openPaywall();
                      setIsLogoMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition"
                  >
                    <Zap className="w-4 h-4 text-amber-500 fill-current" />
                    <span>14-Day Free Trial & Pricing</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: 3 Unified Action Icons (AI, Alerts, Profile Sheet) */}
          <div className="flex items-center gap-2">
            {/* 1. Ask AI Advocate Trigger */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="py-1.5 px-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-brand-500/30 border border-purple-500/40 text-purple-900 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:scale-105 transition"
              title="Ask Syncura AI Health Advocate (Gemini 1.5)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-current animate-pulse" />
              <span className="font-bold">Ask AI</span>
            </button>

            {/* 2. Clinical Alerts Inbox Bell */}
            <button
              onClick={openInbox}
              className="relative p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition shadow-sm"
              title="Clinical Safety Alerts & Inbox"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadAlerts}
                </span>
              )}
            </button>

            {/* 3. Unified Profile & System Control Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileQuickMenuOpen(!isProfileQuickMenuOpen)}
                className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition flex items-center gap-1 shadow-sm"
                title="Account & Quick Settings"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                  alt="User"
                  className="w-6 h-6 rounded-xl object-cover"
                />
                <ChevronDown className="w-3 h-3 text-slate-400 mr-1" />
              </button>

              {/* Profile & Settings Dropdown */}
              {isProfileQuickMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 p-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 text-xs space-y-3 animate-fadeIn">
                  {/* User Badge */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={currentUser?.fullName}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/20"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">{currentUser?.fullName}</h4>
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-1.5 py-0.2 rounded">
                          {currentUser?.role.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Personas Strip */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block px-1">Switch Persona</span>
                    <div className="grid grid-cols-3 gap-1 text-[11px] font-bold text-center">
                      <button
                        onClick={() => {
                          loginAsDemoPersona('david_caregiver');
                          if (isEnterpriseMode) toggleEnterpriseMode();
                          setIsProfileQuickMenuOpen(false);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-slate-950 transition"
                      >
                        👨‍💼 David
                      </button>
                      <button
                        onClick={() => {
                          loginAsDemoPersona('eleanor_senior');
                          if (isEnterpriseMode) toggleEnterpriseMode();
                          setIsProfileQuickMenuOpen(false);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-slate-950 transition"
                      >
                        👵 Eleanor
                      </button>
                      <button
                        onClick={() => {
                          loginAsDemoPersona('marcus_nurse');
                          if (!isEnterpriseMode) toggleEnterpriseMode();
                          setActiveTab('agency');
                          setIsProfileQuickMenuOpen(false);
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-slate-950 transition"
                      >
                        🩺 Nurse RN
                      </button>
                    </div>
                  </div>

                  {/* Quick System Tools */}
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsPairingModalOpen(true);
                        setIsProfileQuickMenuOpen(false);
                      }}
                      className="w-full p-2 rounded-xl text-left font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                    >
                      <span className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-brand-500" /> Caregiver QR Pairing
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsCloudModalOpen(true);
                        setIsProfileQuickMenuOpen(false);
                      }}
                      className="w-full p-2 rounded-xl text-left font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                    >
                      <span className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-sky-500" /> Supabase Cloud Database
                      </span>
                      <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    </button>

                    <button
                      onClick={toggleTheme}
                      className="w-full p-2 rounded-xl text-left font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                    >
                      <span className="flex items-center gap-2">
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        <span>Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsProfileQuickMenuOpen(false);
                      }}
                      className="w-full p-2 rounded-xl text-left font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-purple-500" /> Account & Credentials
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 pt-5">
        {currentView === 'landing' ? (
          <LandingPageView
            onLaunchApp={() => {
              setCurrentView('app');
              setActiveTab('today');
            }}
            onLaunchSeniorMode={() => {
              loginAsDemoPersona('eleanor_senior');
              setCurrentView('app');
              setActiveTab('today');
            }}
            onLaunchAgencyMode={() => {
              loginAsDemoPersona('marcus_nurse');
              if (!isEnterpriseMode) toggleEnterpriseMode();
              setCurrentView('app');
              setActiveTab('agency');
            }}
          />
        ) : (
          <div className="max-w-lg mx-auto">
            {activeTab === 'today' && <RegimenTimelineView />}
            {activeTab === 'agency' && <AgencyRosterView />}
            {activeTab === 'vitals' && <BiometricTelemetryHubView />}
            {activeTab === 'cabinet' && <InventoryCabinetView />}
            {activeTab === 'family' && <FamilyMessageBoard />}
            {activeTab === 'vault' && <DocumentVaultView />}
            {activeTab === 'emergency' && <EmergencyTriageView />}
          </div>
        )}
      </main>

      {/* Bottom Sticky Tab Navigation Bar (Active in App Mode) */}
      {currentView === 'app' && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2">
          <div className="max-w-lg mx-auto flex items-center justify-around">
            {isEnterpriseMode ? (
              <button
                onClick={() => setActiveTab('agency')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                  activeTab === 'agency' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-[10px]">Census</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('today')}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                  activeTab === 'today' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                }`}
              >
                <Pill className="w-5 h-5" />
                <span className="text-[10px]">Today</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                activeTab === 'vitals' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px]">Vitals</span>
            </button>

            <button
              onClick={() => setActiveTab('cabinet')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                activeTab === 'cabinet' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px]">Cabinet</span>
            </button>

            <button
              onClick={() => setActiveTab('family')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                activeTab === 'family' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
              <span className="text-[10px]">{isEnterpriseMode ? 'Handover' : 'Family'}</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                activeTab === 'vault' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="text-[10px]">Records</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                activeTab === 'emergency' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-rose-600'
              }`}
            >
              <PhoneCall className="w-5 h-5" />
              <span className="text-[10px]">ICE Pass</span>
            </button>
          </div>
        </nav>
      )}

      {/* Modals */}
      <CloudConnectionModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <CaregiverQrPairingModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
      />
      <AiHealthCompanionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
      <ClinicalAlertsInboxModal />
      <PaywallModal />
    </div>
  );
}
