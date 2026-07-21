# TrustLink + Applied AI Lab

A Next.js application for professional discovery and a public, reproducible Applied AI engineering portfolio.

## Applied AI Lab

Open `/ai-lab` to explore three implementation-backed portfolio systems:

1. **Trustworthy LLM Optimization Platform**
   - atomic-claim evaluation
   - citation grounding
   - unsupported-claim detection
   - source-trust and freshness scoring
   - release-oriented trust scorecards

2. **Market Intelligence & B2B Recommendation Copilot**
   - transparent multi-factor fit scoring
   - business-need and budget signals
   - partnership readiness and contactability
   - evidence quality, freshness, rationale, and risk notes

3. **Software Engineering Agent EvalOps**
   - repository-context task definitions
   - acceptance criteria and generated tests
   - pass rate, review findings, blockers, latency, and cost
   - deployment-quality gates

The public datasets are synthetic. Displayed portfolio metrics are generated from versioned files and deterministic code; they are not represented as employer production results.

## Reproducible evaluation

```bash
node scripts/run-portfolio-evals.mjs
```

The script writes:

```text
artifacts/ai-portfolio-eval.json
```

The GitHub Actions workflow also runs lint, the Next.js production build, and the portfolio quality gates.

Architecture and expansion plan:

```text
docs/AI_PORTFOLIO_ARCHITECTURE.md
```

## Getting started

```bash
npm install
npm run dev
```

Open:

- TrustLink: `http://localhost:3000`
- Applied AI Lab: `http://localhost:3000/ai-lab`

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Deterministic offline evaluation datasets and scorecards

## Portfolio integrity

- No private employer, customer, LocalSEA, or ValueLink data is committed.
- Synthetic companies and tasks are labeled as synthetic.
- Resume metrics should be added only after they are reproducible from committed evidence or documented production sources.
- Failure cases remain visible and are included in release gates.
