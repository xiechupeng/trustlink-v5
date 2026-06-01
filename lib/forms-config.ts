export type FieldType = "text" | "email" | "textarea" | "select" | "radio" | "chips" | "file" | "divider";

export interface FieldOption { value: string; label: string; labelEn?: string; }
export interface FieldDef {
  key: string; label: string; labelEn?: string; type: FieldType;
  required?: boolean; placeholder?: string; placeholderEn?: string;
  options?: FieldOption[]; maxLength?: number; rows?: number; multi?: boolean;
}
export interface FormConfig {
  category: string; emoji: string;
  title: string; titleEn?: string;
  subtitle: string; subtitleEn?: string;
  submitLabel: string; submitLabelEn?: string;
  fields: FieldDef[];
  trialFee?: string; originalFee?: string;
}

const contactFields: FieldDef[] = [
  { key: "name",   label: "姓名",          labelEn: "Name",              type: "text",  required: true, placeholder: "您的姓名",   placeholderEn: "Your name" },

  { key: "email",  label: "邮箱",          labelEn: "Email",             type: "email", required: true, placeholder: "your@email.com", placeholderEn: "your@email.com" },
  { key: "wechat", label: "微信号（选填）", labelEn: "WeChat ID (optional)", type: "text", placeholder: "微信号", placeholderEn: "WeChat ID" },
];

