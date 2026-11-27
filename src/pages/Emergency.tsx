import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Phone, MapPin, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useTTS } from '../hooks/useTTS';
import { EmergencyCard } from '../components/EmergencyCard';
import { TTSWarning } from '../components/TTSWarning';
import { EmergencyCategory } from '../types';
import { getFirstAidProtocol } from '../services/firstAidService';
import { t } from '../data/translations';

export default function Emergency() {
  const { language } = useLanguage();
  const { detection, reset } = useEmergency();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking, canSpeak, hasVoiceForCurrentLang, capability } = useTTS(language);
  const protocol = useMemo(
    () => (detection ? getFirstAidProtocol(detection.category, language) : null),
    [detection, language]
  );
  const lastSpokenRef = useRef<string>('');

  // If no emergency detected, go home
  useEffect(() => {
    if (!detection) navigate('/');
  }, [detection, navigate]);

  // Auto-speak the immediate action as soon as TTS capability is ready
  useEffect(() => {
    if (protocol && canSpeak && hasVoiceForCurrentLang) {
      const key = `${protocol.category}:${language}`;
      if (lastSpokenRef.current !== key) {
        lastSpokenRef.current = key;
        speak(protocol.immediateAction);
      }
    }
  }, [protocol, language, canSpeak, hasVoiceForCurrentLang, speak]);

  useEffect(() => () => stop(), [stop]);

  if (!detection || !protocol) return null;

  const isUnknown = detection.category === EmergencyCategory.UNKNOWN;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/30 to-gray-950 flex flex-col px-5 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          id="emergency-back"
          onClick={() => { stop(); reset(); navigate('/'); }}
          aria-label={t('back', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h2 className="text-lg font-bold text-white">{t('emergencyIdentified', language)}</h2>
      </div>

      {/* Emergency card */}
      <div className="mb-5">
        <EmergencyCard
          category={detection.category}
          language={language}
          confidence={detection.confidence}
          immediateAction={protocol.immediateAction}
        />
      </div>

      {/* TTS Warning if needed */}
      {capability && (
        <div className="mb-4">
          <TTSWarning
            language={language}
            hasVoiceForCurrentLang={hasVoiceForCurrentLang}
            ttsSupported={capability.supported}
          />
        </div>
      )}

      {/* Voice control */}
      {canSpeak && (
        <button
          id="emergency-speak-btn"
          onClick={() => isSpeaking ? stop() : speak(protocol.immediateAction)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-gray-200 transition-colors mb-5 w-fit"
        >
          <Volume2 size={16} className={isSpeaking ? 'text-red-400 animate-pulse' : 'text-gray-300'} />
          {isSpeaking ? 'Stop' : t('repeat', language)}
        </button>
      )}

      {/* Unknown emergency clarification */}
      {isUnknown && (
        <div className="bg-yellow-900/30 border border-yellow-600/40 rounded-2xl p-4 mb-5">
          <p className="text-yellow-300 font-semibold mb-1">{t('emergencyUnknown', language)}</p>
          <p className="text-yellow-400/80 text-sm">{t('askClarification', language)}</p>
        </div>
      )}

      {/* Professional care disclaimer */}
      <div className="bg-blue-950/50 border border-blue-800/40 rounded-2xl p-3 mb-5">
        <p className="text-blue-300 text-xs leading-relaxed">{t('professionalCareRequired', language)}</p>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {!isUnknown && (
          <button
            id="go-to-first-aid"
            onClick={() => navigate('/first-aid')}
            className="w-full flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-5 rounded-2xl text-lg shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>
              {language === 'kn'
                ? 'ಹಂತ-ಹಂತದ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ'
                : language === 'hi'
                  ? 'चरण-दर-चरण प्राथमिक चिकित्सा'
                  : 'Step-by-Step First Aid'}
            </span>
            <ChevronRight size={22} />
          </button>
        )}

        <div className="flex gap-3">
          <button
            id="emergency-find-hospital"
            onClick={() => navigate('/hospitals')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
          >
            <MapPin size={18} />
            {t('findHospital', language)}
          </button>
          <a
            href="tel:112"
            id="emergency-call-112"
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors"
          >
            <Phone size={18} />
            112
          </a>
        </div>
      </div>
    </div>
  );
}
