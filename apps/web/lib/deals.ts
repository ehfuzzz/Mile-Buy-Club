import { api } from "./api";

export type DealPricingOptionType = "award" | "cash" | "points_plus_cash";

export interface DealPricingOption {
  type: DealPricingOptionType;
  cashAmount?: number;
  cashCurrency?: string;
  miles?: number;
  pointsCurrency?: string;
  provider?: string;
  bookingUrl?: string;
  description?: string;
  isEstimated?: boolean;
}

export interface DealPricing {
  primaryType: DealPricingOptionType;
  price: number;
  currency: string;
  milesRequired: number | null;
  cashPrice: number | null;
  cashCurrency: string | null;
  pointsCashPrice: number | null;
  pointsCashCurrency: string | null;
  pointsCashMiles: number | null;
  options: DealPricingOption[];
}

export interface DealRoute {
  origin: string | null;
  destination: string | null;
  departure: string | null;
  arrival: string | null;
  durationMinutes: number | null;
  stops: number | null;
  aircraft: string[] | null;
}

export interface Deal {
  id: string;
  watcherId: string;
  watcherName: string | null;
  provider: string;
  airline: string | null;
  cabin: string | null;
  route: DealRoute;
  availability: number | null;
  score: number;
  cpp: number | null;
  value: number | null;
  taxes: number | null;
  pricing: DealPricing;
  bookingUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  scoreBreakdown: Record<string, unknown> | null;
}

export interface DealsResponse {
  deals: Deal[];
  meta: {
    total: number;
    userId: string;
    watcherCount: number;
  };
}

export const dealFilterSchema = {
  price: [0, 5000] as [number, number],
  miles: [0, 200000] as [number, number],
  cpp: [0, 10] as [number, number],
  airlines: [] as string[],
  cabins: [] as string[],
  stops: "any" as "any" | "0" | "1" | "2+",
  departureWindow: ["00:00", "23:59"] as [string, string],
  valueScore: 0,
  dateRange: [null, null] as [string | null, string | null],
};

export type DealFilterState = typeof dealFilterSchema;

export const DEFAULT_DEAL_FILTERS: DealFilterState = {
  price: [...dealFilterSchema.price] as [number, number],
  miles: [...dealFilterSchema.miles] as [number, number],
  cpp: [...dealFilterSchema.cpp] as [number, number],
  airlines: [...dealFilterSchema.airlines],
  cabins: [...dealFilterSchema.cabins],
  stops: dealFilterSchema.stops,
  departureWindow: [...dealFilterSchema.departureWindow] as [string, string],
  valueScore: dealFilterSchema.valueScore,
  dateRange: [...dealFilterSchema.dateRange] as [string | null, string | null],
};

export type DealSortOption =
  | "best"
  | "lowest-price"
  | "highest-cpp"
  | "fewest-miles"
  | "departure"
  | "age"
  | "airline";

export async function fetchDeals(userId?: string): Promise<Deal[]> {
  try {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const { success, data, error } = await api.get<DealsResponse>(`/deals${query}`);

    if (!success || !data) {
      const message = error?.message ?? "Unable to load deals from API";
      throw new Error(message);
    }

    return data.deals;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch deals: ${message}`);
  }
}

export function applyDealFilters(deals: Deal[], filters: DealFilterState): Deal[] {
  return deals.filter((deal) => {
    const price = deal.pricing.price;
    if (price < filters.price[0] || price > filters.price[1]) {
      return false;
    }

    const miles = resolveMiles(deal);
    if (miles < filters.miles[0] || miles > filters.miles[1]) {
      return false;
    }

    const cpp = deal.cpp ?? 0;
    if (cpp < filters.cpp[0] || cpp > filters.cpp[1]) {
      return false;
    }

    if (filters.airlines.length > 0) {
      const airline = deal.airline ?? "";
      if (!filters.airlines.includes(airline)) {
        return false;
      }
    }

    if (filters.cabins.length > 0) {
      const cabin = (deal.cabin ?? "").toLowerCase();
      if (!filters.cabins.includes(cabin)) {
        return false;
      }
    }

  if (filters.stops !== "any") {
      const stops = deal.route.stops ?? 0;
      if (filters.stops === "0" && stops !== 0) {
        return false;
      }
      if (filters.stops === "1" && stops !== 1) {
        return false;
      }
      if (filters.stops === "2+" && stops < 2) {
        return false;
      }
    }

    if (!matchesDepartureWindow(deal.route.departure, filters.departureWindow)) {
      return false;
    }

    if (!matchesDateRange(deal.route.departure, filters.dateRange)) {
      return false;
    }

    if (deal.score < filters.valueScore) {
      return false;
    }

    return true;
  });
}

export function sortDeals(deals: Deal[], sort: DealSortOption): Deal[] {
  const sorted = [...deals];
  sorted.sort((a, b) => {
    switch (sort) {
      case "lowest-price":
        return a.pricing.price - b.pricing.price;
      case "highest-cpp":
        return (b.cpp ?? 0) - (a.cpp ?? 0);
      case "fewest-miles":
        return resolveMiles(a) - resolveMiles(b);
      case "departure":
        return getTime(a.route.departure) - getTime(b.route.departure);
      case "age":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "airline":
        return (a.airline ?? "").localeCompare(b.airline ?? "");
      case "best":
      default:
        return b.score - a.score;
    }
  });
  return sorted;
}

function resolveMiles(deal: Deal): number {
  if (typeof deal.pricing.milesRequired === "number") {
    return deal.pricing.milesRequired;
  }

  const awardOption = deal.pricing.options.find((option) => option.type === "award");
  if (awardOption?.miles) {
    return awardOption.miles;
  }

  const hybridOption = deal.pricing.options.find((option) => option.type === "points_plus_cash");
  if (hybridOption?.miles) {
    return hybridOption.miles;
  }

  return 0;
}

function matchesDepartureWindow(departure: string | null, [start, end]: [string, string]): boolean {
  if (!departure) {
    return true;
  }
  const date = new Date(departure);
  if (Number.isNaN(date.getTime())) {
    return true;
  }
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const time = hours * 60 + minutes;
  const startMinutes = parseTime(start);
  const endMinutes = parseTime(end);
  return time >= startMinutes && time <= endMinutes;
}

function matchesDateRange(departure: string | null, [start, end]: [string | null, string | null]): boolean {
  if (!departure) {
    return true;
  }
  const time = new Date(departure).getTime();
  if (Number.isNaN(time)) {
    return true;
  }

  if (start) {
    const startTime = new Date(start).getTime();
    if (time < startTime) {
      return false;
    }
  }

  if (end) {
    const endTime = new Date(end).getTime();
    if (time > endTime) {
      return false;
    }
  }

  return true;
}

function parseTime(value: string): number {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return (hours || 0) * 60 + (minutes || 0);
}

function getTime(value: string | null): number {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}
