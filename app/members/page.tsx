import Link from "next/link";
import { getServiceClient } from "@/lib/supabase";

const CATEGORY_META: Record<string, { emoji: string; zh: string; en: string; color: string }> = {
  investor:                { emoji: "💰", zh: "投资人",      en: "Investor",          color: "bg-blue-100 text-blue-700" },
  cofounder:               { emoji: "🤝", zh: "寻找合伙人",  en: "Co-founder",        color: "bg-purple-100 text-purple-700" },
  "professional-services": { emoji: "🔧", zh: "专业服务",    en: "Pro Services",      color: "bg-indigo-100 text-indigo-700" },
  "brand-creator":         { emoji: "🎬", zh: "品牌营销",    en: "Brand Marketing",   color: "bg-pink-100 text-pink-700" },
  "talent-search":         { emoji: "👥", zh: "招募人才",    en: "Talent Search",     color: "bg-emerald-100 text-emerald-700" },
  "product-trial":         { emoji: "🧪", zh: "产品推广",    en: "Product Trial",     color: "bg-amber-100 text-amber-700" },
  "offer-investor":        { emoji: "💰", zh: "投资人",      en: "Investor",          color: "bg-amber-100 text-amber-700" },
  "offer-expert":          { emoji: "🎯", zh: "专业服务",    en: "Professional",      color: "bg-rose-100 text-rose-700" },
  "offer-cofounder":       { emoji: "🚀", zh: "想当合伙人",  en: "Open to Co-found",  color: "bg-orange-100 text-orange-700" },
  "offer-creator":         { emoji: "🎬", zh: "创作者/网红", en: "Creator",           color: "bg-pink-100 text-pink-700" },
  "offer-talent":          { emoji: "💡", zh: "求职/顾问",   en: "Job Seeker",        color: "bg-emerald-100 text-emerald-700" },
  "offer-tester":          { emoji: "🧪", zh: "试用者",      en: "Product Tester",    color: "bg-yellow-100 text-yellow-700" },
  // legacy
  lawyer:                  { emoji: "⚖️", zh: "律师",        en: "Lawyer",            color: "bg-indigo-100 text-indigo-700" },
  accountant:              { emoji: "📊", zh: "会计/财务",   en: "Accountant",        color: "bg-cyan-100 text-cyan-700" },
  advisor:                 { emoji: "💼", zh: "商业顾问",    en: "Advisor",           color: "bg-teal-100 text-teal-700" },
};

async function getProfiles() {
  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("trustlink_profiles")
      .select("id, category, name, teaser, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (error) { console.error("DB error:", error.message); return []; }
    return data || [];
  } catch (e) {
    console.error("Profiles fetch failed:", e);
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const profiles = await getProfiles();

  return (
    <div className="min-h-screen" style={{ background: "#f5f4f0" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="leading-tight">
            <Link href="/" className="text-sm font-black text-gray-900">TrustLink</Link>
            <p className="text-[10px] font-semibold text-blue-600 tracking-wider">成员目录</p>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← 返回</Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 mb-1">成员目录</h1>
          <p className="text-sm text-gray-500">查看 profile · 联系方式付费解锁</p>
        </div>

        {profiles.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🔜</p>
            <p className="font-semibold text-gray-900 mb-1">成员 profile 陆续入驻中</p>
            <p className="text-sm text-gray-400 mb-4">成为第一批成员</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-[#1b3a6b] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
              发布我的 Profile →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map((p: { id: string; category: string; name: string; teaser: string | null; verified?: boolean }) => {
              const meta = CATEGORY_META[p.category] || { emoji: "👤", zh: p.category, en: p.category, color: "bg-gray-100 text-gray-600" };
              return (
                <Link key={p.id} href={`/members/${p.id}`}
                  className="flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--surface)", borderColor: "var(--line)", boxShadow: "var(--shadow)" }}
                >
                  <div className={`tl-avatar w-12 h-12 text-lg ${p.verified ? "verified" : ""}`}>
                    {p.name?.trim()?.[0]?.toUpperCase() ?? "?"}
                    {p.verified && <span className="badge">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>{p.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.zh}</span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {p.teaser ? p.teaser.slice(0, 60) + "…" : "查看完整 Profile →"}
                    </p>
                  </div>
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/"
            className="inline-flex items-center gap-2 bg-[#1b3a6b] text-white text-sm font-semibold px-6 py-3 rounded-2xl"
          >
            📋 发布我的 Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
