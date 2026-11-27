import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { isAIEnabled } from '../services/aiService';
import { t } from '../data/translations';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</h3>
      <div className="bg-white/8 rounded-2xl border border-white/10 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, icon }: { label: string; value?: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/5 last:border-0">
      {icon && <div className="text-gray-400">{icon}</div>}
      <div className="flex-1">
        <p className="text-white text-sm font-medium">{label}</p>
        {value && <p className="text-gray-400 text-xs mt-0.5">{value}</p>}
      </div>
    </div>
  );
}

export default function Settings() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const aiEnabled = isAIEnabled();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col px-5 py-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          id="settings-back"
          onClick={() => navigate(-1)}
          aria-label={t('back', language)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <h2 className="text-xl font-bold text-white">{t('settings', language)}</h2>
      </div>

      {/* Language */}
      <Section title={t('selectLanguage', language)}>
        <div className="p-4">
          <LanguageSelector selected={language} onChange={setLanguage} compact />
        </div>
      </Section>

      {/* Voice */}
      <Section title="Voice & Accessibility">
        <Row
          icon={<Volume2 size={18} />}
          label="Text-to-Speech"
          value={
            'speechSynthesis' in window
              ? 'Available on this device'
              : 'Not supported on this device'
          }
        />
        <Row
          icon={<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z"/><path d="M19 11a1 1 0 0 1 .993.883L20 12a8 8 0 0 1-7 7.938V22h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3v-2.062A8 8 0 0 1 4 12a1 1 0 0 1 2 0 6 6 0 0 0 12 0 1 1 0 0 1 1-1z"/></svg>}
          label="Voice Recognition"
          value={
            'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
              ? 'Available on this device'
              : 'Not supported — use text input'
          }
        />
        {language === 'kn' && (
          <Row
            icon={<VolumeX size={18} className="text-yellow-400" />}
            label="Kannada TTS Warning"
            value="Kannada voice may not be available. Instructions always shown as text."
          />
        )}
      </Section>

      {/* AI */}
      <Section title="AI Detection">
        <Row
          icon={<div className="w-4 h-4 rounded-full" style={{ background: aiEnabled ? '#22c55e' : '#6b7280' }} />}
          label="AI-Enhanced Detection"
          value={
            aiEnabled
              ? 'Active — Gemini API key configured'
              : 'Disabled — using rule-based detection (works offline)'
          }
        />
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <Row
          icon={<Shield size={18} />}
          label={t('privacyNote', language)}
        />
      </Section>

      {/* App version */}
      <div className="text-center mt-auto">
        <p className="text-xs text-gray-600">RakshaAI v1.0 — SCALER × Flow Hackathon 2024</p>
        <p className="text-xs text-gray-700 mt-1">{t('medicalDisclaimer', language)}</p>
      </div>
    </div>
  );
}
