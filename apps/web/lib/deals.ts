import { z } from "zod";
import { computeUiScore } from "./ranking-preview";

export interface DealRoute {
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  airline: string;
  aircraft: string;
}

export interface DealPricing {
  cashPrice: number;
  milesRequired: number;
  cpp: number;
  savings: number;
}

export interface DealValue {
  score: number;
  rating: "excellent" | "good" | "fair" | "poor";
  badges: string[];
}

export interface DealMetadata {
  discoveredAt: string;
  expiresAt?: string;
  source: string;
  affiliateUrl: string;
}

export interface Deal {
  id: string;
  route: DealRoute;
  pricing: DealPricing;
  value: DealValue;
  metadata: DealMetadata;
}

export const dealFilterSchema = z.object({
  price: z.tuple([z.number().min(0), z.number().min(0)]),
  miles: z.tuple([z.number().min(0), z.number().min(0)]),
  cpp: z.tuple([z.number().min(0), z.number().min(0)]),
  airlines: z.array(z.string()),
  cabins: z.array(z.string()),
  stops: z.union([z.literal("any"), z.literal("0"), z.literal("1"), z.literal("2+")]),
  departureWindow: z.tuple([z.string(), z.string()]),
  valueScore: z.number().min(0).max(100),
  dateRange: z.tuple([z.string().nullable(), z.string().nullable()])
});

export type DealFilterState = z.infer<typeof dealFilterSchema>;

export const DEFAULT_DEAL_FILTERS: DealFilterState = {
  price: [0, 5000],
  miles: [0, 200000],
  cpp: [0, 10],
  airlines: [],
  cabins: [],
  stops: "any",
  departureWindow: ["00:00", "23:59"],
  valueScore: 0,
  dateRange: [null, null]
};

export type DealSortOption =
  | "best"
  | "lowest-price"
  | "highest-cpp"
  | "fewest-miles"
  | "departure"
  | "age"
  | "airline";

export interface DealViewState {
  sort: DealSortOption;
  view: "grid" | "list" | "compact";
}

export function generateMockDeals(): Deal[] {
  const now = new Date();
  return [
    createMockDeal(1, now),
    createMockDeal(2, now),
    createMockDeal(3, now)
  ];
}

function createMockDeal(index: number, now: Date): Deal {
  const basePrice = 450 + index * 50;
  const milesRequired = 35000 + index * 5000;
  const cpp = Number(((basePrice / milesRequired) * 100).toFixed(2));
  const score = computeUiScore({
    price: basePrice,
    cpp,
    milesRequired,
    cabin: index % 2 === 0 ? "business" : "economy",
    airline: index % 2 === 0 ? "United" : "Delta",
    createdAt: new Date(now.getTime() - index * 3600 * 1000)
  });

  return {
    id: `deal-${index}`,
    route: {
      origin: "LAX",
      destination: "JFK",
      departure: new Date(now.getTime() + index * 3600 * 1000).toISOString(),
      arrival: new Date(now.getTime() + (index * 3600 + 18000) * 1000).toISOString(),
      duration: "05h 15m",
      stops: index % 3,
      airline: index % 2 === 0 ? "United" : "Delta",
      aircraft: index % 2 === 0 ? "B787" : "A321"
    },
    pricing: {
      cashPrice: basePrice,
      milesRequired,
      cpp,
      savings: 320 + index * 20
    },
    value: {
      score,
      rating: score > 80 ? "excellent" : score > 60 ? "good" : score > 40 ? "fair" : "poor",
      badges: score > 85 ? ["Hot Deal", "Limited Time"] : ["Solid Value"]
    },
    metadata: {
      discoveredAt: new Date(now.getTime() - index * 3600 * 1000).toISOString(),
      expiresAt: index % 2 === 0 ? new Date(now.getTime() + index * 7200 * 1000).toISOString() : undefined,
      source: "Mile Buy Club",
      affiliateUrl: "https://example.com/book"
    }
  };
}

export async function fetchDeals(): Promise<Deal[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return generateMockDeals();
}

export function applyDealFilters(deals: Deal[], filters: DealFilterState) {
  return deals.filter((deal) => {
    const priceMatch = deal.pricing.cashPrice >= filters.price[0] && deal.pricing.cashPrice <= filters.price[1];
    const milesMatch = deal.pricing.milesRequired >= filters.miles[0] && deal.pricing.milesRequired <= filters.miles[1];
    const cppMatch = deal.pricing.cpp >= filters.cpp[0] && deal.pricing.cpp <= filters.cpp[1];
    const scoreMatch = deal.value.score >= filters.valueScore;

    const airlineMatch = filters.airlines.length === 0 || filters.airlines.includes(deal.route.airline);
    const cabinMatch =
      filters.cabins.length === 0 || filters.cabins.includes(deal.value.badges.includes("Hot Deal") ? "business" : "economy");

    const stopsMatch =
      filters.stops === "any" ||
      (filters.stops === "0" && deal.route.stops === 0) ||
      (filters.stops === "1" && deal.route.stops === 1) ||
      (filters.stops === "2+" && deal.route.stops >= 2);

    if (filters.dateRange[0] && new Date(deal.route.departure) < new Date(filters.dateRange[0]!)) {
      return false;
    }
    if (filters.dateRange[1] && new Date(deal.route.departure) > new Date(filters.dateRange[1]!)) {
      return false;
    }

    return priceMatch && milesMatch && cppMatch && scoreMatch && airlineMatch && cabinMatch && stopsMatch;
  });
}

export function sortDeals(deals: Deal[], sort: DealSortOption): Deal[] {
  const sorted = [...deals];
  sorted.sort((a, b) => {
    switch (sort) {
      case "lowest-price":
        return a.pricing.cashPrice - b.pricing.cashPrice;
      case "highest-cpp":
        return b.pricing.cpp - a.pricing.cpp;
      case "fewest-miles":
        return a.pricing.milesRequired - b.pricing.milesRequired;
      case "departure":
        return new Date(a.route.departure).getTime() - new Date(b.route.departure).getTime();
      case "age":
        return new Date(b.metadata.discoveredAt).getTime() - new Date(a.metadata.discoveredAt).getTime();
      case "airline":
        return a.route.airline.localeCompare(b.route.airline);
      case "best":
      default:
        return b.value.score - a.value.score;
    }
  });
  return sorted;
}
