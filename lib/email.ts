import { Resend } from "resend";
import { FORMS } from "./forms-config";

// ── TrustLink: 发送 profile 编辑链接 ───────────────────────
export async function sendTrustLinkEditLink({
  email, name, editUrl,
}: { email: string; name: string; editUrl: string }) {
  await getResend().emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to: email,
    subject: "TrustLink — 编辑你的 Profile",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="color:#1b3a6b">TrustLink — 编辑你的 Profile</h2>
        <p>你好${name ? ` ${name}` : ""}，</p>
        <p>点击下方按钮编辑你的 Profile。链接 <strong>24 小时内有效</strong>，且只能使用一次。</p>
        <div style="margin:32px 0">
          <a href="${editUrl}"
            style="background:#1b3a6b;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;display:inline-block">
            ✏️ 编辑我的 Profile
          </a>
        </div>
        <p style="color:#888;font-size:13px">如果你没有发起此请求，请忽略此邮件。</p>
        <p style="color:#888;font-size:13px">链接：${editUrl}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#aaa;font-size:12px">TrustLink · 价值互联</p>
      </div>
    `,
  });
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface SubmissionData {
  category: string;
  name?: string;
  wechat: string;
  email?: string;
  description?: string;
  photoUrl?: string;
  extraData: Record<string, string>;
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    repair: "家修服务",
    travel: "旅游咨询",
    restaurant: "餐厅推荐",
  };
  return labels[category] || category;
}

function renderExtraDataRows(category: string, extraData: Record<string, string>) {
  const config = FORMS[category];
  if (!config) return "";
  return config.fields
    .filter((f) => f.key !== "description" && f.key !== "photo")
    .map((field) => {
      const value = extraData[field.key];
      if (!value) return "";
      return `<tr>
        <td style="padding:8px;background:#f5f5f5;font-weight:bold;white-space:nowrap">${field.label}</td>
        <td style="padding:8px">${value}</td>
      </tr>`;
    })
    .join("");
}

export async function sendOwnerNotification(data: SubmissionData) {
  const catLabel = categoryLabel(data.category);
  await getResend().emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to: process.env.OWNER_EMAIL!,
    subject: `【${catLabel}】新询盘 - 微信 ${data.wechat}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0d6e6e">海鸥西雅图 — 新询盘【${catLabel}】</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">业务类型</td><td style="padding:8px"><strong>${catLabel}</strong></td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">微信</td><td style="padding:8px">${data.wechat}</td></tr>
          ${data.name ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">姓名</td><td style="padding:8px">${data.name}</td></tr>` : ""}
          ${data.email ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">邮箱</td><td style="padding:8px">${data.email}</td></tr>` : ""}
          ${renderExtraDataRows(data.category, data.extraData)}
          ${data.description ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">详细描述</td><td style="padding:8px">${data.description}</td></tr>` : ""}
          ${data.photoUrl ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">附件</td><td style="padding:8px"><a href="${data.photoUrl}">查看附件</a></td></tr>` : ""}
        </table>
        <p style="margin-top:20px;color:#666">请在24小时内通过微信联系客户。</p>
      </div>
    `,
  });
}

export async function sendClientConfirmation(data: SubmissionData) {
  if (!data.email) return;
  const catLabel = categoryLabel(data.category);
  await getResend().emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to: data.email,
    subject: `海鸥西雅图 — 已收到您的${catLabel}需求`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#0d6e6e">感谢您的咨询！</h2>
        <p>您好${data.name ? ` ${data.name}` : ""}，我们已收到您的 <strong>${catLabel}</strong> 需求。</p>
        <p>我们将在 <strong>24小时内</strong> 通过微信（${data.wechat}）联系您。</p>
        <p style="color:#666;font-size:14px">如有紧急情况，请直接添加微信：<strong>${process.env.OWNER_WECHAT || "a15165389217"}</strong></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#999;font-size:12px">海鸥西雅图 Seagull Seattle · 西雅图华人本地生活服务</p>
      </div>
    `,
  });
}
