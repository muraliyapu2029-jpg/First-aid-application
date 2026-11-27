import {
  EmergencyCategory,
  type EmergencyDetectionResult,
  type SarvamLanguageCode,
} from '../types';
import { emergencyDefinitions } from '../data/emergencies';
import { detectLanguageFromUnicode } from './sarvamService';

// ============================================================
// Emergency Detection Service
// 1. Offline rule-based emergency + ambulance/hospital intent matching
// 2. Unicode script language detection
// 3. Optional AI fallback (Gemini) when Sarvam AI is not active
// ============================================================

const CONFIDENCE_THRESHOLD = 0.25;

const AMBULANCE_PATTERNS = [
  'ambulance',
  'arrange ambulance',
  'call ambulance',
  'send ambulance',
  'need ambulance',
  'book ambulance',
  'hospital vehicle',
  '108',
  // Hindi / Devanagari + Hinglish
  'एम्बुलेंस',
  'ऐम्बुलेंस',
  'एंबुलेंस',
  'गाड़ी भेजो',
  'अस्पताल ले चलो',
  // Kannada
  'ಆಂಬ್ಯುಲೆನ್ಸ್',
  'ಆಂಬುಲೆನ್ಸ್',
  'ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ',
  // Tamil
  'ஆம்புலன்ஸ்',
  'அம்புலன்ஸ்',
  // Telugu
  'అంబులెన్స్',
  // Malayalam
  'ആംബുലൻസ്',
  // Bengali
  'অ্যাম্বুলেন্স',
  // Marathi / Gujarati
  'ॲम्ब्युलन्स',
  'એમ્બ્યુલન્સ',
];

const HOSPITAL_PATTERNS = [
  'nearest hospital',
  'near hospital',
  'find hospital',
  'hospital',
  'clinic',
  'doctor',
  'अस्पताल',
  'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ',
  'ಆಸ್ಪತ್ರೆ',
  'மருத்துவமனை',
  'ఆసుపత్రి',
  'ആശുപത്രി',
  'হাসপাতাল',
];

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

export function isAmbulanceRequested(text: string): boolean {
  const normalized = normalizeText(text);
  return AMBULANCE_PATTERNS.some(p => normalized.includes(p));
}

export function isHospitalRequested(text: string): boolean {
  const normalized = normalizeText(text);
  return HOSPITAL_PATTERNS.some(p => normalized.includes(p));
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
      scores.set(def.category, Math.min(score / 5, 1));
    }
  }

  return scores;
}

export function detectEmergencyRuleBased(
  text: string,
  detectedLanguageCode?: SarvamLanguageCode
): EmergencyDetectionResult {
  const scores = scoreText(text);
  const langCode = detectedLanguageCode ?? detectLanguageFromUnicode(text);
  const arrangeAmbulance = isAmbulanceRequested(text);
  const findHospital = arrangeAmbulance || isHospitalRequested(text);

  if (scores.size === 0) {
    return {
      category: EmergencyCategory.UNKNOWN,
      confidence: 0,
      rawText: text,
      source: 'rule-based',
      detectedLanguageCode: langCode,
      arrangeAmbulance,
      findHospital,
    };
  }

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
      detectedLanguageCode: langCode,
      arrangeAmbulance,
      findHospital,
    };
  }

  return {
    category: bestCategory,
    confidence: Math.min(bestScore * 1.5, 1.0),
    rawText: text,
    source: 'rule-based',
    detectedLanguageCode: langCode,
    arrangeAmbulance,
    findHospital,
  };
}

export async function detectEmergency(
  text: string,
  useAI: boolean = false,
  detectedLanguageCode?: SarvamLanguageCode
): Promise<EmergencyDetectionResult> {
  const ruleResult = detectEmergencyRuleBased(text, detectedLanguageCode);

  if (useAI && ruleResult.confidence < 0.6) {
    try {
      const { detectWithAI } = await import('./aiService');
      const aiResult = await detectWithAI(text);
      if (aiResult && aiResult.confidence > ruleResult.confidence) {
        return {
          ...aiResult,
          source: 'ai-enhanced',
          detectedLanguageCode: ruleResult.detectedLanguageCode,
          arrangeAmbulance: ruleResult.arrangeAmbulance,
          findHospital: ruleResult.findHospital,
        };
      }
    } catch {
      // Fall back to rule-based
    }
  }

  return ruleResult;
}

export function categoryFromString(str: string): EmergencyCategory {
  return (Object.values(EmergencyCategory) as string[]).includes(str)
    ? (str as EmergencyCategory)
    : EmergencyCategory.UNKNOWN;
}
