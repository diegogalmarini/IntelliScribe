import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
          language === 'en'
            ? 'bg-slate-800 text-white border-slate-700'
            : 'bg-transparent text-slate-500 border-slate-700 hover:text-white'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
          language === 'es'
            ? 'bg-primary text-white border-primary'
            : 'bg-transparent text-slate-500 border-slate-700 hover:text-white'
        }`}
      >
        ES
      </button>
    </div>
  );
};
