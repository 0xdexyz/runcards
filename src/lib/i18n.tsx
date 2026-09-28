import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COPY, LANGS, type Copy, type Lang } from '../content';

interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
}

const STORAGE_KEY = 'site-lang';
const LangContext = createContext<LangValue | null>(null);

function readStoredLang(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (LANGS.some((l) => l.id === saved)) return saved as Lang;
  } catch {
    // storage can be unavailable (private mode, blocked cookies)
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    // Copy length changes shift the layout; re-measure scroll-driven sections.
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: COPY[lang] }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const value = useContext(LangContext);
  if (!value) throw new Error('useLang must be used inside LanguageProvider');
  return value;
}

export const useCopy = () => useLang().t;
