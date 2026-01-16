import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, Language } from '../utils/translations';
import * as Analytics from '../utils/analytics';


interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with persisted language if available, defaulting to 'es'
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('diktalo_global_language');
      if (stored === 'en' || stored === 'es') return stored;
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('diktalo_global_language', lang);

      // TRACK: Language Change
      if (Analytics && typeof Analytics.trackEvent === 'function') {
        Analytics.trackEvent('change_interface_language', { language: lang });
        if (typeof Analytics.setUserProperties === 'function') {
          Analytics.setUserProperties({ interface_language: lang });
        }
      }
    }
  };


  // We need to exposing a method to update state respecting storage is handled by App.tsx, 
  // but we can make internal state update cleaner.

  const t = (key: keyof typeof translations['en']) => {
    const val = translations[language][key];
    return val !== undefined ? val : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};