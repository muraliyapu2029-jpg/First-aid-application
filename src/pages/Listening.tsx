import { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useAudioRecorder, isAudioRecordingSupported } from '../hooks/useAudioRecorder';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { detectEmergency } from '../services/emergencyDetection';
import { detectLanguage } from '../services/languageDetection';
import { isAIEnabled } from '../services/aiService';
import {
  isCloudSTTAvailable,
  transcribeAudio,
  markCloudSTTUnavailable,
  CloudSTTError,
} from '../services/cloudSTT';
import { LanguageSelector } from '../components/LanguageSelector';
import type { Language } from '../types';
import { t } from '../data/translations';

// ============================================================
// Listening page
// Online + backend configured → record audio, Sarvam transcribes
//   and auto-detects Kannada / Hindi / English.
// Otherwise → browser SpeechRecognition in the current language.
// Either way the detected language becomes the app language, so
// every response (UI, first-aid steps, voice) matches the speaker.
// ============================================================

type Mode = 'checking' | 'cloud' | 'browser' | 'unsupported';

const VISUALIZER_BARS = [
  { height: 42, duration: 0.72 },
  { height: 78, duration: 0.95 },
  { height: 55, duration: 0.68 },
  { height: 92, duration: 1.12 },
  { height: 64, duration: 0.84 },
  { height: 85, duration: 1.05 },
  { height: 48, duration: 0.76 },
  { height: 96, duration: 1.18 },
  { height: 70, duration: 0.88 },
  { height: 58, duration: 0.74 },
  { height: 82, duration: 0.98 },
  { height: 45, duration: 0.66 },
];

