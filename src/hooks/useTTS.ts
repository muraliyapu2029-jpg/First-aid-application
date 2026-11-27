import { useState, useCallback, useEffect } from 'react';
import type { Language, TTSCapability } from '../types';
import { speechSynthesisService } from '../services/speechSynthesis';

// ============================================================
// useTTS Hook
// Text-to-Speech with capability detection and Kannada warning
// ============================================================

export interface TTSState {
  isSpeaking: boolean;
  capability: TTSCapability | null;
  isLoading: boolean;
  showKannadaWarning: boolean;
}

export function useTTS(language: Language) {
  const cached = speechSynthesisService.getCachedCapability();
  const [state, setState] = useState<TTSState>({
    isSpeaking: false,
    capability: cached,
    isLoading: !cached,
    showKannadaWarning: cached ? language === 'kn' && !speechSynthesisService.hasVoiceForLanguage('kn') : false,
  });

  useEffect(() => {
    speechSynthesisService.detectCapability().then((cap) => {
      const showKannadaWarning = language === 'kn' && !speechSynthesisService.hasVoiceForLanguage('kn');
      setState(prev => ({
        ...prev,
        capability: cap,
        isLoading: false,
        showKannadaWarning,
      }));
    });
  }, [language]);

  const speak = useCallback(
    (text: string, overrideLang?: Language) => {
      const targetLang = overrideLang ?? language;
      setState(prev => ({ ...prev, isSpeaking: true }));

      speechSynthesisService.speak(
        text,
        targetLang,
        () => setState(prev => ({ ...prev, isSpeaking: false })),
        () => setState(prev => ({ ...prev, isSpeaking: false }))
      );
    },
    [language]
  );

  // Load audio for a sentence that will probably be spoken next
  const prefetch = useCallback(
    (text: string) => speechSynthesisService.prefetch(text, language),
    [language]
  );

  const stop = useCallback(() => {
    speechSynthesisService.stop();
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  const canSpeak = state.capability?.supported ?? false;
  const hasVoiceForCurrentLang = speechSynthesisService.hasVoiceForLanguage(language);

  return { ...state, speak, stop, prefetch, canSpeak, hasVoiceForCurrentLang };
}