export const FORMS: Record<string, FormConfig> = {

  investor: {
    category: "investor", emoji: "💰",
    title: "寻找投资人", titleEn: "Looking for Investors",
    subtitle: "发布你的项目，匹配合适的投资人", subtitleEn: "Post your project and get matched with investors",
    submitLabel: "发布需求", submitLabelEn: "Post Request",
    fields: [
      { key: "project", label: "项目 / 公司名称", labelEn: "Project / Company", type: "text", required: true, placeholder: "项目名称", placeholderEn: "Project name" },
      { key: "industry", label: "行业 / 领域", labelEn: "Industry", type: "text", required: true, placeholder: "例：AI、医疗、消费品", placeholderEn: "e.g. AI, Healthcare, Consumer" },
      { key: "stage", label: "融资阶段", labelEn: "Stage", type: "radio", required: true,
        options: [
          { value: "pre-seed", label: "Pre-seed", labelEn: "Pre-seed" },
          { value: "seed", label: "种子轮", labelEn: "Seed" },
          { value: "series-a", label: "A 轮", labelEn: "Series A" },
          { value: "other", label: "其他", labelEn: "Other" },
        ]},
      { key: "desc", label: "项目简介", labelEn: "Project Brief", type: "textarea", required: true, rows: 4, placeholder: "一句话介绍你的项目和进展", placeholderEn: "One-paragraph pitch" },
      ...contactFields,
    ],
  },

  cofounder: {
    category: "cofounder", emoji: "🤝",
    title: "寻找合伙人", titleEn: "Looking for Co-founders",
    subtitle: "找到志同道合的创业伙伴", subtitleEn: "Find the right co-founder",
    submitLabel: "发布需求", submitLabelEn: "Post Request",
    fields: [
      { key: "project", label: "项目 / 方向", labelEn: "Project / Idea", type: "text", required: true, placeholder: "你在做什么", placeholderEn: "What are you building" },
      { key: "role", label: "需要什么类型的合伙人", labelEn: "Role Needed", type: "chips", required: true,
        options: [
          { value: "tech", label: "技术合伙人 CTO", labelEn: "Technical Co-founder" },
          { value: "ops", label: "运营合伙人 COO", labelEn: "Operations Co-founder" },
          { value: "biz", label: "商务合伙人", labelEn: "Business Co-founder" },
          { value: "product", label: "产品合伙人", labelEn: "Product Co-founder" },
        ]},
      { key: "desc", label: "项目描述 + 对合伙人的期望", labelEn: "Description + Expectations", type: "textarea", required: true, rows: 4, placeholder: "描述项目现状和你期望的合伙人背景", placeholderEn: "Describe the project and ideal co-founder" },
      ...contactFields,
    ],
  },

  "professional-services": {
    category: "professional-services", emoji: "🔧",
    title: "寻找专业服务", titleEn: "Professional Services",
    subtitle: "匹配律师、会计或税务专家", subtitleEn: "Find legal, accounting, or tax professionals",
    submitLabel: "发布需求", submitLabelEn: "Post Request",
    fields: [
      { key: "service-type", label: "需要哪类专业服务", labelEn: "Service Type", type: "chips", required: true, multi: true,
        options: [
          { value: "legal-corp",      label: "法律 · 公司注册 / 合同", labelEn: "Legal · Corp / Contracts" },
          { value: "legal-immigration", label: "法律 · 移民签证",       labelEn: "Legal · Immigration" },
          { value: "legal-ip",        label: "法律 · 知识产权",         labelEn: "Legal · IP / Patent" },
          { value: "legal-other",     label: "法律 · 其他",             labelEn: "Legal · Other" },
          { value: "accounting",      label: "会计 · 记账 / 审计",      labelEn: "Accounting · Bookkeeping" },
          { value: "tax-personal",    label: "税务 · 个人报税",         labelEn: "Tax · Personal" },
          { value: "tax-business",    label: "税务 · 公司报税",         labelEn: "Tax · Business" },
          { value: "tax-crossborder", label: "税务 · 跨境（中美）",     labelEn: "Tax · Cross-border" },
          { value: "financial-plan",  label: "财务规划",                labelEn: "Financial Planning" },
        ]},
      { key: "desc", label: "具体需求描述", labelEn: "Details", type: "textarea", required: true, rows: 3, placeholder: "简单描述你的需求背景", placeholderEn: "Briefly describe your needs" },
      ...contactFields,
    ],
  },

  "offer-investor": {
    category: "offer-investor", emoji: "💰",
    title: "我是投资人", titleEn: "I'm an Investor",
    subtitle: "发布你的投资偏好，让创始人来找你", subtitleEn: "Post your thesis, let founders find you",
    submitLabel: "发布 Profile", submitLabelEn: "Post Profile",
    fields: [
      { key: "background", label: "投资人背景", labelEn: "Background", type: "textarea", required: true, rows: 3, placeholder: "例：前科技公司高管，专注 B2B SaaS 早期投资", placeholderEn: "e.g. Former tech exec, focus on early-stage B2B SaaS" },
      { key: "thesis", label: "投资偏好 / 领域", labelEn: "Investment Focus", type: "text", required: true, placeholder: "例：AI、医疗、消费品、早期", placeholderEn: "e.g. AI, Healthcare, Early stage" },
      { key: "profile_url", label: "LinkedIn 链接", labelEn: "LinkedIn URL", type: "text", placeholder: "linkedin.com/in/yourname", placeholderEn: "linkedin.com/in/yourname" },
      ...contactFields,
    ],
  },

  "offer-expert": {
    category: "offer-expert", emoji: "🎯",
    title: "我提供专业服务", titleEn: "I Offer Professional Services",
    subtitle: "展示你的专业背景，等待匹配需求", subtitleEn: "Showcase your expertise",
    submitLabel: "发布 Profile", submitLabelEn: "Post Profile",
    fields: [
      { key: "type", label: "服务类型", labelEn: "Service Type", type: "chips", required: true, multi: true,
        options: [
          { value: "lawyer",     label: "律师 / 法律顾问", labelEn: "Lawyer / Legal" },
          { value: "accountant", label: "会计 / 记账",      labelEn: "Accountant / Bookkeeping" },
          { value: "tax",        label: "税务",             labelEn: "Tax" },
          { value: "recruiter",  label: "猎头",             labelEn: "Recruiter / Headhunter" },
          { value: "other",      label: "其他",             labelEn: "Other" },
        ]},
      { key: "background", label: "背景介绍", labelEn: "Background", type: "textarea", required: true, rows: 3, placeholder: "你的专业背景、执照、擅长领域", placeholderEn: "Your credentials and expertise" },
      { key: "profile_url", label: "LinkedIn / 个人网站", labelEn: "LinkedIn / Website", type: "text", placeholder: "linkedin.com/in/yourname 或 个人网站", placeholderEn: "linkedin.com/in/yourname or website" },
      ...contactFields,
    ],
  },

  "offer-cofounder": {
    category: "offer-cofounder", emoji: "🚀",
    title: "我想当合伙人", titleEn: "I Want to Be a Co-founder",
    subtitle: "展示你的背景，寻找合适的创业项目合伙", subtitleEn: "Showcase your background and find the right startup to join",
    submitLabel: "发布 Profile", submitLabelEn: "Post Profile",
    fields: [
      { key: "background", label: "你的背景", labelEn: "Your Background", type: "textarea", required: true, rows: 3, placeholder: "工作经历、技能、行业经验", placeholderEn: "Work experience, skills, industry expertise" },
      { key: "interest", label: "感兴趣的方向", labelEn: "Interested Domains", type: "text", required: true, placeholder: "例：AI、医疗、教育、消费品", placeholderEn: "e.g. AI, Healthcare, EdTech" },
      { key: "commitment", label: "投入程度", labelEn: "Commitment", type: "radio",
        options: [
          { value: "full", label: "全职", labelEn: "Full-time" },
          { value: "part", label: "兼职", labelEn: "Part-time" },
          { value: "explore", label: "先聊聊", labelEn: "Exploring" },
        ]},
      { key: "profile_url", label: "LinkedIn 链接", labelEn: "LinkedIn URL", type: "text", placeholder: "linkedin.com/in/yourname", placeholderEn: "linkedin.com/in/yourname" },
      ...contactFields,
    ],
  },

  // ── 品牌营销 ──────────────────────────────────────────────

  "brand-creator": {
    category: "brand-creator", emoji: "🎬",
    title: "招募创作者 / 网红", titleEn: "Looking for Creators & Influencers",
    subtitle: "发布合作需求，匹配合适的创作者", subtitleEn: "Post your campaign and get matched with creators",
    submitLabel: "发布需求", submitLabelEn: "Post Request",
    fields: [
      { key: "brand", label: "品牌 / 公司名称", labelEn: "Brand / Company", type: "text", required: true, placeholder: "你的品牌名称", placeholderEn: "Your brand name" },
      { key: "platform", label: "目标平台", labelEn: "Target Platform", type: "chips", required: true, multi: true,
        options: [
          { value: "instagram", label: "Instagram", labelEn: "Instagram" },
          { value: "tiktok", label: "TikTok", labelEn: "TikTok" },
          { value: "youtube", label: "YouTube", labelEn: "YouTube" },
          { value: "xiaohongshu", label: "小红书", labelEn: "Xiaohongshu" },
          { value: "wechat", label: "微信 / 公众号", labelEn: "WeChat" },
          { value: "weibo", label: "微博", labelEn: "Weibo" },
        ]},
      { key: "follower", label: "期望粉丝量级", labelEn: "Follower Range", type: "radio", required: true,
        options: [
          { value: "nano",  label: "1K–10K（纳米）",   labelEn: "1K–10K (Nano)" },
          { value: "micro", label: "10K–100K（微型）",  labelEn: "10K–100K (Micro)" },
          { value: "macro", label: "100K+（宏观）",     labelEn: "100K+ (Macro)" },
          { value: "any",   label: "不限",             labelEn: "Any" },
        ]},
      { key: "budget", label: "合作预算", labelEn: "Budget", type: "text", placeholder: "例：$500–$2000 per post", placeholderEn: "e.g. $500–$2000 per post" },
      { key: "desc", label: "合作内容 / 活动描述", labelEn: "Campaign Details", type: "textarea", required: true, rows: 4, placeholder: "描述你的产品、推广目标和期望的内容形式", placeholderEn: "Describe your product, goals, and content format" },
      ...contactFields,
    ],
  },

  "offer-creator": {
    category: "offer-creator", emoji: "🎬",
    title: "我是创作者 / 网红", titleEn: "I'm a Creator / Influencer",
    subtitle: "展示你的数据，接受品牌合作邀约", subtitleEn: "Showcase your stats and open to brand deals",
    submitLabel: "发布 Profile", submitLabelEn: "Post Profile",
    fields: [
      { key: "platform", label: "主要平台", labelEn: "Main Platform", type: "chips", required: true, multi: true,
        options: [
          { value: "instagram",    label: "Instagram",     labelEn: "Instagram" },
          { value: "tiktok",       label: "TikTok",        labelEn: "TikTok" },
          { value: "youtube",      label: "YouTube",       labelEn: "YouTube" },
          { value: "xiaohongshu",  label: "小红书",         labelEn: "Xiaohongshu" },
          { value: "wechat",       label: "微信 / 公众号",   labelEn: "WeChat" },
        ]},
      { key: "followers", label: "粉丝量级", labelEn: "Follower Count", type: "radio", required: true,
        options: [
          { value: "nano",  label: "1K–10K",   labelEn: "1K–10K" },
          { value: "micro", label: "10K–100K", labelEn: "10K–100K" },
          { value: "macro", label: "100K+",    labelEn: "100K+" },
        ]},
      { key: "niche", label: "内容方向 / 领域", labelEn: "Content Niche", type: "text", required: true, placeholder: "例：科技、美妆、生活方式、美食", placeholderEn: "e.g. Tech, Beauty, Lifestyle, Food" },
      { key: "profile_url", label: "主账号链接", labelEn: "Main Profile URL", type: "text", required: true, placeholder: "例：instagram.com/yourname 或 小红书主页链接", placeholderEn: "e.g. instagram.com/yourname" },
      { key: "collab", label: "可接受的合作形式", labelEn: "Collaboration Types", type: "chips", multi: true,
        options: [
          { value: "post",       label: "图文 / 视频发布", labelEn: "Post / Video" },
          { value: "story",      label: "Story / 限时动态", labelEn: "Story" },
          { value: "review",     label: "产品评测",        labelEn: "Product Review" },
          { value: "ambassador", label: "品牌大使",         labelEn: "Brand Ambassador" },
        ]},
      ...contactFields,
    ],
  },

  // ── 人才对接 ──────────────────────────────────────────────

  "talent-search": {
    category: "talent-search", emoji: "👥",
    title: "寻找人才 / 顾问", titleEn: "Talent & Consultant Search",
    subtitle: "发布职位或项目，匹配全职、兼职、外部顾问", subtitleEn: "Find employees, freelancers, or outside advisors",
    submitLabel: "发布需求", submitLabelEn: "Post Request",
    fields: [
      { key: "company", label: "公司 / 机构名称", labelEn: "Company / Organization", type: "text", required: true, placeholder: "公司名称", placeholderEn: "Company name" },
      { key: "role-type", label: "招募类型", labelEn: "Engagement Type", type: "chips", required: true,
        options: [
          { value: "fulltime",   label: "全职员工",   labelEn: "Full-time" },
          { value: "parttime",   label: "兼职",       labelEn: "Part-time" },
          { value: "consultant", label: "外部顾问",   labelEn: "Outside Advisor" },
          { value: "project",    label: "项目制合作", labelEn: "Project-based" },
        ]},
      { key: "domain", label: "所需领域 / 职能", labelEn: "Domain / Function", type: "text", required: true, placeholder: "例：产品、数据、市场、战略顾问、GTM", placeholderEn: "e.g. Product, Data, Marketing, Strategy Advisor, GTM" },
      { key: "desc", label: "岗位 / 项目描述", labelEn: "Role / Project Description", type: "textarea", required: true, rows: 4, placeholder: "描述工作内容、要求和薪资范围", placeholderEn: "Describe the role, requirements, and compensation" },
      ...contactFields,
    ],
  },

  "offer-talent": {
    category: "offer-talent", emoji: "💡",
    title: "我是求职者 / 顾问", titleEn: "I'm a Job Seeker / Consultant",
    subtitle: "展示你的背景，接受职位和项目机会", subtitleEn: "Showcase your background and open to opportunities",
    submitLabel: "发布 Profile", submitLabelEn: "Post Profile",
    fields: [
      { key: "background", label: "你的背景 / 经历", labelEn: "Background / Experience", type: "textarea", required: true, rows: 3, placeholder: "工作经历、技能、行业经验", placeholderEn: "Work experience, skills, industry expertise" },
      { key: "domain", label: "擅长领域", labelEn: "Expertise", type: "text", required: true, placeholder: "例：产品、数据、市场、工程", placeholderEn: "e.g. Product, Data, Marketing, Engineering" },
      { key: "type", label: "期望合作方式", labelEn: "Preferred Engagement", type: "chips", required: true,
        options: [
          { value: "fulltime",   label: "全职",    labelEn: "Full-time" },
          { value: "parttime",   label: "兼职",    labelEn: "Part-time" },
          { value: "consultant", label: "顾问咨询", labelEn: "Consulting" },
          { value: "project",    label: "项目制",  labelEn: "Project-based" },
        ]},
      { key: "profile_url", label: "LinkedIn 链接", labelEn: "LinkedIn URL", type: "text", required: true, placeholder: "linkedin.com/in/yourname", placeholderEn: "linkedin.com/in/yourname" },
      ...contactFields,
    ],
  },

  // ── 产品推广 ──────────────────────────────────────────────

  "product-trial": {
    category: "product-trial", emoji: "🧪",
    title: "招募产品 / APP 试用者", titleEn: "Looking for Product / App Testers",
    subtitle: "招募真实用户试用你的产品，获取真实反馈", subtitleEn: "Recruit real users to test your product",
    submitLabel: "发布试用活动", submitLabelEn: "Post Trial Campaign",
    fields: [
      { key: "product", label: "产品 / APP 名称", labelEn: "Product / App Name", type: "text", required: true, placeholder: "你的产品名称", placeholderEn: "Your product name" },
      { key: "type", label: "试用类型", labelEn: "Trial Type", type: "chips", required: true,
        options: [
          { value: "physical", label: "实物产品",    labelEn: "Physical Product" },
          { value: "app",      label: "APP / 软件",  labelEn: "App / Software" },
          { value: "food",     label: "食品 / 饮品",  labelEn: "Food & Beverage" },
          { value: "service",  label: "服务体验",    labelEn: "Service" },
        ]},
      { key: "reward", label: "给试用者的回报", labelEn: "Tester Reward", type: "text", placeholder: "例：免费产品、现金补贴、优惠码", placeholderEn: "e.g. Free product, cash reward, promo code" },
      { key: "desc", label: "产品介绍 + 试用要求", labelEn: "Product Info + Requirements", type: "textarea", required: true, rows: 4, placeholder: "描述产品特点和你希望试用者做什么（评测、反馈、发帖等）", placeholderEn: "Describe the product and what testers should do" },
      ...contactFields,
    ],
  },

  "offer-tester": {
    category: "offer-tester", emoji: "🧪",
    title: "我愿意试用产品 / APP", titleEn: "I'm a Product Tester",
    subtitle: "发现好产品，提供真实反馈，获得回报", subtitleEn: "Try new products, give honest feedback, earn rewards",
    submitLabel: "加入试用者社区", submitLabelEn: "Join as Tester",
    fields: [
      { key: "interest", label: "感兴趣的产品类型", labelEn: "Interested Categories", type: "chips", required: true, multi: true,
        options: [
          { value: "tech",      label: "科技 / 电子",   labelEn: "Tech / Electronics" },
          { value: "app",       label: "APP / 软件",    labelEn: "Apps / Software" },
          { value: "food",      label: "食品 / 饮品",   labelEn: "Food & Beverage" },
          { value: "beauty",    label: "美妆 / 个护",   labelEn: "Beauty & Care" },
          { value: "lifestyle", label: "生活用品",      labelEn: "Lifestyle" },
          { value: "any",       label: "都可以",        labelEn: "Open to all" },
        ]},
      { key: "social", label: "社交媒体账号（选填）", labelEn: "Social Media (optional)", type: "text", placeholder: "Instagram / 小红书 / TikTok（如有）", placeholderEn: "Instagram / Xiaohongshu / TikTok (if any)" },
      { key: "desc", label: "自我介绍（选填）", labelEn: "About You (optional)", type: "textarea", rows: 2, placeholder: "你是谁，为什么想成为试用者", placeholderEn: "Tell us about yourself" },
      ...contactFields,
    ],
  },
};

