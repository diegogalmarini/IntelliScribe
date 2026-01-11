import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with persisted language if available
  const [language, setLanguage] = useState<Language>(() => {
    // Check for any stored language preference
    // Note: We need a generic key or one that matches App.tsx pattern. 
    // Since we don't have userId here easily, we might fallback to a generic key or wait for App.tsx
    // However, App.tsx writes to `diktalo_settings_language_${userId}`.
    // Let's try to match that or a generic 'diktalo_language' if we want global.
    // For now, let's keep it simple: App.tsx controls it. 
    // BUT, to avoid flash, we need to read SOMETHING.
    // Let's try reading a generic key if we decide to fallback.
    // Actually, let's just default to 'es' but export a setter that writes to storage.
    return 'es';
  });

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