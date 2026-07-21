import Link from "next/link";
import companyData from "@/data/ai-lab/companies.json";
import {
  rankCompanies,
  type Company,
  type RecommendationProfile,
} from "@/lib/ai-lab/scoring";

const companies = companyData as Company[];
const profile: RecommendationProfile = {
  description:
    "AI testing and release-quality SaaS seeking mid-market software companies and developer-tool partners in North America.",
  targetIndustries: ["Software"],
  targetRegions: ["United States", "Canada"],
  keywords: ["testing", "automation", "qa", "release", "developer", "engineering"],
};

const ranked = rankCompanies(profile, companies);

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-sky-400" style={{ width: `${Math.max(2, value)}%` }} />
      </div>
    </div>
  );
}

export default function MarketIntelligencePage() {
  const top = ranked.slice(0, 5);
  const averageEvidence =
    Math.round((top.reduce((sum, item) => sum + item.evidenceQuality, 0) / top.length) * 10) / 10;
  const readyForOutreach = top.filter(
    (item) => item.total >= 70 && item.evidenceQuality >= 80 && item.contactability >= 65,
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/ai-lab" className="font-semibold text-sky-300 hover:text-sky-200">
            ← Applied AI Lab
          </Link>
          <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-200">
            Synthetic public dataset
          </span>
        </div>

        <header className="mt-12 max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-violet-300">Agentic GTM</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            Market Intelligence & B2B Recommendation Copilot
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            A deterministic account-ranking layer combines semantic overlap, structured business
            constraints, need and budget signals, partnership readiness, contactability, source
            quality, and freshness. Every score exposes its rationale and risks.
          </p>
        </header>

        <section className="mt-10 grid gap-5 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Target profile</p>
            <h2 className="mt-4 text-2xl font-black">{profile.description}</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Accounts evaluated</p>
              <p className="mt-3 text-4xl font-black text-white">{companies.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Ready for outreach</p>
              <p className="mt-3 text-4xl font-black text-emerald-300">{readyForOutreach}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Top-5 evidence quality</p>
              <p className="mt-3 text-4xl font-black text-sky-300">{averageEvidence}%</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-5">
          {top.map((item, index) => (
            <article key={item.company.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-300">Rank #{index + 1}</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{item.company.name}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    {item.company.description}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-5 py-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Fit score</p>
                  <p className="mt-1 text-4xl font-black text-sky-300">{item.total}</p>
                </div>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <ScoreBar label="Semantic fit" value={item.semanticFit} />
                <ScoreBar label="Need signal" value={item.needSignal} />
                <ScoreBar label="Budget signal" value={item.budgetSignal} />
                <ScoreBar label="Partnership readiness" value={item.partnershipSignal} />
                <ScoreBar label="Evidence quality" value={item.evidenceQuality} />
                <ScoreBar label="Freshness" value={item.freshness} />
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-emerald-400/10 p-5">
                  <p className="font-bold text-emerald-200">Why fit</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-50/75">
                    {(item.rationale.length ? item.rationale : ["Moderate fit; collect more evidence before outreach."]).map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-amber-400/10 p-5">
                  <p className="font-bold text-amber-200">Risks / release gate</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-50/75">
                    {(item.risks.length ? item.risks : ["No material release-gate risks in the sample data."]).map((risk) => (
                      <li key={risk}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-2xl font-black">Scoring contract</h2>
          <p className="mt-3 max-w-4xl leading-7 text-slate-300">
            The current MVP is deliberately transparent: 22% semantic fit, 12% industry, 8% region,
            14% need signals, 12% budget, 10% partnership readiness, 8% contactability, 8% evidence
            quality, and 6% freshness. A future learning-to-rank version can replace these weights only
            after enough accepted/rejected account feedback exists.
          </p>
        </section>
      </div>
    </main>
  );
}
