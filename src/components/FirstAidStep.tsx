import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import type { Language } from '../types';
import { t } from '../data/translations';

// ============================================================
// FirstAidStep Component
// Single step display with large number, voice playback
// ============================================================

interface Props {
  stepNumber: number;
  totalSteps: number;
  instruction: string;
  language: Language;
  isSpeaking: boolean;
  canSpeak: boolean;
  onSpeak: () => void;
  onStop: () => void;
}

export function FirstAidStep({
  stepNumber,
  totalSteps,
  instruction,
  language,
  isSpeaking,
  canSpeak,
  onSpeak,
  onStop,
}: Props) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 animate-slide-up">
      {/* Step counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
            {stepNumber}
          </div>
          <span className="text-sm text-gray-300 font-medium">
            {t('stepOf', language, { current: stepNumber, total: totalSteps })}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < stepNumber ? 'bg-red-500' : i === stepNumber - 1 ? 'bg-red-400 w-4' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instruction text */}
      <p className="text-white text-lg font-medium leading-relaxed mb-4">{instruction}</p>

      {/* Voice button */}
      {canSpeak && (
        <button
          id={`speak-step-${stepNumber}`}
          onClick={isSpeaking ? onStop : onSpeak}
          aria-label={isSpeaking ? 'Stop reading' : t('repeatInstruction', language)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full transition-all duration-200"
        >
          {isSpeaking ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <VolumeX size={16} />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Volume2 size={16} />
              <span>{t('repeat', language)}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
