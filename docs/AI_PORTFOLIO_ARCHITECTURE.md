# Applied AI Portfolio Architecture

This repository contains three public, reproducible Applied AI systems. The first release intentionally uses synthetic data and deterministic scoring so every displayed metric can be traced to versioned inputs and code.

## 1. Trustworthy LLM Optimization Platform

**Goal:** evaluate whether a business-facing LLM answer is sufficiently grounded to release.

### Current implementation

1. Load a versioned QA case with an answer, atomic claims, citations, and evidence.
2. Resolve cited evidence IDs.
3. Calculate token coverage between each claim and its best evidence match.
4. Add citation-presence, source-trust, and freshness contributions.
5. Classify each claim as supported or requiring review.
6. Aggregate claim support, citation coverage, unsupported-claim rate, source trust, and freshness.
7. Apply a release gate when unsupported-claim risk exceeds the configured threshold.

### Next implementation increments

- Replace lexical coverage with an NLI/cross-encoder verifier.
- Add calibrated LLM-as-judge scoring with human labels.
- Add explicit abstention and contradiction test sets.
- Add model-provider adapters and token/latency telemetry.
- Compare baseline, RAG-only, verifier-assisted, and fine-tuned variants.

## 2. Market Intelligence & B2B Recommendation Copilot

**Goal:** produce explainable, evidence-backed account rankings rather than embedding-only similarity lists.

### Current implementation

The score combines:

- semantic/product overlap: 22%
- target-industry fit: 12%
- target-region fit: 8%
- hiring/need signals: 14%
- budget capacity: 12%
- partnership readiness: 10%
- contactability: 8%
- evidence quality: 8%
- freshness: 6%

Each account exposes component scores, reasons, and release-gate risks. The public dataset uses synthetic companies so the repository contains no scraped personal data or unverified claims about real companies.

### Next implementation increments

- Add BM25 and embedding candidate retrieval.
- Add entity resolution and graph relationships.
- Add source URLs, capture dates, and evidence snippets.
- Add accepted/rejected account feedback.
- Train and compare a learning-to-rank model after enough labels exist.
- Export reviewed accounts to a CRM-compatible CSV.

## 3. Software Engineering Agent EvalOps

**Goal:** evaluate coding-agent work as an engineering change, not as generated text.

### Current implementation

Each task records:

- acceptance criteria
- repository context files
- generated-test count
- executed-test pass/fail results
- review findings and blockers
- latency and estimated cost
- quality score and deployment decision

A task is deployable only when tests pass, blockers are zero, and the quality threshold is met.

### Next implementation increments

- Add a real repository task runner in an isolated worktree/container.
- Add static analysis, secret scanning, dependency checks, and coverage reports.
- Record tool calls and file-level context precision.
- Generate PR summaries and reviewer rubrics.
- Add rollback and human-approval policies for high-risk changes.

## Evidence assets

- `data/ai-lab/business-qa.json`: golden QA/evidence examples
- `data/ai-lab/companies.json`: synthetic recommendation candidates
- `data/ai-lab/coding-tasks.json`: coding-agent task traces
- `lib/ai-lab/scoring.ts`: transparent scoring contracts
- `scripts/run-portfolio-evals.mjs`: reproducible CLI evaluation
- `artifacts/ai-portfolio-eval.json`: CI-generated machine-readable scorecard
- `/ai-lab`: interactive portfolio UI

## Integrity rules

1. Never present synthetic metrics as employer production impact.
2. Never include private LocalSEA, ValueLink, customer, or employer data in the public repository.
3. Add a metric to the resume only after it is reproducible from a committed dataset or a documented production source.
4. Keep failure cases visible; do not publish only successful traces.
5. Use human review for any action that sends messages, changes CRM records, modifies production code, or affects pricing.
