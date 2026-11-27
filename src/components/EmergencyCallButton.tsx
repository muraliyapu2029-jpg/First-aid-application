import { Phone } from 'lucide-react';
import type { Language } from '../types';
import { t } from '../data/translations';

// ============================================================
// EmergencyCallButton Component
// 112, 108, 102 quick-dial buttons
// ============================================================

interface EmergencyNumber {
  number: string;
  labelKey: Parameters<typeof t>[0];
  color: string;
  hoverColor: string;
}

const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  { number: '112', labelKey: 'call112', color: 'bg-red-600', hoverColor: 'hover:bg-red-700' },
  { number: '108', labelKey: 'call108', color: 'bg-orange-600', hoverColor: 'hover:bg-orange-700' },
  { number: '102', labelKey: 'call102', color: 'bg-amber-600', hoverColor: 'hover:bg-amber-700' },
];

interface Props {
  language: Language;
  compact?: boolean;
}

export function EmergencyCallButton({ language, compact = false }: Props) {
  if (compact) {
    return (
      <a
        href="tel:112"
        id="quick-call-112"
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg text-base"
        aria-label="Call 112 - National Emergency"
      >
        <Phone size={20} />
        <span>112</span>
      </a>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 text-center">
        ⚠️ Tapping a number initiates a phone call. It does not automatically dispatch services.
      </p>
      {EMERGENCY_NUMBERS.map(({ number, labelKey, color, hoverColor }) => (
        <a
          key={number}
          href={`tel:${number}`}
          id={`emergency-call-${number}`}
          className={`flex items-center gap-3 ${color} ${hoverColor} text-white font-bold py-4 px-5 rounded-2xl transition-all duration-200 shadow-lg text-lg w-full`}
          aria-label={t(labelKey, language)}
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Phone size={22} />
          </div>
          <div>
            <div className="text-xl font-black">{number}</div>
            <div className="text-xs font-normal opacity-90">{t(labelKey, language)}</div>
          </div>
        </a>
      ))}
    </div>
  );
}
