"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { FormConfig } from "@/lib/forms-config";
import { useLanguage } from "./LanguageProvider";
import { T } from "@/lib/translations";

export default function DynamicIntakeForm({ config }: { config: FormConfig }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { lang } = useLanguage();
  const t = T[lang];
  const L = (zh: string, en?: string) => lang === "en" && en ? en : zh;

  // Common fields
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [wechat, setWechat] = useState("");
  const [email, setEmail] = useState("");

  // Category-specific field values
  const [fields, setFields] = useState<Record<string, string>>({});

  // Multi-select chips (e.g. interests, cuisine)
  const [multiChips, setMultiChips] = useState<Record<string, string[]>>({});

  // File upload
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [uploadWarning, setUploadWarning] = useState("");

  // Form state
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function setField(key: string, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function toggleChip(key: string, value: string) {
    setMultiChips((prev) => {
      const current = prev[key] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "video/mp4", "video/quicktime"];
    if (file.size > MAX_SIZE) { setUploadWarning("文件不能超过 10MB"); return; }
    if (!ALLOWED.includes(file.type)) { setUploadWarning("只支持图片或视频文件"); return; }
    setUploading(true);
    setUploadWarning("");
    try {
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const { signedUrl, publicUrl, error: urlError } = await res.json();
      if (!res.ok || urlError) throw new Error(urlError || "Failed to get upload URL");
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
      setPhotoUrl(publicUrl);
      setPhotoName(file.name);
    } catch (err: unknown) {
      console.error(err);
      setUploadWarning("上传失败，可跳过继续提交（微信联系后补发）");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError(t.errorEmail); return; }
    // Check required fields
    for (const f of config.fields) {
      if (f.required) {
        const isMultiChip = f.type === "chips" && f.multi === true;
        const val = isMultiChip
          ? (multiChips[f.key] || []).join(",")
          : fields[f.key] || "";
        if (!val) { setError(t.errorRequired); return; }
      }
    }
    setSubmitting(true);
    try {
      // Build extraData: merge fields + multiChips
      const extraData: Record<string, string> = { ...fields };
      for (const [k, v] of Object.entries(multiChips)) {
        if (v.length > 0) extraData[k] = v.join("、");
      }
      const description = fields["description"] || "";
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: config.category,
          name,
          wechat,
          phone,
          email,
          city,
          description,
          photoUrl,
          extraData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "提交失败");
      router.push(`/thank-you?category=${encodeURIComponent(config.category)}&wechat=${encodeURIComponent(wechat)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Common: contact fields */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">{t.contactSection}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.emailLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {L("手机号（选填）", "Phone (optional)")}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={L("+1 (206) 555-0123", "+1 (206) 555-0123")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.wechatLabel}</label>
            <input
              type="text"
              value={wechat}
              onChange={(e) => setWechat(e.target.value)}
              placeholder={t.wechatPlaceholder}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {L("所在城市 / 地区", "City / Location")} <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 w-full">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "remote",        label: L("远程 / 不限", "Remote / Anywhere") },
                  { value: "seattle",       label: L("西雅图", "Seattle") },
                  { value: "new-york",      label: L("纽约", "New York") },
                  { value: "san-francisco", label: L("旧金山", "San Francisco") },
                  { value: "los-angeles",   label: L("洛杉矶", "Los Angeles") },
                  { value: "other-us",      label: L("其他美国", "Other US") },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setCity(opt.value)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${city === opt.value ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "beijing",     label: L("北京", "Beijing") },
                  { value: "shanghai",    label: L("上海", "Shanghai") },
                  { value: "guangzhou",   label: L("广州", "Guangzhou") },
                  { value: "shenzhen",    label: L("深圳", "Shenzhen") },
                  { value: "other-china", label: L("其他中国", "Other China") },
                  { value: "other",       label: L("其他国家", "Other Country") },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setCity(opt.value)}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${city === opt.value ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category-specific fields */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        <h3 className="font-semibold text-gray-800">{t.detailSection}</h3>
        {config.fields.filter(f => !["name","wechat","email","city"].includes(f.key)).map((field) => {
          const fieldLabel = L(field.label, field.labelEn);
          const fieldPlaceholder = L(field.placeholder || "", field.placeholderEn);

          if (field.type === "divider") {
            return (
              <div key={field.key} className="flex items-center gap-3 pt-2">
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{fieldLabel}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            );
          }

          if (field.type === "text" || field.type === "email") {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fieldLabel}{field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={field.type}
                  value={fields[field.key] || ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={fieldPlaceholder}
                  maxLength={field.maxLength}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fieldLabel}{field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  value={fields[field.key] || ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={fieldPlaceholder}
                  rows={field.rows || 4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {fieldLabel}{field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  value={fields[field.key] || ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {L(opt.label, opt.labelEn)}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === "radio") {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {fieldLabel}{field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="space-y-2">
                  {field.options?.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={field.key}
                        value={opt.value}
                        checked={fields[field.key] === opt.value}
                        onChange={(e) => setField(field.key, e.target.value)}
                        className="accent-teal-600"
                      />
                      <span className="text-sm text-gray-700">{L(opt.label, opt.labelEn)}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (field.type === "chips") {
            const selected = multiChips[field.key] || [];
            const isMulti = field.multi === true;
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {fieldLabel}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {isMulti && <span className="text-xs text-gray-400 ml-1">{t.multiSelect}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {field.options?.map((opt) => {
                    const active = isMulti
                      ? selected.includes(opt.value)
                      : fields[field.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          if (isMulti) toggleChip(field.key, opt.value);
                          else setField(field.key, opt.value);
                        }}
                        className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                          active
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-teal-400"
                        }`}
                      >
                        {L(opt.label, opt.labelEn)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (field.type === "file") {
            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{fieldLabel}</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-teal-400 transition-colors"
                >
                  {uploading ? (
                    <p className="text-sm text-teal-600">{L("上传中...", "Uploading...")}</p>
                  ) : photoName ? (
                    <p className="text-sm text-teal-700">✓ {photoName}</p>
                  ) : (
                    <p className="text-sm text-gray-400">{L("点击选择文件（照片/视频）", "Click to select a file (photo/video)")}</p>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/mp4,video/quicktime"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {uploadWarning && <p className="text-xs text-amber-600 mt-1">{uploadWarning}</p>}
              </div>
            );
          }

          return null;
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting
          ? t.submitting
          : L(config.submitLabel, config.submitLabelEn) + t.suffix}
      </button>

      <p className="text-center text-xs text-gray-400">{t.formFooter}</p>
    </form>
  );
}
