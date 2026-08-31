import React, { useState } from 'react';
import { Bell, AlertOctagon, AlertTriangle, Pill, Phone, X, Check, ShieldAlert, Sparkles, PhoneCall, Trash2, Heart, Clock } from 'lucide-react';
import { useAlertsStore, AlertCategory } from '@/stores/useAlertsStore';

export const ClinicalAlertsInboxModal: React.FC = () => {
  const {
    alerts,
    isInboxOpen,
    closeInbox,
    markAsRead,
    dismissAlert,
    triggerSimulatedDangerousDrugAlert,
  } = useAlertsStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'inventory' | 'timing'>('all');

  if (!isInboxOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'critical') return a.severity === 'critical' || a.category === 'drug_allergy';
    if (activeFilter === 'inventory') return a.category === 'inventory_runout';
    if (activeFilter === 'timing') return a.category === 'drug_interaction' || a.category === 'prn_safety';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Clinical Alerts & Safety Inbox
                {alerts.length > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Allergy Stops, DDI Warnings & Refill Alerts</p>
            </div>
          </div>
          <button onClick={closeInbox} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation Strip */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`py-1.5 px-3 rounded-xl font-bold transition ${
                activeFilter === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setActiveFilter('critical')}
              className={`py-1.5 px-3 rounded-xl font-bold transition ${
                activeFilter === 'critical' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Allergies & DDI
            </button>
            <button
              onClick={() => setActiveFilter('inventory')}
              className={`py-1.5 px-3 rounded-xl font-bold transition ${
                activeFilter === 'inventory' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Refills
            </button>
          </div>

          <button
            onClick={triggerSimulatedDangerousDrugAlert}
            className="py-1 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[10px] font-bold transition shrink-0 flex items-center gap-1"
            title="Simulate adding Amoxicillin to patient with Penicillin anaphylaxis"
          >
            <AlertOctagon className="w-3 h-3 text-rose-500" />
            Test Allergy Stop
          </button>
        </div>

        {/* Alert Items List */}
        <div className="p-6 overflow-y-auto space-y-3.5 text-xs">
          {filteredAlerts.length === 0 ? (
            <div className="py-10 text-center space-y-2 text-slate-500">
              <Check className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">No Active Clinical Alerts</p>
              <p className="text-xs">All medications, refills, and allergies are in safe alignment.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isHigh = alert.severity === 'high';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-3xl border transition space-y-3 shadow-sm ${
                    isCritical
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/20'
                      : isHigh
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/40'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      {isCritical ? (
                        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-rose-500/30">
                          <AlertOctagon className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : isHigh ? (
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <h4 className={`font-black text-xs ${isCritical ? 'text-rose-900 dark:text-rose-200' : 'text-slate-900 dark:text-white'}`}>
                          {alert.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold">Patient: {alert.patient_name}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-10">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 pl-10 border-t border-slate-200/60 dark:border-slate-800/80">
                    {alert.contact_phone ? (
                      <a
                        href={`tel:${alert.contact_phone}`}
                        className={`py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition ${
                          isCritical
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        }`}
                      >
                        <Phone className="w-3 h-3" />
                        {alert.action_label} ({alert.contact_phone})
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-semibold">{alert.action_label || 'Clinical notice logged'}</span>
                    )}

                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-slate-400 hover:text-rose-600 font-bold p-1 transition"
                      title="Acknowledge & Dismiss"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
