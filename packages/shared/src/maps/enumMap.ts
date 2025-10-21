import { z } from 'zod';

export type CabinCode = 'Y' | 'W' | 'J' | 'F';
export type AlertModeCode = 'HIGH_QUALITY' | 'DIGEST';
export type AllianceCode = 'STAR' | 'ONEWORLD' | 'SKYTEAM' | 'NONE';
export type PrefModeCode = 'PREFER' | 'AVOID';

const CABIN_MAP: Record<string, CabinCode> = {
  economy: 'Y',
  coach: 'Y',
  y: 'Y',
  main: 'Y',
  standard: 'Y',
  premium: 'W',
  'premium economy': 'W',
  w: 'W',
  business: 'J',
  biz: 'J',
  'biz class': 'J',
  'business class': 'J',
  j: 'J',
  first: 'F',
  'first class': 'F',
  f: 'F',
};

const ALERT_MODE_MAP: Record<string, AlertModeCode> = {
  high: 'HIGH_QUALITY',
  'high quality': 'HIGH_QUALITY',
  quality: 'HIGH_QUALITY',
  digest: 'DIGEST',
  summary: 'DIGEST',
  weekly: 'DIGEST',
};

const ALLIANCE_MAP: Record<string, AllianceCode> = {
  star: 'STAR',
  'star alliance': 'STAR',
  oneworld: 'ONEWORLD',
  'one world': 'ONEWORLD',
  skyteam: 'SKYTEAM',
  'sky team': 'SKYTEAM',
  none: 'NONE',
  independent: 'NONE',
};

const PREF_MODE_MAP: Record<string, PrefModeCode> = {
  prefer: 'PREFER',
  favorite: 'PREFER',
  favourites: 'PREFER',
  love: 'PREFER',
  avoid: 'AVOID',
  dislike: 'AVOID',
  nope: 'AVOID',
};

function normalizeKey(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.trim().toLowerCase();
}

export function normalizeCabin(value?: string | null): CabinCode | null {
  const normalized = normalizeKey(value);
  if (!normalized) {
    return null;
  }
  if (CABIN_MAP[normalized]) {
    return CABIN_MAP[normalized];
  }
  try {
    const directSchema = z.enum(['Y', 'W', 'J', 'F']);
    return directSchema.parse(normalized.toUpperCase()) as CabinCode;
  } catch {
    return null;
  }
}

export function normalizeAlertMode(value?: string | null): AlertModeCode | null {
  const normalized = normalizeKey(value);
  if (!normalized) {
    return null;
  }
  if (ALERT_MODE_MAP[normalized]) {
    return ALERT_MODE_MAP[normalized];
  }
  const direct = normalized.replace(/[-\s]/g, '_').toUpperCase();
  if (direct === 'HIGH_QUALITY' || direct === 'DIGEST') {
    return direct as AlertModeCode;
  }
  return null;
}

export function normalizeAlliance(value?: string | null): AllianceCode | null {
  const normalized = normalizeKey(value);
  if (!normalized) {
    return null;
  }
  if (ALLIANCE_MAP[normalized]) {
    return ALLIANCE_MAP[normalized];
  }
  const direct = normalized.replace(/[-\s]/g, '').toUpperCase();
  if (direct === 'STAR' || direct === 'ONEWORLD' || direct === 'SKYTEAM' || direct === 'NONE') {
    return direct as AllianceCode;
  }
  return null;
}

export function normalizePrefMode(value?: string | null): PrefModeCode | null {
  const normalized = normalizeKey(value);
  if (!normalized) {
    return null;
  }
  if (PREF_MODE_MAP[normalized]) {
    return PREF_MODE_MAP[normalized];
  }
  const direct = normalized.toUpperCase();
  if (direct === 'PREFER' || direct === 'AVOID') {
    return direct as PrefModeCode;
  }
  return null;
}
