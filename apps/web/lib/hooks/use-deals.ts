"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDeals, type Deal } from "../deals";

interface UseDealsOptions {
  userId?: string;
  initialDeals?: Deal[];
  refetchIntervalMs?: number;
}

export function useDeals({
  userId,
  initialDeals,
  refetchIntervalMs = 30_000,
}: UseDealsOptions) {
  return useQuery<Deal[]>({
    queryKey: ["deals", userId ?? "default"],
    queryFn: () => fetchDeals(userId),
    initialData: initialDeals,
    initialDataUpdatedAt: initialDeals ? Date.now() : undefined,
    refetchInterval: refetchIntervalMs,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
  });
}
