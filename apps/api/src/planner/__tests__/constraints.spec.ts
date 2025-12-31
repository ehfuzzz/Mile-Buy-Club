import { applyConstraints, validateCandidate } from '../constraints';
import { TripQuery, CachedAwardCandidate } from '@mile/shared';

const baseQuery: TripQuery = {
  origins: ['JFK'],
  destinations: ['LHR'],
  dateWindow: { start: '2024-01-01', end: '2024-01-10' },
  cabin: 'business',
  passengers: 1,
  allowStaleCache: false,
};

const buildCandidate = (overrides: Partial<CachedAwardCandidate> = {}): CachedAwardCandidate => ({
  id: 'cand-1',
  provider: 'cache',
  airline: 'AA',
  program: 'aa',
  cabin: 'business',
  origin: 'JFK',
  destination: 'LHR',
  departAt: '2024-01-05T23:30:00Z',
  arriveAt: '2024-01-06T06:30:00Z',
  stops: 0,
  pointsCost: 50000,
  taxesFeesUsd: 5,
  bookingUrl: null,
  bookingLinkStatus: 'unavailable_in_cache',
  cacheUpdatedAt: new Date().toISOString(),
  fetchedAt: new Date().toISOString(),
  availability: 4,
  ...overrides,
});

describe('constraints', () => {
  it('passes when candidate matches cabin and stops', () => {
    const candidate = buildCandidate();
    const result = validateCandidate(candidate, { ...baseQuery, maxStops: 1 });
    expect(result.passed).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.passedCodes).toContain('CABIN_OK');
    expect(result.passedCodes).toContain('STOPS_OK');
  });

  it('fails when stops exceed max', () => {
    const query = { ...baseQuery, maxStops: 0 };
    const candidate = buildCandidate({ stops: 2 });
    const result = validateCandidate(candidate, query);
    expect(result.passed).toBe(false);
    expect(result.violations[0].code).toBe('TOO_MANY_STOPS');
  });

  it('fails closed when stops unknown', () => {
    const query = { ...baseQuery, maxStops: 1 };
    const candidate = buildCandidate({ stops: undefined });
    const result = validateCandidate(candidate, query);
    expect(result.passed).toBe(false);
    expect(result.violations[0].code).toBe('STOPS_UNKNOWN');
  });

  it('flags redeyes when disallowed', () => {
    const query = { ...baseQuery, noRedeyes: true };
    const candidate = buildCandidate({ departAt: '2024-01-05T23:30:00Z', arriveAt: '2024-01-06T06:30:00Z' });
    const result = validateCandidate(candidate, query);
    expect(result.passed).toBe(false);
    expect(result.violations[0].code).toBe('REDEYE_DISALLOWED');
  });

  it('fails closed when redeye cannot be verified', () => {
    const query = { ...baseQuery, noRedeyes: true };
    const candidate = buildCandidate({ departAt: null, arriveAt: null });
    const result = validateCandidate(candidate, query);
    expect(result.passed).toBe(false);
    expect(result.violations[0].code).toBe('REDEYE_UNVERIFIED');
  });

  it('fails closed for insufficient seats when passengers > availability', () => {
    const query = { ...baseQuery, passengers: 3 };
    const candidate = buildCandidate({ availability: 2 });
    const result = validateCandidate(candidate, query);
    expect(result.passed).toBe(false);
    expect(result.violations[0].code).toBe('INSUFFICIENT_SEATS');
  });

  it('fails closed when availability is missing and passengers > 1', () => {
    const query = { ...baseQuery, passengers: 2 };
    const candidate = buildCandidate({ availability: undefined });
    const result = validateCandidate(candidate, query);
    expect(result.passed).toBe(false);
    expect(result.violations[0].code).toBe('SEATS_UNVERIFIED');
  });

  it('returns accepted and rejected buckets in applyConstraints', () => {
    const query = { ...baseQuery, maxStops: 1 };
    const candidates = [buildCandidate({ stops: 0 }), buildCandidate({ id: 'c2', stops: 3 })];
    const { accepted, rejected } = applyConstraints(candidates, query);
    expect(accepted).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(accepted[0].candidateId).toBe('cand-1');
    expect(rejected[0].code).toBe('TOO_MANY_STOPS');
  });
});
