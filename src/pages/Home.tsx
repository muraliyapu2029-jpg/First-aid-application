import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Ambulance, MapPin, Settings, Send, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import {
  detectEmergency,
  isAmbulanceRequested,
  isHospitalRequested,
} from '../services/emergencyDetection';
import { isAIEnabled } from '../services/aiService';
import {
  askSarvamEmergencyDoctor,
  checkSarvamAvailability,
  detectLanguageFromTextSarvam,
} from '../services/sarvamService';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { AMBULANCE_NUMBER, EmergencyCategory, SARVAM_LANGUAGE_NAMES } from '../types';
import { t } from '../data/translations';

// Icon-first emergency buttons for low-literacy users (no dense text)
const QUICK_CATEGORIES: Array<{ category: EmergencyCategory; emoji: string }> = [
  { category: EmergencyCategory.SNAKEBITE, emoji: '🐍' },
  { category: EmergencyCategory.HEART_ATTACK, emoji: '❤️' },
  { category: EmergencyCategory.HEAVY_BLEEDING, emoji: '🩸' },
  { category: EmergencyCategory.BURNS, emoji: '🔥' },
  { category: EmergencyCategory.CHOKING, emoji: '😮‍💨' },
  { category: EmergencyCategory.ROAD_ACCIDENT, emoji: '🚗' },
  { category: EmergencyCategory.ELECTRIC_SHOCK, emoji: '⚡' },
  { category: EmergencyCategory.BREATHING_DIFFICULTY, emoji: '💨' },
  { category: EmergencyCategory.SEIZURE, emoji: '🌀' },
  { category: EmergencyCategory.STROKE, emoji: '🧠' },
  { category: EmergencyCategory.UNCONSCIOUSNESS, emoji: '😶' },
  { category: EmergencyCategory.FAINTING, emoji: '💫' },
];

