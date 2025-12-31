import { rankOptions } from '../ranker';
import { CachedAwardCandidate } from '@mile/shared';

const candidate = (id: string, overrides: Partial<CachedAwardCandidate> = {}): CachedAwardCandidate => ({
  id,
  provider: 'cache',
  airline: 'AA',
  program: 'aa',
  cabin: 'business',
  origin: 'JFK',
  destination: 'LHR',
  departAt: '2024-01-05T10:00:00Z',
  arriveAt: '2024-01-05T18:00:00Z',
  stops: 0,
  pointsCost: 50000,
  taxesFeesUsd: 5,
  bookingUrl: null,
  bookingLinkStatus: 'unavailable_in_cache',
  cacheUpdatedAt: new Date().toISOString(),
  fetchedAt: new Date().toISOString(),
  availability: 2,
  ...overrides,
});

describe('ranker', () => {
  it('ranks by score then tie-breakers deterministically', () => {
    const accepted = [
      { candidateId: 'a', candidate: candidate('a', { pointsCost: 40000 }), verified: true, passedConstraints: [], failedConstraints: [] },
      { candidateId: 'b', candidate: candidate('b', { pointsCost: 50000, stops: 1 }), verified: true, passedConstraints: [], failedConstraints: [] },
      { candidateId: 'c', candidate: candidate('c', { pointsCost: 40000, cacheUpdatedAt: new Date(Date.now() - 1000).toISOString() }), verified: true, passedConstraints: [], failedConstraints: [] },
    ];

    const ranked = rankOptions(accepted, { preferredPrograms: ['aa'] });
    expect(ranked[0].candidateId).toBe('a');
    expect(ranked[1].candidateId).toBe('c');
    expect(ranked[2].candidateId).toBe('b');
    expect(ranked[0].scoreBreakdown.length).toBeGreaterThan(0);
  });

  it('includes program bonus when preferred', () => {
    const accepted = [
      { candidateId: 'a', candidate: candidate('a', { program: 'preferred' }), verified: true, passedConstraints: [], failedConstraints: [] },
    ];
    const ranked = rankOptions(accepted, { preferredPrograms: ['preferred'] });
    const programBreakdown = ranked[0].scoreBreakdown.find((b) => b.key === 'program_match');
    expect(programBreakdown?.value).toBeGreaterThan(0);
  });
});
