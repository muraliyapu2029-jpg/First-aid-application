import { Volume2, VolumeX } from 'lucide-react';
import type { Language } from '../types';
import { t } from '../data/translations';

// ============================================================
// FirstAidStep Component
// Large numbered guideline card with instant voice playback
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
    <div className="rounded-3xl bg-white/10 backdrop-blur-sm border-2 border-white/20 p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-black text-white text-2xl shadow-lg">
            {stepNumber}
          </div>
          <span className="text-base text-gray-300 font-bold">
            {stepNumber} / {totalSteps}
          </span>
        </div>

        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === stepNumber - 1 ? 'bg-red-400 w-6' : i < stepNumber ? 'bg-red-600 w-2.5' : 'bg-white/20 w-2.5'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-white text-2xl font-bold leading-snug mb-6">{instruction}</p>

      {canSpeak && (
        <button
          id={`speak-step-${stepNumber}`}
          onClick={isSpeaking ? onStop : onSpeak}
          aria-label={isSpeaking ? 'Stop voice' : t('repeatInstruction', language)}
          className={`flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl font-bold text-base transition-all ${
            isSpeaking
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-white/15 hover:bg-white/25 text-white'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX size={22} />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Volume2 size={22} />
              <span>{t('repeat', language)}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
