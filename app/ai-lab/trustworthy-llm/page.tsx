import Link from "next/link";
import qaData from "@/data/ai-lab/business-qa.json";
import { evaluateTrust, type QAExample } from "@/lib/ai-lab/scoring";

const examples = qaData as QAExample[];

function Metric({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  const positive = inverse ? value <= 20 : value >= 75;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-black ${positive ? "text-emerald-300" : "text-amber-300"}`}>
        {value}%
      </p>
    </div>
  );
}

export default function TrustworthyLLMPage() {
  const evaluated = examples.map((example) => ({ example, evaluation: evaluateTrust(example) }));
  const primary = evaluated[0];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/ai-lab" className="font-semibold text-sky-300 hover:text-sky-200">
            ← Applied AI Lab
          </Link>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
            Deterministic evaluation
          </span>
        </div>

        <header className="mt-12 max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-sky-300">LLM Reliability</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            Trustworthy LLM Optimization Platform
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The demo decomposes an answer into atomic claims, aligns each claim with cited evidence,
            scores source quality and freshness, and calculates a release-oriented trust score.
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Overall trust" value={primary.evaluation.overall} />
          <Metric label="Claim support" value={primary.evaluation.claimSupportRate} />
          <Metric label="Citation coverage" value={primary.evaluation.citationCoverage} />
          <Metric label="Unsupported claims" value={primary.evaluation.unsupportedClaimRate} inverse />
          <Metric label="Source trust" value={primary.evaluation.sourceTrust} />
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_1.4fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Evaluation case</p>
            <h2 className="mt-4 text-xl font-black text-white">{primary.example.question}</h2>
            <p className="mt-5 leading-7 text-slate-300">{primary.example.answer}</p>
            <div className="mt-7 rounded-2xl border border-slate-700 bg-slate-950 p-5">
              <p className="text-sm font-bold text-slate-200">Release decision</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {primary.evaluation.unsupportedClaimRate > 20
                  ? "Human review required: unsupported-claim rate exceeds the configured threshold."
                  : "Eligible for release: evidence and citation thresholds are satisfied."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {primary.evaluation.claims.map((claim, index) => (
              <article key={`${claim.claim}-${index}`} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Claim {index + 1}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${claim.supported ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"}`}>
                    {claim.supported ? "Supported" : "Needs review"} · {claim.supportScore}
                  </span>
                </div>
                <p className="mt-4 font-semibold leading-7 text-white">{claim.claim}</p>
                <div className="mt-5 rounded-2xl bg-slate-950 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Best evidence match</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {claim.matchedEvidence?.text ?? "No evidence matched."}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    {claim.matchedEvidence?.source ?? "Unknown source"} · source trust {claim.sourceTrust}% · freshness {claim.freshness}%
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-2xl font-black">What is verifiable in the repository?</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Golden dataset", `${examples.length} versioned business QA cases with claims and evidence.`],
              ["Scoring contract", "Token coverage, citation presence, source trust, freshness, and release thresholds."],
              ["Regression output", "A Node evaluation script writes a machine-readable JSON scorecard in CI."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl bg-slate-950 p-5">
                <p className="font-bold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
