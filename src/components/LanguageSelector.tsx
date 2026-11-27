import type { Language } from '../types';

// ============================================================
// LanguageSelector Component
// Three-language chip selector with instant switch
// ============================================================

interface Props {
  selected: Language;
  onChange: (lang: Language) => void;
  compact?: boolean;
}

const LANGUAGES: Array<{ code: Language; label: string; nativeLabel: string }> = [
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
];

export function LanguageSelector({ selected, onChange, compact = false }: Props) {
  return (
    <div className={`flex gap-2 ${compact ? 'justify-center' : 'justify-center'}`} role="group" aria-label="Select language">
      {LANGUAGES.map(({ code, nativeLabel, label }) => (
        <button
          key={code}
          id={`lang-${code}`}
          onClick={() => onChange(code)}
          aria-pressed={selected === code}
          aria-label={`Select ${label}`}
          className={`
            px-4 py-2 rounded-full font-semibold transition-all duration-200 text-sm
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400
            ${compact ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5'}
            ${selected === code
              ? 'bg-red-600 text-white shadow-md scale-105'
              : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
            }
          `}
        >
          {nativeLabel}
        </button>
      ))}
    </div>
  );
}
