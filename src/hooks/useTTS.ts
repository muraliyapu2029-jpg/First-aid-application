import { useState, useCallback, useEffect } from 'react';
import type { Language, SarvamLanguageCode, TTSCapability } from '../types';
import { speechSynthesisService } from '../services/speechSynthesis';
import { checkSarvamAvailability, isSarvamLikelyConfigured } from '../services/sarvamService';

// ============================================================
// useTTS Hook
// Uses Sarvam Bulbul v3 TTS when available (all 11 Indian languages),
// falling back to browser SpeechSynthesis API
// ============================================================

export interface TTSState {
  isSpeaking: boolean;
  capability: TTSCapability | null;
  isLoading: boolean;
  showKannadaWarning: boolean;
  sarvamReady: boolean;
}

export function useTTS(language: Language, detectedLanguageCode?: SarvamLanguageCode) {
  const cached = speechSynthesisService.getCachedCapability();
  const [state, setState] = useState<TTSState>({
    isSpeaking: false,
    capability: cached,
    isLoading: !cached,
    showKannadaWarning: false,
    sarvamReady: isSarvamLikelyConfigured(),
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      speechSynthesisService.detectCapability(),
      checkSarvamAvailability(),
    ]).then(([cap, sarvamReady]) => {
      if (!active) return;
      const showKannadaWarning = !sarvamReady && language === 'kn' && !cap.hasKannada;
      setState(prev => ({
        ...prev,
        capability: cap,
        isLoading: false,
        showKannadaWarning,
        sarvamReady,
      }));
    });
    return () => { active = false; };
  }, [language]);

  const speak = useCallback(
    (text: string, overrideLang?: Language | SarvamLanguageCode, onFinished?: () => void) => {
      const targetLang = overrideLang ?? detectedLanguageCode ?? language;
      setState(prev => ({ ...prev, isSpeaking: true }));

      void speechSynthesisService.speak(
        text,
        targetLang,
        () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
          onFinished?.();
        },
        () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
          onFinished?.();
        }
      );
    },
    [language, detectedLanguageCode]
  );

  const stop = useCallback(() => {
    speechSynthesisService.stop();
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const canSpeak = state.sarvamReady || (state.capability?.supported ?? false);
  const hasVoiceForCurrentLang =
    state.sarvamReady || speechSynthesisService.hasVoiceForLanguage(language);

  return { ...state, speak, stop, canSpeak, hasVoiceForCurrentLang };
}
