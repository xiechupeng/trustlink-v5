# 部署步骤

## 1. Supabase 设置（5 分钟）

1. 进入你的 Supabase 项目 Dashboard
2. SQL Editor → 运行 `supabase-setup.sql` 里的内容
3. Storage → New Bucket：
   - Name: `seagull-leads`
   - Public: **Yes**
   - Max file size: 10MB
4. 复制以下 keys：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Resend 设置（10 分钟）

1. 注册 https://resend.com（免费，3000封/月）
2. Dashboard → API Keys → Create API Key → 复制
3. Domains → Add Domain（填你的域名，如 seagullseattle.com）
   - 添加 DNS 记录（Resend 会告诉你加什么）
   - 验证通过后，FROM_EMAIL 可以用 `noreply@seagullseattle.com`
   - 如果暂时没有域名验证，FROM_EMAIL 填 `onboarding@resend.dev`（测试用）

## 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，填写真实值：

```bash
cp .env.local.example .env.local
```

## 4. 本地运行测试

```bash
npm run dev
```

打开 http://localhost:3000

## 5. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 绑定域名后，在 Vercel Dashboard > Settings > Environment Variables
# 添加所有 .env.local 里的变量
```

## 6. 绑定域名

在 Vercel Dashboard → 你的项目 → Settings → Domains → 添加域名

在域名注册商（如 GoDaddy / Namecheap / Cloudflare）设置 DNS：
- CNAME: `www` → `cname.vercel-dns.com`
- A: `@` → `76.76.21.21`（Vercel IP）

---

## 查看客户提交的数据

Supabase Dashboard → Table Editor → seagull_leads

字段含义：
- `status`: new（新提交）→ contacted（已联系）→ matched（已推荐服务商）→ completed（完成）
- `urgency`: emergency（今天）/ 3days（3天内）/ week（一周内）/ flexible（不急）
- `service`: match / quote-review / concierge / membership
