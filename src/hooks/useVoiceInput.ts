import { useState, useEffect, useCallback, useRef } from 'react';
import type { Language, SarvamLanguageCode } from '../types';
import { speechRecognitionService } from '../services/speechRecognition';
import {
  checkSarvamAvailability,
  detectLanguageFromUnicode,
  transcribeWithSarvam,
} from '../services/sarvamService';

// ============================================================
// useVoiceInput Hook
// 1. Primary (when Sarvam AI is available): Records audio with MediaRecorder
//    + automatic silence detection, sends to Sarvam Saaras v4 (language_code: "unknown")
//    to auto-detect spoken language & transcribe.
// 2. Fallback: Browser Web Speech API
// ============================================================

export interface VoiceInputResult {
  transcript: string;
  languageCode: SarvamLanguageCode;
}

export interface VoiceInputState {
  isListening: boolean;
  isTranscribing: boolean;
  transcript: string;
  interimTranscript: string;
  detectedLanguageCode: SarvamLanguageCode | null;
  error: string | null;
  isSupported: boolean;
  usingSarvam: boolean;
}

export function useVoiceInput(fallbackLanguage: Language = 'en') {
  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isTranscribing: false,
    transcript: '',
    interimTranscript: '',
    detectedLanguageCode: null,
    error: null,
    isSupported:
      (typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)) ||
      speechRecognitionService.isSupported(),
    usingSarvam: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const onResultReadyRef = useRef<((res: VoiceInputResult) => void) | undefined>(undefined);
  const cancelledRef = useRef(false);

  const cleanupMedia = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      speechRecognitionService.stop();
      setState(prev => ({ ...prev, isListening: false }));
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    stopRecording();
    cleanupMedia();
    speechRecognitionService.stop();
    setState(prev => ({
      ...prev,
      isListening: false,
      isTranscribing: false,
    }));
  }, [cleanupMedia, stopRecording]);

  const startBrowserFallback = useCallback(
    (onReady?: (res: VoiceInputResult) => void) => {
      if (!speechRecognitionService.isSupported()) {
        setState(prev => ({
          ...prev,
          isListening: false,
          error: 'Voice input is not supported on this browser.',
        }));
        return;
      }

      let latestText = '';
      speechRecognitionService.start(
        fallbackLanguage,
        (text, isFinal) => {
          latestText = text;
          if (isFinal) {
            const langCode = detectLanguageFromUnicode(text);
            setState(prev => ({
              ...prev,
              transcript: text,
              interimTranscript: '',
              detectedLanguageCode: langCode,
            }));
          } else {
            setState(prev => ({ ...prev, interimTranscript: text }));
          }
        },
        (err) => {
          setState(prev => ({ ...prev, isListening: false, error: err }));
        },
        () => {
          setState(prev => ({ ...prev, isListening: false }));
          if (!cancelledRef.current && latestText.trim()) {
            const langCode = detectLanguageFromUnicode(latestText);
            onReady?.({ transcript: latestText.trim(), languageCode: langCode });
          }
        }
      );
    },
    [fallbackLanguage]
  );

  const start = useCallback(
    async (onReady?: (res: VoiceInputResult) => void) => {
      cancelledRef.current = false;
      onResultReadyRef.current = onReady;
      cleanupMedia();

      setState(prev => ({
        ...prev,
        isListening: true,
        isTranscribing: false,
        transcript: '',
        interimTranscript: '',
        error: null,
      }));

      const sarvamAvailable = await checkSarvamAvailability();
      const canRecord =
        typeof navigator !== 'undefined' &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== 'undefined';

      if (!sarvamAvailable || !canRecord) {
        setState(prev => ({ ...prev, usingSarvam: false }));
        startBrowserFallback(onReady);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        chunksRef.current = [];

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : '';

        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        setState(prev => ({ ...prev, usingSarvam: true }));

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          cleanupMedia();

          if (cancelledRef.current) return;

          if (blob.size < 800) {
            setState(prev => ({
              ...prev,
              isListening: false,
              isTranscribing: false,
              error: 'No speech captured. Tap mic and speak clearly.',
            }));
            return;
          }

          setState(prev => ({ ...prev, isListening: false, isTranscribing: true }));
          try {
            const result = await transcribeWithSarvam(blob);
            if (!result.transcript) {
              setState(prev => ({
                ...prev,
                isTranscribing: false,
                error: 'Could not hear clearly. Please speak again.',
              }));
              return;
            }
            setState(prev => ({
              ...prev,
              isTranscribing: false,
              transcript: result.transcript,
              detectedLanguageCode: result.languageCode,
            }));
            onResultReadyRef.current?.({
              transcript: result.transcript,
              languageCode: result.languageCode,
            });
          } catch {
            // If Sarvam STT fails transiently, notify user clearly
            setState(prev => ({
              ...prev,
              isTranscribing: false,
              error: 'Voice connection issue. Try again or tap an emergency icon.',
            }));
          }
        };

        // Silence auto-stop detection after speech begins (max 15s cap)
        try {
          const audioCtx = new AudioContext();
          audioCtxRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          const src = audioCtx.createMediaStreamSource(stream);
          src.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          let heardSpeech = false;
          let lastSpeechAt = Date.now();
          const startedAt = Date.now();

          const monitor = () => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
            analyser.getByteTimeDomainData(dataArray);
            let peak = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const v = Math.abs(dataArray[i] - 128);
              if (v > peak) peak = v;
            }
            const now = Date.now();
            if (peak > 8) {
              heardSpeech = true;
              lastSpeechAt = now;
            }
            if ((heardSpeech && now - lastSpeechAt > 2000) || now - startedAt > 15000) {
              stopRecording();
              return;
            }
            rafRef.current = requestAnimationFrame(monitor);
          };
          rafRef.current = requestAnimationFrame(monitor);
        } catch {
          // Fallback max duration timer if AudioContext unavailable
          silenceTimerRef.current = window.setTimeout(() => stopRecording(), 8000);
        }

        recorder.start(250);
      } catch (err) {
        cleanupMedia();
        const msg = err instanceof Error ? err.message : '';
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
          setState(prev => ({
            ...prev,
            isListening: false,
            error: 'Microphone permission denied. Please allow microphone access.',
          }));
        } else {
          startBrowserFallback(onReady);
        }
      }
    },
    [cleanupMedia, startBrowserFallback, stopRecording]
  );

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      cleanupMedia();
      speechRecognitionService.stop();
    };
  }, [cleanupMedia]);

  return {
    ...state,
    start,
    stop: stopRecording,
    cancel,
  };
}
