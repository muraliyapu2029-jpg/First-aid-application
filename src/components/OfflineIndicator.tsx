import { WifiOff, Info } from 'lucide-react';
import type { Language } from '../types';
import { t } from '../data/translations';

// ============================================================
// OfflineIndicator Component
// Banner shown when user is offline
// ============================================================

interface Props {
  language: Language;
  variant?: 'banner' | 'inline';
}

export function OfflineIndicator({ language, variant = 'banner' }: Props) {
  if (variant === 'inline') {
    return (
      <div className="flex items-start gap-2 bg-gray-800/80 border border-gray-600 rounded-xl p-3 text-sm">
        <WifiOff size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-gray-300">{t('offlineMessage', language)}</p>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center gap-2 text-sm">
      <WifiOff size={16} className="text-yellow-400 flex-shrink-0" />
      <span className="text-gray-200 font-medium">Offline — </span>
      <span className="text-gray-400">First-aid available. Hospital search needs internet.</span>
    </div>
  );
}

export function OfflineFeatureNotice({ language, feature }: { language: Language; feature: 'hospital' | 'ai' }) {
  const message = feature === 'hospital'
    ? t('offlineHospitalMessage', language)
    : t('offlineAIMessage', language);

  return (
    <div className="flex items-start gap-3 bg-gray-800/60 border border-gray-600/50 rounded-2xl p-4">
      <Info size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-gray-300 text-sm">{message}</p>
        {feature === 'hospital' && (
          <a
            href="tel:112"
            className="inline-flex items-center gap-1 mt-2 text-red-400 font-bold text-sm hover:text-red-300"
          >
            → Call 112 — National Emergency
          </a>
        )}
      </div>
    </div>
  );
}
