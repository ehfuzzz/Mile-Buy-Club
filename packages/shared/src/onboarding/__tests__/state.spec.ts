import { describe, expect, it } from '@jest/globals';
import { applyStatePatch, computeMissingFields, constraintsToRules, OnboardingStatePatchError } from '../state';

describe('applyStatePatch', () => {
  const baseState = {};

  it('sets simple fields', () => {
    const result = applyStatePatch(baseState, { set: { passengers: 2, cabin: 'business' } });
    expect(result.passengers).toBe(2);
    expect(result.cabin).toBe('business');
  });

  it('adds to set while preserving uniqueness', () => {
    const result = applyStatePatch({ homeAirports: ['JFK'] }, { addToSet: { homeAirports: ['EWR', 'JFK'] } });
    expect(result.homeAirports).toEqual(['JFK', 'EWR']);
  });

  it('unsets fields', () => {
    const result = applyStatePatch({ passengers: 1, notes: 'hi' }, { unset: ['notes'] });
    expect(result.notes).toBeUndefined();
    expect(result.passengers).toBe(1);
  });

  it('rejects invalid IATA codes', () => {
    expect(() => applyStatePatch(baseState, { set: { homeAirports: ['JFK', 'bad'] } })).toThrow(OnboardingStatePatchError);
  });

  it('rejects invalid dates', () => {
    expect(() => applyStatePatch(baseState, { set: { dateRange: { start: '2024/01/01' } } })).toThrow(OnboardingStatePatchError);
  });

  it('rejects negative passengers', () => {
    expect(() => applyStatePatch(baseState, { set: { passengers: 0 } })).toThrow(OnboardingStatePatchError);
  });
});

describe('computeMissingFields', () => {
  it('returns canonical list of missing fields', () => {
    const missing = computeMissingFields({});
    expect(missing).toEqual(['homeAirports', 'destination', 'dateRange', 'passengers']);
  });

  it('omits fields that are present', () => {
    const missing = computeMissingFields({
      homeAirports: ['JFK'],
      destinationAirports: ['LAX'],
      dateRange: { start: '2024-01-01' },
      passengers: 2,
    });
    expect(missing).toEqual([]);
  });
});

describe('constraintsToRules', () => {
  it('creates stable rules for provided fields', () => {
    const rules = constraintsToRules({
      homeAirports: ['JFK'],
      destinationAirports: ['LAX'],
      dateRange: { start: '2024-01-01', end: '2024-01-10', flexibleDays: 2 },
      passengers: 2,
      maxPoints: 100000,
      avoidRedEye: true,
      maxStops: 1,
    });

    const ids = rules.map((r) => r.id);
    expect(ids).toContain('rule_homeAirports');
    expect(ids).toContain('rule_destinationAirports');
    expect(ids).toContain('rule_dateRange');
    expect(ids).toContain('rule_passengers');
    expect(ids).toContain('rule_maxPoints');
    expect(ids).toContain('rule_avoidRedEye');
    expect(ids).toContain('rule_maxStops');
  });
});
