import Link from "next/link";
import taskData from "@/data/ai-lab/coding-tasks.json";
import {
  evaluateCodingTask,
  type CodingTask,
} from "@/lib/ai-lab/scoring";

const tasks = (taskData as CodingTask[]).map(evaluateCodingTask);

export default function CodingAgentPage() {
  const deployable = tasks.filter((task) => task.deployable).length;
  const averagePassRate =
    Math.round((tasks.reduce((sum, task) => sum + task.passRate, 0) / tasks.length) * 10) / 10;
  const averageCost =
    Math.round((tasks.reduce((sum, task) => sum + task.costUsd, 0) / tasks.length) * 100) / 100;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/ai-lab" className="font-semibold text-sky-300 hover:text-sky-200">
            ← Applied AI Lab
          </Link>
          <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-200">
            Repo-context task evaluation
          </span>
        </div>

        <header className="mt-12 max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-fuchsia-300">AI-Native Engineering</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            Software Engineering Agent EvalOps
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            The portfolio does not treat code generation as success. Each task is evaluated against
            acceptance criteria, generated tests, execution results, review findings, blocker count,
            latency, cost, and a deployment gate.
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Average pass rate", `${averagePassRate}%`, "text-emerald-300"],
            ["Deployable tasks", `${deployable}/${tasks.length}`, "text-sky-300"],
            ["Average cost/task", `$${averageCost}`, "text-fuchsia-300"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
              <p className={`mt-3 text-4xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 space-y-5">
          {tasks.map((task) => (
            <article key={task.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">
                    {task.category}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-white">{task.title}</h2>
                </div>
                <span className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] ${task.deployable ? "bg-emerald-400/15 text-emerald-200" : "bg-rose-400/15 text-rose-200"}`}>
                  {task.deployable ? "Deployable" : "Review required"}
                </span>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Pass rate", `${task.passRate}%`],
                  ["Quality score", task.qualityScore],
                  ["Generated tests", task.generatedTests],
                  ["Latency", `${task.latencySeconds}s`],
                  ["Cost", `$${task.costUsd}`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-950 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                    <p className="mt-2 text-xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-5 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="font-bold text-white">Acceptance criteria</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                    {task.acceptanceCriteria.map((criterion) => (
                      <li key={criterion}>• {criterion}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="font-bold text-white">Repository context</p>
                  <ul className="mt-3 space-y-2 font-mono text-xs leading-6 text-sky-300">
                    {task.contextFiles.map((file) => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="font-bold text-white">Review findings</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                    {(task.reviewFindings.length ? task.reviewFindings : ["No material findings."]).map((finding) => (
                      <li key={finding}>• {finding}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Risk: <span className={task.reviewRisk === "low" ? "text-emerald-300" : task.reviewRisk === "medium" ? "text-amber-300" : "text-rose-300"}>{task.reviewRisk}</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-2xl font-black">Production-oriented workflow</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {[
              "Retrieve repository context",
              "Plan bounded change",
              "Generate code and tests",
              "Run CI and static checks",
              "Review, approve, or roll back",
            ].map((step, index) => (
              <div key={step} className="rounded-2xl bg-slate-950 p-5">
                <p className="text-xs font-black text-fuchsia-300">0{index + 1}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-white">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
