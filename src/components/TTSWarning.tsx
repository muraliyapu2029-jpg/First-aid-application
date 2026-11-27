import { AlertTriangle, Volume2 } from 'lucide-react';
import type { Language } from '../types';
import { t } from '../data/translations';

// ============================================================
// TTSWarning Component
// Explicit warning when Kannada TTS is unavailable
// NEVER silently switches to English — always shows this notice
// ============================================================

interface Props {
  language: Language;
  hasVoiceForCurrentLang: boolean;
  ttsSupported: boolean;
}

export function TTSWarning({ language, hasVoiceForCurrentLang, ttsSupported }: Props) {
  if (!ttsSupported) {
    return (
      <div className="flex items-start gap-3 bg-gray-800/80 border border-gray-600 rounded-xl p-3 text-sm">
        <Volume2 size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-gray-300">{t('ttsUnavailable', language)}</p>
      </div>
    );
  }

  if (!hasVoiceForCurrentLang && language === 'kn') {
    return (
      <div className="flex items-start gap-3 bg-yellow-900/40 border border-yellow-600/50 rounded-xl p-3 text-sm animate-fade-in">
        <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-200 font-semibold mb-1">
            {t('ttsKannadaUnavailable', language)}
          </p>
          <p className="text-yellow-300/80 text-xs leading-relaxed">
            {t('ttsKannadaWarning', language)}
          </p>
        </div>
      </div>
    );
  }

  if (!hasVoiceForCurrentLang && language === 'hi') {
    return (
      <div className="flex items-start gap-3 bg-orange-900/40 border border-orange-600/50 rounded-xl p-3 text-sm">
        <AlertTriangle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
        <p className="text-orange-200">
          Hindi voice not available on this device. Instructions displayed in Hindi text below.
        </p>
      </div>
    );
  }

  return null;
}
