"use client";

import { useEffect, useState } from "react";
import type { WatcherFilterState } from "../../lib/watchers";

const STATUS_OPTIONS: { value: WatcherFilterState["status"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "error", label: "Needs attention" }
];

interface WatcherFiltersProps {
  value: WatcherFilterState;
  onChange: (next: WatcherFilterState) => void;
  airlineOptions: string[];
}

export function WatcherFilters({ value, onChange, airlineOptions }: WatcherFiltersProps) {
  const [search, setSearch] = useState(value.search);
  const [status, setStatus] = useState<WatcherFilterState["status"]>(value.status);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(value.airlines);

  useEffect(() => {
    setSearch(value.search);
    setStatus(value.status);
    setSelectedAirlines(value.airlines);
  }, [value.search, value.status, value.airlines]);

  useEffect(() => {
    const next: WatcherFilterState = {
      status,
      search,
      airlines: selectedAirlines
    };
    onChange(next);
  }, [search, status, selectedAirlines, onChange]);

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((current) =>
      current.includes(airline) ? current.filter((item) => item !== airline) : [...current, airline]
    );
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by destination or watcher name"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as WatcherFilterState["status"])}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-slate-600">Airlines</span>
          <div className="flex flex-wrap gap-2">
            {airlineOptions.map((airline) => {
              const selected = selectedAirlines.includes(airline);
              return (
                <button
                  key={airline}
                  type="button"
                  onClick={() => toggleAirline(airline)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                    selected
                      ? "border-slate-900 bg-slate-900/90 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {airline}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