// ─── Category metadata ────────────────────────────────────

export interface CategoryMeta {
  label: string; labelEn?: string; emoji: string;
  desc: string;  descEn?: string;  color: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  investor:                { label: "寻找投资人",            labelEn: "Looking for Investors",         emoji: "💰", desc: "天使轮 · Pre-seed · 种子轮",      descEn: "Angel · Seed · Series A",           color: "blue" },
  cofounder:               { label: "寻找合伙人",            labelEn: "Looking for Co-founders",       emoji: "🤝", desc: "技术 · 运营 · 联合创始人",         descEn: "Tech · Ops · Co-founder",           color: "purple" },
  "professional-services": { label: "寻找专业服务",          labelEn: "Professional Services",         emoji: "🔧", desc: "律师 · 会计 · 税务",              descEn: "Legal · Accounting · Tax",          color: "indigo" },
  "brand-creator":         { label: "招募创作者 / 网红",     labelEn: "Looking for Creators",          emoji: "🎬", desc: "内容合作 · 品牌推广 · 大使计划",  descEn: "Content collab · Campaigns",        color: "pink" },
  "talent-search":         { label: "寻找人才 / 顾问",      labelEn: "Talent & Consultant Search",    emoji: "👥", desc: "全职 · 兼职 · 项目制 · 外部顾问", descEn: "Full-time · Part-time · Consulting", color: "emerald" },
  "product-trial":         { label: "招募产品 / APP 试用者", labelEn: "Looking for Product Testers",   emoji: "🧪", desc: "新品体验 · APP 内测 · 真实反馈",  descEn: "Product trial · Beta · Feedback",   color: "amber" },
  "offer-investor":        { label: "我是投资人",            labelEn: "I'm an Investor",               emoji: "💰", desc: "发布投资偏好",                    descEn: "Post your thesis",                  color: "amber" },
  "offer-expert":          { label: "我提供专业服务",        labelEn: "I Offer Pro Services",          emoji: "🎯", desc: "律师 · 会计 · 税务 · 猎头",        descEn: "Legal · Accounting · Tax",          color: "rose" },
  "offer-cofounder":       { label: "我想当合伙人",          labelEn: "I Want to Be a Co-founder",     emoji: "🚀", desc: "展示背景 · 开放合伙",              descEn: "Show background · Open to co-found", color: "orange" },
  "offer-creator":         { label: "我是创作者 / 网红",     labelEn: "I'm a Creator / Influencer",   emoji: "🎬", desc: "接受品牌合作 · 内容创作",          descEn: "Open to brand deals",               color: "pink" },
  "offer-talent":          { label: "我是求职者 / 顾问",     labelEn: "I'm a Job Seeker / Consultant", emoji: "💡", desc: "展示背景 · 接受机会",              descEn: "Show background · Open to roles",   color: "emerald" },
  "offer-tester":          { label: "我愿意试用产品 / APP",  labelEn: "I'm a Product Tester",         emoji: "🧪", desc: "体验新产品 · 提供真实反馈",        descEn: "Test products · Give real feedback", color: "yellow" },
};

export interface CategoryGroup {
  groupLabel: string; groupLabelEn?: string;
  categories: (CategoryMeta & { key: string })[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    groupLabel: "🔍 我在寻找", groupLabelEn: "🔍 I'm Looking For",
    categories: ["investor","cofounder","professional-services","brand-creator","talent-search","product-trial"].map(k => ({ key: k, ...CATEGORY_META[k] })),
  },
  {
    groupLabel: "💡 我能提供", groupLabelEn: "💡 I Can Offer",
    categories: ["offer-investor","offer-expert","offer-cofounder","offer-creator","offer-talent","offer-tester"].map(k => ({ key: k, ...CATEGORY_META[k] })),
  },
];
