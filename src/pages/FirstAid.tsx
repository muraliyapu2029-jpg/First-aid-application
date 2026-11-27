import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Phone, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useTTS } from '../hooks/useTTS';
import { FirstAidStep } from '../components/FirstAidStep';
import { EmergencyCard } from '../components/EmergencyCard';
import { TTSWarning } from '../components/TTSWarning';
import { getFirstAidProtocol } from '../services/firstAidService';
import { t } from '../data/translations';

export default function FirstAid() {
  const { language } = useLanguage();
  const { detection, currentStepIndex, nextStep, prevStep } = useEmergency();
  const navigate = useNavigate();
  const { speak, stop, prefetch, isSpeaking, canSpeak, hasVoiceForCurrentLang, capability } = useTTS(language);
  const protocol = useMemo(
    () => (detection ? getFirstAidProtocol(detection.category, language) : null),
    [detection, language]
  );
  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    if (!detection) navigate('/');
  }, [detection, navigate]);

  // Auto-speak the current step immediately when step or TTS readiness changes
  useEffect(() => {
    if (protocol && canSpeak && hasVoiceForCurrentLang) {
      const step = protocol.steps[currentStepIndex];
      const key = `${protocol.category}:${currentStepIndex}:${language}`;
      if (step && lastSpokenRef.current !== key) {
        lastSpokenRef.current = key;
        speak(step.instruction);
      }
    }
  }, [currentStepIndex, protocol, language, canSpeak, hasVoiceForCurrentLang, speak]);

  // Preload the next step's voice so it plays instantly on "Next"
  useEffect(() => {
    const next = protocol?.steps[currentStepIndex + 1];
    if (next && canSpeak && hasVoiceForCurrentLang) prefetch(next.instruction);
  }, [currentStepIndex, protocol, canSpeak, hasVoiceForCurrentLang, prefetch]);

  useEffect(() => () => stop(), [stop]);

  if (!detection || !protocol) return null;

  const currentStep = protocol.steps[currentStepIndex];
  const isLastStep = currentStepIndex === protocol.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col px-5 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          id="firstaid-back"
          onClick={() => { stop(); navigate('/emergency'); }}
          aria-label={t('back', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <div className="flex-1 min-w-0">
          <EmergencyCard
            category={detection.category}
            language={language}
            compact
          />
        </div>
      </div>

      {/* TTS Warning */}
      {capability && (
        <div className="mb-4">
          <TTSWarning
            language={language}
            hasVoiceForCurrentLang={hasVoiceForCurrentLang}
            ttsSupported={capability.supported}
          />
        </div>
      )}

      {/* Current step */}
      {currentStep && (
        <div className="mb-5 flex-1">
          <FirstAidStep
            stepNumber={currentStepIndex + 1}
            totalSteps={protocol.steps.length}
            instruction={currentStep.instruction}
            language={language}
            isSpeaking={isSpeaking}
            canSpeak={canSpeak && hasVoiceForCurrentLang}
            onSpeak={() => speak(currentStep.instruction)}
            onStop={stop}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mb-5">
        <button
          id="firstaid-prev"
          onClick={() => { stop(); prevStep(); }}
          disabled={isFirstStep}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 disabled:opacity-30 hover:bg-white/20 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all"
        >
          <ChevronLeft size={18} />
          {t('previous', language)}
        </button>
        {isLastStep ? (
          <button
            id="firstaid-done"
            onClick={() => navigate('/hospitals')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all"
          >
            {t('findHospital', language)}
          </button>
        ) : (
          <button
            id="firstaid-next"
            onClick={() => { stop(); nextStep(); }}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all"
          >
            {t('next', language)}
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Do-Nots — shown after last step */}
      {isLastStep && protocol.doNots.length > 0 && (
        <div className="bg-red-950/60 border border-red-700/40 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-400" />
            <h3 className="font-bold text-red-300 text-sm uppercase tracking-wide">
              {t('doNot', language)}
            </h3>
          </div>
          <ul className="space-y-2">
            {protocol.doNots.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-200">
                <span className="text-red-500 font-bold flex-shrink-0">✕</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* When to call doctor */}
      {isLastStep && (
        <div className="bg-blue-950/50 border border-blue-800/40 rounded-2xl p-4 mb-5">
          <h3 className="font-bold text-blue-300 text-sm mb-2">{t('whenToCallDoctor', language)}</h3>
          <p className="text-blue-200 text-sm leading-relaxed">{protocol.whenToCallDoctor}</p>
        </div>
      )}

      {/* Always-visible emergency call */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/95 border-t border-white/10 backdrop-blur-sm">
        <a
          href="tel:112"
          id="firstaid-call-112"
          className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors w-full shadow-lg"
        >
          <Phone size={22} />
          {t('callEmergency', language)} — 112
        </a>
      </div>
    </div>
  );
}
