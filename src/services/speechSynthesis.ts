import type { Language, TTSCapability } from '../types';

// ============================================================
// Speech Synthesis (Text-to-Speech) Service
// Wraps SpeechSynthesis API with per-language capability detection
// ============================================================

const LANG_CODES: Record<Language, string[]> = {
  kn: ['kn-IN', 'kn'],
  hi: ['hi-IN', 'hi'],
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
};

class SpeechSynthesisService {
  private capability: TTSCapability | null = null;

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

    // Voices may not load immediately — wait for them
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
      // Fallback timeout
      setTimeout(resolve, 2000);
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

  speak(
    text: string,
    language: Language,
    onEnd?: () => void,
    onError?: (err: string) => void
  ): void {
    if (!this.isSupported()) {
      onError?.('Text-to-speech is not supported on this device.');
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getBestVoice(language);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      // Use language code without a matching voice — may fall back to default
      utterance.lang = LANG_CODES[language][0];
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      onError?.(`Speech synthesis error: ${e.error}`);
    };

    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.isSupported() && window.speechSynthesis.speaking;
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
