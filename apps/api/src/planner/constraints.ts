import { TripQuery, CachedAwardCandidate, ConstraintViolation, RankedOption } from '@mile/shared';

export interface ConstraintResult {
  passed: boolean;
  violations: ConstraintViolation[];
  passedCodes: string[];
}

const isRedeye = (departAt?: string | null, arriveAt?: string | null): boolean | null => {
  if (!departAt || !arriveAt) {
    return null;
  }

  const depart = new Date(departAt);
  const arrive = new Date(arriveAt);
  if (Number.isNaN(depart.getTime()) || Number.isNaN(arrive.getTime())) {
    return null;
  }

  const departHour = depart.getUTCHours();
  const arriveHour = arrive.getUTCHours();
  const depIsNight = departHour >= 22 || departHour < 5;
  const arrIsMorning = arriveHour >= 4 && arriveHour <= 8;
  return depIsNight && arrIsMorning;
};

export const validateCandidate = (
  candidate: CachedAwardCandidate,
  query: TripQuery,
): ConstraintResult => {
  const violations: ConstraintViolation[] = [];
  const passedCodes: string[] = [];

  if (query.cabin && candidate.cabin && candidate.cabin !== query.cabin) {
    violations.push({ code: 'CABIN_MISMATCH', message: `Expected cabin ${query.cabin}`, path: 'cabin' });
  } else {
    passedCodes.push('CABIN_OK');
  }

  if (typeof query.maxStops === 'number') {
    if (typeof candidate.stops === 'number') {
      if (candidate.stops > query.maxStops) {
        violations.push({
          code: 'TOO_MANY_STOPS',
          message: `Stops ${candidate.stops} exceed max ${query.maxStops}`,
          path: 'stops',
          meta: { candidateStops: candidate.stops, maxStops: query.maxStops },
        });
      } else {
        passedCodes.push('STOPS_OK');
      }
    } else {
      violations.push({ code: 'STOPS_UNKNOWN', message: 'Stops not available in cache', path: 'stops' });
    }
  }

  if (query.noRedeyes) {
    const redeye = isRedeye(candidate.departAt, candidate.arriveAt);
    if (redeye === null) {
      violations.push({ code: 'REDEYE_UNVERIFIED', message: 'Cannot verify redeye constraint', path: 'schedule' });
    } else if (redeye) {
      violations.push({ code: 'REDEYE_DISALLOWED', message: 'Redeye flights are not allowed', path: 'schedule' });
    } else {
      passedCodes.push('REDEYE_OK');
    }
  }

  if (query.passengers > 1) {
    if (typeof candidate.availability === 'number') {
      if (candidate.availability < query.passengers) {
        violations.push({
          code: 'INSUFFICIENT_SEATS',
          message: `Need ${query.passengers} seats but only ${candidate.availability} available`,
          path: 'availability',
        });
      } else {
        passedCodes.push('SEATS_OK');
      }
    } else {
      violations.push({
        code: 'SEATS_UNVERIFIED',
        message: 'Seat availability not present in cache',
        path: 'availability',
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    passedCodes,
  };
};

export const applyConstraints = (
  candidates: CachedAwardCandidate[],
  query: TripQuery,
): { accepted: RankedOption[]; rejected: ConstraintViolation[] } => {
  const accepted: RankedOption[] = [];
  const rejectedViolations: ConstraintViolation[] = [];

  for (const candidate of candidates) {
    const result = validateCandidate(candidate, query);
    if (result.passed) {
      accepted.push({
        candidateId: candidate.id,
        candidate,
        verified: true,
        score: 0,
        scoreBreakdown: [],
        passedConstraints: result.passedCodes,
        failedConstraints: [],
      });
    } else {
      rejectedViolations.push(...result.violations);
    }
  }

  return { accepted, rejected: rejectedViolations };
};
