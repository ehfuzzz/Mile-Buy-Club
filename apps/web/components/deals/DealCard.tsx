"use client";

import { format, formatDistanceToNow } from "date-fns";
import type { Deal } from "../../lib/deals";

interface DealCardProps {
  deal: Deal;
  view?: "grid" | "list" | "compact";
}

function getScoreColor(score: number) {
  if (score >= 85) return "bg-emerald-100 text-emerald-700";
  if (score >= 70) return "bg-sky-100 text-sky-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-700";
}

export function DealCard({ deal, view = "grid" }: DealCardProps) {
  const badges = deal.value.badges;
  const departure = new Date(deal.route.departure);
  const arrival = new Date(deal.route.arrival);

  return (
    <article
      className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md ${
        view === "compact" ? "sm:flex-row sm:items-center sm:justify-between" : ""
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-semibold text-slate-900">{deal.route.airline}</span>
          <span className="text-sm text-slate-500">
            {deal.route.origin} → {deal.route.destination}
          </span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getScoreColor(deal.value.score)}`}>
            Score {Math.round(deal.value.score)}
          </span>
        </div>
        <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-medium text-slate-500">Departure</p>
            <p>
              {format(departure, "MMM d, h:mm a")} ({deal.route.origin})
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Arrival</p>
            <p>
              {format(arrival, "MMM d, h:mm a")} ({deal.route.destination})
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Duration</p>
            <p>{deal.route.duration}</p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Stops</p>
            <p>{deal.route.stops === 0 ? "Direct" : `${deal.route.stops} stop${deal.route.stops > 1 ? "s" : ""}`}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 px-3 py-1">Aircraft {deal.route.aircraft}</span>
          <span className="rounded-full border border-slate-200 px-3 py-1">
            Discovered {formatDistanceToNow(new Date(deal.metadata.discoveredAt), { addSuffix: true })}
          </span>
          {deal.metadata.expiresAt ? (
            <span className="rounded-full border border-rose-200 px-3 py-1 text-rose-600">
              Expires {formatDistanceToNow(new Date(deal.metadata.expiresAt), { addSuffix: true })}
            </span>
          ) : null}
          {badges.map((badge) => (
            <span key={badge} className="rounded-full border border-amber-200 px-3 py-1 text-amber-600">
              {badge}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-semibold text-slate-900">${deal.pricing.cashPrice.toLocaleString()}</span>
          <span className="text-xs uppercase tracking-wide text-slate-500">cash</span>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-lg font-semibold text-slate-900">{deal.pricing.milesRequired.toLocaleString()} mi</span>
          <span className="text-xs uppercase tracking-wide text-slate-500">award</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{deal.pricing.cpp.toFixed(2)}¢ per point</span>
          <span>Savings ${deal.pricing.savings.toLocaleString()}</span>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <a
            href={deal.metadata.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Book now
          </a>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              View details
            </button>
            <button
              type="button"
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Save deal
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
