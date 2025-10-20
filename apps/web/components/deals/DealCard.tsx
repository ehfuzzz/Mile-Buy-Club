"use client";

import { format, formatDistanceToNow } from "date-fns";
import type { Deal, DealPricing, DealPricingOption, DealPricingOptionType } from "../../lib/deals";

interface DealCardProps {
  deal: Deal;
  view?: "grid" | "list" | "compact";
}

export function DealCard({ deal, view = "grid" }: DealCardProps) {
  const departure = deal.route.departure ? new Date(deal.route.departure) : null;
  const arrival = deal.route.arrival ? new Date(deal.route.arrival) : null;
  const scoreColor = getScoreColor(deal.score);
  const duration = formatDuration(deal.route.durationMinutes);
  const stopsLabel = formatStops(deal.route.stops);
  const availabilityLabel = deal.availability ? `${deal.availability} seats` : "Inventory unknown";
  const awardOption = findOption(deal.pricing.options, "award");
  const cashOption = findOption(deal.pricing.options, "cash");
  const hybridOption = findOption(deal.pricing.options, "points_plus_cash");
  const badges = buildBadges(deal, availabilityLabel);
  const primaryPricingLabel = describePricing(deal.pricing.primaryType);
  const bookingUrl = sanitizeBookingUrl(
    deal.bookingUrl ??
      awardOption?.bookingUrl ??
      cashOption?.bookingUrl ??
      hybridOption?.bookingUrl ??
      null,
  );
  const hasBookingUrl = Boolean(bookingUrl);

  return (
    <article
      className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md ${
        view === "compact" ? "sm:flex-row sm:items-center sm:justify-between" : ""
      }`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-semibold text-slate-900">{deal.airline ?? deal.provider}</span>
          <span className="text-sm text-slate-500">
            {(deal.route.origin ?? "—").toUpperCase()} → {(deal.route.destination ?? "—").toUpperCase()}
          </span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${scoreColor}`}>
            Score {Math.round(deal.score)}
          </span>
          {deal.watcherName ? (
            <span className="text-xs text-slate-500">Watcher: {deal.watcherName}</span>
          ) : null}
        </div>
        <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-medium text-slate-500">Departure</p>
            <p>{departure ? `${format(departure, "MMM d, h:mm a")} (${deal.route.origin})` : "TBD"}</p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Arrival</p>
            <p>{arrival ? `${format(arrival, "MMM d, h:mm a")} (${deal.route.destination})` : "TBD"}</p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Duration</p>
            <p>{duration}</p>
          </div>
          <div>
            <p className="font-medium text-slate-500">Stops</p>
            <p>{stopsLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {deal.route.aircraft && deal.route.aircraft.length > 0 ? (
            <span className="rounded-full border border-slate-200 px-3 py-1">Aircraft {deal.route.aircraft.join(", ")}</span>
          ) : null}
          <span className="rounded-full border border-slate-200 px-3 py-1">
            Discovered {formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true })}
          </span>
          {deal.expiresAt ? (
            <span className="rounded-full border border-rose-200 px-3 py-1 text-rose-600">
              Expires {formatDistanceToNow(new Date(deal.expiresAt), { addSuffix: true })}
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
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary pricing</span>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900">
              {formatPrimaryPrice(deal.pricing)}
            </span>
            <span className="text-xs uppercase tracking-wide text-slate-500">{primaryPricingLabel}</span>
          </div>
          {deal.cpp ? <span className="text-xs text-slate-500">{deal.cpp.toFixed(2)}¢ per point</span> : null}
        </div>
        <div className="flex flex-col gap-2">
          {awardOption ? <PricingRow label="Award" option={awardOption} currency={deal.pricing.currency} /> : null}
          {cashOption ? <PricingRow label="Cash" option={cashOption} currency={deal.pricing.currency} /> : null}
          {hybridOption ? <PricingRow label="Points + Cash" option={hybridOption} currency={deal.pricing.currency} /> : null}
        </div>
        <div className="text-xs text-slate-500">Availability: {availabilityLabel}</div>
        <div className="flex flex-col gap-2 pt-2">
          {hasBookingUrl ? (
            <a
              href={bookingUrl as string}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Book now
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
            >
              Booking unavailable
            </button>
          )}
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

function sanitizeBookingUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.toString();
  } catch {
    return null;
  }
}

