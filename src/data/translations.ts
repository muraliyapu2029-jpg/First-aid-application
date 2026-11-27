import type { Language } from '../types';

// ============================================================
// Translation Database — EN / HI / KN
// All UI strings, voice prompts, and emergency names
// ============================================================

export type TranslationKey =
  | 'appName'
  | 'appTagline'
  | 'mainPrompt'
  | 'tapMicToStart'
  | 'listening'
  | 'processing'
  | 'cancel'
  | 'next'
  | 'previous'
  | 'repeat'
  | 'callEmergency'
  | 'findHospital'
  | 'shareLocation'
  | 'settings'
  | 'selectLanguage'
  | 'emergencyIdentified'
  | 'immediateAction'
  | 'stepOf'
  | 'doNot'
  | 'whenToCallDoctor'
  | 'callNow'
  | 'call112'
  | 'call108'
  | 'call102'
  | 'ambulance'
  | 'police'
  | 'nearbyHospitals'
  | 'hospitalsFound'
  | 'noHospitalsFound'
  | 'loadingHospitals'
  | 'getDirections'  
  | 'callHospital'
  | 'distance'
  | 'km'
  | 'offlineMessage'
  | 'offlineHospitalMessage'
  | 'offlineAIMessage'
  | 'voiceUnavailable'
  | 'voiceFallbackMessage'
  | 'ttsUnavailable'
  | 'ttsKannadaUnavailable'
  | 'ttsKannadaWarning'
  | 'micPermissionDenied'
  | 'orSelectEmergency'
  | 'textInputPlaceholder'
  | 'describeEmergency'
  | 'emergencyUnknown'
  | 'askClarification'
  | 'isPersonConscious'
  | 'isPersonBreathing'
  | 'isThereHeavyBleeding'
  | 'hasEmergencyBeenCalled'
  | 'yes'
  | 'no'
  | 'repeatInstruction'
  | 'locationShared'
  | 'copyLocation'
  | 'shareViaWhatsApp'
  | 'medicalDisclaimer'
  | 'professionalCareRequired'
  | 'voiceOn'
  | 'voiceOff'
  | 'textSizeSmall'
  | 'textSizeMedium'
  | 'textSizeLarge'
  | 'privacyNote'
  | 'permissionRequired'
  | 'allowLocation'
  | 'locationDenied'
  | 'home'
  | 'back'
  | 'emergency_snakebite'
  | 'emergency_heart_attack'
  | 'emergency_stroke'
  | 'emergency_unconsciousness'
  | 'emergency_road_accident'
  | 'emergency_heavy_bleeding'
  | 'emergency_burns'
  | 'emergency_electric_shock'
  | 'emergency_choking'
  | 'emergency_breathing_difficulty'
  | 'emergency_seizure'
  | 'emergency_fainting'
  | 'emergency_unknown';

type Translations = Record<Language, Record<TranslationKey, string>>;

