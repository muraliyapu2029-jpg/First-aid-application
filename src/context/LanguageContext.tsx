import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language, SarvamLanguageCode } from '../types';
import { normalizeSarvamLanguageCode } from '../services/sarvamService';

// ============================================================
// Language Context
// Automatically updated from Sarvam AI / speech language detection
// ============================================================

interface LanguageContextValue {
  language: Language;
  detectedLanguageCode: SarvamLanguageCode;
  isAutoDetected: boolean;
  setLanguage: (lang: Language) => void;
  setDetectedLanguage: (code: SarvamLanguageCode | string) => void;
}

function sarvamToUiLanguage(code: SarvamLanguageCode): Language {
  if (code === 'kn-IN') return 'kn';
  if (code === 'hi-IN') return 'hi';
  return 'en';
}

function uiToSarvamLanguage(lang: Language): SarvamLanguageCode {
  if (lang === 'kn') return 'kn-IN';
  if (lang === 'hi') return 'hi-IN';
  return 'en-IN';
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  detectedLanguageCode: 'en-IN',
  isAutoDetected: false,
  setLanguage: () => {},
  setDetectedLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [detectedLanguageCode, setDetectedLanguageCode] = useState<SarvamLanguageCode>(() => {
    const saved = localStorage.getItem('raksha_detected_lang_code');
    return saved ? normalizeSarvamLanguageCode(saved) : 'en-IN';
  });
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);

  const language: Language = sarvamToUiLanguage(detectedLanguageCode);

  const setDetectedLanguage = useCallback((code: SarvamLanguageCode | string) => {
    const normalized = normalizeSarvamLanguageCode(code);
    setDetectedLanguageCode(normalized);
    setIsAutoDetected(true);
    localStorage.setItem('raksha_detected_lang_code', normalized);
    localStorage.setItem('raksha_language', sarvamToUiLanguage(normalized));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    const code = uiToSarvamLanguage(lang);
    setDetectedLanguageCode(code);
    setIsAutoDetected(false);
    localStorage.setItem('raksha_language', lang);
    localStorage.setItem('raksha_detected_lang_code', code);
  }, []);

  useEffect(() => {
    document.documentElement.lang = detectedLanguageCode.split('-')[0] || 'en';
  }, [detectedLanguageCode]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        detectedLanguageCode,
        isAutoDetected,
        setLanguage,
        setDetectedLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
