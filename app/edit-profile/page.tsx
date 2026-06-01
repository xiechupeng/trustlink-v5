"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FORMS } from "@/lib/forms-config";

const CONTACT_KEYS = new Set(["name", "wechat", "email"]);

type Profile = {
  id: string;
  category: string;
  name: string;
  wechat: string;
  data: Record<string, string> | null;
};

function EditProfileForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "saved">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  // Editable fields state
  const [name, setName] = useState("");
  const [wechat, setWechat] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [multiChips, setMultiChips] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!token) { setErrorMsg("缺少编辑 token，请重新申请编辑链接。"); setStatus("error"); return; }
    fetch(`/api/edit-profile?token=${token}`)
      .then(r => r.json())
      .then(({ profile: p, error }) => {
        if (error || !p) { setErrorMsg(error || "链接无效或已过期"); setStatus("error"); return; }
        setProfile(p);
        setName(p.name || "");
        setWechat(p.wechat || "");
        // Pre-fill fields from stored data
        const stored: Record<string, string> = p.data || {};
        const initFields: Record<string, string> = {};
        const initChips: Record<string, string[]> = {};
        const formConfig = FORMS[p.category];
        if (formConfig) {
          for (const f of formConfig.fields) {
            if (CONTACT_KEYS.has(f.key)) continue;
            const val = stored[f.key];
            if (!val) continue;
            if (f.type === "chips" && f.multi) {
              // Could be stored as "a、b、c" or JSON array
              try {
                const arr = JSON.parse(val);
                if (Array.isArray(arr)) { initChips[f.key] = arr; continue; }
              } catch { /* ignore */ }
              initChips[f.key] = val.split(/[、,]/).map(s => s.trim()).filter(Boolean);
            } else {
              initFields[f.key] = val;
            }
          }
        }
        setFields(initFields);
        setMultiChips(initChips);
        setStatus("ready");
      })
      .catch(() => { setErrorMsg("网络错误，请刷新重试"); setStatus("error"); });
  }, [token]);

  function setField(key: string, value: string) {
    setFields(f => ({ ...f, [key]: value }));
  }

  function toggleChip(key: string, value: string) {
    setMultiChips(prev => {
      const cur = prev[key] || [];
      const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
      return { ...prev, [key]: next };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wechat.trim()) { setSubmitError("微信号不能为空"); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      // Merge fields + multiChips back into data
      const data: Record<string, string> = { ...fields };
      for (const [k, v] of Object.entries(multiChips)) {
        if (v.length > 0) data[k] = JSON.stringify(v);
      }
      const res = await fetch("/api/edit-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, wechat, data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "保存失败");
      setStatus("saved");
      setTimeout(() => router.push("/"), 2500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400 text-sm">验证链接中...</p>
    </div>
  );

  if (status === "error") return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
      <div className="text-4xl mb-3">🔗</div>
      <h2 className="font-black text-gray-900 mb-2">链接已失效</h2>
      <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
      <Link href="/my-profile"
        className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
        style={{ background: "#1b3a6b" }}
      >
        重新申请编辑链接
      </Link>
    </div>
  );

  if (status === "saved") return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
      <div className="text-5xl mb-3">✅</div>
      <h2 className="font-black text-gray-900 mb-2">Profile 已更新</h2>
      <p className="text-sm text-gray-500">正在跳转回首页...</p>
    </div>
  );

  const formConfig = FORMS[profile!.category];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Contact fields */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800">联系方式</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="你的姓名"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">微信号 <span className="text-red-500">*</span></label>
            <input type="text" value={wechat} onChange={e => setWechat(e.target.value)}
              placeholder="微信号" required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
      </div>

      {/* Category-specific fields */}
      {formConfig && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-gray-800">Profile 详情</h3>
          {formConfig.fields
            .filter(f => !CONTACT_KEYS.has(f.key) && f.type !== "divider" && f.type !== "file")
            .map(field => {
              if (field.type === "text") return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input type="text" value={fields[field.key] || ""}
                    onChange={e => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              );

              if (field.type === "textarea") return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea value={fields[field.key] || ""}
                    onChange={e => setField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>
              );

              if (field.type === "radio") return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {field.options?.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setField(field.key, opt.value)}
                        className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                          fields[field.key] === opt.value
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                        }`}
                      >{opt.label}</button>
                    ))}
                  </div>
                </div>
              );

              if (field.type === "chips") {
                const isMulti = field.multi === true;
                const selected = multiChips[field.key] || [];
                return (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                      {isMulti && <span className="text-xs text-gray-400 ml-1">（可多选）</span>}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {field.options?.map(opt => {
                        const active = isMulti ? selected.includes(opt.value) : fields[field.key] === opt.value;
                        return (
                          <button key={opt.value} type="button"
                            onClick={() => isMulti ? toggleChip(field.key, opt.value) : setField(field.key, opt.value)}
                            className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                              active ? "bg-blue-600 text-white border-blue-600"
                                     : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                            }`}
                          >{opt.label}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return null;
            })}
        </div>
      )}

      {submitError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{submitError}</p>
      )}

      <button type="submit" disabled={submitting}
        className="w-full py-4 rounded-2xl font-bold text-white text-sm shadow-lg disabled:opacity-60"
        style={{ background: "#1b3a6b" }}
      >
        {submitting ? "保存中..." : "✅ 保存更新"}
      </button>
      <p className="text-center text-xs text-gray-400">保存后编辑链接立即失效</p>
    </form>
  );
}

export default function EditProfilePage() {
  return (
    <div className="min-h-screen" style={{ background: "#f5f4f0" }}>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-black text-gray-900">TrustLink</Link>
          <span className="text-xs text-gray-400">编辑 Profile</span>
        </div>
      </nav>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-black text-gray-900">编辑我的 Profile</h1>
        <Suspense fallback={<p className="text-gray-400 text-sm py-10 text-center">加载中...</p>}>
          <EditProfileForm />
        </Suspense>
      </div>
    </div>
  );
}
