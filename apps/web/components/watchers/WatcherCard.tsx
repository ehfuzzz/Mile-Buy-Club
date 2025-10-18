"use client";

import { formatDistanceToNow } from "date-fns";
import type { WatcherSummary } from "../../lib/watchers";

interface WatcherCardProps {
  watcher: WatcherSummary;
  onPause: (watcher: WatcherSummary) => void;
  onResume: (watcher: WatcherSummary) => void;
  onDelete: (watcher: WatcherSummary) => void;
  onEdit: (watcher: WatcherSummary) => void;
}

export function WatcherCard({ watcher, onPause, onResume, onDelete, onEdit }: WatcherCardProps) {
  const isPaused = watcher.status === "paused";

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{watcher.name}</h3>
          <p className="text-sm text-slate-500">
            {watcher.route.origin} → {watcher.route.destination}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${
              watcher.status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : watcher.status === "paused"
                ? "bg-slate-100 text-slate-600"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {watcher.status}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">
            Last run {formatDistanceToNow(new Date(watcher.performance.lastRun), { addSuffix: true })}
          </span>
        </div>
      </div>

      <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-medium text-slate-500">Cabin</dt>
          <dd className="capitalize">{watcher.criteria.cabinClass}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Price cap</dt>
          <dd>${watcher.criteria.maxPrice.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">CPP threshold</dt>
          <dd>{watcher.criteria.minCpp.toFixed(2)}¢</dd>
        </div>
        <div>
          <dt className="font-medium text-slate-500">Deals found</dt>
          <dd>{watcher.performance.dealsFound}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        {watcher.criteria.airlines.length > 0 ? (
          <span className="rounded-full border border-slate-200 px-3 py-1">
            Airlines: {watcher.criteria.airlines.join(", ")}
          </span>
        ) : null}
        {watcher.filters.departureTime.length > 0 ? (
          <span className="rounded-full border border-slate-200 px-3 py-1">
            Departure: {watcher.filters.departureTime.join(", ")}
          </span>
        ) : null}
        {watcher.notifications.quietHours ? (
          <span className="rounded-full border border-slate-200 px-3 py-1">
            Quiet hours: {watcher.notifications.quietHours.start}–{watcher.notifications.quietHours.end}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Route window: {new Date(watcher.route.departureDate).toLocaleDateString()} → {watcher.route.returnDate ? new Date(watcher.route.returnDate).toLocaleDateString() : "Flexible"}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(watcher)}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => (isPaused ? onResume(watcher) : onPause(watcher))}
            className="rounded-full border border-slate-900 px-4 py-1.5 text-sm font-medium text-slate-900 transition hover:bg-slate-900/90 hover:text-white"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(watcher)}
            className="rounded-full border border-rose-200 px-4 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
