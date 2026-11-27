import { useState, useEffect, useCallback, useRef } from 'react';
import type { Language } from '../types';
import { speechRecognitionService } from '../services/speechRecognition';

// ============================================================
// useVoiceInput Hook
// Manages speech recognition lifecycle
// ============================================================

export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export function useVoiceInput(language: Language) {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    isSupported: speechRecognitionService.isSupported(),
  });

  const onEndCallback = useRef<(() => void) | undefined>(undefined);

  const start = useCallback(
    (onEnd?: () => void) => {
      onEndCallback.current = onEnd;
      setState(prev => ({
        ...prev,
        isListening: true,
        transcript: '',
        interimTranscript: '',
        error: null,
      }));

      speechRecognitionService.start(
        language,
        (text, isFinal) => {
          if (isFinal) {
            setState(prev => ({
              ...prev,
              transcript: text,
              interimTranscript: '',
            }));
          } else {
            setState(prev => ({ ...prev, interimTranscript: text }));
          }
        },
        (error) => {
          setState(prev => ({
            ...prev,
            isListening: false,
            error,
          }));
        },
        () => {
          setState(prev => ({ ...prev, isListening: false }));
          onEndCallback.current?.();
        }
      );
    },
    [language]
  );

  const stop = useCallback(() => {
    speechRecognitionService.stop();
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '', error: null }));
  }, []);

  // Stop listening when component unmounts
  useEffect(() => {
    return () => {
      speechRecognitionService.stop();
    };
  }, []);

  return { ...state, start, stop, clearTranscript };
}
