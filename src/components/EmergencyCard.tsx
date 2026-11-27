import { EmergencyCategory, type Language } from '../types';
import { getEmergencyIcon, getSeverityColor } from '../services/firstAidService';
import { t } from '../data/translations';

// ============================================================
// EmergencyCard Component
// Displays identified emergency with color-coded severity
// ============================================================

interface Props {
  category: EmergencyCategory;
  language: Language;
  confidence?: number;
  immediateAction?: string;
  compact?: boolean;
}

const SEVERITY_STYLES: Record<string, string> = {
  emergency: 'border-red-500 bg-red-950/80',
  warning: 'border-yellow-500 bg-yellow-950/80',
  safe: 'border-green-500 bg-green-950/80',
  primary: 'border-blue-500 bg-blue-950/80',
};

const BADGE_STYLES: Record<string, string> = {
  emergency: 'bg-red-600 text-white',
  warning: 'bg-yellow-600 text-white',
  safe: 'bg-green-600 text-white',
  primary: 'bg-blue-600 text-white',
};

export function EmergencyCard({ category, language, confidence, immediateAction, compact = false }: Props) {
  const icon = getEmergencyIcon(category);
  const color = getSeverityColor(category);
  const name = t(`emergency_${category}` as Parameters<typeof t>[0], language);

  return (
    <div
      className={`
        rounded-2xl border-2 p-4 ${SEVERITY_STYLES[color] ?? SEVERITY_STYLES.emergency}
        animate-fade-in backdrop-blur-sm
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl" aria-hidden="true">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${BADGE_STYLES[color]}`}>
              {t('emergencyIdentified', language)}
            </span>
            {confidence !== undefined && confidence > 0 && (
              <span className="text-xs text-gray-400">
                {Math.round(confidence * 100)}% match
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">{name}</h2>
          {immediateAction && !compact && (
            <div className="mt-3 p-3 bg-black/30 rounded-xl border border-white/10">
              <p className="text-xs font-semibold text-yellow-400 uppercase mb-1">
                {t('immediateAction', language)}
              </p>
              <p className="text-white font-medium leading-snug">{immediateAction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
