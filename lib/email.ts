import { Resend } from "resend";
import { FORMS } from "./forms-config";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.FROM_EMAIL || "onboarding@resend.dev";
const OWNER = process.env.OWNER_EMAIL!;

// ── 编辑 Profile 链接 ─────────────────────────────────────
export async function sendTrustLinkEditLink({
  email, name, editUrl,
}: { email: string; name: string; editUrl: string }) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "TrustLink — 编辑你的 Profile",
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#1c2230">
        <h2 style="color:#b0863c">TrustLink · 价值互联</h2>
        <p>你好${name ? ` ${name}` : ""}，</p>
        <p>点击下方按钮编辑你的 Profile。链接 <strong>24 小时内有效</strong>，且只能使用一次。</p>
        <div style="margin:32px 0">
          <a href="${editUrl}"
            style="background:#1c2230;color:#faf8f2;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:bold;display:inline-block">
            ✏️ 编辑我的 Profile
          </a>
        </div>
        <p style="color:#8d8979;font-size:13px">如果你没有发起此请求，请忽略此邮件。</p>
        <p style="color:#8d8979;font-size:13px">链接：${editUrl}</p>
        <hr style="border:none;border-top:1px solid #ede8dd;margin:24px 0"/>
        <p style="color:#b0863c;font-size:12px">TrustLink · 价值互联 · trustlink-v3.vercel.app</p>
      </div>
    `,
  });
}

export interface SubmissionData {
  category: string;
  name?: string;
  wechat?: string;
  phone?: string;
  email?: string;
  city?: string;
  description?: string;
  photoUrl?: string;
  extraData: Record<string, string>;
}

function categoryLabel(category: string, lang: "zh" | "en" = "zh") {
  const labels: Record<string, { zh: string; en: string }> = {
    investor:               { zh: "寻找投资人",            en: "Looking for Investors" },
    cofounder:              { zh: "寻找合伙人",            en: "Looking for Co-founders" },
    "professional-services":{ zh: "寻找专业服务",          en: "Professional Services" },
    "brand-creator":        { zh: "招募创作者 / 网红",     en: "Looking for Creators" },
    "talent-search":        { zh: "寻找人才 / 顾问",       en: "Talent Search" },
    "product-trial":        { zh: "招募产品试用者",         en: "Looking for Product Testers" },
    "offer-investor":       { zh: "我是投资人",            en: "Investor Profile" },
    "offer-cofounder":      { zh: "我想当合伙人",          en: "Co-founder Profile" },
    "offer-expert":         { zh: "我提供专业服务",        en: "Professional Services Profile" },
    "offer-creator":        { zh: "我是创作者 / 网红",     en: "Creator Profile" },
    "offer-talent":         { zh: "我是求职者 / 顾问",     en: "Job Seeker / Consultant Profile" },
    "offer-tester":         { zh: "我愿意试用产品",        en: "Product Tester Profile" },
  };
  return labels[category]?.[lang] ?? category;
}

function contactRow(label: string, value?: string) {
  if (!value) return "";
  return `<tr>
    <td style="padding:8px 12px;background:#f4f1ea;font-weight:600;white-space:nowrap;color:#4a505d;font-size:13px">${label}</td>
    <td style="padding:8px 12px;font-size:13px">${value}</td>
  </tr>`;
}

function extraRows(category: string, extraData: Record<string, string>) {
  const config = FORMS[category];
  if (!config) return "";
  return config.fields
    .filter(f => !["name","wechat","email","city","photo"].includes(f.key))
    .map(f => {
      const v = extraData[f.key];
      if (!v) return "";
      return `<tr>
        <td style="padding:8px 12px;background:#f4f1ea;font-weight:600;white-space:nowrap;color:#4a505d;font-size:13px">${f.label}</td>
        <td style="padding:8px 12px;font-size:13px">${v}</td>
      </tr>`;
    }).join("");
}

// ── 给你（平台方）的通知 ──────────────────────────────────
export async function sendOwnerNotification(data: SubmissionData) {
  const cat = categoryLabel(data.category);
  await getResend().emails.send({
    from: FROM,
    to: OWNER,
    subject: `【TrustLink】新 Profile · ${cat} · ${data.name || data.email || "匿名"}`,
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;color:#1c2230">
        <h2 style="color:#b0863c;margin-bottom:4px">TrustLink · 新 Profile 提交</h2>
        <p style="color:#8d8979;font-size:13px;margin-top:0">类别：${cat}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          ${contactRow("姓名", data.name)}
          ${contactRow("Email", data.email)}
          ${contactRow("手机", data.phone)}
          ${contactRow("微信", data.wechat)}
          ${contactRow("城市", data.city)}
          ${extraRows(data.category, data.extraData)}
          ${data.description ? contactRow("描述", data.description) : ""}
          ${data.photoUrl ? `<tr><td style="padding:8px 12px;background:#f4f1ea;font-weight:600;color:#4a505d;font-size:13px">附件</td><td style="padding:8px 12px;font-size:13px"><a href="${data.photoUrl}" style="color:#b0863c">查看附件</a></td></tr>` : ""}
        </table>
        <p style="margin-top:20px;color:#8d8979;font-size:13px">审核后在 Supabase 将 <code>approved</code> 改为 <code>true</code> 即可上线。</p>
        <hr style="border:none;border-top:1px solid #ede8dd;margin:24px 0"/>
        <p style="color:#b0863c;font-size:12px">TrustLink · 价值互联</p>
      </div>
    `,
  });
}

