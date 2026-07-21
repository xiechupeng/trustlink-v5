import Link from "next/link";

const projects = [
  {
    href: "/ai-lab/trustworthy-llm",
    eyebrow: "LLM Reliability",
    title: "Trustworthy LLM Optimization Platform",
    description:
      "Claim-level hallucination detection, citation grounding, abstention-aware release gates, and reproducible quality/cost evaluation.",
    metrics: ["Claim support", "Citation coverage", "Unsupported claims", "p95 latency"],
  },
  {
    href: "/ai-lab/market-intelligence",
    eyebrow: "Agentic GTM",
    title: "Market Intelligence & B2B Recommendation Copilot",
    description:
      "Evidence-backed account discovery with hybrid business signals, explainable fit scoring, risk notes, and CRM-ready recommendations.",
    metrics: ["Precision@k", "Evidence quality", "Freshness", "Contactability"],
  },
  {
    href: "/ai-lab/coding-agent",
    eyebrow: "AI-Native Engineering",
    title: "Software Engineering Agent EvalOps",
    description:
      "Repository-context tasks evaluated with generated tests, review findings, deployment gates, latency, cost, and regression controls.",
    metrics: ["Pass rate", "Quality score", "Review risk", "Cost/task"],
  },
];

export default function AILabPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_42%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.12),_transparent_38%)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Link href="/" className="text-sm font-semibold text-sky-300 hover:text-sky-200">
            ← Back to TrustLink
          </Link>
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.28em] text-sky-300">
            Public Applied AI Portfolio
          </p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Production-oriented AI systems with visible evidence, metrics, and failure modes.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Three portfolio-grade systems demonstrate trustworthy LLM evaluation, agentic B2B
            decisioning, and coding-agent EvalOps. The first release is intentionally deterministic
            and reproducible: every score is generated from versioned sample data rather than hidden
            prompts or unverifiable claims.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            {[
              "No API key required",
              "Versioned evaluation datasets",
              "Deterministic scorecards",
              "CI-ready evidence artifacts",
            ].map((item) => (
              <span key={item} className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.href}
              href={project.href}
              className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-7 transition hover:-translate-y-1 hover:border-sky-500/60 hover:bg-slate-900"
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">
                {project.eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-black leading-tight text-white">{project.title}</h2>
              <p className="mt-4 leading-7 text-slate-300">{project.description}</p>
              <div className="mt-7 grid grid-cols-2 gap-2">
                {project.metrics.map((metric) => (
                  <span key={metric} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-300">
                    {metric}
                  </span>
                ))}
              </div>
              <p className="mt-8 font-bold text-sky-300 group-hover:text-sky-200">Open demo →</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-7">
          <h2 className="text-xl font-black text-amber-100">Portfolio integrity statement</h2>
          <p className="mt-3 max-w-4xl leading-7 text-amber-50/80">
            Company names and coding tasks in this public demo are synthetic. Metrics describe the
            reproducible evaluation implementation in this repository; they are not presented as
            employer production results. The architecture is designed so real, permissioned data and
            model providers can be added later without changing the evaluation contracts.
          </p>
        </div>
      </section>
    </main>
  );
}
