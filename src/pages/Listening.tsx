import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { detectEmergency } from '../services/emergencyDetection';
import { isAIEnabled } from '../services/aiService';
import { t } from '../data/translations';

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
  const { language } = useLanguage();
  const { setDetection } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const navigate = useNavigate();

  const { isListening, transcript, interimTranscript, error, isSupported, start, stop } =
    useVoiceInput(language);

  const handleTranscriptReady = useCallback(
    async (text: string) => {
      const result = await detectEmergency(text, isAIEnabled() && !isOffline);
      setDetection(result);
      navigate('/emergency');
    },
    [isOffline, setDetection, navigate]
  );

  // Start listening as soon as page mounts
  useEffect(() => {
    if (isSupported) {
      start(() => {
        // On recognition end
        if (transcript) {
          handleTranscriptReady(transcript);
        }
      });
    }
    return () => { stop(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When a final transcript arrives, process it
  useEffect(() => {
    if (transcript && !isListening) {
      handleTranscriptReady(transcript);
    }
  }, [transcript, isListening, handleTranscriptReady]);

  const handleCancel = () => {
    stop();
    navigate('/');
  };

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

      {/* Animated mic indicator */}
      <div className="relative flex items-center justify-center mb-10">
        {/* Pulsing rings */}
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
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl">
          <svg viewBox="0 0 24 24" className="w-14 h-14 fill-white" aria-hidden="true">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm7 8a1 1 0 0 1 .993.883L20 12a8 8 0 0 1-7 7.938V22h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3v-2.062A8 8 0 0 1 4 12a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z" />
          </svg>
        </div>
      </div>

      {/* Status text */}
      <div className="text-center mb-8">
        <p className="text-white text-2xl font-bold mb-2">
          {error ? '❌ Error' : isListening ? t('listening', language) : t('processing', language)}
        </p>
        {error ? (
          <p className="text-red-400 text-sm px-4">{error}</p>
        ) : (
          <p className="text-gray-400 text-sm">{t('tapMicToStart', language)}</p>
        )}
      </div>

      {/* Live transcript display */}
      {(transcript || interimTranscript) && (
        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-4 border border-white/15 mb-6">
          <p className="text-white text-base leading-relaxed">
            {transcript || interimTranscript}
          </p>
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

      {/* Cancel button */}
      <button
        id="listening-cancel-btn"
        onClick={handleCancel}
        className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-base font-medium transition-colors border border-white/20"
      >
        {t('cancel', language)}
      </button>

      {/* Voice unavailable fallback */}
      {!isSupported && (
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
