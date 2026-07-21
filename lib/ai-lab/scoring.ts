export type Evidence = {
  id: string;
  text: string;
  source: string;
  trust: number;
  freshness: number;
};

export type Claim = {
  text: string;
  evidenceIds: string[];
};

export type QAExample = {
  id: string;
  question: string;
  answer: string;
  claims: Claim[];
  evidence: Evidence[];
};

export type ClaimEvaluation = {
  claim: string;
  supported: boolean;
  supportScore: number;
  citationPresent: boolean;
  sourceTrust: number;
  freshness: number;
  matchedEvidence?: Evidence;
};

export type TrustEvaluation = {
  overall: number;
  claimSupportRate: number;
  citationCoverage: number;
  unsupportedClaimRate: number;
  sourceTrust: number;
  freshness: number;
  claims: ClaimEvaluation[];
};

export type Company = {
  id: string;
  name: string;
  description: string;
  industry: string;
  region: string;
  employees: number;
  keywords: string[];
  hiringSignals: string[];
  partnershipSignals: string[];
  budgetSignal: number;
  contactability: number;
  evidenceQuality: number;
  freshness: number;
};

export type RecommendationProfile = {
  description: string;
  targetIndustries: string[];
  targetRegions: string[];
  keywords: string[];
};

export type CompanyScore = {
  company: Company;
  total: number;
  semanticFit: number;
  industryFit: number;
  regionFit: number;
  needSignal: number;
  budgetSignal: number;
  partnershipSignal: number;
  contactability: number;
  evidenceQuality: number;
  freshness: number;
  rationale: string[];
  risks: string[];
};

export type CodingTask = {
  id: string;
  title: string;
  category: string;
  acceptanceCriteria: string[];
  contextFiles: string[];
  generatedTests: number;
  testsPassed: number;
  testsFailed: number;
  reviewFindings: string[];
  blockerCount: number;
  latencySeconds: number;
  costUsd: number;
};

export type CodingTaskEvaluation = CodingTask & {
  passRate: number;
  qualityScore: number;
  reviewRisk: "low" | "medium" | "high";
  deployable: boolean;
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const round = (value: number) => Math.round(value * 10) / 10;

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function tokenCoverage(left: string, right: string): number {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  if (leftTokens.size === 0) return 0;
  let intersection = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) intersection += 1;
  });
  return intersection / leftTokens.size;
}

export function evaluateTrust(example: QAExample): TrustEvaluation {
  const evidenceById = new Map(example.evidence.map((item) => [item.id, item]));

  const claims = example.claims.map<ClaimEvaluation>((claim) => {
    const cited = claim.evidenceIds
      .map((id) => evidenceById.get(id))
      .filter((item): item is Evidence => Boolean(item));

    const candidates = cited.length > 0 ? cited : example.evidence;
    const ranked = candidates
      .map((item) => ({ item, coverage: tokenCoverage(claim.text, item.text) }))
      .sort((a, b) => b.coverage - a.coverage);
    const best = ranked[0];
    const citationPresent = cited.length > 0;
    const supportScore = clamp(
      (best?.coverage ?? 0) * 75 +
        (citationPresent ? 10 : 0) +
        (best?.item.trust ?? 0) * 10 +
        (best?.item.freshness ?? 0) * 5,
    );

    return {
      claim: claim.text,
      supported: supportScore >= 62,
      supportScore: round(supportScore),
      citationPresent,
      sourceTrust: round((best?.item.trust ?? 0) * 100),
      freshness: round((best?.item.freshness ?? 0) * 100),
      matchedEvidence: best?.item,
    };
  });

  const supported = claims.filter((claim) => claim.supported).length;
  const cited = claims.filter((claim) => claim.citationPresent).length;
  const claimSupportRate = claims.length ? (supported / claims.length) * 100 : 0;
  const citationCoverage = claims.length ? (cited / claims.length) * 100 : 0;
  const unsupportedClaimRate = 100 - claimSupportRate;
  const sourceTrust = claims.length
    ? claims.reduce((sum, claim) => sum + claim.sourceTrust, 0) / claims.length
    : 0;
  const freshness = claims.length
    ? claims.reduce((sum, claim) => sum + claim.freshness, 0) / claims.length
    : 0;
  const overall =
    claimSupportRate * 0.42 +
    citationCoverage * 0.2 +
    sourceTrust * 0.2 +
    freshness * 0.08 +
    (100 - unsupportedClaimRate) * 0.1;

  return {
    overall: round(overall),
    claimSupportRate: round(claimSupportRate),
    citationCoverage: round(citationCoverage),
    unsupportedClaimRate: round(unsupportedClaimRate),
    sourceTrust: round(sourceTrust),
    freshness: round(freshness),
    claims,
  };
}

