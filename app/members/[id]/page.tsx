"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { getPublicClient } from "@/lib/supabase";
import { FORMS } from "@/lib/forms-config";
import { PLANS, DEFAULT_PLAN, type PlanKey } from "@/lib/pricing";

const CATEGORY_META: Record<string, { emoji: string; zh: string; color: string }> = {
  investor:                { emoji: "💰", zh: "投资人",      color: "bg-blue-100 text-blue-700" },
  cofounder:               { emoji: "🤝", zh: "寻找合伙人",  color: "bg-purple-100 text-purple-700" },
  "professional-services": { emoji: "🔧", zh: "专业服务",    color: "bg-indigo-100 text-indigo-700" },
  "brand-creator":         { emoji: "🎬", zh: "品牌营销",    color: "bg-pink-100 text-pink-700" },
  "talent-search":         { emoji: "👥", zh: "招募人才",    color: "bg-emerald-100 text-emerald-700" },
  "product-trial":         { emoji: "🧪", zh: "产品推广",    color: "bg-amber-100 text-amber-700" },
  "offer-investor":        { emoji: "💰", zh: "投资人",      color: "bg-amber-100 text-amber-700" },
  "offer-expert":          { emoji: "🎯", zh: "专业服务",    color: "bg-rose-100 text-rose-700" },
  "offer-cofounder":       { emoji: "🚀", zh: "想当合伙人",  color: "bg-orange-100 text-orange-700" },
  "offer-creator":         { emoji: "🎬", zh: "创作者/网红", color: "bg-pink-100 text-pink-700" },
  "offer-talent":          { emoji: "💡", zh: "求职/顾问",   color: "bg-emerald-100 text-emerald-700" },
  "offer-tester":          { emoji: "🧪", zh: "试用者",      color: "bg-yellow-100 text-yellow-700" },
  lawyer:                  { emoji: "⚖️", zh: "律师",        color: "bg-indigo-100 text-indigo-700" },
  accountant:              { emoji: "📊", zh: "会计/财务",   color: "bg-cyan-100 text-cyan-700" },
  advisor:                 { emoji: "💼", zh: "商业顾问",    color: "bg-teal-100 text-teal-700" },
};

const CONTACT_KEYS = new Set(["name", "wechat", "email"]);
const ADMIN_WECHAT = "localsea_app";
const ZELLE_EMAIL  = "peter.bellevue2025@gmail.com";

