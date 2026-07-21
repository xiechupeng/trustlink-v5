import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
const round = (value) => Math.round(value * 10) / 10;
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

function tokenize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function coverage(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  if (!leftTokens.size) return 0;
  let matches = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) matches += 1;
  });
  return matches / leftTokens.size;
}

function evaluateQa(example) {
  const evidenceById = new Map(example.evidence.map((item) => [item.id, item]));
  const claims = example.claims.map((claim) => {
    const cited = claim.evidenceIds.map((id) => evidenceById.get(id)).filter(Boolean);
    const candidates = cited.length ? cited : example.evidence;
    const best = candidates
      .map((item) => ({ item, coverage: coverage(claim.text, item.text) }))
      .sort((a, b) => b.coverage - a.coverage)[0];
    const score = clamp(
      (best?.coverage ?? 0) * 75 +
        (cited.length ? 10 : 0) +
        (best?.item.trust ?? 0) * 10 +
        (best?.item.freshness ?? 0) * 5,
    );
    return {
      claim: claim.text,
      supportScore: round(score),
      supported: score >= 62,
      citationPresent: cited.length > 0,
    };
  });
  const supportRate = (claims.filter((claim) => claim.supported).length / claims.length) * 100;
  const citationCoverage = (claims.filter((claim) => claim.citationPresent).length / claims.length) * 100;
  return {
    id: example.id,
    supportRate: round(supportRate),
    citationCoverage: round(citationCoverage),
    unsupportedClaimRate: round(100 - supportRate),
    claims,
  };
}

function keywordFit(profile, company) {
  const query = new Set(profile.keywords.map((item) => item.toLowerCase()));
  const corpus = new Set([...company.keywords, ...tokenize(company.description)].map((item) => item.toLowerCase()));
  let matches = 0;
  query.forEach((keyword) => {
    if (corpus.has(keyword)) matches += 1;
  });
  return query.size ? (matches / query.size) * 100 : 0;
}

function scoreCompany(profile, company) {
  const semanticFit = keywordFit(profile, company);
  const industryFit = profile.targetIndustries.includes(company.industry) ? 100 : 35;
  const regionFit = profile.targetRegions.includes(company.region) ? 100 : 45;
  const needSignal = clamp(company.hiringSignals.length * 28);
  const partnershipSignal = clamp(company.partnershipSignals.length * 34);
  const budgetSignal = company.budgetSignal * 100;
  const contactability = company.contactability * 100;
  const evidenceQuality = company.evidenceQuality * 100;
  const freshness = company.freshness * 100;
  const total =
    semanticFit * 0.22 +
    industryFit * 0.12 +
    regionFit * 0.08 +
    needSignal * 0.14 +
    budgetSignal * 0.12 +
    partnershipSignal * 0.1 +
    contactability * 0.08 +
    evidenceQuality * 0.08 +
    freshness * 0.06;
  return {
    id: company.id,
    name: company.name,
    score: round(total),
    evidenceQuality: round(evidenceQuality),
    contactability: round(contactability),
    freshness: round(freshness),
  };
}

function evaluateCodingTask(task) {
  const total = task.testsPassed + task.testsFailed;
  const passRate = total ? (task.testsPassed / total) * 100 : 0;
  const coverageProxy = Math.min(100, task.generatedTests * 12.5);
  const reviewPenalty = task.reviewFindings.length * 4 + task.blockerCount * 18;
  const costPenalty = Math.min(12, task.costUsd * 12);
  const latencyPenalty = Math.min(10, task.latencySeconds / 12);
  const qualityScore = clamp(
    passRate * 0.55 + coverageProxy * 0.25 + 20 - reviewPenalty - costPenalty - latencyPenalty,
  );
  return {
    id: task.id,
    title: task.title,
    passRate: round(passRate),
    qualityScore: round(qualityScore),
    deployable: passRate === 100 && task.blockerCount === 0 && qualityScore >= 72,
    costUsd: task.costUsd,
    latencySeconds: task.latencySeconds,
  };
}

const [qa, companies, codingTasks] = await Promise.all([
  readJson("data/ai-lab/business-qa.json"),
  readJson("data/ai-lab/companies.json"),
  readJson("data/ai-lab/coding-tasks.json"),
]);

const profile = {
  targetIndustries: ["Software"],
  targetRegions: ["United States", "Canada"],
  keywords: ["testing", "automation", "qa", "release", "developer", "engineering"],
};

const qaResults = qa.map(evaluateQa);
const recommendationResults = companies
  .map((company) => scoreCompany(profile, company))
  .sort((a, b) => b.score - a.score);
const codingResults = codingTasks.map(evaluateCodingTask);

const report = {
  generatedAt: new Date().toISOString(),
  datasetVersion: "v0.1-synthetic",
  trustworthyLlm: {
    cases: qaResults.length,
    averageClaimSupport: round(
      qaResults.reduce((sum, result) => sum + result.supportRate, 0) / qaResults.length,
    ),
    averageCitationCoverage: round(
      qaResults.reduce((sum, result) => sum + result.citationCoverage, 0) / qaResults.length,
    ),
    results: qaResults,
  },
  b2bRecommendation: {
    candidates: recommendationResults.length,
    top3: recommendationResults.slice(0, 3),
    outreachReady: recommendationResults.filter(
      (item) => item.score >= 70 && item.evidenceQuality >= 80 && item.contactability >= 65,
    ).length,
  },
  codingAgent: {
    tasks: codingResults.length,
    averagePassRate: round(
      codingResults.reduce((sum, result) => sum + result.passRate, 0) / codingResults.length,
    ),
    deployable: codingResults.filter((result) => result.deployable).length,
    results: codingResults,
  },
};

const outputDirectory = path.join(root, "artifacts");
await mkdir(outputDirectory, { recursive: true });
await writeFile(
  path.join(outputDirectory, "ai-portfolio-eval.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify(report, null, 2));

const failed =
  report.trustworthyLlm.averageClaimSupport < 60 ||
  report.b2bRecommendation.outreachReady < 1 ||
  report.codingAgent.deployable < 1;

if (failed) {
  console.error("Portfolio quality gate failed.");
  process.exitCode = 1;
}
