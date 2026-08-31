/**
 * Senior-Friendly Voice Alarm & Audio Chime Synthesizer
 * Uses native Web Speech API & Web Audio API (zero external mp3 lag, 100% offline).
 */

export class VoiceAlarmService {
  private static audioCtx: AudioContext | null = null;

  /**
   * Generates a warm, high-legibility melodic chime designed for aging ears
   */
  static playGentleChime(type: 'reminder' | 'taken_success' | 'prn_warning' = 'reminder') {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      if (type === 'reminder') {
        // 3-tone ascending pleasant harp chime (523.25Hz -> 659.25Hz -> 783.99Hz : C5-E5-G5)
        const tones = [523.25, 659.25, 783.99];
        tones.forEach((freq, i) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.15);

          gain.gain.setValueAtTime(0.3, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.45);
        });
      } else if (type === 'taken_success') {
        // 2-tone uplifting confirmation (587.33Hz -> 880Hz : D5-A5)
        [587.33, 880].forEach((freq, i) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.12);

          gain.gain.setValueAtTime(0.25, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.35);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.4);
        });
      } else if (type === 'prn_warning') {
        // Soft double attention pulse (440Hz -> 415Hz)
        [440, 415].forEach((freq, i) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.2);

          gain.gain.setValueAtTime(0.35, now + i * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.3);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.35);
        });
      }
    } catch (err) {
      console.warn('Audio chime playback error:', err);
    }
  }

  /**
   * Speaks friendly, natural spoken reminders for seniors
   */
  static speakMedicationReminder(patientName: string, medicationName: string, instructions: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Play chime first
    this.playGentleChime('reminder');

    setTimeout(() => {
      window.speechSynthesis.cancel(); // Clear any pending speech

      const firstName = patientName.split(' ')[0] || patientName;
      const speechText = `Hi ${firstName}, it is time for your ${medicationName}. ${instructions}`;

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = 0.9; // Slightly slower pacing for seniors
      utterance.pitch = 1.05; // Warm, friendly pitch
      utterance.volume = 1.0;

      // Select high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }, 450);
  }

  /**
   * Speaks dose taken confirmation
   */
  static speakDoseTakenConfirmation(medicationName: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.playGentleChime('taken_success');

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(`Great job! ${medicationName} has been logged.`);
      utterance.rate = 0.95;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }, 350);
  }
}
