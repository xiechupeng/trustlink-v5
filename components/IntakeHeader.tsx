"use client";

import { useLanguage } from "./LanguageProvider";
import { T } from "@/lib/translations";
import type { FormConfig } from "@/lib/forms-config";

export default function IntakeHeader({ config }: { config: FormConfig }) {
  const { lang } = useLanguage();
  const t = T[lang];

  const title    = lang === "en" && config.titleEn    ? config.titleEn    : config.title;
  const subtitle = lang === "en" && config.subtitleEn ? config.subtitleEn : config.subtitle;

  const isFree   = config.trialFee === "免费" || config.trialFee === "free";
  const isPartner = config.category === "partner";

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">{config.emoji}</div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>

      {/* Fee banner */}
      {!isPartner && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex gap-3 items-start">
          <span className="text-lg mt-0.5">💡</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">{t.feeBannerTitle}</p>
            {isFree ? (
              <p className="text-xs text-amber-700 mt-0.5">{t.feeFree}</p>
            ) : config.trialFee ? (
              <p className="text-xs text-amber-700 mt-0.5">
                {lang === "en" ? (
                  <>
                    Service fee after matching:{" "}
                    <span className="line-through text-amber-400 mx-1">{config.originalFee}</span>
                    <strong className="text-amber-900">{config.trialFee}</strong>
                    <span className="ml-1 text-amber-600">(50% off during trial)</span>
                  </>
                ) : (
                  <>
                    匹配推荐后收取服务费：
                    <span className="line-through text-amber-400 mx-1">{config.originalFee}</span>
                    <strong className="text-amber-900">{config.trialFee}</strong>
                    <span className="ml-1 text-amber-600">（试运营5折）</span>
                  </>
                )}
              </p>
            ) : (
              <p className="text-xs text-amber-700 mt-0.5">
                {lang === "en"
                  ? "We charge a service fee after providing a match recommendation (50% off during trial)"
                  : "我们提供匹配推荐后收取服务费，试运营期间 5折优惠"}
              </p>
            )}
            {!isFree && (
              <p className="text-xs text-amber-600 mt-0.5">{t.feeNote}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
