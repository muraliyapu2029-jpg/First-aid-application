import { EmergencyCategory, type EmergencyDefinition } from '../types';

// ============================================================
// Emergency Keyword Database
// Multilingual keyword arrays for rule-based detection
// Keywords are scored by weight (1-3), higher = stronger signal
// ============================================================

export const emergencyDefinitions: EmergencyDefinition[] = [
  {
    category: EmergencyCategory.SNAKEBITE,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'snake', language: 'en', weight: 2 },
      { word: 'snakebite', language: 'en', weight: 3 },
      { word: 'snake bit', language: 'en', weight: 3 },
      { word: 'bitten by snake', language: 'en', weight: 3 },
      { word: 'serpent', language: 'en', weight: 2 },
      { word: 'venom', language: 'en', weight: 2 },
      { word: 'poisonous bite', language: 'en', weight: 2 },
      { word: 'reptile bite', language: 'en', weight: 1 },
      // Hindi
      { word: 'सांप', language: 'hi', weight: 2 },
      { word: 'सर्प', language: 'hi', weight: 2 },
      { word: 'नाग', language: 'hi', weight: 2 },
      { word: 'सांप ने काटा', language: 'hi', weight: 3 },
      { word: 'सांप का काटना', language: 'hi', weight: 3 },
      { word: 'काटा सांप', language: 'hi', weight: 3 },
      { word: 'जहर', language: 'hi', weight: 1 },
      // Kannada
      { word: 'ಹಾವು', language: 'kn', weight: 2 },
      { word: 'ಹಾವು ಕಡಿತ', language: 'kn', weight: 3 },
      { word: 'ಹಾವು ಕಚ್ಚಿತು', language: 'kn', weight: 3 },
      { word: 'ನಾಗ', language: 'kn', weight: 2 },
      { word: 'ವಿಷ ಕಡಿತ', language: 'kn', weight: 2 },
      { word: 'ವಿಷ', language: 'kn', weight: 1 },
    ],
  },
  {
    category: EmergencyCategory.HEART_ATTACK,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'chest pain', language: 'en', weight: 3 },
      { word: 'heart attack', language: 'en', weight: 3 },
      { word: 'heart pain', language: 'en', weight: 3 },
      { word: 'chest pressure', language: 'en', weight: 2 },
      { word: 'cardiac', language: 'en', weight: 2 },
      { word: 'left arm pain', language: 'en', weight: 2 },
      { word: 'sweating chest', language: 'en', weight: 2 },
      { word: 'crushing chest', language: 'en', weight: 2 },
      { word: 'heart', language: 'en', weight: 1 },
      { word: 'sweat', language: 'en', weight: 1 },
      { word: 'jaw pain', language: 'en', weight: 1 },
      // Hindi
      { word: 'सीने में दर्द', language: 'hi', weight: 3 },
      { word: 'दिल का दौरा', language: 'hi', weight: 3 },
      { word: 'हृदयाघात', language: 'hi', weight: 3 },
      { word: 'छाती में दर्द', language: 'hi', weight: 3 },
      { word: 'दिल दर्द', language: 'hi', weight: 2 },
      { word: 'पसीना', language: 'hi', weight: 1 },
      { word: 'सांस फूलना', language: 'hi', weight: 1 },
      // Kannada
      { word: 'ಎದೆ ನೋವು', language: 'kn', weight: 3 },
      { word: 'ಹೃದಯಾಘಾತ', language: 'kn', weight: 3 },
      { word: 'ಹೃದಯ ನೋವು', language: 'kn', weight: 3 },
      { word: 'ಎದೆ ಒತ್ತಡ', language: 'kn', weight: 2 },
      { word: 'ಬೆವರು', language: 'kn', weight: 1 },
    ],
  },
  {
    category: EmergencyCategory.STROKE,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'stroke', language: 'en', weight: 3 },
      { word: 'face drooping', language: 'en', weight: 3 },
      { word: 'face droop', language: 'en', weight: 3 },
      { word: 'arm weakness', language: 'en', weight: 2 },
      { word: 'speech slurred', language: 'en', weight: 2 },
      { word: 'slurred speech', language: 'en', weight: 2 },
      { word: 'brain attack', language: 'en', weight: 3 },
      { word: 'paralysis', language: 'en', weight: 2 },
      { word: 'one side weak', language: 'en', weight: 2 },
      { word: 'sudden confusion', language: 'en', weight: 1 },
      // Hindi
      { word: 'लकवा', language: 'hi', weight: 3 },
      { word: 'पक्षाघात', language: 'hi', weight: 3 },
      { word: 'चेहरा टेढ़ा', language: 'hi', weight: 3 },
      { word: 'मुंह टेढ़ा', language: 'hi', weight: 3 },
      { word: 'बोलने में तकलीफ', language: 'hi', weight: 2 },
      // Kannada
      { word: 'ಪಾರ್ಶ್ವವಾಯು', language: 'kn', weight: 3 },
      { word: 'ಸ್ಟ್ರೋಕ್', language: 'kn', weight: 3 },
      { word: 'ಮುಖ ಓರೆ', language: 'kn', weight: 3 },
      { word: 'ಒಂದು ಬದಿ ಶಕ್ತಿ ಇಲ್ಲ', language: 'kn', weight: 2 },
    ],
  },
  {
    category: EmergencyCategory.UNCONSCIOUSNESS,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'unconscious', language: 'en', weight: 3 },
      { word: 'not responding', language: 'en', weight: 2 },
      { word: 'unresponsive', language: 'en', weight: 3 },
      { word: 'passed out', language: 'en', weight: 2 },
      { word: 'collapsed', language: 'en', weight: 2 },
      { word: 'not waking up', language: 'en', weight: 2 },
      { word: 'no pulse', language: 'en', weight: 2 },
      { word: 'cpr', language: 'en', weight: 3 },
      // Hindi
      { word: 'बेहोश', language: 'hi', weight: 3 },
      { word: 'होश नहीं', language: 'hi', weight: 3 },
      { word: 'नाड़ी नहीं', language: 'hi', weight: 2 },
      { word: 'सांस नहीं', language: 'hi', weight: 2 },
      // Kannada
      { word: 'ಪ್ರಜ್ಞೆ ಇಲ್ಲ', language: 'kn', weight: 3 },
      { word: 'ಎಚ್ಚರ ಇಲ್ಲ', language: 'kn', weight: 3 },
      { word: 'ಸ್ಪಂದಿಸುತ್ತಿಲ್ಲ', language: 'kn', weight: 2 },
    ],
  },
  {
    category: EmergencyCategory.ROAD_ACCIDENT,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'accident', language: 'en', weight: 2 },
      { word: 'road accident', language: 'en', weight: 3 },
      { word: 'car accident', language: 'en', weight: 3 },
      { word: 'bike accident', language: 'en', weight: 3 },
      { word: 'vehicle accident', language: 'en', weight: 3 },
      { word: 'crash', language: 'en', weight: 2 },
      { word: 'hit by vehicle', language: 'en', weight: 3 },
      { word: 'knocked down', language: 'en', weight: 2 },
      { word: 'collision', language: 'en', weight: 2 },
      // Hindi
      { word: 'दुर्घटना', language: 'hi', weight: 2 },
      { word: 'सड़क दुर्घटना', language: 'hi', weight: 3 },
      { word: 'गाड़ी दुर्घटना', language: 'hi', weight: 3 },
      { word: 'हादसा', language: 'hi', weight: 2 },
      // Kannada
      { word: 'ಅಪಘಾತ', language: 'kn', weight: 2 },
      { word: 'ರಸ್ತೆ ಅಪಘಾತ', language: 'kn', weight: 3 },
      { word: 'ವಾಹನ ಅಪಘಾತ', language: 'kn', weight: 3 },
    ],
  },
  {
    category: EmergencyCategory.HEAVY_BLEEDING,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'bleeding', language: 'en', weight: 2 },
      { word: 'heavy bleeding', language: 'en', weight: 3 },
      { word: 'blood not stopping', language: 'en', weight: 3 },
      { word: 'lot of blood', language: 'en', weight: 3 },
      { word: 'blood flowing', language: 'en', weight: 2 },
      { word: 'cut deep', language: 'en', weight: 2 },
      { word: 'wound bleeding', language: 'en', weight: 2 },
      // Hindi
      { word: 'खून बह रहा', language: 'hi', weight: 3 },
      { word: 'रक्तस्राव', language: 'hi', weight: 3 },
      { word: 'खून नहीं रुक रहा', language: 'hi', weight: 3 },
      { word: 'बहुत खून', language: 'hi', weight: 2 },
      // Kannada
      { word: 'ರಕ್ತ ಹರಿಯುತ್ತಿದೆ', language: 'kn', weight: 3 },
      { word: 'ರಕ್ತಸ್ರಾವ', language: 'kn', weight: 3 },
      { word: 'ರಕ್ತ ನಿಲ್ಲುತ್ತಿಲ್ಲ', language: 'kn', weight: 3 },
    ],
  },
  {
    category: EmergencyCategory.BURNS,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'burn', language: 'en', weight: 2 },
      { word: 'burned', language: 'en', weight: 2 },
      { word: 'fire', language: 'en', weight: 1 },
      { word: 'scalded', language: 'en', weight: 2 },
      { word: 'hot water burn', language: 'en', weight: 3 },
      { word: 'flame burn', language: 'en', weight: 3 },
      { word: 'skin burn', language: 'en', weight: 2 },
      // Hindi
      { word: 'जला', language: 'hi', weight: 2 },
      { word: 'जलन', language: 'hi', weight: 2 },
      { word: 'आग से जला', language: 'hi', weight: 3 },
      { word: 'गर्म पानी', language: 'hi', weight: 2 },
      // Kannada
      { word: 'ಸುಟ್ಟ ಗಾಯ', language: 'kn', weight: 3 },
      { word: 'ಬೆಂಕಿ', language: 'kn', weight: 1 },
      { word: 'ಸುಟ್ಟಿದೆ', language: 'kn', weight: 2 },
      { word: 'ಬಿಸಿ ನೀರು', language: 'kn', weight: 2 },
    ],
  },
  {
    category: EmergencyCategory.ELECTRIC_SHOCK,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'electric shock', language: 'en', weight: 3 },
      { word: 'electrocuted', language: 'en', weight: 3 },
      { word: 'electricity', language: 'en', weight: 2 },
      { word: 'current shock', language: 'en', weight: 3 },
      { word: 'wire shock', language: 'en', weight: 2 },
      // Hindi
      { word: 'बिजली का झटका', language: 'hi', weight: 3 },
      { word: 'करंट लगा', language: 'hi', weight: 3 },
      { word: 'बिजली लगी', language: 'hi', weight: 3 },
      // Kannada
      { word: 'ವಿದ್ಯುತ್ ಆಘಾತ', language: 'kn', weight: 3 },
      { word: 'ಕರೆಂಟ್ ಹೊಡೆದಿದೆ', language: 'kn', weight: 3 },
      { word: 'ವಿದ್ಯುತ್', language: 'kn', weight: 1 },
    ],
  },
  {
    category: EmergencyCategory.CHOKING,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'choking', language: 'en', weight: 3 },
      { word: 'choked', language: 'en', weight: 3 },
      { word: 'food stuck', language: 'en', weight: 2 },
      { word: 'cannot breathe', language: 'en', weight: 2 },
      { word: 'throat blocked', language: 'en', weight: 2 },
      { word: 'swallowed object', language: 'en', weight: 2 },
      // Hindi
      { word: 'गला घुट रहा', language: 'hi', weight: 3 },
      { word: 'सांस नहीं ले पा रहा', language: 'hi', weight: 2 },
      { word: 'गले में फंसा', language: 'hi', weight: 3 },
      // Kannada
      { word: 'ಗಂಟಲು ಕಟ್ಟಿಕೊಂಡಿದೆ', language: 'kn', weight: 3 },
      { word: 'ಉಸಿರಾಡಲು ಆಗುತ್ತಿಲ್ಲ', language: 'kn', weight: 2 },
      { word: 'ಆಹಾರ ಸಿಕ್ಕಿಹಾಕಿಕೊಂಡಿದೆ', language: 'kn', weight: 3 },
    ],
  },
  {
    category: EmergencyCategory.BREATHING_DIFFICULTY,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'breathing difficulty', language: 'en', weight: 3 },
      { word: 'trouble breathing', language: 'en', weight: 3 },
      { word: 'breathless', language: 'en', weight: 3 },
      { word: 'short of breath', language: 'en', weight: 2 },
      { word: 'asthma', language: 'en', weight: 2 },
      { word: 'wheezing', language: 'en', weight: 2 },
      { word: 'gasping', language: 'en', weight: 2 },
      // Hindi
      { word: 'सांस लेने में तकलीफ', language: 'hi', weight: 3 },
      { word: 'सांस फूल रही', language: 'hi', weight: 3 },
      { word: 'दमा', language: 'hi', weight: 2 },
      // Kannada
      { word: 'ಉಸಿರಾಟ ತೊಂದರೆ', language: 'kn', weight: 3 },
      { word: 'ಉಸಿರು ಕಟ್ಟಿದೆ', language: 'kn', weight: 3 },
      { word: 'ಆಸ್ತಮಾ', language: 'kn', weight: 2 },
    ],
  },
  {
    category: EmergencyCategory.SEIZURE,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'seizure', language: 'en', weight: 3 },
      { word: 'fits', language: 'en', weight: 2 },
      { word: 'convulsion', language: 'en', weight: 3 },
      { word: 'epilepsy', language: 'en', weight: 2 },
      { word: 'shaking uncontrollably', language: 'en', weight: 2 },
      { word: 'jerking', language: 'en', weight: 1 },
      // Hindi
      { word: 'दौरा', language: 'hi', weight: 3 },
      { word: 'मिर्गी', language: 'hi', weight: 3 },
      { word: 'झटके आ रहे', language: 'hi', weight: 3 },
      // Kannada
      { word: 'ಅಪಸ್ಮಾರ', language: 'kn', weight: 3 },
      { word: 'ಮಿರ್ಗಿ', language: 'kn', weight: 3 },
      { word: 'ಅದಿರುತ್ತಿದ್ದಾರೆ', language: 'kn', weight: 2 },
    ],
  },
  {
    category: EmergencyCategory.FAINTING,
    minConfidence: 0.3,
    keywords: [
      // English
      { word: 'fainted', language: 'en', weight: 3 },
      { word: 'fainting', language: 'en', weight: 3 },
      { word: 'dizzy', language: 'en', weight: 1 },
      { word: 'fell down', language: 'en', weight: 1 },
      { word: 'feeling faint', language: 'en', weight: 2 },
      { word: 'syncope', language: 'en', weight: 3 },
      // Hindi
      { word: 'चक्कर आ रहे', language: 'hi', weight: 2 },
      { word: 'बेहोश हो गए', language: 'hi', weight: 3 },
      { word: 'मूर्छा', language: 'hi', weight: 3 },
      // Kannada
      { word: 'ಮೂರ್ಛೆ', language: 'kn', weight: 3 },
      { word: 'ತಲೆ ಸುತ್ತುತ್ತಿದೆ', language: 'kn', weight: 2 },
      { word: 'ಬಿದ್ದು ಹೋದರು', language: 'kn', weight: 2 },
    ],
  },
];

export function getKeywordsForCategory(category: EmergencyCategory): string[] {
  const def = emergencyDefinitions.find(d => d.category === category);
  return def ? def.keywords.map(k => k.word) : [];
}
