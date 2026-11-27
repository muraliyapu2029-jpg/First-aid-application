import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MapPin, Settings, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEmergency } from '../context/EmergencyContext';
import { isAudioRecordingSupported } from '../hooks/useAudioRecorder';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { detectEmergency } from '../services/emergencyDetection';
import { detectLanguage } from '../services/languageDetection';
import { speechRecognitionService } from '../services/speechRecognition';
import { isAIEnabled } from '../services/aiService';
import { MicrophoneButton } from '../components/MicrophoneButton';
import { LanguageSelector } from '../components/LanguageSelector';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { EmergencyCategory } from '../types';
import { t } from '../data/translations';

// Quick-select emergency categories for text fallback
const QUICK_CATEGORIES: Array<{ category: EmergencyCategory; emoji: string }> = [
  { category: EmergencyCategory.SNAKEBITE, emoji: '🐍' },
  { category: EmergencyCategory.HEART_ATTACK, emoji: '❤️' },
  { category: EmergencyCategory.STROKE, emoji: '🧠' },
  { category: EmergencyCategory.ROAD_ACCIDENT, emoji: '🚗' },
  { category: EmergencyCategory.HEAVY_BLEEDING, emoji: '🩸' },
  { category: EmergencyCategory.BURNS, emoji: '🔥' },
  { category: EmergencyCategory.ELECTRIC_SHOCK, emoji: '⚡' },
  { category: EmergencyCategory.CHOKING, emoji: '😮‍💨' },
  { category: EmergencyCategory.BREATHING_DIFFICULTY, emoji: '💨' },
  { category: EmergencyCategory.SEIZURE, emoji: '🌀' },
  { category: EmergencyCategory.UNCONSCIOUSNESS, emoji: '😶' },
  { category: EmergencyCategory.FAINTING, emoji: '💫' },
];

export default function Home() {
  const { language, setLanguage } = useLanguage();
  const { selectCategory, setDetection } = useEmergency();
  const { isOffline } = useOfflineStatus();
  const navigate = useNavigate();

  const [textInput, setTextInput] = useState('');
  const [micState, setMicState] = useState<'idle' | 'processing'>('idle');

  // Voice works if either the browser recognizer or audio recording
  // (for cloud STT via Sarvam) is available on this device.
  const isSupported = speechRecognitionService.isSupported() || isAudioRecordingSupported();

  // The Listening page owns the whole voice session (cloud or browser),
  // so the mic button only navigates — starting here too caused a double start.
  const handleMicClick = useCallback(() => {
    navigate('/listening');
  }, [navigate]);

  const handleTextSubmit = useCallback(async () => {
    const text = textInput.trim();
    if (!text) return;
    setMicState('processing');
    // Reply in the language the user typed in (Kannada / Hindi / English)
    const typedLanguage = detectLanguage(text, language);
    if (typedLanguage !== language) setLanguage(typedLanguage);
    const result = await detectEmergency(text, isAIEnabled() && !isOffline);
    setDetection(result);
    setMicState('idle');
    navigate('/emergency');
  }, [textInput, language, setLanguage, isOffline, setDetection, navigate]);

  const handleQuickSelect = useCallback(
    (category: EmergencyCategory) => {
      selectCategory(category);
      navigate('/emergency');
    },
    [selectCategory, navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/30 to-gray-950 flex flex-col">
      {/* Offline banner */}
      {isOffline && <OfflineIndicator language={language} variant="banner" />}

      <div className={`flex flex-col flex-1 px-5 pb-24 ${isOffline ? 'pt-12' : 'pt-6'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Raksha<span className="text-red-500">AI</span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{t('appTagline', language)}</p>
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

        {/* Language selector */}
        <div className="mb-8">
          <LanguageSelector selected={language} onChange={setLanguage} />
        </div>

        {/* Main prompt */}
        <div className="text-center mb-10">
          <p className="text-white text-xl font-semibold leading-snug px-4">
            {t('mainPrompt', language)}
          </p>
          <p className="text-gray-400 text-sm mt-2">{t('tapMicToStart', language)}</p>
        </div>

        {/* Microphone button — the primary CTA */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <MicrophoneButton
            state={micState}
            onClick={handleMicClick}
          />
          {!isSupported && (
            <p className="text-yellow-400 text-sm text-center px-4">
              {t('voiceUnavailable', language)}
            </p>
          )}
        </div>

        {/* Text input fallback */}
        <div className="mb-6">
          <div className="relative">
            <input
              id="emergency-text-input"
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
              placeholder={t('textInputPlaceholder', language)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3.5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
              aria-label={t('describeEmergency', language)}
            />
            <button
              id="text-submit-button"
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || micState === 'processing'}
              aria-label="Submit emergency description"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-red-600 disabled:bg-gray-600 rounded-xl flex items-center justify-center transition-colors"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>

        {/* Quick emergency category buttons */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-3 font-medium">{t('orSelectEmergency', language)}</p>
          <div className="grid grid-cols-3 gap-2.5">
            {QUICK_CATEGORIES.map(({ category, emoji }) => (
              <button
                key={category}
                id={`quick-select-${category}`}
                onClick={() => handleQuickSelect(category)}
                className="flex flex-col items-center gap-1.5 bg-white/8 hover:bg-white/15 border border-white/10 rounded-2xl p-3 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs text-gray-300 text-center leading-tight font-medium">
                  {t(`emergency_${category}` as Parameters<typeof t>[0], language)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom action strip */}
        <div className="flex gap-3 mt-auto">
          <a
            href="tel:112"
            id="home-call-112"
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-base transition-colors shadow-lg"
          >
            <Phone size={20} />
            <span>112</span>
          </a>
          <button
            id="home-find-hospital"
            onClick={() => navigate('/hospitals')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-2xl text-base transition-colors"
          >
            <MapPin size={20} />
            <span>{t('findHospital', language)}</span>
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-600 text-center mt-4 px-4 leading-relaxed">
          {t('medicalDisclaimer', language)}
        </p>
      </div>
    </div>
  );
}
