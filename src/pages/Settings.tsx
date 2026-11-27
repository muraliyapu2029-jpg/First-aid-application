import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, Mic, KeyRound, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  checkSarvamAvailability,
  getSarvamApiKey,
  setSarvamApiKey,
} from '../services/sarvamService';
import { SARVAM_LANGUAGE_NAMES } from '../types';
import { t } from '../data/translations';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</h3>
      <div className="bg-white/8 rounded-2xl border border-white/10 overflow-hidden">{children}</div>
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
  const { language, detectedLanguageCode, isAutoDetected } = useLanguage();
  const navigate = useNavigate();

  const [sarvamKey, setKeyInput] = useState(() => getSarvamApiKey());
  const [sarvamActive, setSarvamActive] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void checkSarvamAvailability().then(setSarvamActive);
  }, []);

  const handleSaveKey = async () => {
    setSarvamApiKey(sarvamKey);
    const active = await checkSarvamAvailability();
    setSarvamActive(active);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const detectedInfo = SARVAM_LANGUAGE_NAMES[detectedLanguageCode] ?? SARVAM_LANGUAGE_NAMES['en-IN'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col px-5 py-6 pb-24">
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

      {/* Automatic Language Detection Status */}
      <Section title="Automatic Language Detection">
        <Row
          label="Detected Language"
          value={`${detectedInfo.native} (${detectedLanguageCode}) — ${
            isAutoDetected ? 'Auto-detected from speech/text' : 'Default until you speak'
          }`}
        />
      </Section>

      {/* Sarvam AI Configuration */}
      <Section title="Sarvam AI (Voice + Auto-Language + Q&A)">
        <Row
          icon={
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ background: sarvamActive ? '#22c55e' : '#f59e0b' }}
            />
          }
          label="Sarvam AI Status"
          value={
            sarvamActive
              ? 'Active — Saaras v4 (Auto LID) + Sarvam-105B + Bulbul v3'
              : 'Not configured — enter key below or set SARVAM_API_KEY in .env'
          }
        />
        <div className="p-4 space-y-2.5">
          <label className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
            <KeyRound size={13} />
            Sarvam API Subscription Key
          </label>
          <div className="flex gap-2">
            <input
              id="sarvam-api-key-input"
              type="password"
              value={sarvamKey}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="Paste Sarvam API key..."
              className="flex-1 bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              id="save-sarvam-key-btn"
              onClick={() => {
                void handleSaveKey();
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 rounded-xl text-sm flex items-center gap-1.5"
            >
              {saved ? <Check size={16} /> : null}
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </Section>

      {/* Device Capabilities */}
      <Section title="Device Voice">
        <Row
          icon={<Volume2 size={18} />}
          label="Audio Playback / TTS"
          value={sarvamActive ? 'Sarvam Bulbul v3 (11 Indian languages)' : 'Browser speech synthesis'}
        />
        <Row
          icon={<Mic size={18} />}
          label="Microphone Recording"
          value={
            typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
              ? 'Available'
              : 'Not supported'
          }
        />
      </Section>
    </div>
  );
}
