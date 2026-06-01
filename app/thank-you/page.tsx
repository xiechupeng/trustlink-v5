"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORY_META } from "@/lib/forms-config";
import { useLanguage } from "@/components/LanguageProvider";
import { T } from "@/lib/translations";

const OWNER_WECHAT = "localsea_app";

// offer-* 类别：供给方 profile，需要引导验证
const OFFER_CATEGORIES = new Set([
  "offer-investor", "offer-expert", "offer-cofounder",
  "offer-creator", "offer-talent", "offer-tester",
]);

function VerificationSteps({ category }: { category: string }) {
  const isCreator = category === "offer-creator";

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
          🔐
        </div>
        <div>
          <h2 className="font-bold text-gray-900">身份验证（可选）</h2>
          <p className="text-xs text-blue-600 font-medium">完成后 Profile 显示「✓ 已验证」标记</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {/* Method A */}
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-xs font-bold text-blue-800 mb-1">
            方式 A — Bio 暗语验证（证明账号归属）
          </p>
          {isCreator ? (
            <p className="text-xs text-blue-700 leading-relaxed">
              在你的 Instagram / TikTok / 小红书 Bio 中临时加入：
              <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded ml-1 text-blue-900">TrustLink</span>
              <br />截图发给管理员确认后即可删除。
            </p>
          ) : (
            <p className="text-xs text-blue-700 leading-relaxed">
              在你的 LinkedIn / 个人网站 / 公司官网中临时加入：
              <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded ml-1 text-blue-900">TrustLink</span>
              <br />截图发给管理员确认后即可删除。
            </p>
          )}
        </div>

        {/* Method B */}
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-bold text-gray-700 mb-1">
            方式 B — 资质截图验证（证明信息真实）
          </p>
          {isCreator ? (
            <p className="text-xs text-gray-500 leading-relaxed">
              发送你的账号主页截图（显示粉丝数和近期帖子）给管理员。
            </p>
          ) : (
            <p className="text-xs text-gray-500 leading-relaxed">
              发送能证明你背景的截图（LinkedIn、执照、工牌、名片等）给管理员。
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
        <span className="text-xl">💬</span>
        <div>
          <p className="text-xs text-teal-600">发截图至管理员微信，备注「验证申请」</p>
          <p className="font-bold text-teal-800">{OWNER_WECHAT}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        验证完全自愿 · 未验证 Profile 仍可正常展示
      </p>
    </div>
  );
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const wechat   = searchParams.get("wechat")   || "";
  const meta     = CATEGORY_META[category];
  const isOffer  = OFFER_CATEGORIES.has(category);

  const { lang } = useLanguage();
  const t = T[lang];

  const categoryLabel = meta ? (lang === "en" && meta.labelEn ? meta.labelEn : meta.label) : category;

  return (
    <div className="max-w-md w-full space-y-4">

      {/* Step 1: Submitted */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
          <h2 className="font-bold text-gray-900">{t.thankStep1}</h2>
        </div>
        <p className="text-sm text-gray-500 ml-11">
          {t.thankReceived}{" "}
          {meta && <strong className="text-gray-700">{meta.emoji} {categoryLabel}</strong>}{" "}
          {t.thankRequest}
          {wechat && <> · {t.thankContact} <strong className="text-gray-700">{wechat}</strong></>}
        </p>
      </div>

      {/* Verification step (offer profiles only) */}
      {isOffer && <VerificationSteps category={category} />}

      {/* Step 2: Pending review */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-teal-500 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {isOffer ? "2" : "2"}
          </div>
          <h2 className="font-bold text-gray-900">{t.thankStep2}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {t.thankReply("24")}
        </p>
        <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <p className="text-xs text-teal-600 mb-0.5">{t.thankWechatNote}</p>
            <p className="font-bold text-lg text-teal-800">{OWNER_WECHAT}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">{t.thankAddNote}</p>
      </div>

      {/* Step 3: Start connecting */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-70">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
          <h2 className="font-bold text-gray-700">{t.thankStep3}</h2>
        </div>
        <p className="text-sm text-gray-500 ml-11">{t.thankStep3Desc}</p>
      </div>

      <Link href="/" className="block text-center text-sm text-gray-400 hover:text-gray-600 py-2">
        {t.thankBack}
      </Link>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-gray-400 text-sm">Loading...</div>}>
        <ThankYouContent />
      </Suspense>
    </div>
  );
}
