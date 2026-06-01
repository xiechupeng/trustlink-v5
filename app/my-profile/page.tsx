"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_META } from "@/lib/forms-config";

type ProfileResult = { id: string; category: string; name: string; editUrl: string };

export default function MyProfilePage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<ProfileResult[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("请填写邮箱"); return; }
    setError("");
    setProfiles(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/request-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "请求失败");
      setProfiles(data.profiles ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "请求失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  function copyLink(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const notFound = profiles !== null && profiles.length === 0;
  const found    = profiles !== null && profiles.length > 0;

  return (
    <div className="min-h-screen" style={{ background: "#f5f4f0" }}>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-black text-gray-900">TrustLink</Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← 返回首页</Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">更新我的 Profile</h1>
          <p className="text-sm text-gray-500">输入注册时填写的邮箱，获取编辑链接</p>
        </div>

        {/* ── 找到 profile(s) ── */}
        {found && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              找到 {profiles!.length} 个 Profile，选择要编辑的：
            </p>
            {profiles!.map(p => {
              const meta = CATEGORY_META[p.category];
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta?.emoji ?? "👤"}</span>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400">{meta?.label ?? p.category}</p>
                    </div>
                  </div>
                  <a href={p.editUrl}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white text-sm"
                    style={{ background: "#1b3a6b" }}
                  >
                    ✏️ 编辑此 Profile
                  </a>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-400 flex-1 truncate font-mono">{p.editUrl}</span>
                    <button onClick={() => copyLink(p.editUrl, p.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex-shrink-0"
                    >
                      {copied === p.id ? "已复制 ✓" : "复制"}
                    </button>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
              ⚠️ 每个链接 24 小时内有效，使用一次后失效，请勿转发
            </p>
            <button onClick={() => { setProfiles(null); setEmail(""); }}
              className="w-full text-xs text-gray-400 py-2"
            >
              换一个邮箱重新查询
            </button>
          </div>
        )}

        {/* ── 未找到 ── */}
        {notFound && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-sm font-semibold text-amber-800 mb-1">未找到对应 Profile</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              该邮箱暂无匹配记录。可能当时未填写邮箱，或邮箱地址不同。<br />
              请微信联系管理员 <span className="font-mono font-bold">localsea_app</span>，备注「更新 Profile」。
            </p>
          </div>
        )}

        {/* ── 输入表单 ── */}
        {profiles === null && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-60"
              style={{ background: "#1b3a6b" }}
            >
              {submitting ? "查询中..." : "🔍 获取编辑链接"}
            </button>
          </form>
        )}

        {/* 没有邮箱提示 */}
        {profiles === null && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>当时没有填写邮箱？</strong><br />
              请微信联系管理员 <span className="font-mono font-semibold text-gray-700">localsea_app</span>，备注「更新 Profile」。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
