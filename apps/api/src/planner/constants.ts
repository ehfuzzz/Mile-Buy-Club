export const CACHE_MAX_AGE_MINUTES = 45;
export const PLANNER_VERSION = 'cache_only_v1';
export const PLANNER_DATA_SOURCE = 'db_cache_only';

export function isCacheStale(
  freshestAt: string | undefined,
  maxMinutes: number = CACHE_MAX_AGE_MINUTES,
): boolean {
  if (!freshestAt) return true;
  const updated = new Date(freshestAt);
  if (Number.isNaN(updated.getTime())) return true;
  const ageMinutes = (Date.now() - updated.getTime()) / 60000;
  return ageMinutes > maxMinutes;
}
