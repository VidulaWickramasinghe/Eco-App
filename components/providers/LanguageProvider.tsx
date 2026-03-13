'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Language } from '@/types/app';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'eco-collect-language';

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'English';

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'English' || saved === 'Sinhala' || saved === 'Tamil') {
    return saved;
  }
  return 'English';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
