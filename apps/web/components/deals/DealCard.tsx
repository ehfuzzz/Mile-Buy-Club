"use client";

import { format, formatDistanceToNow } from "date-fns";
import { ExternalLink, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  Deal,
  DealPricing,
  DealPricingOption,
  DealPricingOptionType,
} from "../../lib/deals";
import { api } from "../../lib/api";

interface DealCardProps {
  deal: Deal;
  view?: "grid" | "list" | "compact";
}

const BOOKING_HOST_ALLOWLIST = [
  "seats.aero",
  "united.com",
  "mileageplus.united.com",
  "aa.com",
  "americanairlines.com",
  "delta.com",
  "aircanada.com",
  "aeroplan.com",
  "lufthansa.com",
  "singaporeair.com",
  "singaporeairlines.com",
  "cathaypacific.com",
  "emirates.com",
  "qatarairways.com",
  "virginatlantic.com",
  "virgin-atlantic.com",
  "klm.com",
  "airfrance.com",
  "alaskaair.com",
  "southwest.com",
  "qantas.com",
  "britishairways.com",
  "ba.com",
  "ana.co.jp",
  "jal.co.jp",
  "etihad.com",
  "turkishairlines.com",
  "finnair.com",
  "ethiopianairlines.com",
  "saudia.com",
  "flysas.com",
  "virginaustralia.com",
  "jetblue.com",
  "latam.com",
  "azul.com.br",
] as const;

const PROGRAM_HOST_OVERRIDES: Record<string, string[]> = {
  american: ["aa.com", "americanairlines.com"],
  united: ["united.com", "mileageplus.united.com"],
  delta: ["delta.com"],
  aeroplan: ["aeroplan.com", "aircanada.com"],
  aircanada: ["aircanada.com", "aeroplan.com"],
  lufthansa: ["lufthansa.com"],
  singapore: ["singaporeair.com", "singaporeairlines.com"],
  singaporeair: ["singaporeair.com", "singaporeairlines.com"],
  cathaypacific: ["cathaypacific.com"],
  emirates: ["emirates.com"],
  qatar: ["qatarairways.com"],
  qatarairways: ["qatarairways.com"],
  virginatlantic: ["virginatlantic.com", "virgin-atlantic.com"],
  klm: ["klm.com"],
  airfrance: ["airfrance.com"],
  alaska: ["alaskaair.com"],
  alaskaair: ["alaskaair.com"],
  southwest: ["southwest.com"],
  qantas: ["qantas.com"],
  british: ["britishairways.com", "ba.com"],
  britishairways: ["britishairways.com", "ba.com"],
  turkish: ["turkishairlines.com"],
  turkishairlines: ["turkishairlines.com"],
  finnair: ["finnair.com"],
  ethiopian: ["ethiopianairlines.com"],
  saudia: ["saudia.com"],
  velocity: ["virginaustralia.com"],
  virginaustralia: ["virginaustralia.com"],
  flyingblue: ["airfrance.com", "klm.com"],
  jetblue: ["jetblue.com"],
  azul: ["azul.com.br"],
  latam: ["latam.com"],
  virginatlanticuk: ["virginatlantic.com", "virgin-atlantic.com"],
};

interface BookingValidationContext {
  airline?: string | null;
  program?: string | null;
}

interface ValidatedBookingUrl {
  url: string;
  host: string;
  displayHost: string;
}

