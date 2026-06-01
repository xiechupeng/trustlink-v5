"use client";

import { Fragment, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { T } from "@/lib/translations";
import { getPublicClient } from "@/lib/supabase";
import { CATEGORY_META } from "@/lib/forms-config";

function initial(name: string) {
  return name?.trim()?.[0]?.toUpperCase() ?? "?";
}

// Language-neutral SVG line icons (24×24, stroke style)
const S = "currentColor";
const SW = "1.75";
const CAT_ICONS: Record<string, React.ReactNode> = {
  invest: (
    <svg viewBox="0 0 24 24" fill="none" stroke={S} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  partner: (
    <svg viewBox="0 0 24 24" fill="none" stroke={S} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  expert: (
    <svg viewBox="0 0 24 24" fill="none" stroke={S} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  creator: (
    <svg viewBox="0 0 24 24" fill="none" stroke={S} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  ),
  talent: (
    <svg viewBox="0 0 24 24" fill="none" stroke={S} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  tester: (
    <svg viewBox="0 0 24 24" fill="none" stroke={S} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6"/>
      <path d="M9 3v9l-4.5 8.5A1 1 0 0 0 5.4 22h13.2a1 1 0 0 0 .9-1.5L15 12V3"/>
      <path d="M6.5 18h11"/>
    </svg>
  ),
};

type NeedCategory = {
  key: string; iconKey: string;
  zh: string; en: string;
  desc_zh: string; desc_en: string;
  color: string; iconColor: string; arrowBg: string;
  groupZh?: string; groupEn?: string;
};

const NEED_CATEGORIES: NeedCategory[] = [
  { key: "investor",              iconKey: "invest",  zh: "寻找投资人",            en: "Looking for Investors",          desc_zh: "天使轮 · Pre-seed · 种子轮",         desc_en: "Angel · Pre-seed · Seed",            color: "bg-blue-50 border-blue-100",       iconColor: "text-blue-500",    arrowBg: "bg-blue-500",    groupZh: "商业合作", groupEn: "Business" },
  { key: "cofounder",             iconKey: "partner", zh: "寻找合伙人",            en: "Looking for Co-founders",        desc_zh: "技术合伙人 · 运营 · 联合创始人",     desc_en: "Tech · Ops · Co-founder",            color: "bg-purple-50 border-purple-100",   iconColor: "text-purple-500",  arrowBg: "bg-purple-500" },
  { key: "professional-services", iconKey: "expert",  zh: "寻找专业服务",          en: "Professional Services",          desc_zh: "律师 · 会计 · 移民 · 跨境税务",      desc_en: "Legal · Accounting · Immigration",   color: "bg-indigo-50 border-indigo-100",   iconColor: "text-indigo-500",  arrowBg: "bg-indigo-500",  groupZh: "专业服务", groupEn: "Pro Services" },
  { key: "brand-creator",         iconKey: "creator", zh: "招募创作者 / 网红",     en: "Looking for Creators",           desc_zh: "内容合作 · 品牌推广 · 大使计划",     desc_en: "Content collab · Campaigns",         color: "bg-pink-50 border-pink-100",       iconColor: "text-pink-500",    arrowBg: "bg-pink-500",    groupZh: "品牌营销", groupEn: "Brand Marketing" },
  { key: "talent-search",         iconKey: "talent",  zh: "寻找人才 / 顾问",       en: "Talent & Consultant Search",     desc_zh: "全职 · 兼职 · 项目制 · 外部顾问",   desc_en: "Full-time · Part-time · Consulting", color: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-500", arrowBg: "bg-emerald-500", groupZh: "人才对接", groupEn: "Talent" },
  { key: "product-trial",         iconKey: "tester",  zh: "招募产品 / APP 试用者", en: "Looking for Product Testers",    desc_zh: "新品体验 · APP 内测 · 真实反馈",     desc_en: "Product trial · Beta · Feedback",    color: "bg-amber-50 border-amber-100",     iconColor: "text-amber-500",   arrowBg: "bg-amber-500",   groupZh: "产品推广", groupEn: "Product Trials" },
];

const OFFER_CATEGORIES = [
  { key: "offer-investor",  iconKey: "invest",  zh: "我是投资人",           en: "I'm an Investor",               desc_zh: "发布偏好 · 等创始人来找你",   desc_en: "Post thesis · Let founders find you", color: "bg-amber-50 border-amber-100",     iconColor: "text-amber-600",   arrowBg: "bg-amber-500" },
  { key: "offer-cofounder", iconKey: "partner", zh: "我想当合伙人",         en: "I Want to Be a Co-founder",     desc_zh: "展示背景 · 开放合伙",         desc_en: "Show background · Open to co-found",  color: "bg-orange-50 border-orange-100",   iconColor: "text-orange-500",  arrowBg: "bg-orange-500" },
  { key: "offer-expert",    iconKey: "expert",  zh: "我提供专业服务",       en: "I Offer Professional Services",  desc_zh: "律师 · 会计 · 顾问",         desc_en: "Legal · Accounting · Advisory",       color: "bg-rose-50 border-rose-100",       iconColor: "text-rose-500",    arrowBg: "bg-rose-500" },
  { key: "offer-creator",   iconKey: "creator", zh: "我是创作者 / 网红",    en: "I'm a Creator / Influencer",    desc_zh: "接受品牌合作 · 内容创作",     desc_en: "Open to brand deals · Content",       color: "bg-pink-50 border-pink-100",       iconColor: "text-pink-500",    arrowBg: "bg-pink-500" },
  { key: "offer-talent",    iconKey: "talent",  zh: "我是求职者 / 顾问",    en: "I'm a Job Seeker / Consultant", desc_zh: "展示背景 · 接受机会",         desc_en: "Show background · Open to roles",     color: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-500", arrowBg: "bg-emerald-500" },
  { key: "offer-tester",    iconKey: "tester",  zh: "我愿意试用产品 / APP", en: "I'm a Product Tester",          desc_zh: "体验新产品 · 提供真实反馈",   desc_en: "Try products · Give real feedback",   color: "bg-yellow-50 border-yellow-100",   iconColor: "text-yellow-600",  arrowBg: "bg-yellow-500" },
];

type FeaturedMember = { id: string; name: string; category: string; teaser: string | null; verified: boolean };
const ADMIN_WECHAT = "localsea_app";

export default function HomePage() {
  const { lang, toggle } = useLanguage();
  const t = T[lang];
  const [copied, setCopied] = useState(false);
  const [members, setMembers] = useState<FeaturedMember[]>([]);
  const zh = lang === "zh";

  useEffect(() => {
    // 优先取 featured=true 的成员，如果没有或列不存在则回退到全部 approved
    getPublicClient()
      .from("trustlink_profiles")
      .select("id, name, category, teaser, verified")
      .eq("approved", true)
      .eq("featured", true)
      .limit(8)
      .then(({ data: featured, error: featuredError }) => {
        if (!featuredError && featured && featured.length > 0) {
          setMembers(featured);
          return;
        }
        // 回退：featured 列不存在或没有标记成员，取全部 approved
        getPublicClient()
          .from("trustlink_profiles")
          .select("id, name, category, teaser, verified")
          .eq("approved", true)
          .limit(8)
          .then(({ data, error }) => {
            if (data) {
              setMembers(data);
            } else if (error) {
              getPublicClient()
                .from("trustlink_profiles")
                .select("id, name, category, teaser")
                .eq("approved", true)
                .limit(8)
                .then(({ data: d2 }) => {
                  if (d2) setMembers(d2.map(m => ({ ...m, verified: false })));
                });
            }
          });
      });
  }, []);

  const copyWeChat = useCallback(() => {
    navigator.clipboard.writeText(ADMIN_WECHAT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b px-4 py-3"
        style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-sm font-black" style={{ color: "var(--ink)" }}>{t.navBrand}</p>
            <p className="text-[10px] font-semibold tracking-wider" style={{ color: "var(--accent)" }}>{t.navSub}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/members" className="text-xs font-semibold" style={{ color: "var(--accent-text)" }}>成员目录</Link>
            <Link href="/my-profile" className="text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>{t.navEditProfile}</Link>
            <button onClick={toggle} className="flex items-center rounded-full p-0.5 text-xs font-semibold"
              style={{ background: "var(--surface-2)" }}>
              <span className={`px-3 py-1 rounded-full transition-colors ${lang === "zh" ? "shadow-sm" : ""}`}
                style={lang === "zh" ? { background: "var(--surface)", color: "var(--ink)" } : { color: "var(--muted)" }}>中文</span>
              <span className={`px-3 py-1 rounded-full transition-colors ${lang === "en" ? "shadow-sm" : ""}`}
                style={lang === "en" ? { background: "var(--surface)", color: "var(--ink)" } : { color: "var(--muted)" }}>EN</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b px-5 pt-8 pb-8" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <div className="max-w-lg mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border mb-5"
            style={{ background: "var(--accent-soft)", color: "var(--accent-text)", borderColor: "var(--accent-line)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
            {t.heroBadge}
          </span>
          <h1 className="text-[2rem] font-black leading-tight mb-3" style={{ color: "var(--ink)" }}>
            {t.heroHeadline1}<br />
            <span style={{ color: "var(--accent-text)" }}>{t.heroHeadline2}</span>
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--ink-soft)" }}>{t.heroDesc}</p>
          <button
            onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-2xl shadow-sm"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {t.heroCta}
          </button>
          <div className="flex flex-wrap gap-2 mt-5">
            {[t.trustBadge1, t.trustBadge2, t.trustBadge3].map(badge => (
              <span key={badge} className="text-xs px-3 py-1.5 rounded-full"
                style={{ color: "var(--ink-soft)", background: "var(--surface-2)" }}>{badge}</span>
            ))}
          </div>
        </div>
      </div>

      <div id="categories" className="max-w-lg mx-auto px-4 py-8 pb-28 space-y-8">

        {/* 精选成员 */}
        {members.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-1 rounded-full" style={{ background: "var(--accent)" }} />
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--muted)" }}>
                  {zh ? "精选成员" : "FEATURED MEMBERS"}
                </span>
              </div>
              <Link href="/members" className="text-xs font-semibold flex items-center gap-1"
                style={{ color: "var(--accent-text)" }}>
                {zh ? "查看全部" : "View all"} ›
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollSnapType: "x mandatory" }}>
              {members.map(m => {
                const meta = CATEGORY_META[m.category];
                const roleLabel = meta ? (zh ? meta.label : (meta.labelEn ?? meta.label)) : m.category;
                return (
                  <Link key={m.id} href={`/members/${m.id}`}
                    className="flex-shrink-0 w-36 rounded-2xl border p-4 flex flex-col transition-all hover:-translate-y-0.5"
                    style={{ scrollSnapAlign: "start", background: "var(--surface)", borderColor: "var(--line)", boxShadow: "var(--shadow)" }}
                  >
                    <div className={`tl-avatar w-12 h-12 text-lg font-semibold ${m.verified ? "verified" : ""}`}
                      style={{ fontSize: "18px" }}>
                      {initial(m.name)}
                      {m.verified && <span className="badge">✓</span>}
                    </div>
                    <p className="font-semibold text-sm mt-3 leading-tight" style={{ color: "var(--ink)" }}>{m.name}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{roleLabel}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: "var(--accent-text)" }}>
                      <span>🔓</span>
                      <span>{zh ? "解锁 · 直联" : "Unlock"}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 我在寻找 */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>{t.needSection}</span>
            <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
          </div>
          <div className="space-y-2">
            {NEED_CATEGORIES.map(cat => {
              const label = zh ? cat.zh : cat.en;
              const chips = (zh ? cat.desc_zh : cat.desc_en).split("·").map(s => s.trim()).filter(Boolean);
              const groupLabel = zh ? cat.groupZh : cat.groupEn;
              return (
                <Fragment key={cat.key}>
                  {groupLabel && (
                    <div className="flex items-center gap-2 pt-3 pb-1">
                      <span className="text-[11px] font-semibold whitespace-nowrap" style={{ color: "var(--muted)" }}>{groupLabel}</span>
                      <div className="flex-1 h-px" style={{ background: "var(--line-2)" }} />
                    </div>
                  )}
                  <Link href={`/intake/${cat.key}`}
                    className={`flex items-center gap-4 rounded-2xl border px-4 py-4 transition-all hover:-translate-y-0.5 ${cat.color}`}
                    style={{ boxShadow: "var(--shadow)" }}
                  >
                    <div className={`cat-icon flex-shrink-0 ${cat.iconColor}`}>{CAT_ICONS[cat.iconKey]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm mb-1.5" style={{ color: "var(--ink)" }}>{label}</p>
                      <div className="flex flex-wrap gap-1">
                        {chips.map(chip => (
                          <span key={chip} className="text-xs px-2 py-0.5 rounded-full border"
                            style={{ color: "var(--accent-text)", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }}>
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={`w-7 h-7 ${cat.arrowBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">›</span>
                    </div>
                  </Link>
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* 我能提供 */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>{t.offerSection}</span>
            <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {OFFER_CATEGORIES.map(cat => {
              const label = zh ? cat.zh : cat.en;
              const chips = (zh ? cat.desc_zh : cat.desc_en).split("·").map(s => s.trim()).filter(Boolean);
              return (
                <Link key={cat.key} href={`/intake/${cat.key}`}
                  className={`rounded-2xl border p-4 transition-all hover:-translate-y-0.5 flex flex-col gap-2.5 ${cat.color}`}
                  style={{ boxShadow: "var(--shadow)" }}
                >
                  <div className="flex items-start justify-between">
                    <div className={`cat-icon ${cat.iconColor}`}>{CAT_ICONS[cat.iconKey]}</div>
                    <div className={`w-7 h-7 ${cat.arrowBg} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">›</span>
                    </div>
                  </div>
                  <p className="font-bold text-sm leading-tight" style={{ color: "var(--ink)" }}>{label}</p>
                  <div className="flex flex-wrap gap-1">
                    {chips.slice(0, 3).map(chip => (
                      <span key={chip} className="text-[10px] px-2 py-0.5 rounded-full border"
                        style={{ color: "var(--accent-text)", borderColor: "var(--accent-line)", background: "var(--accent-soft)" }}>
                        {chip}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* WeChat card */}
        <div className="rounded-3xl p-6" style={{ background: "var(--primary)" }}>
          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "var(--accent)" }}>{t.contactCardReach}</p>
          <p className="text-xl font-bold text-white mb-5">{t.contactCardTitle}</p>
          <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💬</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{t.wechatContactLabel}</p>
              <p className="font-bold text-white text-base">{ADMIN_WECHAT}</p>
            </div>
            <button onClick={copyWeChat}
              className="font-semibold text-sm px-4 py-2 rounded-xl flex-shrink-0"
              style={{ background: "var(--surface)", color: "var(--ink)" }}>
              {copied ? t.copiedBtn : t.copyBtn}
            </button>
          </div>
        </div>

        <p className="text-center text-xs pb-4" style={{ color: "var(--muted)" }}>{t.footer}</p>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center p-3"
        style={{ backdropFilter: "blur(10px)", borderTop: "1px solid var(--line)" }}>
        <div className="w-full max-w-lg flex items-center gap-3">
          <button
            onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm shadow-lg"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {t.bottomBarCta}
          </button>
          <button onClick={copyWeChat}
            className="w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center text-2xl flex-shrink-0 border"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            💬
          </button>
        </div>
      </div>
    </div>
  );
}