function getScoreColor(score: number) {
  if (score >= 85) return "bg-emerald-100 text-emerald-700";
  if (score >= 70) return "bg-sky-100 text-sky-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-700";
}

function formatDuration(minutes: number | null) {
  if (!minutes) {
    return "—";
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) {
    return `${remaining}m`;
  }
  return `${hours}h ${remaining.toString().padStart(2, "0")}m`;
}

function formatStops(stops: number | null) {
  if (stops === null || stops === undefined) {
    return "Unknown";
  }
  if (stops === 0) {
    return "Direct";
  }
  return `${stops} stop${stops > 1 ? "s" : ""}`;
}

function buildBadges(deal: Deal, availabilityLabel: string): string[] {
  const badges: string[] = [describePricing(deal.pricing.primaryType)];
  if (deal.provider) {
    badges.push(deal.provider);
  }
  if (availabilityLabel !== "Inventory unknown") {
    badges.push(availabilityLabel);
  }
  return badges;
}

function describePricing(type: DealPricingOptionType): string {
  switch (type) {
    case "award":
      return "Award";
    case "cash":
      return "Cash";
    case "points_plus_cash":
      return "Points + Cash";
    default:
      return type;
  }
}

function findOption(options: DealPricingOption[], type: DealPricingOptionType) {
  return options.find((option) => option.type === type);
}

function formatPrimaryPrice(pricing: DealPricing) {
  if (pricing.primaryType === "award" && typeof pricing.milesRequired === "number") {
    const cashComponent = typeof pricing.cashPrice === "number"
      ? ` + ${pricing.cashCurrency ?? pricing.currency} ${pricing.cashPrice.toLocaleString()}`
      : "";
    return `${pricing.milesRequired.toLocaleString()} miles${cashComponent}`;
  }

  if (pricing.primaryType === "cash" && typeof pricing.cashPrice === "number") {
    return `${pricing.cashCurrency ?? pricing.currency} ${pricing.cashPrice.toLocaleString()}`;
  }

  if (pricing.primaryType === "points_plus_cash") {
    const miles = pricing.pointsCashMiles ?? pricing.milesRequired ?? 0;
    const cash = pricing.pointsCashPrice ?? pricing.cashPrice ?? 0;
    return `${miles.toLocaleString()} miles + ${pricing.pointsCashCurrency ?? pricing.cashCurrency ?? pricing.currency} ${cash.toLocaleString()}`;
  }

  return `${pricing.currency} ${pricing.price.toLocaleString()}`;
}

function PricingRow({ label, option, currency }: { label: string; option: DealPricingOption; currency: string }) {
  const parts: string[] = [];
  if (typeof option.miles === "number") {
    parts.push(`${option.miles.toLocaleString()} miles`);
  }
  if (typeof option.cashAmount === "number") {
    parts.push(`${option.cashCurrency ?? currency} ${option.cashAmount.toLocaleString()}`);
  }

  const meta: string[] = [];
  if (option.provider) {
    meta.push(option.provider);
  }
  if (option.isEstimated) {
    meta.push("estimated");
  }

  return (
    <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-white/70 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className="text-sm text-slate-700">{parts.join(" + ") || "Provider supplied"}</span>
      </div>
      <div className="text-right text-xs text-slate-400">
        {meta.join(" · ")}
        {option.description ? <div className="text-[10px] text-slate-400">{option.description}</div> : null}
      </div>
    </div>
  );
}
