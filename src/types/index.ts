// ============================================================
// Core Type Definitions — Emergency Assistance App
// ============================================================

export type Language = 'en' | 'hi' | 'kn';

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
  source: 'rule-based' | 'ai-enhanced';
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
  /** Languages spoken with Sarvam audio (pre-generated or live) */
  audioVoiceLanguages: Language[];
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
