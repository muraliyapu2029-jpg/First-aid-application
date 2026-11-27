import { EmergencyCategory, type FirstAidProtocol, type Language } from '../types';
import { getProtocol } from '../data/firstAidProtocols';
import { firstAidTranslations } from '../data/firstAidTranslations';

// ============================================================
// First Aid Service
// Retrieves curated protocols — works 100% offline
// ============================================================

export function getFirstAidProtocol(
  category: EmergencyCategory,
  language: Language = 'en'
): FirstAidProtocol {
  const base = getProtocol(category);
  if (language === 'en') return base;

  const localized = firstAidTranslations[language]?.[base.category];
  if (!localized) return base;

  return {
    ...base,
    immediateAction: localized.immediateAction,
    steps: base.steps.map((step, index) => ({
      ...step,
      instruction: localized.steps[index] ?? step.instruction,
    })),
    doNots: localized.doNots,
    whenToCallDoctor: localized.whenToCallDoctor,
  };
}

export function getImmediateAction(category: EmergencyCategory): string {
  const protocol = getProtocol(category);
  return protocol.immediateAction;
}

export function getStepText(category: EmergencyCategory, stepIndex: number): string {
  const protocol = getProtocol(category);
  const step = protocol.steps[stepIndex];
  return step ? step.instruction : '';
}

export function getTotalSteps(category: EmergencyCategory): number {
  return getProtocol(category).steps.length;
}

export function getSeverityColor(category: EmergencyCategory): string {
  const protocol = getProtocol(category);
  switch (protocol.severity) {
    case 'critical': return 'emergency';
    case 'high': return 'warning';
    case 'medium': return 'safe';
    default: return 'primary';
  }
}

export function getEmergencyIcon(category: EmergencyCategory): string {
  const icons: Record<EmergencyCategory, string> = {
    [EmergencyCategory.SNAKEBITE]: '🐍',
    [EmergencyCategory.HEART_ATTACK]: '❤️',
    [EmergencyCategory.STROKE]: '🧠',
    [EmergencyCategory.UNCONSCIOUSNESS]: '😶',
    [EmergencyCategory.ROAD_ACCIDENT]: '🚗',
    [EmergencyCategory.HEAVY_BLEEDING]: '🩸',
    [EmergencyCategory.BURNS]: '🔥',
    [EmergencyCategory.ELECTRIC_SHOCK]: '⚡',
    [EmergencyCategory.CHOKING]: '😮‍💨',
    [EmergencyCategory.BREATHING_DIFFICULTY]: '💨',
    [EmergencyCategory.SEIZURE]: '🌀',
    [EmergencyCategory.FAINTING]: '💫',
    [EmergencyCategory.UNKNOWN]: '🆘',
  };
  return icons[category] ?? '🆘';
}