function keywordFit(profile: RecommendationProfile, company: Company): number {
  const query = new Set(profile.keywords.map((keyword) => keyword.toLowerCase()));
  const corpus = new Set(
    [...company.keywords, ...tokenize(company.description)].map((keyword) =>
      keyword.toLowerCase(),
    ),
  );
  if (query.size === 0) return 0;
  let matches = 0;
  query.forEach((keyword) => {
    if (corpus.has(keyword)) matches += 1;
  });
  return clamp((matches / query.size) * 100);
}

export function scoreCompany(
  profile: RecommendationProfile,
  company: Company,
): CompanyScore {
  const semanticFit = keywordFit(profile, company);
  const industryFit = profile.targetIndustries.includes(company.industry) ? 100 : 35;
  const regionFit = profile.targetRegions.includes(company.region) ? 100 : 45;
  const needSignal = clamp(company.hiringSignals.length * 28);
  const partnershipSignal = clamp(company.partnershipSignals.length * 34);
  const budgetSignal = clamp(company.budgetSignal * 100);
  const contactability = clamp(company.contactability * 100);
  const evidenceQuality = clamp(company.evidenceQuality * 100);
  const freshness = clamp(company.freshness * 100);

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

  const rationale = [
    semanticFit >= 60 ? "Strong product and capability overlap" : null,
    needSignal >= 56 ? "Multiple active hiring or operational need signals" : null,
    partnershipSignal >= 68 ? "Clear partnership or ecosystem readiness" : null,
    budgetSignal >= 70 ? "Strong inferred budget capacity" : null,
    evidenceQuality >= 80 ? "Recommendation is supported by high-quality evidence" : null,
  ].filter((item): item is string => Boolean(item));

  const risks = [
    contactability < 60 ? "No strong verified contact path" : null,
    freshness < 70 ? "Some evidence may be stale" : null,
    evidenceQuality < 70 ? "Recommendation needs additional source verification" : null,
    semanticFit < 50 ? "Product fit is indirect" : null,
  ].filter((item): item is string => Boolean(item));

  return {
    company,
    total: round(total),
    semanticFit: round(semanticFit),
    industryFit,
    regionFit,
    needSignal,
    budgetSignal,
    partnershipSignal,
    contactability,
    evidenceQuality,
    freshness,
    rationale,
    risks,
  };
}

export function rankCompanies(
  profile: RecommendationProfile,
  companies: Company[],
): CompanyScore[] {
  return companies
    .map((company) => scoreCompany(profile, company))
    .sort((a, b) => b.total - a.total);
}

export function evaluateCodingTask(task: CodingTask): CodingTaskEvaluation {
  const totalTests = task.testsPassed + task.testsFailed;
  const passRate = totalTests ? (task.testsPassed / totalTests) * 100 : 0;
  const coverageProxy = Math.min(100, task.generatedTests * 12.5);
  const reviewPenalty = task.reviewFindings.length * 4 + task.blockerCount * 18;
  const costPenalty = Math.min(12, task.costUsd * 12);
  const latencyPenalty = Math.min(10, task.latencySeconds / 12);
  const qualityScore = clamp(
    passRate * 0.55 + coverageProxy * 0.25 + 20 - reviewPenalty - costPenalty - latencyPenalty,
  );
  const reviewRisk = task.blockerCount > 0 ? "high" : task.reviewFindings.length > 2 ? "medium" : "low";

  return {
    ...task,
    passRate: round(passRate),
    qualityScore: round(qualityScore),
    reviewRisk,
    deployable: passRate === 100 && task.blockerCount === 0 && qualityScore >= 72,
  };
}
