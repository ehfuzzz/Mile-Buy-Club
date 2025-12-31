import { CachedAwardCandidate, RankedOption } from '@mile/shared';

interface RankContext {
  preferredPrograms?: string[];
  freshnessWeight?: number;
}

const DEFAULT_FRESHNESS_WEIGHT = 0.1;

const computeScore = (
  candidate: CachedAwardCandidate,
  context: RankContext,
): { score: number; breakdown: RankedOption['scoreBreakdown'] } => {
  const breakdown: RankedOption['scoreBreakdown'] = [];

  const points = candidate.pointsCost ?? 0;
  const pointsScore = points > 0 ? Math.max(0, 100 - Math.min(points / 1000, 80)) : 50;
  breakdown.push({ key: 'points', value: pointsScore, reason: 'Lower points cost is better' });

  const stops = typeof candidate.stops === 'number' ? candidate.stops : 2;
  const stopsScore = Math.max(0, 30 - stops * 10);
  breakdown.push({ key: 'stops', value: stopsScore, reason: 'Fewer stops preferred' });

  const updatedAt = candidate.cacheUpdatedAt ? new Date(candidate.cacheUpdatedAt).getTime() : Date.now();
  const ageMinutes = (Date.now() - updatedAt) / 60000;
  const freshnessWeight = context.freshnessWeight ?? DEFAULT_FRESHNESS_WEIGHT;
  const freshnessScore = Math.max(0, 20 - ageMinutes * freshnessWeight);
  breakdown.push({ key: 'freshness', value: freshnessScore, reason: 'Fresher cache preferred' });

  const programMatch = context.preferredPrograms?.includes(candidate.program ?? '') ? 10 : 0;
  breakdown.push({ key: 'program_match', value: programMatch, reason: 'Preferred program bonus' });

  const score = breakdown.reduce((sum, entry) => sum + entry.value, 0);
  return { score, breakdown };
};

export const rankOptions = (
  accepted: Omit<RankedOption, 'score' | 'scoreBreakdown'>[],
  context: RankContext,
): RankedOption[] => {
  const ranked = accepted.map((option) => {
    const { score, breakdown } = computeScore(option.candidate, context);
    return { ...option, score, scoreBreakdown: breakdown } satisfies RankedOption;
  });

  return ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const pointsA = a.candidate.pointsCost ?? Number.MAX_SAFE_INTEGER;
    const pointsB = b.candidate.pointsCost ?? Number.MAX_SAFE_INTEGER;
    if (pointsA !== pointsB) return pointsA - pointsB;
    const updatedA = a.candidate.cacheUpdatedAt;
    const updatedB = b.candidate.cacheUpdatedAt;
    if (updatedA && updatedB && updatedA !== updatedB) {
      return new Date(updatedB).getTime() - new Date(updatedA).getTime();
    }
    return a.candidateId.localeCompare(b.candidateId);
  });
};
