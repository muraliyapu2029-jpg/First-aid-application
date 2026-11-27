import type { Language, SarvamLanguageCode, TTSCapability } from '../types';
import { speakWithSarvamTTS, stopSarvamAudio } from './sarvamService';

// ============================================================
// Speech Synthesis (Text-to-Speech) Service
// Primary: Sarvam Bulbul v3 TTS (supports 11 Indian languages + English)
// Fallback: Browser Web Speech Synthesis API
// ============================================================

const LANG_CODES: Record<Language, string[]> = {
  kn: ['kn-IN', 'kn'],
  hi: ['hi-IN', 'hi'],
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
};

export function toSarvamLangCode(lang: Language | SarvamLanguageCode): SarvamLanguageCode {
  if (lang.includes('-')) return lang as SarvamLanguageCode;
  if (lang === 'kn') return 'kn-IN';
  if (lang === 'hi') return 'hi-IN';
  return 'en-IN';
}

class SpeechSynthesisService {
  private capability: TTSCapability | null = null;
  private speakingSarvam = false;

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  async detectCapability(): Promise<TTSCapability> {
    if (!this.isSupported()) {
      return {
        supported: false,
        hasKannada: false,
        hasHindi: false,
        hasEnglish: false,
        availableVoices: [],
      };
    }

    await this.waitForVoices();

    const voices = window.speechSynthesis.getVoices();
    const voiceNames = voices.map(v => `${v.name} (${v.lang})`);

    const hasKannada = voices.some(v =>
      LANG_CODES.kn.some(code => v.lang.toLowerCase().startsWith(code.toLowerCase()))
    );
    const hasHindi = voices.some(v =>
      LANG_CODES.hi.some(code => v.lang.toLowerCase().startsWith(code.toLowerCase()))
    );
    const hasEnglish = voices.some(v =>
      LANG_CODES.en.some(code => v.lang.toLowerCase().startsWith(code.toLowerCase()))
    );

    this.capability = {
      supported: true,
      hasKannada,
      hasHindi,
      hasEnglish,
      availableVoices: voiceNames,
    };

    return this.capability;
  }

  private waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
        return;
      }
      const handler = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handler);
      setTimeout(resolve, 1500);
    });
  }

  private getBestVoice(language: Language): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices();
    const codes = LANG_CODES[language];

    for (const code of codes) {
      const voice = voices.find(v => v.lang.toLowerCase().startsWith(code.toLowerCase()));
      if (voice) return voice;
    }
    return null;
  }

  async speak(
    text: string,
    language: Language | SarvamLanguageCode,
    onEnd?: () => void,
    onError?: (err: string) => void
  ): Promise<void> {
    this.stop();

    const sarvamCode = toSarvamLangCode(language);
    this.speakingSarvam = true;
    const playedSarvam = await speakWithSarvamTTS(
      text,
      sarvamCode,
      () => {
        this.speakingSarvam = false;
        onEnd?.();
      },
      () => {
        this.speakingSarvam = false;
      }
    );

    if (playedSarvam) return;
    this.speakingSarvam = false;

    // Fallback to browser SpeechSynthesis
    if (!this.isSupported()) {
      onError?.('Text-to-speech is not supported on this device.');
      return;
    }

    const uiLang: Language = sarvamCode === 'kn-IN' ? 'kn' : sarvamCode === 'hi-IN' ? 'hi' : 'en';
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getBestVoice(uiLang);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = sarvamCode;
    }

    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => onError?.(`Speech synthesis error: ${e.error}`);

    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    this.speakingSarvam = false;
    stopSarvamAudio();
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.speakingSarvam || (this.isSupported() && window.speechSynthesis.speaking);
  }

  hasVoiceForLanguage(language: Language): boolean {
    if (!this.capability) return false;
    if (language === 'kn') return this.capability.hasKannada;
    if (language === 'hi') return this.capability.hasHindi;
    return this.capability.hasEnglish;
  }

  getCachedCapability(): TTSCapability | null {
    return this.capability;
  }
}

export const speechSynthesisService = new SpeechSynthesisService();