export default function Home() {
  const { language, detectedLanguageCode, isAutoDetected, setDetectedLanguage } = useLanguage();
  const { selectCategory, setDetection, clearCallHistory, setAmbulanceTriggered } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const navigate = useNavigate();

  const [textInput, setTextInput] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleStartPhoneCall = useCallback(() => {
    clearCallHistory();
    navigate('/listening');
  }, [clearCallHistory, navigate]);

  const handleAmbulanceNow = useCallback(() => {
    setAmbulanceTriggered(true);
    window.location.href = `tel:${AMBULANCE_NUMBER}`;
    navigate('/hospitals?ambulance=1');
  }, [navigate, setAmbulanceTriggered]);

  const handleTextSubmit = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;

    setProcessing(true);
    try {
      const detectedLang = await detectLanguageFromTextSarvam(text);
      setDetectedLanguage(detectedLang);

      // Direct ambulance request from text
      if (isAmbulanceRequested(text)) {
        setAmbulanceTriggered(true);
        window.location.href = `tel:${AMBULANCE_NUMBER}`;
        navigate('/hospitals?ambulance=1');
        return;
      }

      if (!isOffline && (await checkSarvamAvailability())) {
        try {
          const aiGuidance = await askSarvamEmergencyDoctor({
            transcript: text,
            languageCode: detectedLang,
            history: [],
          });

          setDetection({
            category: aiGuidance.category,
            confidence: 0.95,
            rawText: text,
            source: 'sarvam-ai',
            detectedLanguageCode: detectedLang,
            arrangeAmbulance: aiGuidance.arrangeAmbulance,
            findHospital: aiGuidance.findHospital,
            aiGuidance,
          });

          if (aiGuidance.arrangeAmbulance) {
            window.location.href = `tel:${AMBULANCE_NUMBER}`;
            navigate('/hospitals?ambulance=1');
            return;
          }
          if (aiGuidance.findHospital) {
            navigate('/hospitals');
            return;
          }
          navigate('/emergency');
          return;
        } catch {
          // Fall back to rule-based detection below
        }
      }

      if (isHospitalRequested(text)) {
        navigate('/hospitals');
        return;
      }

      const result = await detectEmergency(text, isAIEnabled() && !isOffline, detectedLang);
      setDetection(result);
      navigate('/emergency');
    } finally {
      setProcessing(false);
    }
  }, [
    textInput,
    isOffline,
    setDetectedLanguage,
    setAmbulanceTriggered,
    setDetection,
    navigate,
  ]);

  const handleQuickSelect = useCallback(
    (category: EmergencyCategory) => {
      selectCategory(category);
      navigate('/emergency');
    },
    [selectCategory, navigate]
  );

  const detectedLabel = SARVAM_LANGUAGE_NAMES[detectedLanguageCode]?.native ?? 'English';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/25 to-gray-950 flex flex-col">
      {isOffline && <OfflineIndicator language={language} variant="banner" />}

      <div className={`flex flex-col flex-1 px-5 pb-24 ${isOffline ? 'pt-12' : 'pt-5'}`}>
        {/* Minimal Header — no manual language chooser */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg">
              <Phone size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Raksha<span className="text-red-500">AI</span>
              </h1>
              {isAutoDetected && (
                <span className="inline-block text-[11px] font-semibold text-emerald-300">
                  ● {detectedLabel}
                </span>
              )}
            </div>
          </div>

          <button
            id="settings-button"
            onClick={() => navigate('/settings')}
            aria-label={t('settings', language)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Settings size={20} className="text-gray-300" />
          </button>
        </div>

        {/* Primary Phone-Call CTA — Speak in ANY language */}
        <div className="flex flex-col items-center text-center my-4">
          <div className="relative flex items-center justify-center mb-4">
            <span className="absolute w-44 h-44 rounded-full bg-emerald-500/20 animate-ping" />
            <span className="absolute w-36 h-36 rounded-full bg-emerald-500/25 animate-pulse" />
            <button
              id="start-phone-call-btn"
              onClick={handleStartPhoneCall}
              aria-label="Start emergency voice call"
              className="relative w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-green-700 hover:from-emerald-400 hover:to-green-600 shadow-2xl flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-400"
            >
              <div className="flex items-center gap-1 text-white">
                <Phone size={32} />
                <Mic size={28} />
              </div>
            </button>
          </div>

          <p className="text-white text-xl font-extrabold">
            {language === 'kn'
              ? 'ಮಾತನಾಡಿ — ಸಹಾಯ ಪಡೆಯಿರಿ'
              : language === 'hi'
                ? 'बोलें — तुरंत मदद पाएं'
                : 'Tap & Speak'}
          </p>
        </div>

        {/* Instant 1-Tap Ambulance & Nearest Hospital */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            id="home-call-ambulance"
            onClick={handleAmbulanceNow}
            className="flex flex-col items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-black py-4 px-3 rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            <Ambulance size={28} />
            <span className="text-base">
              {language === 'kn'
                ? 'ಆಂಬ್ಯುಲೆನ್ಸ್'
                : language === 'hi'
                  ? 'एम्बुलेंस'
                  : 'Ambulance'}
            </span>
            <span className="text-xs font-bold opacity-90">{AMBULANCE_NUMBER}</span>
          </button>

          <button
            id="home-find-hospital"
            onClick={() => navigate('/hospitals')}
            className="flex flex-col items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-3 rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            <MapPin size={28} />
            <span className="text-base">{t('findHospital', language)}</span>
            <span className="text-xs font-bold opacity-90">Google Maps</span>
          </button>
        </div>

        {/* Visual Icon-First Emergency Grid (minimal text) */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2.5">
            {QUICK_CATEGORIES.map(({ category, emoji }) => (
              <button
                key={category}
                id={`quick-select-${category}`}
                onClick={() => handleQuickSelect(category)}
                className="flex flex-col items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl p-3.5 transition-all active:scale-95"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs text-white text-center leading-tight font-bold">
                  {t(`emergency_${category}` as Parameters<typeof t>[0], language)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Compact text fallback (auto-detects language too) */}
        <div className="mt-auto">
          <div className="relative">
            <input
              id="emergency-text-input"
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && void handleTextSubmit()}
              placeholder={t('textInputPlaceholder', language)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              aria-label={t('describeEmergency', language)}
            />
            <button
              id="text-submit-button"
              onClick={() => void handleTextSubmit()}
              disabled={!textInput.trim() || processing}
              aria-label="Send"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 disabled:bg-gray-600 rounded-xl flex items-center justify-center transition-colors"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
