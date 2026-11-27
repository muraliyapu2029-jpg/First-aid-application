import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneOff,
  Mic,
  Volume2,
  Ambulance,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Square,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useVoiceInput, type VoiceInputResult } from '../hooks/useVoiceInput';
import { useTTS } from '../hooks/useTTS';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import {
  detectEmergency,
  isAmbulanceRequested,
  isHospitalRequested,
} from '../services/emergencyDetection';
import { getFirstAidProtocol, getEmergencyIcon } from '../services/firstAidService';
import { askSarvamEmergencyDoctor, checkSarvamAvailability } from '../services/sarvamService';
import { isAIEnabled } from '../services/aiService';
import {
  AMBULANCE_NUMBER,
  EmergencyCategory,
  SARVAM_LANGUAGE_NAMES,
  type CallTurn,
  type SarvamLanguageCode,
} from '../types';

type CallPhase = 'listening' | 'thinking' | 'speaking' | 'waiting';

const VISUALIZER_BARS = [42, 78, 55, 92, 64, 85, 48, 96, 70, 58, 82, 45];

export default function Listening() {
  const { language, detectedLanguageCode, setDetectedLanguage } = useLanguage();
  const {
    detection,
    callHistory,
    activeGuidelines,
    setDetection,
    addCallTurn,
    setAmbulanceTriggered,
    setActiveGuidelines,
  } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const navigate = useNavigate();

  const {
    isListening,
    isTranscribing,
    interimTranscript,
    error: voiceError,
    start,
    stop,
    cancel,
  } = useVoiceInput(language);

  const { speak, stop: stopSpeaking, isSpeaking } = useTTS(language, detectedLanguageCode);

  const [phase, setPhase] = useState<CallPhase>('listening');
  const [callSeconds, setCallSeconds] = useState(0);
  const [activeLangCode, setActiveLangCode] = useState<SarvamLanguageCode>(detectedLanguageCode);
  const [lastSpokenReply, setLastSpokenReply] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);
  const historyRef = useRef<CallTurn[]>(callHistory);
  useEffect(() => {
    historyRef.current = callHistory;
  }, [callHistory]);

  // Call timer
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCallSeconds(s => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const triggerAmbulanceFlow = useCallback(
    (spokenConfirmation?: string, langCode?: SarvamLanguageCode) => {
      setAmbulanceTriggered(true);
      if (spokenConfirmation) {
        speak(spokenConfirmation, langCode ?? activeLangCode);
      }
      window.location.href = `tel:${AMBULANCE_NUMBER}`;
      navigate('/hospitals?ambulance=1');
    },
    [activeLangCode, navigate, setAmbulanceTriggered, speak]
  );

  const handleVoiceResult = useCallback(
    async ({ transcript, languageCode }: VoiceInputResult) => {
      setPhase('thinking');
      setStatusError(null);
      setActiveLangCode(languageCode);
      setDetectedLanguage(languageCode);

      const userTurn: CallTurn = {
        role: 'user',
        text: transcript,
        languageCode,
      };
      addCallTurn(userTurn);
      const updatedHistory = [...historyRef.current, userTurn];

      // Immediate ambulance check
      if (isAmbulanceRequested(transcript)) {
        const confirmMsg =
          languageCode === 'kn-IN'
            ? `ಆಂಬ್ಯುಲೆನ್ಸ್ ${AMBULANCE_NUMBER} ಕ್ಕೆ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ ಮತ್ತು ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಯನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇನೆ.`
            : languageCode === 'hi-IN'
              ? `एम्बुलेंस ${AMBULANCE_NUMBER} को कॉल कर रहे हैं और सबसे नजदीकी अस्पताल खोज रहे हैं।`
              : `Calling ambulance ${AMBULANCE_NUMBER} and finding the nearest hospital now.`;
        triggerAmbulanceFlow(confirmMsg, languageCode);
        return;
      }

      // Use Sarvam AI conversational doctor when online & configured
      if (!isOffline && (await checkSarvamAvailability())) {
        try {
          const ai = await askSarvamEmergencyDoctor({
            transcript,
            languageCode,
            history: updatedHistory,
          });

          setDetection({
            category: ai.category,
            confidence: 0.95,
            rawText: transcript,
            source: 'sarvam-ai',
            detectedLanguageCode: languageCode,
            arrangeAmbulance: ai.arrangeAmbulance,
            findHospital: ai.findHospital,
            aiGuidance: ai,
          });
          setActiveGuidelines({
            title: ai.title,
            guidelines: ai.guidelines,
            doNots: ai.doNots,
          });
          addCallTurn({
            role: 'assistant',
            text: ai.voiceReply,
            languageCode,
            guidelines: ai.guidelines,
            doNots: ai.doNots,
          });

          if (ai.arrangeAmbulance) {
            triggerAmbulanceFlow(ai.voiceReply, languageCode);
            return;
          }

          if (ai.findHospital && ai.category === EmergencyCategory.UNKNOWN) {
            speak(ai.voiceReply, languageCode);
            navigate('/hospitals');
            return;
          }

          setLastSpokenReply(ai.voiceReply);
          setPhase('speaking');
          speak(ai.voiceReply, languageCode, () => {
            setPhase('waiting');
          });
          return;
        } catch {
          // Fall back to local WHO guidelines below
        }
      }

      // Offline / No-Sarvam-Key fallback using WHO local guidelines
      if (isHospitalRequested(transcript)) {
        navigate('/hospitals');
        return;
      }

      const fallbackResult = await detectEmergency(
        transcript,
        isAIEnabled() && !isOffline,
        languageCode
      );
      setDetection(fallbackResult);

      const uiLang = languageCode === 'kn-IN' ? 'kn' : languageCode === 'hi-IN' ? 'hi' : 'en';
      const proto = getFirstAidProtocol(fallbackResult.category, uiLang);
      const shortSteps = proto.steps.slice(0, 4).map(s => s.instruction);
      const shortDoNots = proto.doNots.slice(0, 3);

      setActiveGuidelines({
        title: proto.immediateAction,
        guidelines: shortSteps,
        doNots: shortDoNots,
      });

      const voiceText = [proto.immediateAction, ...shortSteps.slice(0, 2)].join('. ');
      setLastSpokenReply(voiceText);
      addCallTurn({
        role: 'assistant',
        text: voiceText,
        languageCode,
        guidelines: shortSteps,
        doNots: shortDoNots,
      });
      setPhase('speaking');
      speak(voiceText, languageCode, () => {
        setPhase('waiting');
      });
    },
    [
      addCallTurn,
      isOffline,
      navigate,
      setActiveGuidelines,
      setDetectedLanguage,
      setDetection,
      speak,
      triggerAmbulanceFlow,
    ]
  );

  const beginListeningTurn = useCallback(() => {
    stopSpeaking();
    setStatusError(null);
    setPhase('listening');
    void start(result => {
      void handleVoiceResult(result);
    });
  }, [handleVoiceResult, start, stopSpeaking]);

  // Start first listening turn immediately when the call screen opens
  useEffect(() => {
    const id = window.setTimeout(() => {
      beginListeningTurn();
    }, 0);
    return () => {
      window.clearTimeout(id);
      cancel();
      stopSpeaking();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const effectivePhase: CallPhase = isTranscribing
    ? 'thinking'
    : voiceError && phase === 'listening'
      ? 'waiting'
      : phase;
  const displayError = statusError ?? voiceError;

  const handleEndCall = () => {
    cancel();
    stopSpeaking();
    navigate(detection ? '/emergency' : '/');
  };

  const langInfo = SARVAM_LANGUAGE_NAMES[activeLangCode] ?? SARVAM_LANGUAGE_NAMES['en-IN'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-emerald-950/20 to-gray-950 flex flex-col px-5 py-6">
      {/* Phone Call Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <p className="text-white font-bold text-sm">RakshaAI Call</p>
            <p className="text-emerald-300 text-xs font-mono">{formatDuration(callSeconds)}</p>
          </div>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold text-emerald-300">
          {langInfo.native} ({activeLangCode})
        </div>
      </div>

      {/* Live Call Status Ring */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative flex items-center justify-center mb-4">
          {(isListening || isSpeaking) && (
            <span
              className={`absolute w-28 h-28 rounded-full opacity-30 animate-ping ${
                isListening ? 'bg-red-500' : 'bg-emerald-500'
              }`}
            />
          )}
          <div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl ${
              effectivePhase === 'listening'
                ? 'bg-red-600'
                : effectivePhase === 'thinking'
                  ? 'bg-amber-600'
                  : effectivePhase === 'speaking'
                    ? 'bg-emerald-600'
                    : 'bg-white/15'
            }`}
          >
            {effectivePhase === 'thinking' ? (
              <Loader2 size={40} className="text-white animate-spin" />
            ) : effectivePhase === 'speaking' ? (
              <Volume2 size={40} className="text-white animate-pulse" />
            ) : (
              <Mic size={40} className="text-white" />
            )}
          </div>
        </div>

        {/* Minimal status label */}
        <p className="text-white text-lg font-extrabold text-center">
          {effectivePhase === 'listening'
            ? 'Listening... Speak now'
            : effectivePhase === 'thinking'
              ? 'Checking WHO guidelines...'
              : effectivePhase === 'speaking'
                ? 'Speaking...'
                : 'Tap mic to ask or answer'}
        </p>

        {/* Audio bars while listening */}
        {isListening && (
          <div className="flex items-end gap-1 h-9 mt-3" aria-hidden="true">
            {VISUALIZER_BARS.map((height, i) => (
              <div
                key={i}
                className="w-1.5 bg-red-400 rounded-full"
                style={{
                  height: `${height}%`,
                  animation: `bounceGentle ${0.65 + (i % 4) * 0.12}s ease-in-out infinite`,
                  animationDelay: `${i * 0.06}s`,
                }}
              />
            ))}
          </div>
        )}

        {interimTranscript && (
          <p className="text-gray-300 text-sm text-center mt-2 px-4">{interimTranscript}</p>
        )}

        {isListening && (
          <button
            id="stop-speaking-btn"
            onClick={stop}
            className="mt-4 flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-2.5 rounded-full text-sm"
          >
            <Square size={14} className="fill-white" />
            Done Speaking
          </button>
        )}

        {displayError && (
          <p className="text-yellow-300 text-sm text-center mt-3 bg-yellow-950/60 border border-yellow-600/40 rounded-xl px-4 py-2">
            {displayError}
          </p>
        )}
      </div>

      {/* Guidelines-Only Card (Short WHO bullet points, NO long prose) */}
      {activeGuidelines && (
        <div className="bg-white/10 border border-white/15 rounded-3xl p-4 mb-4 space-y-3 overflow-y-auto max-h-72">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {detection && <span className="text-2xl">{getEmergencyIcon(detection.category)}</span>}
              <h2 className="text-white font-extrabold text-base">{activeGuidelines.title}</h2>
            </div>
            {lastSpokenReply && (
              <button
                onClick={() => speak(lastSpokenReply, activeLangCode)}
                aria-label="Replay voice"
                className="w-9 h-9 rounded-full bg-emerald-600/80 hover:bg-emerald-600 flex items-center justify-center flex-shrink-0"
              >
                <Volume2 size={18} className="text-white" />
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {activeGuidelines.guidelines.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-white text-sm font-semibold">
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>

          {activeGuidelines.doNots.length > 0 && (
            <ul className="space-y-1.5 pt-2 border-t border-white/10">
              {activeGuidelines.doNots.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-red-300 text-xs font-semibold">
                  <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Bottom Phone-Call Action Bar */}
      <div className="mt-auto space-y-3 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            id="call-ambulance-shortcut"
            onClick={() => triggerAmbulanceFlow()}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg"
          >
            <Ambulance size={20} />
            <span>{AMBULANCE_NUMBER}</span>
          </button>

          <button
            id="call-hospital-shortcut"
            onClick={() => {
              cancel();
              stopSpeaking();
              navigate('/hospitals');
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg"
          >
            <MapPin size={20} />
            <span>Hospital</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-5 pt-2">
          {!isListening && effectivePhase !== 'thinking' && (
            <button
              id="call-speak-again"
              onClick={beginListeningTurn}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-7 py-4 rounded-full shadow-xl text-base"
            >
              <Mic size={22} />
              <span>Speak</span>
            </button>
          )}

          <button
            id="listening-cancel-btn"
            onClick={handleEndCall}
            aria-label="End call"
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-black px-7 py-4 rounded-full shadow-xl text-base"
          >
            <PhoneOff size={22} />
            <span>End</span>
          </button>
        </div>
      </div>
    </div>
  );
}
