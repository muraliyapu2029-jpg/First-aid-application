import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Language } from '../types';

// ============================================================
// Language Context
// Global language state with localStorage persistence
// ============================================================

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('raksha_language');
    return (saved as Language) ?? 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('raksha_language', lang);
    // Update html lang attribute for accessibility
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'hi' ? 'hi' : 'kn';
  };

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : language === 'hi' ? 'hi' : 'kn';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