export function DealCard({ deal, view = "grid" }: DealCardProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [resolvedBooking, setResolvedBooking] = useState<ValidatedBookingUrl | null>(null);

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

  const providerProgram = useMemo(() => parseProgramFromProvider(deal.provider), [deal.provider]);

  const bookingCandidates = useMemo(
    () =>
      [
        deal.bookingUrl,
        awardOption?.bookingUrl,
        cashOption?.bookingUrl,
        hybridOption?.bookingUrl,
      ].filter((candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0),
    [deal.bookingUrl, awardOption?.bookingUrl, cashOption?.bookingUrl, hybridOption?.bookingUrl],
  );

  const validatedBooking = useMemo(() => {
    if (resolvedBooking) {
      return resolvedBooking;
    }

    return validateBookingUrls(bookingCandidates, {
      airline: deal.airline,
      program: providerProgram,
    });
  }, [resolvedBooking, bookingCandidates, deal.airline, providerProgram]);

  useEffect(() => {
    setResolvedBooking(null);
  }, [deal.id]);

  useEffect(() => {
    if (!resolvedBooking && !validatedBooking && bookingCandidates.length > 0) {
      console.warn("Discarded invalid booking URL for deal", {
        id: deal.id,
        airline: deal.airline,
        provider: deal.provider,
        bookingCandidates,
      });
    }
  }, [resolvedBooking, validatedBooking, bookingCandidates, deal.id, deal.airline, deal.provider]);

  const bookingHostLabel = validatedBooking ? formatHostForLabel(validatedBooking.displayHost) : null;
  const friendlyAirlineName = useMemo(
    () =>
      formatAirlineName(
        deal.airline ?? providerProgram ?? (validatedBooking ? extractBrandFromHost(validatedBooking.displayHost) : null),
      ),
    [deal.airline, providerProgram, validatedBooking],
  );

  const buttonDestinationLabel = bookingHostLabel ?? friendlyAirlineName ?? "Airline site";
  const tooltipAirlineLabel = friendlyAirlineName ?? buttonDestinationLabel;
  const canAttemptBooking = Boolean(deal.id);
  const bookingTooltip = validatedBooking
    ? `Open ${tooltipAirlineLabel} (${validatedBooking.displayHost}) in a new tab`
    : canAttemptBooking
    ? "Fetch live booking link"
    : "Booking link unavailable";
  const bookingButtonLabel = validatedBooking
    ? `Book on ${buttonDestinationLabel}`
    : canAttemptBooking
    ? "Book now"
    : "Booking unavailable";

  const handleBookNow = useCallback(async () => {
    if (!canAttemptBooking || isBooking) {
      return;
    }

    const confirmationLabel = tooltipAirlineLabel ?? buttonDestinationLabel ?? "the airline site";
    const confirmed = window.confirm(
      `You'll be redirected to ${confirmationLabel} to complete your booking. Continue?`,
    );

    if (!confirmed) {
      return;
    }

    setIsBooking(true);

    try {
      const { success, data, error } = await api.get<{ bookingUrl: string | null }>(
        `/deals/${encodeURIComponent(deal.id)}/booking-url`,
      );

      if (!success) {
        throw new Error(error?.message ?? "Unable to fetch booking URL");
      }

      const context: BookingValidationContext = {
        airline: deal.airline,
        program: providerProgram,
      };

      const remoteBooking = data?.bookingUrl
        ? validateBookingUrls([data.bookingUrl], context)
        : null;

      if (!remoteBooking && data?.bookingUrl) {
        console.warn("Discarded remote SeatsAero booking URL", {
          dealId: deal.id,
          airline: deal.airline,
          program: providerProgram,
          bookingUrl: data.bookingUrl,
        });
      }

      const finalBooking = remoteBooking ?? validatedBooking;

      if (finalBooking) {
        setResolvedBooking(finalBooking);
        window.open(finalBooking.url, "_blank", "noopener,noreferrer");
      } else {
        window.alert("Booking URL not available for this flight. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching booking URL", error);
      window.alert("Unable to retrieve booking information. Please try again later.");
    } finally {
      setIsBooking(false);
    }
  }, [
    canAttemptBooking,
    isBooking,
    tooltipAirlineLabel,
    buttonDestinationLabel,
    deal.id,
    deal.airline,
    providerProgram,
    validatedBooking,
  ]);

  const handleBookNow = useCallback(() => {
    if (!validatedBooking) {
      return;
    }

    const confirmationLabel = tooltipAirlineLabel ?? validatedBooking.displayHost;
    const confirmed = window.confirm(
      `You'll be redirected to ${confirmationLabel} to complete your booking. Continue?`,
    );

    if (!confirmed) {
      return;
    }

    setIsBooking(true);
    try {
      window.open(validatedBooking.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open booking link", error);
    } finally {
      window.setTimeout(() => setIsBooking(false), 300);
    }
  }, [tooltipAirlineLabel, validatedBooking]);

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
          {canAttemptBooking ? (
            <button
              type="button"
              onClick={handleBookNow}
              disabled={isBooking}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              title={bookingTooltip}
              aria-label={bookingTooltip}
            >
              {isBooking ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{bookingButtonLabel}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
              title="Booking link unavailable"
              aria-label="Booking link unavailable"
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

function sanitizeNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return undefined;
}

function PricingRow({
  label,
  option,
  currency,
}: {
  label: string;
  option: DealPricingOption;
  currency: string;
}) {
  const cashAmount = sanitizeNumber(option.cashAmount);
  const miles = sanitizeNumber(option.miles);
  const provider = option.provider ?? "";
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white/70 px-3 py-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        {provider ? <span className="text-slate-400">{provider}</span> : null}
      </div>
      <div className="text-sm text-slate-700">
        {miles ? `${miles.toLocaleString()} miles` : "—"}
        {cashAmount ? ` + ${option.cashCurrency ?? currency} ${cashAmount.toLocaleString()}` : ""}
      </div>
      {option.bookingUrl ? (
        <span className="text-xs text-slate-400">Direct booking link available</span>
      ) : null}
    </div>
  );
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

function validateBookingUrls(
  candidates: string[],
  context: BookingValidationContext,
): ValidatedBookingUrl | null {
  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (!trimmed) {
      continue;
    }

    const normalized = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      continue;
    }

    if (parsed.protocol !== "https:") {
      continue;
    }

    const host = parsed.hostname.toLowerCase();
    if (!isAllowedBookingHost(host, context)) {
      continue;
    }

    return {
      url: parsed.toString(),
      host,
      displayHost: getDisplayHost(host),
    };
  }

  return null;
}

function getDisplayHost(host: string): string {
  const segments = host.split(".").filter(Boolean);
  if (segments.length <= 1) {
    return host;
  }

  const tld = segments[segments.length - 1];
  const domain = segments[segments.length - 2];

  if ((domain === "co" || domain === "com" || domain === "org") && segments.length >= 3) {
    const secondLevel = segments[segments.length - 3];
    return `${secondLevel}.${domain}.${tld}`;
  }

  return `${domain}.${tld}`;
}

function extractBrandFromHost(host: string): string {
  const displayHost = getDisplayHost(host);
  const domain = displayHost.split(".")[0];
  return domain;
}

function formatHostForLabel(host: string): string {
  const displayHost = getDisplayHost(host);
  if (!displayHost) {
    return "Airline site";
  }

  return displayHost.charAt(0).toUpperCase() + displayHost.slice(1);
}

function isAllowedBookingHost(host: string, context: BookingValidationContext): boolean {
  const normalizedHost = host.toLowerCase();

  if (BOOKING_HOST_ALLOWLIST.some((fragment) => normalizedHost.includes(fragment))) {
    return true;
  }

  const slugHost = normalizedHost.replace(/[^a-z0-9]/g, "");
  const slugs = new Set<string>();
  if (context.airline) {
    slugs.add(slugify(context.airline));
  }
  if (context.program) {
    slugs.add(slugify(context.program));
  }

  for (const slug of slugs) {
    if (!slug) {
      continue;
    }

    if (slugHost.includes(slug)) {
      return true;
    }

    const overrides = PROGRAM_HOST_OVERRIDES[slug];
    if (overrides?.some((fragment) => normalizedHost.includes(fragment))) {
      return true;
    }
  }

  return false;
}

function parseProgramFromProvider(provider: string | null | undefined): string | null {
  if (!provider) {
    return null;
  }

  const trimmed = provider.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes("·")) {
    const parts = trimmed
      .split("·")
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  }

  return trimmed.toLowerCase();
}

function formatAirlineName(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/[_-]/g, " ").trim();
  if (!normalized) {
    return null;
  }

  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugify(value: string | null | undefined): string {
  return value ? value.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
}

