"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_DEAL_FILTERS,
  applyDealFilters,
  sortDeals,
  type Deal,
  type DealFilterState,
  type DealSortOption
} from "../../../lib/deals";
import { DealCard } from "../../../components/deals/DealCard";
import { DealFilters } from "../../../components/deals/DealFilters";
import { DealSorting } from "../../../components/deals/DealSorting";

interface DealsDashboardClientProps {
  deals: Deal[];
}

export function DealsDashboardClient({ deals }: DealsDashboardClientProps) {
  const [filters, setFilters] = useState<DealFilterState>(DEFAULT_DEAL_FILTERS);
  const [sort, setSort] = useState<DealSortOption>("best");
  const [view, setView] = useState<"grid" | "list" | "compact">("grid");

  const filteredAndSortedDeals = useMemo(() => {
    const filtered = applyDealFilters(deals, filters);
    return sortDeals(filtered, sort);
  }, [deals, filters, sort]);

  const airlineOptions = useMemo(
    () => Array.from(new Set(deals.map((deal) => deal.airline ?? deal.provider))).filter(Boolean).sort(),
    [deals]
  );
  const cabinOptions = ["Economy", "Premium", "Business", "First"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Top deals</h1>
        <p className="text-sm text-slate-600">Filter, sort, and explore the latest award deals ranked by our value score.</p>
      </div>
      <DealFilters
        value={filters}
        onChange={setFilters}
        airlineOptions={airlineOptions}
        cabinOptions={cabinOptions}
      />
      <DealSorting sort={sort} view={view} onSortChange={setSort} onViewChange={setView} />
      <section className={view === "grid" ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}>
        {filteredAndSortedDeals.map((deal) => (
          <DealCard key={deal.id} deal={deal} view={view} />
        ))}
        {filteredAndSortedDeals.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No deals match the current filters. Try expanding your search criteria.
          </div>
        ) : null}
      </section>
    </div>
  );
}
