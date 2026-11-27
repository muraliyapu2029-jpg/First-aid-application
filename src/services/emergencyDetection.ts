import { EmergencyCategory, type EmergencyDetectionResult } from '../types';
import { emergencyDefinitions } from '../data/emergencies';

// ============================================================
// Emergency Detection Service
// Primary: Rule-based keyword matching (offline, always works)
// Secondary: AI-enhanced via aiService (optional, online only)
// ============================================================

const CONFIDENCE_THRESHOLD = 0.25;

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

function scoreText(text: string): Map<EmergencyCategory, number> {
  const normalized = normalizeText(text);
  const scores = new Map<EmergencyCategory, number>();

  for (const def of emergencyDefinitions) {
    let score = 0;

    for (const keyword of def.keywords) {
      if (normalized.includes(normalizeText(keyword.word))) {
        score += keyword.weight;
      }
    }

    if (score > 0) {
      // Scale matched keyword weight against a strong-match baseline (5)
      // so multilingual synonym lists don't dilute a clear match.
      scores.set(def.category, Math.min(score / 5, 1));
    }
  }

  return scores;
}

export function detectEmergencyRuleBased(text: string): EmergencyDetectionResult {
  const scores = scoreText(text);

  if (scores.size === 0) {
    return {
      category: EmergencyCategory.UNKNOWN,
      confidence: 0,
      rawText: text,
      source: 'rule-based',
    };
  }

  // Find highest scoring category
  let bestCategory: EmergencyCategory = EmergencyCategory.UNKNOWN;
  let bestScore = 0;

  for (const [category, score] of scores.entries()) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  if (bestScore < CONFIDENCE_THRESHOLD) {
    return {
      category: EmergencyCategory.UNKNOWN,
      confidence: bestScore,
      rawText: text,
      source: 'rule-based',
    };
  }

  return {
    category: bestCategory,
    confidence: Math.min(bestScore * 1.5, 1.0), // scale up slightly
    rawText: text,
    source: 'rule-based',
  };
}

export async function detectEmergency(
  text: string,
  useAI: boolean = false
): Promise<EmergencyDetectionResult> {
  // Always run rule-based first
  const ruleResult = detectEmergencyRuleBased(text);

  // If AI is available and rule-based confidence is low, try AI enhancement
  if (useAI && ruleResult.confidence < 0.6) {
    try {
      const { detectWithAI } = await import('./aiService');
      const aiResult = await detectWithAI(text);
      if (aiResult && aiResult.confidence > ruleResult.confidence) {
        return { ...aiResult, source: 'ai-enhanced' };
      }
    } catch {
      // AI failed — fall back to rule-based silently
    }
  }

  return ruleResult;
}

// Map direct emergency selection (from quick-select buttons)
export function categoryFromString(str: string): EmergencyCategory {
  return (Object.values(EmergencyCategory) as string[]).includes(str)
    ? (str as EmergencyCategory)
    : EmergencyCategory.UNKNOWN;
}
