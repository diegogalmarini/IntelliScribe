import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  onLanguageChange?: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => {
        const newLang = language === 'en' ? 'es' : 'en';
        setLanguage(newLang);
        if (onLanguageChange) onLanguageChange(newLang);
      }}
      className="flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase text-slate-500 hover:text-primary hover:border-primary transition-all active:scale-95"
      title={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
    >
      {language === 'en' ? 'ES' : 'EN'}
    </button>
  );
};
