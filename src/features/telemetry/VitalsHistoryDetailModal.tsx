import React, { useState } from 'react';
import { X, Heart, Zap, Footprints, Moon, Droplets, Calendar, Clock, Plus, Check, Radio, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { BiometricMetricType } from '@/types/telemetry';
import { useTelemetryStore } from '@/stores/useTelemetryStore';

interface VitalsHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: BiometricMetricType | null;
}

export const VitalsHistoryDetailModal: React.FC<VitalsHistoryDetailModalProps> = ({
  isOpen,
  onClose,
  metricType,
}) => {
  const { getHistoryForMetric, waterLogs, todayWaterMl, addReading, logWater } = useTelemetryStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for manual additions
  const [manualSystolic, setManualSystolic] = useState('120');
  const [manualDiastolic, setManualDiastolic] = useState('80');
  const [manualPulse, setManualPulse] = useState('70');
  const [manualGlucose, setManualGlucose] = useState('110');
  const [manualWater, setManualWater] = useState('250');
  const [manualNotes, setManualNotes] = useState('');

  if (!isOpen || !metricType) return null;

  const history = getHistoryForMetric(metricType);

  const getMetricConfig = () => {
    switch (metricType) {
      case 'blood_pressure':
        return {
          title: 'Blood Pressure History',
          unit: 'mmHg',
          icon: <Heart className="w-5 h-5 text-rose-500" />,
          badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
          summary: 'Normal resting averages: 122/78 mmHg over the past 5 days.',
        };
      case 'blood_glucose':
        return {
          title: 'Continuous Glucose (CGM) History',
          unit: 'mg/dL',
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          badgeColor: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
          summary: 'Time in Target Range (70-140 mg/dL): 96.4% across all readings.',
        };
      case 'steps':
        return {
          title: 'Daily Steps & Walking History',
          unit: 'steps',
          icon: <Footprints className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
          badgeColor: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20',
          summary: 'Daily Average: 7,082 steps (4.5 km/day) via Apple Watch.',
        };
      case 'sleep':
        return {
          title: 'Sleep Architecture History',
          unit: 'hours',
          icon: <Moon className="w-5 h-5 text-indigo-500" />,
          badgeColor: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
          summary: 'Average: 7.5 hours/night with 1.8h restorative deep sleep.',
        };
      case 'water_intake':
        return {
          title: 'Daily Hydration Log',
          unit: 'mL',
          icon: <Droplets className="w-5 h-5 text-sky-500" />,
          badgeColor: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20',
          summary: `Total Today: ${todayWaterMl} mL of 2,500 mL goal.`,
        };
      default:
        return {
          title: 'Vitals History',
          unit: '',
          icon: <Activity className="w-5 h-5 text-brand-500" />,
          badgeColor: 'text-brand-600 dark:text-brand-400 bg-brand-50',
          summary: '',
        };
    }
  };

  const config = getMetricConfig();

  const handleSaveManualReading = () => {
    if (metricType === 'blood_pressure') {
      addReading({
        profile_id: 'prof-mom',
        metric_type: 'blood_pressure',
        source_device_name: 'Manual Entry',
        systolic_mmhg: parseInt(manualSystolic) || 120,
        diastolic_mmhg: parseInt(manualDiastolic) || 80,
        pulse_bpm: parseInt(manualPulse) || 70,
        notes: manualNotes.trim() || 'Manual cuff check',
        flag: 'normal',
      });
    } else if (metricType === 'blood_glucose') {
      addReading({
        profile_id: 'prof-mom',
        metric_type: 'blood_glucose',
        source_device_name: 'Fingerstick Meter',
        glucose_mg_dl: parseInt(manualGlucose) || 110,
        glucose_trend: 'flat',
        notes: manualNotes.trim() || 'Manual blood glucose check',
        flag: 'normal',
      });
    } else if (metricType === 'water_intake') {
      logWater(parseInt(manualWater) || 250, manualNotes.trim() || 'Hydration log');
    }

    setShowAddForm(false);
    setManualNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {config.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{config.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Timestamps, Trends & Device Feed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Summary Banner */}
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-sm ${config.badgeColor}`}>
            <span>{config.summary}</span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-1 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[11px] font-bold flex items-center gap-1 shadow-sm hover:border-brand-500 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? 'Cancel' : 'Log Reading'}
            </button>
          </div>

          {/* Quick Manual Add Form */}
          {showAddForm && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 shadow-md">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Log Manual Reading</h4>
              
              {metricType === 'blood_pressure' && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Systolic</label>
                    <input
                      type="number"
                      value={manualSystolic}
                      onChange={(e) => setManualSystolic(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Diastolic</label>
                    <input
                      type="number"
                      value={manualDiastolic}
                      onChange={(e) => setManualDiastolic(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Pulse</label>
                    <input
                      type="number"
                      value={manualPulse}
                      onChange={(e) => setManualPulse(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              )}

              {metricType === 'blood_glucose' && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={manualGlucose}
                    onChange={(e) => setManualGlucose(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              {metricType === 'water_intake' && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Water Amount (mL)</label>
                  <input
                    type="number"
                    value={manualWater}
                    onChange={(e) => setManualWater(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}

              <div>
                <input
                  type="text"
                  placeholder="Optional note (e.g. 30m post-meal, feeling rested)..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                onClick={handleSaveManualReading}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Reading to Record
              </button>
            </div>
          )}

          {/* Chronological History List */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              Recorded Timeline & Timestamps
            </h4>

            {/* Special rendering for water logs */}
            {metricType === 'water_intake' ? (
              <div className="space-y-2">
                {waterLogs.map((w) => (
                  <div key={w.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-sm">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">+{w.amountMl} mL</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{w.label}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {new Date(w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {metricType === 'blood_pressure' && (
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {item.systolic_mmhg}/{item.diastolic_mmhg} <span className="text-xs font-normal text-slate-500">mmHg</span>
                          </span>
                        )}
                        {metricType === 'blood_glucose' && (
                          <span className="text-base font-black text-brand-600 dark:text-brand-400">
                            {item.glucose_mg_dl} <span className="text-xs font-normal text-slate-500">mg/dL</span>
                          </span>
                        )}
                        {metricType === 'steps' && (
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {item.step_count?.toLocaleString()} <span className="text-xs font-normal text-slate-500">steps</span>
                          </span>
                        )}
                        {metricType === 'sleep' && (
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {((item.sleep_minutes || 450) / 60).toFixed(1)} <span className="text-xs font-normal text-slate-500">hours</span>
                          </span>
                        )}

                        {item.pulse_bpm && (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            • Pulse: {item.pulse_bpm} bpm
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium">{item.notes}</p>
                    )}

                    {item.source_device_name && (
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-900">
                        <span className="flex items-center gap-1 font-medium">
                          <Radio className="w-3 h-3 text-brand-500" /> {item.source_device_name}
                        </span>
                        <span className="uppercase font-bold text-brand-600 dark:text-brand-400">{item.flag || 'Verified'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