type Profile = {
  id: string;
  category: string;
  name: string;
  teaser: string | null;
  verified?: boolean;
  data: Record<string, string> | null;
};

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(DEFAULT_PLAN);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const db = getPublicClient();
      const { data } = await db
        .from("trustlink_profiles")
        .select("id, category, name, teaser, data")
        .eq("id", id)
        .eq("approved", true)
        .single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const copyWechat = useCallback(() => {
    navigator.clipboard.writeText(ADMIN_WECHAT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <p className="text-gray-400 text-sm">加载中...</p>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center">
        <p className="text-gray-500 mb-4">Profile 不存在或未通过审核</p>
        <Link href="/members" className="text-blue-600 text-sm">← 返回目录</Link>
      </div>
    </div>
  );

  const meta = CATEGORY_META[profile.category] || { emoji: "👤", zh: profile.category, color: "bg-gray-100 text-gray-600" };
  const formConfig = FORMS[profile.category];
  const publicFields = formConfig?.fields.filter(
    f => !CONTACT_KEYS.has(f.key) && f.type !== "divider" && profile.data?.[f.key]
  ) ?? [];

  const activePlan = PLANS.find(p => p.key === selectedPlan)!;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-black text-gray-900">TrustLink</Link>
          <Link href="/members" className="text-xs text-gray-400 hover:text-gray-600">← 成员目录</Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Profile card */}
        <div className="rounded-2xl border p-6 space-y-5"
          style={{ background: "var(--surface)", borderColor: "var(--line)", boxShadow: "var(--shadow)" }}>
          <div className="flex items-center gap-4">
            <div className={`tl-avatar w-16 h-16 text-2xl font-bold ${profile.verified ? "verified" : ""}`}>
              {profile.name?.trim()?.[0]?.toUpperCase() ?? "?"}
              {profile.verified && <span className="badge badge-lg">✓</span>}
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: "var(--ink)" }}>{profile.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.zh}</span>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ color: "var(--accent-text)", background: "var(--accent-soft)", borderColor: "var(--accent-line)" }}>
                    ✓ 已验证
                  </span>
                )}
              </div>
            </div>
          </div>

          {profile.teaser && (
            <p className="text-sm text-gray-700 leading-relaxed border-l-2 border-blue-200 pl-3">
              {profile.teaser}
            </p>
          )}

          {publicFields.length > 0 && (
            <div className="space-y-3">
              <div className="h-px bg-gray-100" />
              {publicFields.map(field => {
                const value = profile.data?.[field.key];
                if (!value) return null;
                let displayValue = value;
                try {
                  const parsed = JSON.parse(value);
                  if (Array.isArray(parsed)) {
                    const optionMap = Object.fromEntries((field.options ?? []).map(o => [o.value, o.label]));
                    displayValue = parsed.map((v: string) => optionMap[v] ?? v).join("  ·  ");
                  }
                } catch { /* plain string */ }
                return (
                  <div key={field.key} className="flex gap-3">
                    <span className="text-xs text-gray-400 w-20 flex-shrink-0 pt-0.5">{field.label}</span>
                    <span className="text-sm text-gray-800 leading-relaxed flex-1">{displayValue}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Locked contact */}
          <div className="relative rounded-xl overflow-hidden">
            <div className="space-y-2 blur-sm select-none pointer-events-none px-3 py-3">
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-20">微信号</span>
                <div className="h-4 bg-green-100 rounded w-28" />
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-gray-400 w-20">邮箱</span>
                <div className="h-4 bg-gray-100 rounded w-36" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <p className="text-sm font-semibold text-gray-700">联系方式 · 解锁后可见</p>
              </div>
            </div>
          </div>
        </div>

        {/* Unlock CTA */}
        <button
          onClick={() => setShowUnlock(true)}
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg flex items-center justify-center gap-2"
          style={{ background: "#1b3a6b" }}
        >
          🔓 解锁联系方式 · 从 $29 起
        </button>

        <p className="text-center text-xs text-gray-400">一次性付款 · Zelle 收款 · 24小时内发送</p>
      </div>

      {/* Unlock Modal */}
      {showUnlock && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => setShowUnlock(false)}>
          <div className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-10 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

            <h2 className="text-xl font-black text-gray-900 mb-1">解锁联系方式</h2>
            <p className="text-sm text-gray-500 mb-5">选择适合你的方案</p>

            {/* Plan selector */}
            <div className="space-y-2 mb-6">
              {PLANS.map(plan => (
                <button key={plan.key}
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all ${
                    selectedPlan === plan.key
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        selectedPlan === plan.key ? "border-blue-600" : "border-gray-300"
                      }`}>
                        {selectedPlan === plan.key && (
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{plan.label}</span>
                      {plan.badge && (
                        <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <span className={`font-black text-base ${
                      selectedPlan === plan.key ? "text-blue-600" : "text-gray-900"
                    }`}>{plan.price}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-6">{plan.desc}</p>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mb-5" />

            {/* Payment steps */}
            <h3 className="text-sm font-bold text-gray-700 mb-4">付款步骤</h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Zelle 转账 <span className="text-blue-600">{activePlan.price}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    转到：<span className="font-mono font-semibold text-gray-800">{ZELLE_EMAIL}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    备注：<span className="font-mono">{activePlan.zelleNote}</span>
                    {activePlan.key === "single" && ` + ${profile.name}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">截图发给管理员微信</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm font-bold text-gray-800">{ADMIN_WECHAT}</span>
                    <button onClick={copyWechat}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg hover:bg-gray-200">
                      {copied ? "已复制 ✓" : "复制"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</div>
                <div>
                  {activePlan.key === "single" && (
                    <>
                      <p className="text-sm font-semibold text-gray-900">24小时内收到联系方式</p>
                      <p className="text-xs text-gray-500 mt-0.5">直接加对方微信，开始沟通</p>
                    </>
                  )}
                  {activePlan.key === "pack3" && (
                    <>
                      <p className="text-sm font-semibold text-gray-900">开通 3 次解锁额度</p>
                      <p className="text-xs text-gray-500 mt-0.5">告知管理员你要解锁哪些人，逐一发送</p>
                    </>
                  )}
                  {activePlan.key === "monthly" && (
                    <>
                      <p className="text-sm font-semibold text-gray-900">开通月度会员（30天）</p>
                      <p className="text-xs text-gray-500 mt-0.5">当月无限解锁，直接发消息给管理员指定成员即可</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button onClick={() => setShowUnlock(false)}
              className="w-full py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-medium">
              稍后再说
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
