"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { Globe } from 'lucide-react';

type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['ru']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('app_lang') as Language;
      if (savedLang === 'ru' || savedLang === 'en') {
        setLanguage(savedLang);
      } else {
        // Определение системного языка браузера/ОС
        const systemLang = navigator.language;
        const detected: Language = systemLang.startsWith('ru') ? 'ru' : 'en';
        setLanguage(detected);
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key: keyof typeof translations['ru']): string => {
    const dict = translations[language] || translations['ru'];
    return dict[key] || translations['ru'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
    >
      <Globe className="w-3.5 h-3.5 text-gray-400" />
      <span>{language === 'ru' ? 'English' : 'Русский'}</span>
    </button>
  );
}