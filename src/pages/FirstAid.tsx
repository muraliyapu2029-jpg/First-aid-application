import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Ambulance, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useTTS } from '../hooks/useTTS';
import { FirstAidStep } from '../components/FirstAidStep';
import { EmergencyCard } from '../components/EmergencyCard';
import { getFirstAidProtocol } from '../services/firstAidService';
import { AMBULANCE_NUMBER } from '../types';
import { t } from '../data/translations';

export default function FirstAid() {
  const { language, detectedLanguageCode } = useLanguage();
  const { detection, currentStepIndex, nextStep, prevStep, setAmbulanceTriggered } = useEmergency();
  const navigate = useNavigate();
  const { speak, stop, isSpeaking, canSpeak, hasVoiceForCurrentLang } = useTTS(
    language,
    detectedLanguageCode
  );
  const protocol = useMemo(
    () => (detection ? getFirstAidProtocol(detection.category, language) : null),
    [detection, language]
  );
  const lastSpokenRef = useRef<string>('');

  useEffect(() => {
    if (!detection) navigate('/');
  }, [detection, navigate]);

  useEffect(() => {
    if (protocol && canSpeak && hasVoiceForCurrentLang) {
      const step = protocol.steps[currentStepIndex];
      const key = `${protocol.category}:${currentStepIndex}:${detectedLanguageCode}`;
      if (step && lastSpokenRef.current !== key) {
        lastSpokenRef.current = key;
        speak(step.instruction, detectedLanguageCode);
      }
    }
  }, [currentStepIndex, protocol, detectedLanguageCode, canSpeak, hasVoiceForCurrentLang, speak]);

  useEffect(() => () => stop(), [stop]);

  if (!detection || !protocol) return null;

  const currentStep = protocol.steps[currentStepIndex];
  const isLastStep = currentStepIndex === protocol.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col px-5 py-6 pb-28">
      <div className="flex items-center gap-3 mb-5">
        <button
          id="firstaid-back"
          onClick={() => {
            stop();
            navigate('/emergency');
          }}
          aria-label={t('back', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <div className="flex-1 min-w-0">
          <EmergencyCard category={detection.category} language={language} compact />
        </div>
      </div>

      {currentStep && (
        <div className="mb-5 flex-1">
          <FirstAidStep
            stepNumber={currentStepIndex + 1}
            totalSteps={protocol.steps.length}
            instruction={currentStep.instruction}
            language={language}
            isSpeaking={isSpeaking}
            canSpeak={canSpeak && hasVoiceForCurrentLang}
            onSpeak={() => speak(currentStep.instruction, detectedLanguageCode)}
            onStop={stop}
          />
        </div>
      )}

      <div className="flex gap-3 mb-5">
        <button
          id="firstaid-prev"
          onClick={() => {
            stop();
            prevStep();
          }}
          disabled={isFirstStep}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 disabled:opacity-30 hover:bg-white/20 text-white font-bold py-4 rounded-2xl text-base"
        >
          <ChevronLeft size={20} />
          {t('previous', language)}
        </button>
        {isLastStep ? (
          <button
            id="firstaid-done"
            onClick={() => {
              stop();
              navigate('/hospitals');
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base"
          >
            {t('findHospital', language)}
          </button>
        ) : (
          <button
            id="firstaid-next"
            onClick={() => {
              stop();
              nextStep();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl text-base"
          >
            {t('next', language)}
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {isLastStep && protocol.doNots.length > 0 && (
        <div className="bg-red-950/60 border border-red-700/40 rounded-2xl p-4 mb-5 space-y-2">
          {protocol.doNots.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-red-200 font-semibold">
              <XCircle size={17} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Always-visible Ambulance 108 Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950/95 border-t border-white/10 backdrop-blur-sm z-50">
        <div className="max-w-md mx-auto">
          <button
            id="firstaid-call-ambulance"
            onClick={() => {
              stop();
              setAmbulanceTriggered(true);
              window.location.href = `tel:${AMBULANCE_NUMBER}`;
              navigate('/hospitals?ambulance=1');
            }}
            className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-lg w-full shadow-lg"
          >
            <Ambulance size={24} />
            <span>Ambulance — {AMBULANCE_NUMBER}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
