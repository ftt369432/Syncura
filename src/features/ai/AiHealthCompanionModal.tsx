import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Mic, Volume2, Bot, User, Shield, Stethoscope, RefreshCw, StopCircle, Key, Check } from 'lucide-react';
import { GeminiClinicalService, ChatMessage } from '@/services/geminiClinicalService';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useMedicationStore } from '@/stores/useMedicationStore';
import { useClinicalMemoryStore } from '@/services/clinicalMemoryStore';
import { VoiceAlarmService } from '@/services/voiceAlarmService';

interface AiHealthCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiHealthCompanionModal: React.FC<AiHealthCompanionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profiles, activeProfileId } = useHouseholdStore();
  const { medications } = useMedicationStore();
  const { getMemoryForProfile } = useClinicalMemoryStore();

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const memory = getMemoryForProfile(activeProfile.id);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello! I'm your Syncura Clinical AI Advocate. I have full context on ${activeProfile.name.split(' ')[0]}'s active prescriptions (Eliquis, Metformin, Levothyroxine), allergies (Penicillin), and recent Quest lab results. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keySavedNotice, setKeySavedNotice] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingKey = GeminiClinicalService.getApiKey();
    setApiKeyInput(existingKey);
    if (!existingKey) {
      setShowKeyConfig(true); // Automatically show key prompt if not configured
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      GeminiClinicalService.setApiKey(apiKeyInput.trim());
      setKeySavedNotice(true);
      setTimeout(() => {
        setKeySavedNotice(false);
        setShowKeyConfig(false);
      }, 1000);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await GeminiClinicalService.askClinicalAdvocate(
        textToSend,
        activeProfile,
        medications,
        memory
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error generating AI response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechRecognition = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert('Voice dictation is supported on Chrome, Safari, and Edge.');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputPrompt(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  const handleSpeakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-500/10 via-purple-500/10 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center text-slate-950 shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Syncura AI Health Advocate
                <span className="text-[10px] uppercase font-bold bg-brand-500/20 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded">
                  Gemini 1.5 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Live Clinical Guidance for {activeProfile.name.split(' ')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="p-2 rounded-xl text-slate-400 hover:text-brand-500 transition"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Configuration Dropdown */}
        {showKeyConfig && (
          <form onSubmit={handleSaveApiKey} className="p-3 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
            <input
              type="password"
              placeholder="Paste Google Gemini API Key"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 font-mono"
            />
            <button
              type="submit"
              className="py-1.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold transition flex items-center gap-1"
            >
              {keySavedNotice ? <Check className="w-3.5 h-3.5" /> : 'Save Key'}
            </button>
          </form>
        )}

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800 flex gap-2 overflow-x-auto text-xs shrink-0 scrollbar-none">
          <button
            onClick={() => handleSend('Can Mom take Tylenol with Eliquis for a headache?')}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap transition shadow-sm"
          >
            💊 Tylenol + Eliquis Check
          </button>
          <button
            onClick={() => handleSend('Why must Levothyroxine be taken 30 mins before coffee?')}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap transition shadow-sm"
          >
            ☕ Coffee & Thyroid Timing
          </button>
          <button
            onClick={() => handleSend('What is the interaction between Lisinopril and coffee or Eleanor’s history?')}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap transition shadow-sm"
          >
            🫀 Lisinopril History Check
          </button>
          <button
            onClick={() => handleSend('Explain Eleanor’s Quest Diagnostics metabolic panel and HbA1c.')}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-300 font-semibold whitespace-nowrap transition shadow-sm"
          >
            🧪 Explain Recent Labs
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => {
            const isAi = msg.sender === 'assistant';

            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isAi ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 font-bold'
                }`}>
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`p-4 rounded-3xl max-w-[85%] space-y-2 shadow-sm ${
                  isAi ? 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200' : 'bg-brand-500 text-slate-950 font-medium'
                }`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isAi ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900'}`}>
                      {isAi ? 'Syncura Clinical AI' : 'You'}
                    </span>
                    <span className={`text-[10px] font-mono ${isAi ? 'text-slate-400' : 'text-slate-800'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="leading-relaxed whitespace-pre-line text-xs font-normal">
                    {msg.text}
                  </p>

                  {isAi && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        title="Read aloud with speech synthesizer"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                      </button>
                      <span className="text-[10px] text-slate-400">Context: Persistent Graph</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center shrink-0 animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                <span>Synthesizing clinical pharmacology & records with Gemini...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleSpeechRecognition}
              className={`p-3 rounded-2xl transition flex items-center justify-center ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-brand-500'
              }`}
              title="Speak Question (Microphone)"
            >
              {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              placeholder={`Ask anything about ${activeProfile.name.split(' ')[0]}'s pills, labs, or foods to avoid...`}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold transition disabled:opacity-50 shadow-md shadow-brand-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
