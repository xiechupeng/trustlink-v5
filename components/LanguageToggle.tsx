"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded-full px-3 py-1.5 transition-all hover:border-gray-400 shadow-sm"
    >
      <span>🌐</span>
      <span className={lang === "zh" ? "font-bold text-gray-800" : ""}>中文</span>
      <span className="text-gray-300">|</span>
      <span className={lang === "en" ? "font-bold text-gray-800" : ""}>English</span>
    </button>
  );
}