export const translations: Translations = {
  en: {
    appName: 'RakshaAI',
    appTagline: 'Your Emergency. Our Immediate Assistance.',
    mainPrompt: 'Tell me what happened. I am here to help.',
    tapMicToStart: 'Tap the microphone and explain the emergency',
    listening: 'Listening...',
    processing: 'Understanding your emergency...',
    cancel: 'Cancel',
    next: 'Next Step',
    previous: 'Previous',
    repeat: 'Repeat',
    callEmergency: 'Call Emergency',
    findHospital: 'Find Hospital',
    shareLocation: 'Share Location',
    settings: 'Settings',
    selectLanguage: 'Select Language',
    emergencyIdentified: 'Emergency Identified',
    immediateAction: 'Immediate Action',
    stepOf: 'Step {current} of {total}',
    doNot: 'Important: Do NOT do these',
    whenToCallDoctor: 'Get Medical Help',
    callNow: 'Call Now',
    call112: '112 — National Emergency',
    call108: '108 — Ambulance',
    call102: '102 — Ambulance (some states)',
    ambulance: 'Ambulance',
    police: 'Police',
    nearbyHospitals: 'Nearby Hospitals',
    hospitalsFound: '{count} hospitals found nearby',
    noHospitalsFound: 'No hospitals found. Please call 112 immediately.',
    loadingHospitals: 'Finding nearby hospitals...',
    getDirections: 'Directions',
    callHospital: 'Call',
    distance: 'Distance',
    km: 'km',
    offlineMessage: 'You are offline. First-aid instructions are available. Hospital search and AI features require internet.',
    offlineHospitalMessage: 'Hospital search requires internet connection. Please call 112 — National Emergency.',
    offlineAIMessage: 'AI-enhanced detection unavailable offline. Using local emergency detection.',
    voiceUnavailable: 'Voice input is not available on this device.',
    voiceFallbackMessage: 'Please type the emergency below or select an emergency type.',
    ttsUnavailable: 'Text-to-speech is not available on this device. Please read the instructions carefully.',
    ttsKannadaUnavailable: 'Kannada voice is not available on this device.',
    ttsKannadaWarning: '⚠️ Kannada text-to-speech is not supported on this browser/device. Instructions are shown in Kannada text below. Voice will not play in Kannada.',
    micPermissionDenied: 'Microphone permission denied. Please allow microphone access in your browser settings.',
    orSelectEmergency: 'Or select an emergency type:',
    textInputPlaceholder: 'Type what happened here...',
    describeEmergency: 'Describe the emergency',
    emergencyUnknown: 'Emergency type not clear',
    askClarification: 'Can you tell me more? What are the main symptoms?',
    isPersonConscious: 'Is the person conscious and responding?',
    isPersonBreathing: 'Is the person breathing normally?',
    isThereHeavyBleeding: 'Is there heavy bleeding?',
    hasEmergencyBeenCalled: 'Has emergency help been called?',
    yes: 'Yes',
    no: 'No',
    repeatInstruction: 'Repeat this instruction',
    locationShared: 'Location copied to clipboard',
    copyLocation: 'Copy Location',
    shareViaWhatsApp: 'Share on WhatsApp',
    medicalDisclaimer: '⚠️ This app provides first-aid guidance only. It is not a substitute for professional medical care.',
    professionalCareRequired: 'Professional medical care is required. These are only first-aid steps.',
    voiceOn: 'Voice: ON',
    voiceOff: 'Voice: OFF',
    textSizeSmall: 'Small',
    textSizeMedium: 'Medium',
    textSizeLarge: 'Large',
    privacyNote: 'Your location is only shared when you explicitly tap "Share Location". No personal data is stored.',
    permissionRequired: 'Permission Required',
    allowLocation: 'Allow Location',
    locationDenied: 'Location access denied. Showing all hospitals without distance sorting.',
    home: 'Home',
    back: 'Back',
    emergency_snakebite: 'Snakebite',
    emergency_heart_attack: 'Heart Attack',
    emergency_stroke: 'Stroke',
    emergency_unconsciousness: 'Unconscious Person',
    emergency_road_accident: 'Road Accident',
    emergency_heavy_bleeding: 'Heavy Bleeding',
    emergency_burns: 'Burns',
    emergency_electric_shock: 'Electric Shock',
    emergency_choking: 'Choking',
    emergency_breathing_difficulty: 'Breathing Difficulty',
    emergency_seizure: 'Seizure / Fits',
    emergency_fainting: 'Fainting',
    emergency_unknown: 'Unknown Emergency',
  },

  hi: {
    appName: 'RakshaAI',
    appTagline: 'आपकी आपात स्थिति। हमारी तत्काल सहायता।',
    mainPrompt: 'मुझे बताइए क्या हुआ। मैं यहाँ मदद करने के लिए हूँ।',
    tapMicToStart: 'माइक्रोफोन दबाएं और आपात स्थिति बताएं',
    listening: 'सुन रहा हूँ...',
    processing: 'आपकी बात समझ रहा हूँ...',
    cancel: 'रद्द करें',
    next: 'अगला कदम',
    previous: 'पिछला',
    repeat: 'दोहराएं',
    callEmergency: 'आपातकालीन कॉल करें',
    findHospital: 'अस्पताल खोजें',
    shareLocation: 'स्थान साझा करें',
    settings: 'सेटिंग्स',
    selectLanguage: 'भाषा चुनें',
    emergencyIdentified: 'आपात स्थिति पहचानी गई',
    immediateAction: 'तुरंत करें',
    stepOf: 'कदम {current} / {total}',
    doNot: 'ध्यान दें: ये न करें',
    whenToCallDoctor: 'डॉक्टर की मदद लें',
    callNow: 'अभी कॉल करें',
    call112: '112 — राष्ट्रीय आपातकाल',
    call108: '108 — एम्बुलेंस',
    call102: '102 — एम्बुलेंस (कुछ राज्यों में)',
    ambulance: 'एम्बुलेंस',
    police: 'पुलिस',
    nearbyHospitals: 'नजदीकी अस्पताल',
    hospitalsFound: '{count} अस्पताल मिले',
    noHospitalsFound: 'कोई अस्पताल नहीं मिला। कृपया तुरंत 112 पर कॉल करें।',
    loadingHospitals: 'नजदीकी अस्पताल खोज रहे हैं...',
    getDirections: 'रास्ता',
    callHospital: 'कॉल',
    distance: 'दूरी',
    km: 'किमी',
    offlineMessage: 'आप ऑफलाइन हैं। प्राथमिक चिकित्सा निर्देश उपलब्ध हैं। अस्पताल खोज और AI सुविधाओं के लिए इंटरनेट आवश्यक है।',
    offlineHospitalMessage: 'अस्पताल खोज के लिए इंटरनेट कनेक्शन आवश्यक है। कृपया 112 पर कॉल करें।',
    offlineAIMessage: 'ऑफलाइन AI सुविधा उपलब्ध नहीं। स्थानीय पहचान प्रणाली का उपयोग हो रहा है।',
    voiceUnavailable: 'इस डिवाइस पर वॉइस इनपुट उपलब्ध नहीं है।',
    voiceFallbackMessage: 'कृपया नीचे आपात स्थिति टाइप करें या आपात प्रकार चुनें।',
    ttsUnavailable: 'इस डिवाइस पर टेक्स्ट-टू-स्पीच उपलब्ध नहीं है। कृपया निर्देश ध्यान से पढ़ें।',
    ttsKannadaUnavailable: 'इस डिवाइस पर कन्नड़ आवाज़ उपलब्ध नहीं है।',
    ttsKannadaWarning: '⚠️ इस ब्राउज़र/डिवाइस पर कन्नड़ टेक्स्ट-टू-स्पीच समर्थित नहीं है। निर्देश कन्नड़ टेक्स्ट में नीचे दिखाए गए हैं।',
    micPermissionDenied: 'माइक्रोफोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग्स में माइक्रोफोन की अनुमति दें।',
    orSelectEmergency: 'या आपात प्रकार चुनें:',
    textInputPlaceholder: 'यहाँ क्या हुआ टाइप करें...',
    describeEmergency: 'आपात स्थिति बताएं',
    emergencyUnknown: 'आपात प्रकार स्पष्ट नहीं',
    askClarification: 'क्या आप और बता सकते हैं? मुख्य लक्षण क्या हैं?',
    isPersonConscious: 'क्या व्यक्ति होश में है और जवाब दे रहा है?',
    isPersonBreathing: 'क्या व्यक्ति सामान्य रूप से सांस ले रहा है?',
    isThereHeavyBleeding: 'क्या बहुत ज्यादा खून बह रहा है?',
    hasEmergencyBeenCalled: 'क्या आपातकालीन सहायता बुलाई गई है?',
    yes: 'हाँ',
    no: 'नहीं',
    repeatInstruction: 'यह निर्देश दोहराएं',
    locationShared: 'स्थान क्लिपबोर्ड पर कॉपी हुआ',
    copyLocation: 'स्थान कॉपी करें',
    shareViaWhatsApp: 'WhatsApp पर साझा करें',
    medicalDisclaimer: '⚠️ यह ऐप केवल प्राथमिक चिकित्सा मार्गदर्शन प्रदान करता है। यह पेशेवर चिकित्सा देखभाल का विकल्प नहीं है।',
    professionalCareRequired: 'पेशेवर चिकित्सा देखभाल आवश्यक है। ये केवल प्राथमिक चिकित्सा के कदम हैं।',
    voiceOn: 'आवाज़: चालू',
    voiceOff: 'आवाज़: बंद',
    textSizeSmall: 'छोटा',
    textSizeMedium: 'मध्यम',
    textSizeLarge: 'बड़ा',
    privacyNote: 'आपका स्थान केवल तब साझा होता है जब आप स्पष्ट रूप से "स्थान साझा करें" दबाते हैं। कोई व्यक्तिगत डेटा संग्रहीत नहीं होता।',
    permissionRequired: 'अनुमति आवश्यक है',
    allowLocation: 'स्थान की अनुमति दें',
    locationDenied: 'स्थान की अनुमति नहीं मिली। सभी अस्पताल दूरी के बिना दिखाए जा रहे हैं।',
    home: 'होम',
    back: 'वापस',
    emergency_snakebite: 'सांप का काटना',
    emergency_heart_attack: 'दिल का दौरा',
    emergency_stroke: 'मस्तिष्काघात (स्ट्रोक)',
    emergency_unconsciousness: 'बेहोश व्यक्ति',
    emergency_road_accident: 'सड़क दुर्घटना',
    emergency_heavy_bleeding: 'अत्यधिक रक्तस्राव',
    emergency_burns: 'जलन / आग से जलना',
    emergency_electric_shock: 'बिजली का झटका',
    emergency_choking: 'गला घुटना',
    emergency_breathing_difficulty: 'सांस लेने में कठिनाई',
    emergency_seizure: 'दौरा / मिर्गी',
    emergency_fainting: 'बेहोशी / चक्कर आना',
    emergency_unknown: 'अज्ञात आपात स्थिति',
  },

  kn: {
    appName: 'RakshaAI',
    appTagline: 'ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿ. ನಮ್ಮ ತಕ್ಷಣದ ಸಹಾಯ.',
    mainPrompt: 'ಏನಾಯಿತು ಎಂದು ಹೇಳಿ. ನಾನು ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ.',
    tapMicToStart: 'ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ ತುರ್ತು ಪರಿಸ್ಥಿತಿ ವಿವರಿಸಿ',
    listening: 'ಕೇಳುತ್ತಿದ್ದೇನೆ...',
    processing: 'ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಅರ್ಥ ಮಾಡಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ...',
    cancel: 'ರದ್ದು ಮಾಡಿ',
    next: 'ಮುಂದಿನ ಹಂತ',
    previous: 'ಹಿಂದಿನ',
    repeat: 'ಮತ್ತೆ ಹೇಳಿ',
    callEmergency: 'ತುರ್ತು ಕರೆ ಮಾಡಿ',
    findHospital: 'ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ',
    shareLocation: 'ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ',
    settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ',
    emergencyIdentified: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಗುರುತಿಸಲಾಗಿದೆ',
    immediateAction: 'ತಕ್ಷಣ ಮಾಡಿ',
    stepOf: 'ಹಂತ {current} / {total}',
    doNot: 'ಮುಖ್ಯ: ಇವನ್ನು ಮಾಡಬೇಡಿ',
    whenToCallDoctor: 'ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ',
    callNow: 'ಈಗ ಕರೆ ಮಾಡಿ',
    call112: '112 — ರಾಷ್ಟ್ರೀಯ ತುರ್ತು',
    call108: '108 — ಆಂಬ್ಯುಲೆನ್ಸ್',
    call102: '102 — ಆಂಬ್ಯುಲೆನ್ಸ್ (ಕೆಲವು ರಾಜ್ಯಗಳಲ್ಲಿ)',
    ambulance: 'ಆಂಬ್ಯುಲೆನ್ಸ್',
    police: 'ಪೊಲೀಸ್',
    nearbyHospitals: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು',
    hospitalsFound: '{count} ಆಸ್ಪತ್ರೆಗಳು ಸಿಕ್ಕಿವೆ',
    noHospitalsFound: 'ಆಸ್ಪತ್ರೆ ಸಿಗಲಿಲ್ಲ. ತಕ್ಷಣ 112 ಕರೆ ಮಾಡಿ.',
    loadingHospitals: 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇವೆ...',
    getDirections: 'ದಾರಿ',
    callHospital: 'ಕರೆ',
    distance: 'ದೂರ',
    km: 'ಕಿಮೀ',
    offlineMessage: 'ನೀವು ಆಫ್‌ಲೈನ್ ಆಗಿದ್ದೀರಿ. ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಸೂಚನೆಗಳು ಲಭ್ಯ. ಆಸ್ಪತ್ರೆ ಹುಡುಕಲು ಮತ್ತು AI ಸೇವೆಗೆ ಇಂಟರ್ನೆಟ್ ಅಗತ್ಯ.',
    offlineHospitalMessage: 'ಆಸ್ಪತ್ರೆ ಹುಡುಕಲು ಇಂಟರ್ನೆಟ್ ಅಗತ್ಯ. ದಯವಿಟ್ಟು 112 ಗೆ ಕರೆ ಮಾಡಿ.',
    offlineAIMessage: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ AI ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ. ಸ್ಥಳೀಯ ಪತ್ತೆ ವ್ಯವಸ್ಥೆ ಬಳಸಲಾಗುತ್ತಿದೆ.',
    voiceUnavailable: 'ಈ ಸಾಧನದಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಲಭ್ಯವಿಲ್ಲ.',
    voiceFallbackMessage: 'ದಯವಿಟ್ಟು ಕೆಳಗೆ ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ತುರ್ತು ಪ್ರಕಾರ ಆಯ್ಕೆ ಮಾಡಿ.',
    ttsUnavailable: 'ಈ ಸಾಧನದಲ್ಲಿ ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಸೂಚನೆಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಓದಿ.',
    ttsKannadaUnavailable: 'ಈ ಸಾಧನದಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ.',
    ttsKannadaWarning: '⚠️ ಈ ಬ್ರೌಸರ್/ಸಾಧನದಲ್ಲಿ ಕನ್ನಡ ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ಸೂಚನೆಗಳನ್ನು ಕನ್ನಡ ಪಠ್ಯದಲ್ಲಿ ಕೆಳಗೆ ತೋರಿಸಲಾಗಿದೆ. ಧ್ವನಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುವುದಿಲ್ಲ.',
    micPermissionDenied: 'ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ಕೊಡಿ.',
    orSelectEmergency: 'ಅಥವಾ ತುರ್ತು ಪ್ರಕಾರ ಆಯ್ಕೆ ಮಾಡಿ:',
    textInputPlaceholder: 'ಏನಾಯಿತು ಎಂದು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...',
    describeEmergency: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ ವಿವರಿಸಿ',
    emergencyUnknown: 'ತುರ್ತು ಪ್ರಕಾರ ಸ್ಪಷ್ಟವಿಲ್ಲ',
    askClarification: 'ಇನ್ನಷ್ಟು ಹೇಳಬಲ್ಲಿರಾ? ಮುಖ್ಯ ಲಕ್ಷಣಗಳು ಏನು?',
    isPersonConscious: 'ವ್ಯಕ್ತಿ ಎಚ್ಚರವಾಗಿದ್ದಾರೆಯೇ ಮತ್ತು ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತಿದ್ದಾರೆಯೇ?',
    isPersonBreathing: 'ವ್ಯಕ್ತಿ ಸಾಮಾನ್ಯವಾಗಿ ಉಸಿರಾಡುತ್ತಿದ್ದಾರೆಯೇ?',
    isThereHeavyBleeding: 'ಹೆಚ್ಚು ರಕ್ತ ಹರಿಯುತ್ತಿದೆಯೇ?',
    hasEmergencyBeenCalled: 'ತುರ್ತು ಸಹಾಯಕ್ಕೆ ಕರೆ ಮಾಡಲಾಗಿದೆಯೇ?',
    yes: 'ಹೌದು',
    no: 'ಇಲ್ಲ',
    repeatInstruction: 'ಈ ಸೂಚನೆ ಮತ್ತೆ ಹೇಳಿ',
    locationShared: 'ಸ್ಥಳ ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ಕಾಪಿ ಆಗಿದೆ',
    copyLocation: 'ಸ್ಥಳ ಕಾಪಿ ಮಾಡಿ',
    shareViaWhatsApp: 'WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
    medicalDisclaimer: '⚠️ ಈ ಅಪ್ಲಿಕೇಶನ್ ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಮಾರ್ಗದರ್ಶನ ಮಾತ್ರ ಒದಗಿಸುತ್ತದೆ. ಇದು ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಆರೈಕೆಗೆ ಬದಲಿಯಾಗಿಲ್ಲ.',
    professionalCareRequired: 'ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಆರೈಕೆ ಅಗತ್ಯ. ಇವು ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಹಂತಗಳು ಮಾತ್ರ.',
    voiceOn: 'ಧ್ವನಿ: ಆನ್',
    voiceOff: 'ಧ್ವನಿ: ಆಫ್',
    textSizeSmall: 'ಚಿಕ್ಕದು',
    textSizeMedium: 'ಮಧ್ಯಮ',
    textSizeLarge: 'ದೊಡ್ಡದು',
    privacyNote: 'ನಿಮ್ಮ ಸ್ಥಳ ಕೇವಲ "ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ" ಒತ್ತಿದಾಗ ಮಾತ್ರ ಹಂಚಿಕೊಳ್ಳಲಾಗುತ್ತದೆ. ಯಾವುದೇ ವ್ಯಕ್ತಿಗತ ಡೇಟಾ ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ.',
    permissionRequired: 'ಅನುಮತಿ ಅಗತ್ಯ',
    allowLocation: 'ಸ್ಥಳ ಅನುಮತಿ ಕೊಡಿ',
    locationDenied: 'ಸ್ಥಳ ಪ್ರವೇಶ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದೂರ ವರ್ಗೀಕರಣ ಇಲ್ಲದೆ ಎಲ್ಲ ಆಸ್ಪತ್ರೆಗಳು ತೋರಿಸಲಾಗುತ್ತಿವೆ.',
    home: 'ಮನೆ',
    back: 'ಹಿಂದೆ',
    emergency_snakebite: 'ಹಾವು ಕಡಿತ',
    emergency_heart_attack: 'ಹೃದಯಾಘಾತ',
    emergency_stroke: 'ಪಾರ್ಶ್ವವಾಯು (ಸ್ಟ್ರೋಕ್)',
    emergency_unconsciousness: 'ಪ್ರಜ್ಞೆ ಕಳೆದಿರುವ ವ್ಯಕ್ತಿ',
    emergency_road_accident: 'ರಸ್ತೆ ಅಪಘಾತ',
    emergency_heavy_bleeding: 'ಅಧಿಕ ರಕ್ತಸ್ರಾವ',
    emergency_burns: 'ಸುಟ್ಟ ಗಾಯ',
    emergency_electric_shock: 'ವಿದ್ಯುತ್ ಆಘಾತ',
    emergency_choking: 'ಗಂಟಲು ಕಟ್ಟಿಕೊಳ್ಳುವಿಕೆ',
    emergency_breathing_difficulty: 'ಉಸಿರಾಟದ ತೊಂದರೆ',
    emergency_seizure: 'ಅಪಸ್ಮಾರ / ಫಿಟ್ಸ್',
    emergency_fainting: 'ಮೂರ್ಛೆ / ತಲೆ ಸುತ್ತುವಿಕೆ',
    emergency_unknown: 'ಅಜ್ಞಾತ ತುರ್ತು ಪರಿಸ್ಥಿತಿ',
  },
};

export function t(key: TranslationKey, lang: Language, replacements?: Record<string, string | number>): string {
  let str = translations[lang]?.[key] ?? translations.en[key] ?? key;
  if (replacements) {
    Object.entries(replacements).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, String(v));
    });
  }
  return str;
}
