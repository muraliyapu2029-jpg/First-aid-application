// ============================================================
// Core Type Definitions — RakshaAI Emergency Assistance App
// ============================================================

export type Language = 'en' | 'hi' | 'kn';

export type SarvamLanguageCode =
  | 'en-IN'
  | 'hi-IN'
  | 'kn-IN'
  | 'ta-IN'
  | 'te-IN'
  | 'bn-IN'
  | 'mr-IN'
  | 'gu-IN'
  | 'ml-IN'
  | 'pa-IN'
  | 'od-IN';

export const AMBULANCE_NUMBER = '108';
export const NATIONAL_EMERGENCY_NUMBER = '112';

export const SARVAM_LANGUAGE_NAMES: Record<SarvamLanguageCode, { name: string; native: string }> = {
  'en-IN': { name: 'English', native: 'English' },
  'hi-IN': { name: 'Hindi', native: 'हिंदी' },
  'kn-IN': { name: 'Kannada', native: 'ಕನ್ನಡ' },
  'ta-IN': { name: 'Tamil', native: 'தமிழ்' },
  'te-IN': { name: 'Telugu', native: 'తెలుగు' },
  'bn-IN': { name: 'Bengali', native: 'বাংলা' },
  'mr-IN': { name: 'Marathi', native: 'मराठी' },
  'gu-IN': { name: 'Gujarati', native: 'ગુજરાતી' },
  'ml-IN': { name: 'Malayalam', native: 'മലയാളം' },
  'pa-IN': { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  'od-IN': { name: 'Odia', native: 'ଓଡ଼ିଆ' },
};

export const EmergencyCategory = {
  SNAKEBITE: 'snakebite',
  HEART_ATTACK: 'heart_attack',
  STROKE: 'stroke',
  UNCONSCIOUSNESS: 'unconsciousness',
  ROAD_ACCIDENT: 'road_accident',
  HEAVY_BLEEDING: 'heavy_bleeding',
  BURNS: 'burns',
  ELECTRIC_SHOCK: 'electric_shock',
  CHOKING: 'choking',
  BREATHING_DIFFICULTY: 'breathing_difficulty',
  SEIZURE: 'seizure',
  FAINTING: 'fainting',
  UNKNOWN: 'unknown',
} as const;

export type EmergencyCategory = (typeof EmergencyCategory)[keyof typeof EmergencyCategory];

export const VoiceStatus = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  SPEAKING: 'speaking',
  ERROR: 'error',
  UNSUPPORTED: 'unsupported',
} as const;

export type VoiceStatus = (typeof VoiceStatus)[keyof typeof VoiceStatus];

export interface FirstAidStep {
  id: number;
  instruction: string;
}

export interface FirstAidProtocol {
  category: EmergencyCategory;
  immediateAction: string;
  steps: FirstAidStep[];
  doNots: string[];
  whenToCallDoctor: string;
  severity: 'critical' | 'high' | 'medium';
  followUpQuestions: string[];
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  phone?: string;
  distance?: number; // km
  osmId?: string;
  facilityType?: 'hospital' | 'clinic';
  hasEmergency?: boolean;
  isGovernment?: boolean;
  speciality?: string;
}

export interface EmergencyDetectionResult {
  category: EmergencyCategory;
  confidence: number; // 0–1
  rawText: string;
  source: 'rule-based' | 'ai-enhanced' | 'sarvam-ai';
  detectedLanguageCode?: SarvamLanguageCode;
  arrangeAmbulance?: boolean;
  findHospital?: boolean;
  aiGuidance?: SarvamGuidanceResponse;
}

export interface SarvamGuidanceResponse {
  intent: 'first_aid' | 'arrange_ambulance' | 'find_hospital' | 'clarify';
  category: EmergencyCategory;
  title: string;
  guidelines: string[];
  doNots: string[];
  voiceReply: string;
  followUpQuestion?: string;
  arrangeAmbulance: boolean;
  findHospital: boolean;
  languageCode: SarvamLanguageCode;
}

export interface CallTurn {
  role: 'user' | 'assistant';
  text: string;
  languageCode: SarvamLanguageCode;
  guidelines?: string[];
  doNots?: string[];
}

export interface LocationData {
  lat: number;
  lon: number;
  accuracy: number;
}

export interface TTSCapability {
  supported: boolean;
  hasKannada: boolean;
  hasHindi: boolean;
  hasEnglish: boolean;
  availableVoices: string[];
}

export interface AppState {
  language: Language;
  voiceStatus: VoiceStatus;
  currentEmergency: EmergencyDetectionResult | null;
  currentProtocol: FirstAidProtocol | null;
  currentStepIndex: number;
  isOnline: boolean;
  location: LocationData | null;
  ttsCapability: TTSCapability | null;
}

export interface EmergencyKeyword {
  word: string;
  language: Language;
  weight: number;
}

export interface EmergencyDefinition {
  category: EmergencyCategory;
  keywords: EmergencyKeyword[];
  minConfidence: number;
}