// ── 给用户的确认邮件 ──────────────────────────────────────
export async function sendClientConfirmation(data: SubmissionData) {
  if (!data.email) return;
  const cat = categoryLabel(data.category);
  await getResend().emails.send({
    from: FROM,
    to: data.email,
    subject: `TrustLink — 你的 Profile 已提交 · ${cat}`,
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#1c2230">
        <h2 style="color:#b0863c">TrustLink · 价值互联</h2>
        <p>你好${data.name ? ` ${data.name}` : ""}，</p>
        <p>我们已收到你的 <strong>${cat}</strong> Profile，正在审核中。</p>
        <p>审核通过后你将出现在成员目录，系统会为你匹配合适的对象并通过邮件通知你。</p>
        <div style="background:#f4f1ea;border-radius:12px;padding:20px;margin:24px 0">
          <p style="margin:0 0 8px;font-size:13px;color:#4a505d;font-weight:600">接下来</p>
          <ol style="margin:0;padding-left:20px;color:#4a505d;font-size:14px;line-height:2">
            <li>等待审核（通常 24 小时内）</li>
            <li>审核通过后加入成员目录</li>
            <li>系统匹配到合适的人会通过此邮件通知你</li>
          </ol>
        </div>
        <p style="color:#8d8979;font-size:13px">有问题？加管理员微信：<strong>${process.env.ADMIN_WECHAT || "localsea_app"}</strong>，备注「TrustLink」</p>
        <hr style="border:none;border-top:1px solid #ede8dd;margin:24px 0"/>
        <p style="color:#b0863c;font-size:12px">TrustLink · 价值互联 · trustlink-v3.vercel.app</p>
      </div>
    `,
  });
}

// ── AI 匹配通知（双方各收一封）────────────────────────────
export async function sendMatchNotification({
  toEmail, toName,
  matchName, matchCategory, matchDesc,
  matchEmail, matchPhone, matchWechat,
}: {
  toEmail: string; toName?: string;
  matchName: string; matchCategory: string; matchDesc?: string;
  matchEmail?: string; matchPhone?: string; matchWechat?: string;
}) {
  const catLabel = categoryLabel(matchCategory);
  const contacts = [
    matchEmail  ? `📧 Email：${matchEmail}` : "",
    matchPhone  ? `📱 手机：${matchPhone}` : "",
    matchWechat ? `💬 微信：${matchWechat}` : "",
  ].filter(Boolean).join("<br/>");

  await getResend().emails.send({
    from: FROM,
    to: toEmail,
    subject: `TrustLink 为你找到了匹配 · ${matchName}`,
    html: `
      <div style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#1c2230">
        <h2 style="color:#b0863c">TrustLink · 找到匹配了！</h2>
        <p>你好${toName ? ` ${toName}` : ""}，</p>
        <p>TrustLink 为你找到了一位匹配成员：</p>
        <div style="background:#f4f1ea;border-radius:12px;padding:20px;margin:24px 0">
          <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#1c2230">${matchName}</p>
          <p style="margin:0 0 12px;font-size:13px;color:#8d8979">${catLabel}</p>
          ${matchDesc ? `<p style="margin:0 0 16px;font-size:14px;color:#4a505d">${matchDesc}</p>` : ""}
          <div style="border-top:1px solid #ede8dd;padding-top:12px;font-size:14px;line-height:2">
            ${contacts}
          </div>
        </div>
        <p style="font-size:14px;color:#4a505d">请主动联系，并备注 <strong>TrustLink</strong>。</p>
        <hr style="border:none;border-top:1px solid #ede8dd;margin:24px 0"/>
        <p style="color:#b0863c;font-size:12px">TrustLink · 价值互联 · trustlink-v3.vercel.app</p>
      </div>
    `,
  });
}
