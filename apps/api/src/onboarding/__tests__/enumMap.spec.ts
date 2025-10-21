import { normalizeCabin, normalizeAlertMode, normalizeAlliance } from '@mile/shared';

describe('enum mapping helpers', () => {
  it('normalizes cabin values', () => {
    expect(normalizeCabin('business')).toBe('J');
    expect(normalizeCabin('Premium Economy')).toBe('W');
    expect(normalizeCabin('economy')).toBe('Y');
  });

  it('normalizes alert modes', () => {
    expect(normalizeAlertMode('digest')).toBe('DIGEST');
    expect(normalizeAlertMode('high quality')).toBe('HIGH_QUALITY');
  });

  it('normalizes alliance names', () => {
    expect(normalizeAlliance('star alliance')).toBe('STAR');
    expect(normalizeAlliance('SkyTeam')).toBe('SKYTEAM');
    expect(normalizeAlliance('unknown')).toBeNull();
  });
});
