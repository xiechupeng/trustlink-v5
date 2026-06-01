"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "zh" | "en";

interface LangCtx {
  lang: Lang;
  toggle: () => void;
}

export const LanguageContext = createContext<LangCtx>({ lang: "zh", toggle: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("seagull-lang") as Lang;
    if (saved === "en" || saved === "zh") setLang(saved);
  }, []);

  function toggle() {
    setLang((prev) => {
      const next = prev === "zh" ? "en" : "zh";
      localStorage.setItem("seagull-lang", next);
      return next;
    });
  }

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