export default function Listening() {
  const { language, setLanguage } = useLanguage();
  const { setDetection } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const navigate = useNavigate();

  const voice = useVoiceInput(language);
  const recorder = useAudioRecorder();

  const [mode, setMode] = useState<Mode>('checking');
  const [attempt, setAttempt] = useState(0);
  // Set when the user taps a language chip — overrides auto-detection
  const [forcedLanguage, setForcedLanguage] = useState<Language | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cloudTranscript, setCloudTranscript] = useState('');
  const handledRef = useRef(false);

  // Final step for both modes: switch app language, classify, navigate
  const finalize = useCallback(
    async (text: string, spokenLanguage: Language | null) => {
      if (handledRef.current) return;
      handledRef.current = true;
      setIsProcessing(true);

      const replyLanguage = forcedLanguage ?? spokenLanguage ?? detectLanguage(text, language);
      if (replyLanguage !== language) setLanguage(replyLanguage);

      const result = await detectEmergency(text, isAIEnabled() && !isOffline);
      setDetection(result);
      navigate('/emergency');
    },
    [forcedLanguage, language, setLanguage, isOffline, setDetection, navigate]
  );

  // One listening session per `attempt` (mount, retry, or language chip tap)
  useEffect(() => {
    let cancelled = false;
    handledRef.current = false;

    const startBrowser = () => {
      if (!voice.isSupported) {
        setMode('unsupported');
        return;
      }
      setMode('browser');
      voice.start();
    };

    const runCloud = async () => {
      setMode('cloud');
      let utterance;
      try {
        utterance = await recorder.record();
      } catch (err) {
        if (cancelled) return;
        if ((err as Error).message === 'not-allowed') {
          setErrorMessage(t('micPermissionDenied', language));
        } else {
          startBrowser(); // recording not possible — try the browser recognizer
        }
        return;
      }
      if (cancelled || !utterance) return;

      if (!utterance.hadSpeech || utterance.blob.size < 1_000) {
        setErrorMessage(t('noSpeechHeard', language));
        return;
      }

      setIsProcessing(true);
      try {
        const result = await transcribeAudio(utterance.blob, forcedLanguage);
        if (cancelled) return;
        if (!result.transcript) {
          setIsProcessing(false);
          setErrorMessage(t('noSpeechHeard', language));
          return;
        }
        setCloudTranscript(result.transcript);
        await finalize(result.transcript, result.language);
      } catch (err) {
        if (cancelled) return;
        setIsProcessing(false);
        if (err instanceof CloudSTTError && (err.code === 'out_of_credits' || err.code === 'not_configured')) {
          markCloudSTTUnavailable();
        }
        // Cloud failed — ask again using the on-device recognizer
        startBrowser();
      }
    };

    (async () => {
      const cloudReady = !isOffline && isAudioRecordingSupported() && (await isCloudSTTAvailable());
      if (cancelled) return;
      if (cloudReady) await runCloud();
      else startBrowser();
    })();

    return () => {
      cancelled = true;
      recorder.cancel();
      voice.stop();
    };
  }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser mode: process the final transcript once recognition ends
  useEffect(() => {
    if (mode === 'browser' && voice.transcript && !voice.isListening) {
      finalize(voice.transcript, null);
    }
  }, [mode, voice.transcript, voice.isListening, finalize]);

  // Reset UI state, then bump `attempt` so the session effect restarts
  const restartSession = () => {
    setErrorMessage(null);
    setCloudTranscript('');
    setIsProcessing(false);
    setMode('checking');
    setAttempt(a => a + 1);
  };

  const handleLanguagePick = (lang: Language) => {
    setLanguage(lang);
    setForcedLanguage(lang);
    restartSession();
  };

  const handleRetry = () => restartSession();

  const handleMicTap = () => {
    if (mode === 'cloud' && recorder.isRecording) recorder.stop();
    else if (mode === 'browser' && voice.isListening) voice.stop();
  };

  const handleCancel = () => {
    recorder.cancel();
    voice.stop();
    navigate('/');
  };

  const error = errorMessage ?? (mode === 'browser' ? voice.error : null);
  const isListening = mode === 'cloud' ? recorder.isRecording : mode === 'browser' && voice.isListening;
  const shownTranscript = cloudTranscript || voice.transcript || voice.interimTranscript;
  const canRetry = Boolean(error) && !isProcessing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/40 to-gray-950 flex flex-col items-center justify-center px-6 py-10">
      {/* Cancel button */}
      <div className="absolute top-6 right-6">
        <button
          id="listening-cancel"
          onClick={handleCancel}
          aria-label={t('cancel', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X size={22} className="text-gray-300" />
        </button>
      </div>

      {/* Animated mic indicator — tap to finish speaking */}
      <div className="relative flex items-center justify-center mb-10">
        {isListening && (
          <>
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className="absolute rounded-full bg-red-500 opacity-20 animate-ping"
                style={{
                  width: `${6 + i * 3}rem`,
                  height: `${6 + i * 3}rem`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '1.8s',
                }}
              />
            ))}
          </>
        )}
        <button
          id="listening-mic"
          type="button"
          onClick={handleMicTap}
          disabled={!isListening}
          aria-label={t('tapMicWhenDone', language)}
          className="relative w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl"
        >
          <svg viewBox="0 0 24 24" className="w-14 h-14 fill-white" aria-hidden="true">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 8a1 1 0 0 1 .993.883L20 12a8 8 0 0 1-7 7.938V22h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3v-2.062A8 8 0 0 1 4 12a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
          </svg>
        </button>
      </div>

      {/* Status text */}
      <div className="text-center mb-8" aria-live="polite">
        <p className="text-white text-2xl font-bold mb-2">
          {error ? '❌' : isListening ? t('listening', language) : t('processing', language)}
        </p>
        {error ? (
          <p className="text-red-400 text-sm px-4">{error}</p>
        ) : (
          <p className="text-gray-400 text-sm">
            {isListening ? t('tapMicWhenDone', language) : t('tapMicToStart', language)}
          </p>
        )}
      </div>

      {/* Live transcript display */}
      {shownTranscript && (
        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-4 border border-white/15 mb-6">
          <p className="text-white text-base leading-relaxed">{shownTranscript}</p>
        </div>
      )}

      {/* Audio visualizer bars */}
      {isListening && (
        <div className="flex items-end gap-1 h-12 mb-8" aria-hidden="true">
          {VISUALIZER_BARS.map((bar, i) => (
            <div
              key={i}
              className="w-2 bg-red-500 rounded-full opacity-80"
              style={{
                height: `${bar.height}%`,
                animationName: 'bounceGentle',
                animationDuration: `${bar.duration}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Retry after an error */}
      {canRetry && (
        <button
          id="listening-retry-btn"
          onClick={handleRetry}
          className="mb-4 flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-base font-bold transition-colors"
        >
          <RotateCcw size={18} />
          {t('tryAgain', language)}
        </button>
      )}

      {/* Language override — one tap restarts listening in that language */}
      {mode !== 'unsupported' && !isProcessing && (
        <div className="w-full max-w-sm mt-2 mb-4 text-center">
          <p className="text-gray-400 text-xs mb-2">{t('otherLanguagePrompt', language)}</p>
          <LanguageSelector selected={forcedLanguage ?? language} onChange={handleLanguagePick} compact />
        </div>
      )}

      {/* Cancel button */}
      <button
        id="listening-cancel-btn"
        onClick={handleCancel}
        className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-base font-medium transition-colors border border-white/20"
      >
        {t('cancel', language)}
      </button>

      {/* Voice unavailable fallback */}
      {mode === 'unsupported' && (
        <div className="mt-6 p-4 bg-yellow-900/40 border border-yellow-600/40 rounded-2xl text-center">
          <p className="text-yellow-300 font-semibold mb-1">{t('voiceUnavailable', language)}</p>
          <p className="text-yellow-400/80 text-sm">{t('voiceFallbackMessage', language)}</p>
          <button
            onClick={handleCancel}
            className="mt-3 text-sm text-blue-400 underline"
          >
            Go back to type instead
          </button>
        </div>
      )}
    </div>
  );
}
