import type { Language } from '../types';

// ============================================================
// Speech Recognition Service
// Wraps Web Speech API with graceful fallbacks
// ============================================================

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => unknown) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => unknown) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => unknown) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const LANG_MAP: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
};

export type RecognitionCallback = (transcript: string, isFinal: boolean) => void;
export type ErrorCallback = (error: string) => void;

class SpeechRecognitionService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;

  isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  start(
    language: Language,
    onResult: RecognitionCallback,
    onError: ErrorCallback,
    onEnd?: () => void
  ): boolean {
    if (!this.isSupported()) {
      onError('Speech recognition is not supported on this device.');
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    const SpeechRecognitionAPI =
      (window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      onError('Speech recognition API not available.');
      return false;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.lang = LANG_MAP[language];
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        onResult(finalTranscript, true);
      } else if (interimTranscript) {
        onResult(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      switch (event.error) {
        case 'not-allowed':
          onError('Microphone permission denied. Please allow microphone access.');
          break;
        case 'no-speech':
          onError('No speech detected. Please try again.');
          break;
        case 'network':
          onError('Network error. Please check your internet connection.');
          break;
        case 'audio-capture':
          onError('No microphone found. Please connect a microphone.');
          break;
        default:
          onError(`Speech recognition error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch {
      onError('Failed to start speech recognition. Please try again.');
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
