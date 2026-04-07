'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Language } from '@/game/engine/types';

const STORAGE_KEY = 'sales-school-lang';

function getStoredLang(): Language {
  if (typeof window === 'undefined') return 'uz';
  return (localStorage.getItem(STORAGE_KEY) as Language) || 'uz';
}

export function useLang() {
  const [lang, setLangState] = useState<Language>(getStoredLang);

  useEffect(() => {
    setLangState(getStoredLang());
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  return { lang, setLang } as const;
}
