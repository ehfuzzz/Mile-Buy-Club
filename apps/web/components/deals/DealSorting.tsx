"use client";

import type { DealSortOption } from "../../lib/deals";

interface DealSortingProps {
  sort: DealSortOption;
  view: "grid" | "list" | "compact";
  onSortChange: (sort: DealSortOption) => void;
  onViewChange: (view: "grid" | "list" | "compact") => void;
}

const SORT_OPTIONS: { value: DealSortOption; label: string }[] = [
  { value: "best", label: "Best value" },
  { value: "lowest-price", label: "Lowest price" },
  { value: "highest-cpp", label: "Highest CPP" },
  { value: "fewest-miles", label: "Fewest miles" },
  { value: "departure", label: "Departure time" },
  { value: "age", label: "Newest" },
  { value: "airline", label: "Airline" }
];

const VIEW_OPTIONS: { value: "grid" | "list" | "compact"; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "compact", label: "Compact" }
];

export function DealSorting({ sort, view, onSortChange, onViewChange }: DealSortingProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-slate-600">Sort by</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as DealSortOption)}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium text-slate-600">View</span>
        {VIEW_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onViewChange(option.value)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
              view === option.value
                ? "border-slate-900 bg-slate-900/90 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
