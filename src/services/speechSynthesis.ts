import type { Language, TTSCapability } from '../types';
import { getAudioUrl, isAudioVoiceAvailable, prefetchAudio, usesAudioVoice } from './voiceAudio';

// ============================================================
// Speech Synthesis (Text-to-Speech) Service
// - Kannada: plays Sarvam audio (pre-generated clip, or live via
//   the backend) because most devices have no Kannada voice.
// - Other languages, or when Sarvam audio is unavailable: the
//   device's SpeechSynthesis voice.
// ============================================================

const LANG_CODES: Record<Language, string[]> = {
  kn: ['kn-IN', 'kn'],
  hi: ['hi-IN', 'hi'],
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
};

const ALL_LANGUAGES: Language[] = ['kn', 'hi', 'en'];

class SpeechSynthesisService {
  private capability: TTSCapability | null = null;
  private audioVoiceLanguages = new Set<Language>();
  private audio: HTMLAudioElement | null = null;
  // Incremented on every speak/stop so late async results are ignored
  private playToken = 0;

  /** Device speechSynthesis support (not Sarvam audio). */
  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  async detectCapability(): Promise<TTSCapability> {
    const deviceSupported = this.isSupported();

    const [, audioLanguages] = await Promise.all([
      deviceSupported ? this.waitForVoices() : Promise.resolve(),
      Promise.all(ALL_LANGUAGES.map(async lang => ((await isAudioVoiceAvailable(lang)) ? lang : null))).then(
        langs => langs.filter((l): l is Language => l !== null)
      ),
    ]);

    this.audioVoiceLanguages = new Set(audioLanguages);

    const voices = deviceSupported ? window.speechSynthesis.getVoices() : [];
    const hasDeviceVoice = (lang: Language) =>
      voices.some(v => LANG_CODES[lang].some(code => v.lang.toLowerCase().startsWith(code.toLowerCase())));

    this.capability = {
      supported: deviceSupported || audioLanguages.length > 0,
      hasKannada: hasDeviceVoice('kn'),
      hasHindi: hasDeviceVoice('hi'),
      hasEnglish: hasDeviceVoice('en'),
      availableVoices: voices.map(v => `${v.name} (${v.lang})`),
      audioVoiceLanguages: audioLanguages,
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
    this.stop();
    const token = ++this.playToken;

    if (this.audioVoiceLanguages.has(language)) {
      getAudioUrl(text, language).then(url => {
        if (token !== this.playToken) return; // superseded by another speak/stop
        if (!url) {
          this.speakWithDevice(text, language, onEnd, onError, true);
          return;
        }
        this.playAudio(url, token, text, language, onEnd, onError);
      });
      return;
    }

    this.speakWithDevice(text, language, onEnd, onError, false);
  }

  private playAudio(
    url: string,
    token: number,
    text: string,
    language: Language,
    onEnd?: () => void,
    onError?: (err: string) => void
  ): void {
    const audio = new Audio(url);
    this.audio = audio;

    audio.onended = () => {
      if (token !== this.playToken) return;
      this.audio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      if (token !== this.playToken) return;
      this.audio = null;
      this.speakWithDevice(text, language, onEnd, onError, true);
    };
    audio.play().catch((err: DOMException) => {
      if (token !== this.playToken) return;
      this.audio = null;
      if (err?.name === 'NotAllowedError') {
        // Browser blocked autoplay — user can tap the speaker button
        onError?.('autoplay-blocked');
      } else {
        this.speakWithDevice(text, language, onEnd, onError, true);
      }
    });
  }

  private speakWithDevice(
    text: string,
    language: Language,
    onEnd: (() => void) | undefined,
    onError: ((err: string) => void) | undefined,
    requireMatchingVoice: boolean
  ): void {
    if (!this.isSupported()) {
      onError?.('Text-to-speech is not supported on this device.');
      return;
    }

    const voice = this.getBestVoice(language);
    // When falling back from Sarvam audio, never read Kannada with an
    // English voice — that is unintelligible. Text stays on screen.
    if (!voice && requireMatchingVoice) {
      onError?.('no-voice-for-language');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

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

  /** Start loading audio for a sentence likely to be spoken next. */
  prefetch(text: string, language: Language): void {
    if (this.audioVoiceLanguages.has(language) || usesAudioVoice(language)) {
      prefetchAudio(text, language);
    }
  }

  stop(): void {
    this.playToken++;
    if (this.audio) {
      this.audio.onended = null;
      this.audio.onerror = null;
      this.audio.pause();
      this.audio = null;
    }
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    if (this.audio && !this.audio.paused) return true;
    return this.isSupported() && window.speechSynthesis.speaking;
  }

  /** Can we speak this language — via Sarvam audio or a device voice? */
  hasVoiceForLanguage(language: Language): boolean {
    if (this.audioVoiceLanguages.has(language)) return true;
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
