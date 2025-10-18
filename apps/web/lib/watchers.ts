import { z } from "zod";

export type WatcherStatus = "active" | "paused" | "error";

export interface WatcherRoute {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  isRoundTrip: boolean;
}

export interface WatcherCriteria {
  maxPrice: number;
  minCpp: number;
  cabinClass: string;
  passengers: number;
  seatPreference: string;
  airlines: string[];
  excludeAirlines: string[];
  blackoutDates: string[];
}

export interface WatcherFilters {
  maxStops: number;
  departureTime: string[];
  aircraftTypes: string[];
  alliances: string[];
}

export interface WatcherNotificationSettings {
  email: boolean;
  push: boolean;
  frequency: "immediate" | "hourly" | "daily";
  quietHours: { start: string; end: string };
}

export interface WatcherPerformance {
  dealsFound: number;
  lastRun: string;
}

export interface WatcherSummary {
  id: string;
  name: string;
  route: WatcherRoute;
  criteria: WatcherCriteria;
  filters: WatcherFilters;
  notifications: WatcherNotificationSettings;
  status: WatcherStatus;
  performance: WatcherPerformance;
}

export interface WatcherFilterState {
  status: WatcherStatus | "all";
  search: string;
  airlines: string[];
}

export interface CreateWatcherPayload {
  name: string;
  route: WatcherRoute;
  criteria: WatcherCriteria;
  filters: WatcherFilters;
  notifications: WatcherNotificationSettings;
}

export function formatRoute(route: WatcherRoute) {
  const base = `${route.origin.toUpperCase()} → ${route.destination.toUpperCase()}`;
  if (!route.isRoundTrip || !route.returnDate) {
    return base;
  }
  return `${base} (Round-trip)`;
}

export function generateMockWatcher(id: number): WatcherSummary {
  const today = new Date();
  today.setHours(9, 0, 0, 0);
  return {
    id: `watcher-${id}`,
    name: `Business class to JFK #${id}`,
    route: {
      origin: "LAX",
      destination: "JFK",
      departureDate: today.toISOString(),
      returnDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      isRoundTrip: true
    },
    criteria: {
      maxPrice: 650,
      minCpp: 2.1,
      cabinClass: "business",
      passengers: 2,
      seatPreference: "window",
      airlines: ["Delta", "American"],
      excludeAirlines: ["Spirit"],
      blackoutDates: []
    },
    filters: {
      maxStops: 1,
      departureTime: ["morning", "afternoon"],
      aircraftTypes: ["A321", "B777"],
      alliances: ["SkyTeam", "oneworld"]
    },
    notifications: {
      email: true,
      push: true,
      frequency: "immediate",
      quietHours: { start: "22:00", end: "06:00" }
    },
    status: id % 3 === 0 ? "paused" : "active",
    performance: {
      dealsFound: 14 - id,
      lastRun: new Date(Date.now() - id * 3600 * 1000).toISOString()
    }
  };
}

export async function fetchWatchers(): Promise<WatcherSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return Array.from({ length: 4 }, (_, index) => generateMockWatcher(index + 1));
}

export function filterWatchers(
  watchers: WatcherSummary[],
  filters: WatcherFilterState
): WatcherSummary[] {
  return watchers.filter((watcher) => {
    if (filters.status !== "all" && watcher.status !== filters.status) {
      return false;
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      if (!watcher.name.toLowerCase().includes(query) && !watcher.route.destination.toLowerCase().includes(query)) {
        return false;
      }
    }

    if (filters.airlines.length > 0) {
      const matchesAirline = filters.airlines.some((airline) => watcher.criteria.airlines.includes(airline));
      if (!matchesAirline) {
        return false;
      }
    }

    return true;
  });
}

export async function createWatcher(payload: CreateWatcherPayload) {
  const response = await fetch("/api/watchers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to create watcher");
  }

  return response.json();
}

export async function pauseWatcher(id: string) {
  console.info("Pausing watcher", id);
}

export async function resumeWatcher(id: string) {
  console.info("Resuming watcher", id);
}

export async function deleteWatcher(id: string) {
  console.info("Deleting watcher", id);
}

export const watcherFormSchema = z.object({
  name: z.string().min(3, "Give your watcher a descriptive name."),
  route: z
    .object({
      origin: z.string().min(3, "Origin airport code is required."),
      destination: z.string().min(3, "Destination airport code is required."),
      departureDate: z.string().min(1, "Select a departure date."),
      returnDate: z.string().optional(),
      isRoundTrip: z.boolean()
    })
    .refine(
      (route) => (route.isRoundTrip ? Boolean(route.returnDate) : true),
      {
        message: "Return date is required for round-trip watchers.",
        path: ["returnDate"]
      }
    ),
  criteria: z.object({
    maxPrice: z.number().min(0, "Price must be positive."),
    minCpp: z.number().min(0, "CPP cannot be negative."),
    cabinClass: z.string().min(1, "Select a cabin class."),
    passengers: z
      .number({ invalid_type_error: "Enter the number of passengers." })
      .min(1, "At least one passenger required.")
      .max(9, "Maximum 9 passengers."),
    seatPreference: z.string().min(1).default("any"),
    airlines: z.array(z.string()).default([]),
    excludeAirlines: z.array(z.string()).default([]),
    blackoutDates: z.array(z.string()).default([])
  }),
  filters: z.object({
    maxStops: z.number().min(0).max(2),
    departureTime: z.array(z.string()).default([]),
    aircraftTypes: z.array(z.string()).default([]),
    alliances: z.array(z.string()).default([])
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    frequency: z.enum(["immediate", "hourly", "daily"]),
    quietHours: z.object({
      start: z.string(),
      end: z.string()
    })
  })
});

export type WatcherFormValues = z.infer<typeof watcherFormSchema>;

export const DEFAULT_WATCHER_FORM_VALUES: WatcherFormValues = {
  name: "",
  route: {
    origin: "",
    destination: "",
    departureDate: new Date().toISOString().slice(0, 10),
    returnDate: new Date().toISOString().slice(0, 10),
    isRoundTrip: true
  },
  criteria: {
    maxPrice: 1000,
    minCpp: 1.5,
    cabinClass: "economy",
    passengers: 1,
    seatPreference: "any",
    airlines: [],
    excludeAirlines: [],
    blackoutDates: []
  },
  filters: {
    maxStops: 1,
    departureTime: [],
    aircraftTypes: [],
    alliances: []
  },
  notifications: {
    email: true,
    push: false,
    frequency: "immediate",
    quietHours: {
      start: "22:00",
      end: "06:00"
    }
  }
};
