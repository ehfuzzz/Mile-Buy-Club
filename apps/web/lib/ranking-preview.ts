/**
 * computeUiScore translates deal economics into a UI-friendly 0-100 score.
 * The heuristic rewards lower cash prices, stronger cents-per-point (cpp) ratios,
 * fewer miles required, premium cabins, and recent discoveries. Each component is
 * normalized between 0 and 1 before weighting, providing a monotonic relationship
 * with price/cpp so UI badges remain stable until the shared back-end model lands.
 */
export function computeUiScore(deal: {
  price: number;
  cpp: number;
  milesRequired: number;
  cabin: string;
  airline?: string;
  createdAt: string | number | Date;
}): number {
  const MAX_PRICE = 5000;
  const MAX_CPP = 10;
  const MAX_MILES = 300000;
  const MAX_AGE_DAYS = 30;

  const cabinWeights: Record<string, number> = {
    first: 1,
    "first class": 1,
    business: 0.85,
    "business class": 0.85,
    premium: 0.7,
    "premium economy": 0.7,
    economy: 0.5
  };

  const priceFactor = clamp(1 - deal.price / MAX_PRICE);
  const cppFactor = clamp(deal.cpp / MAX_CPP);
  const milesFactor = clamp(1 - deal.milesRequired / MAX_MILES);

  const cabinKey = deal.cabin.toLowerCase();
  const cabinFactor = cabinWeights[cabinKey] ?? 0.6;

  const createdDate = new Date(deal.createdAt);
  const ageMs = Date.now() - createdDate.getTime();
  const ageDays = Number.isFinite(ageMs) ? ageMs / (1000 * 60 * 60 * 24) : MAX_AGE_DAYS;
  const recencyFactor = clamp(1 - ageDays / MAX_AGE_DAYS);

  const weighted =
    priceFactor * 0.35 +
    cppFactor * 0.3 +
    milesFactor * 0.15 +
    cabinFactor * 0.15 +
    recencyFactor * 0.05;

  return Math.round(clamp(weighted) * 100);
}

function clamp(value: number, min = 0, max = 1) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}
