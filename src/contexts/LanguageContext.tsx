// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  // ✅ Load from localStorage on mount
  useEffect(() => {
    console.log('🔧 LanguageContext: Initializing...');
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ar', 'en', 'fr'].includes(savedLanguage)) {
      console.log('✅ Loaded language from localStorage:', savedLanguage);
      setLanguageState(savedLanguage);
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  // ✅ Log whenever language changes
  useEffect(() => {
    console.log('🌍 LanguageContext: Language changed to:', language);
  }, [language]);

  // ✅ Wrapper function that updates state AND localStorage
  const setLanguage = (newLang: Language) => {
    console.log('🔄 LanguageContext: setLanguage called with:', newLang);
    setLanguageState(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    console.log('✅ Language updated in context');
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};
