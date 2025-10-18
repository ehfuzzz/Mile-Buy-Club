"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  filterWatchers,
  pauseWatcher,
  resumeWatcher,
  deleteWatcher,
  type WatcherFilterState,
  type WatcherSummary
} from "../../../lib/watchers";
import { WatcherCard } from "../../../components/watchers/WatcherCard";
import { WatcherFilters } from "../../../components/watchers/WatcherFilters";

interface WatchersDashboardClientProps {
  initialWatchers: WatcherSummary[];
}

const DEFAULT_FILTERS: WatcherFilterState = {
  status: "all",
  search: "",
  airlines: []
};

export function WatchersDashboardClient({ initialWatchers }: WatchersDashboardClientProps) {
  const [filters, setFilters] = useState<WatcherFilterState>(DEFAULT_FILTERS);
  const [watchers, setWatchers] = useState<WatcherSummary[]>(initialWatchers);

  const filteredWatchers = useMemo(() => filterWatchers(watchers, filters), [filters, watchers]);

  const availableAirlines = useMemo(() => {
    const set = new Set<string>();
    for (const watcher of watchers) {
      watcher.criteria.airlines.forEach((airline) => set.add(airline));
    }
    return Array.from(set).sort();
  }, [watchers]);

  const updateWatcherStatus = (id: string, status: WatcherSummary["status"]) => {
    setWatchers((current) =>
      current.map((watcher) => (watcher.id === id ? { ...watcher, status } : watcher))
    );
  };

  const handlePause = async (watcher: WatcherSummary) => {
    updateWatcherStatus(watcher.id, "paused");
    await pauseWatcher(watcher.id);
  };

  const handleResume = async (watcher: WatcherSummary) => {
    updateWatcherStatus(watcher.id, "active");
    await resumeWatcher(watcher.id);
  };

  const handleDelete = async (watcher: WatcherSummary) => {
    setWatchers((current) => current.filter((item) => item.id !== watcher.id));
    await deleteWatcher(watcher.id);
  };

  const handleEdit = (watcher: WatcherSummary) => {
    console.info("Edit watcher", watcher.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Deal watchers</h1>
          <p className="text-sm text-slate-600">Create watchers to monitor award space across your favorite routes.</p>
        </div>
        <Link
          href="/watchers/create"
          className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          New watcher
        </Link>
      </div>
      <WatcherFilters
        value={filters}
        onChange={setFilters}
        airlineOptions={availableAirlines}
      />
      <div className="grid gap-4">
        {filteredWatchers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No watchers match your filters. Adjust the filters or create a new watcher.
          </div>
        ) : (
          filteredWatchers.map((watcher) => (
            <WatcherCard
              key={watcher.id}
              watcher={watcher}
              onPause={handlePause}
              onResume={handleResume}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
