import { applyStatePatch } from '../state-machine';
import { STATE_PATCH_SCHEMA, USER_STATE_SCHEMA, createDefaultUserState } from '@mile/shared';

describe('onboarding state machine', () => {
  it('creates a default state that passes validation', () => {
    const state = createDefaultUserState();
    expect(() => USER_STATE_SCHEMA.parse(state)).not.toThrow();
  });

  it('applies allowed set operations', () => {
    const current = createDefaultUserState();
    const patch = STATE_PATCH_SCHEMA.parse({
      baseVersion: current.version,
      ops: [{ op: 'set', path: '/travelPrefs/homeAirports', value: ['JFK', 'SFO'] }],
    });

    const result = applyStatePatch(current, patch);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userState.travelPrefs.homeAirports).toEqual(['JFK', 'SFO']);
    }
  });

  it('rejects unknown paths', () => {
    const current = createDefaultUserState();
    const patch = STATE_PATCH_SCHEMA.parse({
      baseVersion: current.version,
      ops: [{ op: 'set', path: '/unknown/path', value: 'noop' }],
    });

    const result = applyStatePatch(current, patch);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].code).toBe('PATCH_PATH_NOT_ALLOWED');
    }
  });

  it('rejects invalid types that fail schema validation', () => {
    const current = createDefaultUserState();
    const patch = STATE_PATCH_SCHEMA.parse({
      baseVersion: current.version,
      ops: [{ op: 'set', path: '/travelPrefs/homeAirports', value: 'JFK' }],
    });

    const result = applyStatePatch(current, patch);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].path).toBe('/travelPrefs/homeAirports');
    }
  });

  it('fails closed when removing required fields', () => {
    const current = createDefaultUserState();
    const patch = STATE_PATCH_SCHEMA.parse({
      baseVersion: current.version,
      ops: [{ op: 'remove', path: '/onboarding/status' }],
    });

    const result = applyStatePatch(current, patch);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].code).toBe('STATE_VALIDATION_FAILED');
    }
  });

  it('supports array additions on allowed paths', () => {
    const current = createDefaultUserState();
    const patch = STATE_PATCH_SCHEMA.parse({
      baseVersion: current.version,
      ops: [
        { op: 'add', path: '/points/programs', value: { programId: 'AEROPLAN', balance: 5000 } },
        { op: 'add', path: '/hotelPrefs/chains', value: 'HYATT' },
      ],
    });

    const result = applyStatePatch(current, patch);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userState.points.programs).toEqual([{ programId: 'AEROPLAN', balance: 5000 }]);
      expect(result.userState.hotelPrefs.chains).toEqual(['HYATT']);
    }
  });
});
