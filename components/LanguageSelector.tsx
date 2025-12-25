import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase text-slate-500 hover:text-primary hover:border-primary transition-all active:scale-95"
      title={language === 'en' ? 'Switch to Spanish' : 'Switch to English'}
    >
      {language.toUpperCase()}
    </button>
  );
};
