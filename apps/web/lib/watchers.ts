import { z } from "zod";
import { api } from "./api";
import type { Deal } from "./deals";

export type WatcherStatus = "active" | "paused" | "error";

export interface WatcherRoute {
  origin: string | null;
  destination: string | null;
  departureDate: string | null;
  returnDate: string | null;
  isRoundTrip: boolean;
}

export interface WatcherSummary {
  id: string;
  name: string;
  description: string | null;
  status: WatcherStatus;
  frequency: string;
  minScore: number;
  route: WatcherRoute;
  passengers: number;
  cabin: string | null;
  notifications: {
    email: boolean;
    push: boolean;
  };
  metrics: {
    dealsFound: number;
    lastRunAt: string | null;
    bestScore: number | null;
    availability: number | null;
  };
  airlines: string[];
  topDeals: Deal[];
  searchParams: Record<string, unknown>;
}

export interface WatcherStats {
  total: number;
  active: number;
  paused: number;
  error: number;
  totalDeals: number;
}

export interface WatcherResponse {
  watchers: WatcherSummary[];
  stats: WatcherStats;
  userId: string;
  lastUpdated: string;
}

export interface WatcherFilterState {
  status: WatcherStatus | "all";
  search: string;
  airlines: string[];
}

export async function fetchWatchers(userId?: string): Promise<WatcherResponse> {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const { success, data, error } = await api.get<WatcherResponse>(`/watchers${query}`);

  if (!success || !data) {
    throw new Error(error?.message ?? "Unable to load watchers");
  }

  return data;
}

export function filterWatchers(watchers: WatcherSummary[], filters: WatcherFilterState): WatcherSummary[] {
  return watchers.filter((watcher) => {
    if (filters.status !== "all" && watcher.status !== filters.status) {
      return false;
    }

    if (filters.search.trim().length > 0) {
      const term = filters.search.trim().toLowerCase();
      const matchFields = [
        watcher.name,
        watcher.route.origin ?? "",
        watcher.route.destination ?? "",
        watcher.description ?? "",
      ];

      if (!matchFields.some((field) => field.toLowerCase().includes(term))) {
        return false;
      }
    }

    if (filters.airlines.length > 0) {
      const hasAirline = watcher.airlines.some((airline) => filters.airlines.includes(airline));
      if (!hasAirline) {
        return false;
      }
    }

    return true;
  });
}

export async function createWatcher(payload: Record<string, unknown>) {
  const { success, error } = await api.post(`/watchers`, payload);
  if (!success) {
    throw new Error(error?.message ?? "Failed to create watcher");
  }
}

export async function pauseWatcher(id: string) {
  console.info("Pause watcher not yet implemented", id);
}

export async function resumeWatcher(id: string) {
  console.info("Resume watcher not yet implemented", id);
}

export async function deleteWatcher(id: string) {
  console.info("Delete watcher not yet implemented", id);
}

export const watcherFormSchema = z.object({
  name: z.string().min(3, "Give your watcher a descriptive name."),
  route: z
    .object({
      origin: z.string().min(3, "Origin airport code is required."),
      destination: z.string().min(3, "Destination airport code is required."),
      departureDate: z.string().min(1, "Select a departure date."),
      returnDate: z.string().optional(),
      isRoundTrip: z.boolean(),
    })
    .refine((route) => (route.isRoundTrip ? Boolean(route.returnDate) : true), {
      message: "Return date is required for round-trip watchers.",
      path: ["returnDate"],
    }),
  criteria: z.object({
    maxPrice: z.number().min(0, "Price must be positive."),
    minCpp: z.number().min(0, "CPP cannot be negative."),
    cabinClass: z.string().min(1, "Select a cabin class."),
    passengers: z
      .number({ invalid_type_error: "Enter the number of passengers." })
      .min(1, "At least one passenger required."),
    seatPreference: z.string().optional(),
    airlines: z.array(z.string()).default([]),
    excludeAirlines: z.array(z.string()).default([]),
    blackoutDates: z.array(z.string()).default([]),
  }),
  filters: z.object({
    maxStops: z.number().min(0).max(3),
    departureTime: z.array(z.string()),
    aircraftTypes: z.array(z.string()),
    alliances: z.array(z.string()),
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    frequency: z.enum(["immediate", "hourly", "daily"]),
    quietHours: z.object({ start: z.string(), end: z.string() }),
  }),
});
