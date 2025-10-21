const AIRLINE_CODE_MAP: Record<string, string> = {
  ua: 'UA',
  'united airlines': 'UA',
  united: 'UA',
  ac: 'AC',
  'air canada': 'AC',
  aa: 'AA',
  'american airlines': 'AA',
  american: 'AA',
  dl: 'DL',
  delta: 'DL',
  'delta air lines': 'DL',
  ba: 'BA',
  'british airways': 'BA',
  lh: 'LH',
  lufthansa: 'LH',
  af: 'AF',
  'air france': 'AF',
  kl: 'KL',
  'klm royal dutch airlines': 'KL',
  klm: 'KL',
  sq: 'SQ',
  'singapore airlines': 'SQ',
  nh: 'NH',
  'ana': 'NH',
  'all nippon airways': 'NH',
  jl: 'JL',
  'japan airlines': 'JL',
  qf: 'QF',
  qantas: 'QF',
  ek: 'EK',
  emirates: 'EK',
  qr: 'QR',
  'qatar airways': 'QR',
  tk: 'TK',
  turkish: 'TK',
  'turkish airlines': 'TK',
  va: 'VA',
  'virgin australia': 'VA',
  vs: 'VS',
  'virgin atlantic': 'VS',
  ib: 'IB',
  'iberia': 'IB',
  ay: 'AY',
  'finnair': 'AY',
  et: 'ET',
  ethiopian: 'ET',
  'ethiopian airlines': 'ET',
  ha: 'HA',
  'hawaiian airlines': 'HA',
  wn: 'WN',
  southwest: 'WN',
  'southwest airlines': 'WN',
  b6: 'B6',
  jetblue: 'B6',
  'jetblue airways': 'B6',
};

function normalizeKey(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  return value.trim().toLowerCase();
}

export function resolveAirlineCode(value?: string | null): string | null {
  const normalized = normalizeKey(value);
  if (!normalized) {
    return null;
  }
  if (AIRLINE_CODE_MAP[normalized]) {
    return AIRLINE_CODE_MAP[normalized];
  }
  const compact = normalized.replace(/[^a-z0-9]/g, '');
  if (compact.length === 2) {
    return compact.toUpperCase();
  }
  return null;
}

export const knownAirlineCodes = Array.from(
  new Set(Object.values(AIRLINE_CODE_MAP)),
).sort();
