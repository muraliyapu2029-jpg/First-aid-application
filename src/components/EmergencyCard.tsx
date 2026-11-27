import { EmergencyCategory, type Language } from '../types';
import { getEmergencyIcon, getSeverityColor } from '../services/firstAidService';
import { t } from '../data/translations';

// ============================================================
// EmergencyCard Component
// Minimal, icon-first emergency badge for low-literacy users
// ============================================================

interface Props {
  category: EmergencyCategory;
  language: Language;
  customTitle?: string;
  immediateAction?: string;
  compact?: boolean;
}

const SEVERITY_STYLES: Record<string, string> = {
  emergency: 'border-red-500 bg-red-950/80',
  warning: 'border-yellow-500 bg-yellow-950/80',
  safe: 'border-green-500 bg-green-950/80',
  primary: 'border-blue-500 bg-blue-950/80',
};

export function EmergencyCard({ category, language, customTitle, immediateAction, compact = false }: Props) {
  const icon = getEmergencyIcon(category);
  const color = getSeverityColor(category);
  const name = customTitle || t(`emergency_${category}` as Parameters<typeof t>[0], language);

  return (
    <div
      className={`rounded-2xl border-2 p-4 ${SEVERITY_STYLES[color] ?? SEVERITY_STYLES.emergency} animate-fade-in`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-3.5">
        <span className="text-4xl flex-shrink-0" aria-hidden="true">{icon}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-white leading-tight">{name}</h2>
          {immediateAction && !compact && (
            <p className="text-yellow-300 text-base font-semibold mt-1.5 leading-snug">
              {immediateAction}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
