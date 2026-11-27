import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Ambulance,
  MapPin,
  Volume2,
  VolumeX,
  Mic,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useTTS } from '../hooks/useTTS';
import { EmergencyCard } from '../components/EmergencyCard';
import { getFirstAidProtocol } from '../services/firstAidService';
import { AMBULANCE_NUMBER, SARVAM_LANGUAGE_NAMES } from '../types';
import { t } from '../data/translations';

export default function Emergency() {
  const { language, detectedLanguageCode } = useLanguage();
  const { detection, activeGuidelines, reset, setAmbulanceTriggered } = useEmergency();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking, canSpeak, hasVoiceForCurrentLang } = useTTS(
    language,
    detectedLanguageCode
  );

  const protocol = useMemo(
    () => (detection ? getFirstAidProtocol(detection.category, language) : null),
    [detection, language]
  );

  const guidelinesToShow = useMemo(() => {
    if (activeGuidelines && activeGuidelines.guidelines.length > 0) {
      return activeGuidelines.guidelines;
    }
    return protocol ? protocol.steps.map(s => s.instruction) : [];
  }, [activeGuidelines, protocol]);

  const doNotsToShow = useMemo(() => {
    if (activeGuidelines && activeGuidelines.doNots.length > 0) {
      return activeGuidelines.doNots;
    }
    return protocol ? protocol.doNots : [];
  }, [activeGuidelines, protocol]);

  const spokenSummary = useMemo(() => {
    if (detection?.aiGuidance?.voiceReply) return detection.aiGuidance.voiceReply;
    if (!protocol) return '';
    return [protocol.immediateAction, ...guidelinesToShow.slice(0, 3)].join('. ');
  }, [detection, guidelinesToShow, protocol]);

  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    if (!detection) navigate('/');
  }, [detection, navigate]);

  useEffect(() => {
    if (protocol && spokenSummary && canSpeak && hasVoiceForCurrentLang) {
      const key = `${protocol.category}:${detectedLanguageCode}:${spokenSummary}`;
      if (lastSpokenRef.current !== key) {
        lastSpokenRef.current = key;
        speak(spokenSummary, detectedLanguageCode);
      }
    }
  }, [protocol, spokenSummary, detectedLanguageCode, canSpeak, hasVoiceForCurrentLang, speak]);

  useEffect(() => () => stop(), [stop]);

  if (!detection || !protocol) return null;

  const langLabel = SARVAM_LANGUAGE_NAMES[detectedLanguageCode]?.native ?? 'English';

  const handleAmbulance = () => {
    stop();
    setAmbulanceTriggered(true);
    window.location.href = `tel:${AMBULANCE_NUMBER}`;
    navigate('/hospitals?ambulance=1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/30 to-gray-950 flex flex-col px-5 py-5 pb-28">
      {/* Minimal Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="emergency-back"
          onClick={() => {
            stop();
            reset();
            navigate('/');
          }}
          aria-label={t('back', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-200" />
        </button>

        <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
          {langLabel}
        </span>

        {canSpeak && (
          <button
            id="emergency-speak-btn"
            onClick={() => (isSpeaking ? stop() : speak(spokenSummary, detectedLanguageCode))}
            aria-label={isSpeaking ? 'Stop voice' : t('repeat', language)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isSpeaking ? 'bg-red-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSpeaking ? (
              <VolumeX size={20} className="text-white" />
            ) : (
              <Volume2 size={20} className="text-white" />
            )}
          </button>
        )}
      </div>

      {/* Emergency Title + Immediate Action */}
      <div className="mb-4">
        <EmergencyCard
          category={detection.category}
          language={language}
          customTitle={activeGuidelines?.title}
          immediateAction={protocol.immediateAction}
        />
      </div>

      {/* WHO-Approved Guidelines Only (No Paragraphs) */}
      <div className="bg-white/10 border border-white/15 rounded-3xl p-4 mb-4 space-y-2.5">
        {guidelinesToShow.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-white text-base font-bold leading-snug">{step}</p>
          </div>
        ))}
      </div>

      {/* Critical Do-Nots */}
      {doNotsToShow.length > 0 && (
        <div className="bg-red-950/60 border border-red-700/40 rounded-3xl p-4 mb-5 space-y-2">
          {doNotsToShow.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm font-semibold leading-snug">{item}</p>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 mt-auto">
        <button
          id="go-to-first-aid"
          onClick={() => {
            stop();
            navigate('/first-aid');
          }}
          className="w-full flex items-center justify-between bg-white/15 hover:bg-white/25 text-white font-bold py-3.5 px-5 rounded-2xl text-base"
        >
          <span>
            {language === 'kn'
              ? 'ಒಂದೊಂದೇ ಹಂತ ನೋಡಿ'
              : language === 'hi'
                ? 'एक-एक कदम देखें'
                : 'Step-by-Step Voice'}
          </span>
          <ChevronRight size={20} />
        </button>

        <button
          id="ask-followup-call"
          onClick={() => {
            stop();
            navigate('/listening');
          }}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-2xl text-base shadow-lg"
        >
          <Mic size={20} />
          <span>
            {language === 'kn'
              ? 'ಪ್ರಶ್ನೆ ಕೇಳಿ (ಮಾತನಾಡಿ)'
              : language === 'hi'
                ? 'सवाल पूछें (बोलें)'
                : 'Ask Question (Voice Call)'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            id="emergency-call-ambulance-btn"
            onClick={handleAmbulance}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-sm shadow-lg"
          >
            <Ambulance size={20} />
            <span>{AMBULANCE_NUMBER}</span>
          </button>

          <button
            id="emergency-find-hospital"
            onClick={() => {
              stop();
              navigate('/hospitals');
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-sm shadow-lg"
          >
            <MapPin size={20} />
            <span>{t('findHospital', language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
