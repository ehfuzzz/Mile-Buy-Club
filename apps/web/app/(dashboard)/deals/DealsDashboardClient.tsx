"use client";

import { formatDistanceToNow } from "date-fns";
import { Loader2, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";

import {
  DEFAULT_DEAL_FILTERS,
  applyDealFilters,
  sortDeals,
  type Deal,
  type DealFilterState,
  type DealSortOption,
} from "../../../lib/deals";
import { useDeals } from "../../../lib/hooks/use-deals";
import { DealCard } from "../../../components/deals/DealCard";
import { DealFilters } from "../../../components/deals/DealFilters";
import { DealSorting } from "../../../components/deals/DealSorting";

interface DealsDashboardClientProps {
  initialDeals?: Deal[];
  userId?: string;
}

export function DealsDashboardClient({ initialDeals, userId }: DealsDashboardClientProps) {
  const [filters, setFilters] = useState<DealFilterState>(DEFAULT_DEAL_FILTERS);
  const [sort, setSort] = useState<DealSortOption>("best");
  const [view, setView] = useState<"grid" | "list" | "compact">("grid");

  const { data: deals = [], error, isFetching, isLoading, refetch, dataUpdatedAt } = useDeals({
    userId,
    initialDeals,
  });

  const filteredAndSortedDeals = useMemo(() => {
    const filtered = applyDealFilters(deals, filters);
    return sortDeals(filtered, sort);
  }, [deals, filters, sort]);

  const airlineOptions = useMemo(
    () => Array.from(new Set(deals.map((deal) => deal.airline ?? deal.provider))).filter(Boolean).sort(),
    [deals],
  );
  const cabinOptions = ["Economy", "Premium", "Business", "First"];
  const watcherCount = useMemo(() => {
    if (!deals || deals.length === 0) {
      return 0;
    }
    const ids = new Set(deals.map((deal) => deal.watcherId));
    return ids.size;
  }, [deals]);

  const showLoadingState = (isLoading || (isFetching && deals.length === 0)) && !error;
  const errorMessage = error instanceof Error ? error.message : error ? "Failed to load deals." : null;
  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null;
  const statusLabel =
    showLoadingState && deals.length === 0
      ? "Loading live deals…"
      : isFetching
      ? "Refreshing…"
      : lastUpdated
      ? `Updated ${formatDistanceToNow(lastUpdated, { addSuffix: true })}`
      : "Waiting for data";

  const dealsLabel = filteredAndSortedDeals.length === 1 ? "deal" : "deals";
  const totalDealsLabel = deals.length === 1 ? "deal" : "deals";
  const watchersLabel = watcherCount === 1 ? "watcher" : "watchers";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Live award deals</h1>
        <p className="text-sm text-slate-600">
          Filter, sort, and explore real-time award availability pulled from your active watchers.
        </p>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-slate-900">
              {filteredAndSortedDeals.length.toLocaleString()} {dealsLabel}
            </span>
            <span className="hidden text-slate-400 md:inline">•</span>
            <span className="text-slate-500">
              {deals.length.toLocaleString()} total {totalDealsLabel} across {watcherCount} {watchersLabel}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : null}
              <span>{statusLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
        <span className="text-xs text-slate-400">Auto-refreshes every 30 seconds.</span>
        {errorMessage ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 md:text-sm">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <DealFilters
        value={filters}
        onChange={setFilters}
        airlineOptions={airlineOptions}
        cabinOptions={cabinOptions}
      />
      <DealSorting sort={sort} view={view} onSortChange={setSort} onViewChange={setView} />

      {showLoadingState ? (
        <DealsSkeleton view={view} />
      ) : (
        <section className={view === "grid" ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}>
          {filteredAndSortedDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} view={view} />
          ))}
          {filteredAndSortedDeals.length === 0 && !errorMessage ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No deals match the current filters. Try expanding your search criteria.
            </div>
          ) : null}
          {errorMessage && filteredAndSortedDeals.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
              Unable to load live deals right now. Please try refreshing.
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}

function DealsSkeleton({ view }: { view: "grid" | "list" | "compact" }) {
  const items = view === "compact" ? 6 : 4;

  return (
    <section className={view === "grid" ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse"
        >
          <div className="flex flex-col gap-3">
            <div className="h-5 w-1/3 rounded bg-slate-200/70" />
            <div className="h-4 w-2/3 rounded bg-slate-200/60" />
            <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
              <div className="h-4 rounded bg-slate-200/60" />
              <div className="h-4 rounded bg-slate-200/60" />
              <div className="h-4 rounded bg-slate-200/60" />
              <div className="h-4 rounded bg-slate-200/60" />
            </div>
          </div>
          <div className="h-10 w-full rounded bg-slate-200/60" />
        </div>
      ))}
    </section>
  );
}
