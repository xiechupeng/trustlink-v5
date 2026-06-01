export type PlanKey = "single" | "pack3" | "monthly";

export interface Plan {
  key: PlanKey;
  label: string;
  price: string;         // display price
  priceNum: number;      // numeric for Zelle
  badge?: string;        // highlight label
  desc: string;          // one-line description
  unlocks: string;       // what they get
  zelleNote: string;     // Zelle 备注前缀
}

export const PLANS: Plan[] = [
  {
    key: "single",
    label: "单次解锁",
    price: "$29",
    priceNum: 29,
    desc: "解锁 1 位成员的联系方式",
    unlocks: "1 次解锁",
    zelleNote: "TrustLink single",
  },
  {
    key: "pack3",
    label: "3 次包",
    price: "$59",
    priceNum: 59,
    badge: "省 $28",
    desc: "解锁 3 位成员，可分次使用",
    unlocks: "3 次解锁",
    zelleNote: "TrustLink 3pack",
  },
  {
    key: "monthly",
    label: "月度会员",
    price: "$399/月",
    priceNum: 399,
    badge: "企业 / 高频用户",
    desc: "当月无限解锁所有成员",
    unlocks: "无限解锁（30天）",
    zelleNote: "TrustLink monthly",
  },
];

export const DEFAULT_PLAN: PlanKey = "single";
