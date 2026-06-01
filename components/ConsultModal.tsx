"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: "zh" | "en";
}

export default function ConsultModal({ isOpen, onClose, lang }: Props) {
  const [name, setName]       = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  if (!isOpen) return null;

  const zh = lang === "zh";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact) return;
    setSubmitting(true);
    try {
      await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "general", name, wechat: contact, message, lang }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg pb-10 animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {submitted ? (
          <div className="text-center px-6 py-8">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-bold text-gray-900 text-lg mb-2">
              {zh ? "已收到您的咨询" : "Request received!"}
            </p>
            <p className="text-sm text-gray-500">
              {zh ? "我们将在24小时内通过微信联系您" : "We'll reach out within 24 hours."}
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-sm text-teal-600 font-medium"
            >
              {zh ? "关闭" : "Close"}
            </button>
          </div>
        ) : (
          <div className="px-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                💬
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 text-lg">
                  {zh ? "免费咨询" : "Free Consultation"}
                </h2>
                <p className="text-sm text-gray-400">
                  {zh ? "24小时内回复 · 本地华人团队" : "Reply within 24hrs · Bilingual team"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {zh ? "您的称呼" : "Your name"}
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={zh ? "怎么称呼您？" : "Your name"}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-teal-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Contact */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {zh ? "微信 / 电话" : "WeChat / Phone"}{" "}
                  <span className="text-orange-500">*</span>
                </label>
                <input
                  required
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder={zh ? "微信号或手机号" : "WeChat ID or phone number"}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-teal-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  {zh ? "需要什么帮助？" : "How can we help?"}
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={zh ? "简单描述一下您的需求…" : "Briefly describe your needs…"}
                  rows={3}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:border-teal-400 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1b3a6b] hover:bg-[#152d55] text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                <span>💬</span>
                {submitting
                  ? (zh ? "提交中..." : "Submitting...")
                  : (zh ? "提交咨询" : "Submit")}
              </button>

              <p className="text-center text-xs text-gray-400">
                {zh ? "提交即表示同意 · 信息仅用于服务匹配" : "By submitting you agree · Info used for matching only"}
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
