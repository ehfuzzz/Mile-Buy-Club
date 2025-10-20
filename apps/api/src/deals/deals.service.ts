import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SeatsAeroPartnerDeal, SeatsAeroPartnerSegment, SeatsAeroPartnerService } from './seats-aero-partner.service';

// Temporarily define types locally to avoid module resolution issues caused by the
// lightweight Prisma client stub that ships with this repository. The runtime
// shape of these records matches the schema in `packages/database/prisma/schema.prisma`.

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

interface WatcherSummary {
  id: string;
  name: string | null;
}

interface DealRecord {
  id: string;
  watcherId: string;
  userId: string;
  externalId: string;
  title: string;
  description: string | null;
  type: string;
  origin: string | null;
  destination: string | null;
  departDate: Date | null;
  returnDate: Date | null;
  cabin: string | null;
  airline: string | null;
  availability: number | null;
  price: number;
  currency: string;
  basePrice: number | null;
  taxes: number | null;
  cashPrice: number | null;
  cashCurrency: string | null;
  pointsCashPrice: number | null;
  pointsCashCurrency: string | null;
  pointsCashMiles: number | null;
  primaryPricingType: string | null;
  pricingOptions: JsonValue | null;
  milesRequired: number | null;
  cpp: number | null;
  value: number | null;
  score: number;
  scoreBreakdown: JsonValue | null;
  bookingUrl: string | null;
  provider: string | null;
  status: string;
  isNew: boolean;
  rawData: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
  watcher?: WatcherSummary | null;
}

type DealWithWatcher = DealRecord;

export type FlightPricingOptionType = 'cash' | 'award' | 'mixed';
export interface FlightPricingOption {
  type: FlightPricingOptionType;
  cashAmount?: number;
  cashCurrency?: string;
  miles?: number;
  points?: number;
  currency?: string;
  pointsCurrency?: string;
  taxes?: number;
  fees?: number;
  totalTaxes?: number;
  totalFees?: number;
  availability?: number;
  score?: number;
  cpp?: number;
  value?: number;
  expiresAt?: string;
  updatedAt?: string;
  createdAt?: string;
  provider?: string;
  bookingUrl?: string;
  description?: string;
  segments?: FlightSegment[];
  isEstimated?: boolean;
}

export interface FlightSegment {
  marketingCarrier?: string;
  operatingCarrier?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  fareClass?: string;
  aircraft?: string;
  durationMinutes?: number;
}

export interface Flight {
  id?: string;
  provider?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  currency?: string;
  airline?: string;
  cabin?: 'economy' | 'premium_economy' | 'business' | 'first';
  segments?: FlightSegment[];
  pricingOptions?: FlightPricingOption[];
}

export interface DealPricingOptionView {
  type: FlightPricingOptionType;
  cashAmount?: number;
  cashCurrency?: string;
  miles?: number;
  pointsCurrency?: string;
  provider?: string;
  bookingUrl?: string;
  description?: string;
  isEstimated?: boolean;
}

export interface DealPricingView {
  primaryType: FlightPricingOptionType;
  price: number;
  currency: string;
  milesRequired?: number | null;
  cashPrice?: number | null;
  cashCurrency?: string | null;
  pointsCashPrice?: number | null;
  pointsCashCurrency?: string | null;
  pointsCashMiles?: number | null;
  options: DealPricingOptionView[];
}

export interface DealRouteView {
  origin: string | null;
  destination: string | null;
  departure: string | null;
  arrival: string | null;
  durationMinutes: number | null;
  stops: number | null;
  aircraft: string[] | null;
}

export interface DealView {
  id: string;
  watcherId: string;
  watcherName: string | null;
  provider: string;
  airline: string | null;
  cabin: string | null;
  route: DealRouteView;
  availability: number | null;
  score: number;
  cpp: number | null;
  value: number | null;
  taxes: number | null;
  pricing: DealPricingView;
  bookingUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  scoreBreakdown: Record<string, unknown> | null;
}

export interface DealsListResponse {
  deals: DealView[];
  meta: {
    total: number;
    userId: string;
    watcherCount: number;
  };
}

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly seatsAeroPartnerService: SeatsAeroPartnerService,
  ) {}

  async resolveUserId(userId?: string): Promise<string> {
    if (userId) {
      const existing = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!existing) {
        throw new NotFoundException(`User ${userId} not found`);
      }
      return existing.id;
    }

    const fallback = await this.prisma.user.findFirst({ select: { id: true } });
    if (!fallback) {
      throw new NotFoundException('No users available in the workspace');
    }

    return fallback.id;
  }

  async listDeals(
    userId?: string,
    limit = 100,
    programs?: string[],
  ): Promise<DealsListResponse> {
    const take = limit && limit > 0 ? Math.min(limit, 200) : 100;

    const requestedProgramsLog = Array.isArray(programs) && programs.length > 0
      ? programs.join(', ')
      : 'default (all configured)';

    this.logger.debug(
      `Requesting SeatsAero live deals: take=${take}, programs=${requestedProgramsLog}`,
    );

    try {
      const { deals: liveDeals } = await this.seatsAeroPartnerService.search({
        take,
        programs,
      });

      const programSummary = this.seatsAeroPartnerService.getProgramSummary(liveDeals);
      this.logger.debug(
        `Received ${liveDeals.length} SeatsAero live deals (program summary: ${
          programSummary.summary || 'none'
        })`,
      );

      const mappedDeals = liveDeals.map((deal) => this.mapPartnerDeal(deal));
      const watcherCount =
        mappedDeals.length > 0 ? new Set(mappedDeals.map((deal) => deal.watcherId)).size : 0;

      return {
        deals: mappedDeals,
        meta: {
          total: mappedDeals.length,
          userId: userId ?? 'seats-aero',
          watcherCount,
        },
      };
    } catch (error) {
      this.logger.error('Falling back to stored deals after SeatsAero error', error as Error);
      return this.listDealsFromDatabase(userId, take);
    }
  }

  async listDealsForWatcher(
    watcherId: string,
    userId?: string,
    limit = 100,
  ): Promise<DealsListResponse> {
    const resolvedUserId = await this.resolveUserId(userId);
    const records = (await this.prisma.deal.findMany({
      where: { watcherId, userId: resolvedUserId, status: 'active' },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        watcher: {
          select: { id: true, name: true },
        },
      },
    })) as DealWithWatcher[];

    const deals = records.map((deal) => this.toDealView(deal));

    return {
      deals,
      meta: {
        total: deals.length,
        userId: resolvedUserId,
        watcherCount: deals.length > 0 ? 1 : 0,
      },
    };
  }

  private async listDealsFromDatabase(userId: string | undefined, limit = 100): Promise<DealsListResponse> {
    const resolvedUserId = await this.resolveUserId(userId);
    const records = (await this.prisma.deal.findMany({
      where: { userId: resolvedUserId, status: 'active' },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        watcher: {
          select: { id: true, name: true },
        },
      },
    })) as DealWithWatcher[];

    const deals = records.map((deal) => this.toDealView(deal));
    const watcherCount = new Set(deals.map((deal) => deal.watcherId)).size;

    return {
      deals,
      meta: {
        total: deals.length,
        userId: resolvedUserId,
        watcherCount,
      },
    };
  }

  private mapPartnerDeal(deal: SeatsAeroPartnerDeal): DealView {
    const id = deal.id ?? this.buildDealId(deal);
    const program = deal.program ?? deal.loyaltyProgram ?? 'Seats.aero';
    const providerLabel = deal.program ? `Seats.aero · ${program}` : 'Seats.aero';
    this.logger.debug(
      `Mapping SeatsAero partner deal ${id}: airline=${deal.airline ?? 'unknown'}, program=${
        deal.program ?? deal.loyaltyProgram ?? 'unknown'
      }, origin=${deal.origin ?? 'unknown'}, destination=${deal.destination ?? 'unknown'}`,
    );
    const partnerSegments = Array.isArray(deal.segments) ? deal.segments : [];
    const firstPartnerSegment = partnerSegments.length > 0 ? partnerSegments[0] : undefined;
    const lastPartnerSegment =
      partnerSegments.length > 0 ? partnerSegments[partnerSegments.length - 1] : undefined;

    const departure = deal.departure ?? firstPartnerSegment?.departure ?? null;
    const arrival = deal.arrival ?? lastPartnerSegment?.arrival ?? null;
    const miles = this.resolveMiles(deal);
    const cashDue = this.resolveCashDue(deal);
    const currency = deal.currency ?? deal.taxesCurrency ?? 'USD';
    const availability = this.resolveAvailability(deal);
    const cpp = this.computeCpp(miles, cashDue);
    const score = this.computeScore(cpp, availability);
    const updatedAt = deal.updatedAt ?? new Date().toISOString();
    const segments = this.mapSegments(partnerSegments, deal.cabin ?? null);
    const firstSegment = segments && segments.length > 0 ? segments[0] : undefined;
    const lastSegment = segments && segments.length > 0 ? segments[segments.length - 1] : undefined;
    const cabinSource = deal.cabin ?? firstSegment?.cabin ?? null;
    const normalizedCabin = typeof cabinSource === 'string' ? cabinSource.toLowerCase() : cabinSource;

    return {
      id,
      watcherId: deal.watcherId ?? 'seats-aero-live',
      watcherName: deal.watcherName ?? program,
      provider: providerLabel,
      airline: deal.airline ?? deal.carrier ?? firstSegment?.marketingCarrier ?? null,
      cabin: normalizedCabin,
      route: {
        origin: deal.origin ?? firstSegment?.origin ?? null,
        destination: deal.destination ?? lastSegment?.destination ?? null,
        departure,
        arrival,
        durationMinutes: this.computeDurationMinutes(departure, arrival),
        stops: this.computeStops(segments),
        aircraft: this.resolveAircraft(segments),
      },
      availability,
      score,
      cpp,
      value: null,
      taxes: cashDue ?? null,
      pricing: {
        primaryType: 'award',
        price: cashDue ?? 0,
        currency,
        milesRequired: miles,
        cashPrice: cashDue,
        cashCurrency: currency,
        pointsCashPrice: null,
        pointsCashCurrency: null,
        pointsCashMiles: null,
        options: [
          {
            type: 'award',
            miles: miles ?? undefined,
            cashAmount: cashDue ?? undefined,
            cashCurrency: currency,
            provider: providerLabel,
            bookingUrl: deal.bookingUrl,
            description: program ? `Book via ${program}` : undefined,
          },
        ],
      },
      bookingUrl: deal.bookingUrl ?? null,
      status: 'active',
      createdAt: deal.createdAt ?? updatedAt,
      updatedAt,
      expiresAt: deal.expiresAt ?? null,
      scoreBreakdown: {
        cpp,
        availability,
      },
    };
  }

  private buildDealId(deal: SeatsAeroPartnerDeal): string {
    const partnerSegments = Array.isArray(deal.segments) ? deal.segments : [];
    const firstSegment = partnerSegments.length > 0 ? partnerSegments[0] : undefined;
    const lastSegment = partnerSegments.length > 0 ? partnerSegments[partnerSegments.length - 1] : undefined;

    const origin = deal.origin ?? firstSegment?.origin ?? 'unknown';
    const destination = deal.destination ?? lastSegment?.destination ?? 'unknown';
    const departure = (deal.departure ?? firstSegment?.departure ?? '').replace(/[^0-9A-Za-z]/g, '');
    const program = (deal.program ?? deal.loyaltyProgram ?? 'seats').replace(/\s+/g, '-').toLowerCase();
    return `${program}-${origin}-${destination}-${departure || Date.now()}`;
  }

  private resolveMiles(deal: SeatsAeroPartnerDeal): number | null {
    if (typeof deal.miles === 'number') {
      return Math.max(0, Math.round(deal.miles));
    }

    if (typeof deal.points === 'number') {
      return Math.max(0, Math.round(deal.points));
    }

    return null;
  }

  private resolveCashDue(deal: SeatsAeroPartnerDeal): number | null {
    const totals = [deal.totalFees, deal.totalTaxes].filter(
      (value): value is number => typeof value === 'number' && Number.isFinite(value),
    );

    if (totals.length > 0) {
      const sum = totals.reduce((acc, value) => acc + value, 0);
      return Math.round(sum * 100) / 100;
    }

    const partials = [deal.fees, deal.taxes].filter(
      (value): value is number => typeof value === 'number' && Number.isFinite(value),
    );

    if (partials.length === 0) {
      return null;
    }

    const sum = partials.reduce((acc, value) => acc + value, 0);
    return Math.round(sum * 100) / 100;
  }

  private resolveAvailability(deal: SeatsAeroPartnerDeal): number | null {
    const availability =
      typeof deal.availability === 'number'
        ? deal.availability
        : typeof deal.seatsAvailable === 'number'
        ? deal.seatsAvailable
        : typeof deal.seats === 'number'
        ? deal.seats
        : null;

    if (availability === null) {
      return null;
    }

    return Math.max(0, Math.floor(availability));
  }

  private computeCpp(miles: number | null, cashDue: number | null): number | null {
    if (!miles || miles <= 0 || cashDue === null || cashDue <= 0) {
      return null;
    }

    const cpp = (cashDue / miles) * 100;
    return Math.round(cpp * 100) / 100;
  }

  private computeScore(cpp: number | null, availability: number | null): number {
    const base = cpp === null ? 70 : Math.max(10, Math.min(95, Math.round((2 - Math.min(cpp, 2)) * 45 + 50)));
    const availabilityBoost = availability && availability > 2 ? 5 : 0;
    return Math.max(10, Math.min(100, base + availabilityBoost));
  }

  private mapSegments(
    segments: SeatsAeroPartnerSegment[] | undefined,
    defaultCabin: string | null,
  ): FlightSegment[] | undefined {
    if (!segments || segments.length === 0) {
      return undefined;
    }

    return segments.map((segment) => ({
      marketingCarrier: segment.marketingCarrier ?? segment.operatingCarrier ?? segment.flightNumber ?? 'UNK',
      operatingCarrier: segment.operatingCarrier,
      flightNumber: segment.flightNumber,
      origin: segment.origin ?? '',
      destination: segment.destination ?? '',
      departureTime: segment.departure ?? '',
      arrivalTime: segment.arrival ?? '',
      cabin: (segment.cabin ?? defaultCabin ?? 'economy') as FlightSegment['cabin'],
      fareClass: segment.fareClass ?? undefined,
      aircraft: segment.aircraft ?? undefined,
    }));
  }

  private computeDurationMinutes(departure: string | null, arrival: string | null): number | null {
    if (!departure || !arrival) {
      return null;
    }

    const start = new Date(departure).getTime();
    const end = new Date(arrival).getTime();

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return null;
    }

    return Math.round((end - start) / 60000);
  }

  private computeStops(segments?: FlightSegment[]): number | null {
    if (!segments || segments.length === 0) {
      return null;
    }

    return Math.max(0, segments.length - 1);
  }

  private resolveAircraft(segments?: FlightSegment[]): string[] | null {
    if (!segments) {
      return null;
    }

    const aircraft = segments
      .map((segment) => segment.aircraft)
      .filter((value): value is string => Boolean(value));

    return aircraft.length > 0 ? Array.from(new Set(aircraft)) : null;
  }

  toDealView(deal: DealWithWatcher): DealView {
    const raw = this.parseRawFlight(deal.rawData);
    const options = this.normalizePricingOptions(deal.pricingOptions, deal.provider ?? raw?.provider ?? undefined);
    const route = this.buildRoute(deal, raw);

    const bookingUrl = deal.bookingUrl ?? options.find((option) => option.bookingUrl)?.bookingUrl ?? null;

    return {
      id: deal.id,
      watcherId: deal.watcherId,
      watcherName: deal.watcher?.name ?? null,
      provider: deal.provider ?? raw?.provider ?? 'unknown',
      airline: deal.airline ?? raw?.airline ?? null,
      cabin: deal.cabin ?? raw?.cabin ?? null,
      route,
      availability: deal.availability ?? null,
      score: deal.score,
      cpp: deal.cpp ?? null,
      value: deal.value ?? null,
      taxes: deal.taxes ?? null,
      pricing: {
        primaryType: (deal.primaryPricingType ?? 'award') as FlightPricingOptionType,
        price: deal.price,
        currency: deal.currency,
        milesRequired: deal.milesRequired ?? null,
        cashPrice: deal.cashPrice ?? null,
        cashCurrency: deal.cashCurrency ?? null,
        pointsCashPrice: deal.pointsCashPrice ?? null,
        pointsCashCurrency: deal.pointsCashCurrency ?? null,
        pointsCashMiles: deal.pointsCashMiles ?? null,
        options,
      },
      bookingUrl,
      status: deal.status,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
      expiresAt: deal.expiresAt ? deal.expiresAt.toISOString() : null,
      scoreBreakdown: this.normalizeRecord(deal.scoreBreakdown),
    };
  }

  private parseRawFlight(raw: JsonValue | null): Flight | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return raw as unknown as Flight;
  }

  private buildRoute(deal: DealRecord, raw: Flight | null): DealRouteView {
    const segments = Array.isArray(raw?.segments) ? (raw?.segments as FlightSegment[]) : [];
    const stops = segments.length > 0 ? segments.length - 1 : null;
    const departure = raw?.departureTime ?? (deal.departDate ? deal.departDate.toISOString() : null);
    const arrival = raw?.arrivalTime ?? (deal.returnDate ? deal.returnDate.toISOString() : null);
    const durationFromSegments = segments.reduce((total, segment) => {
      const minutes = typeof segment.durationMinutes === 'number' ? segment.durationMinutes : 0;
      return total + minutes;
    }, 0);
    const durationMinutes = durationFromSegments
      ? durationFromSegments
      : deal.departDate && deal.returnDate
      ? Math.max(0, Math.round((deal.returnDate.getTime() - deal.departDate.getTime()) / 60000))
      : null;

    const aircraftSet = new Set<string>();
    segments.forEach((segment) => {
      if (segment.aircraft) {
        aircraftSet.add(segment.aircraft);
      }
    });
    const aircraft = aircraftSet.size > 0 ? Array.from(aircraftSet) : null;

    return {
      origin: deal.origin ?? raw?.origin ?? null,
      destination: deal.destination ?? raw?.destination ?? null,
      departure,
      arrival,
      durationMinutes,
      stops,
      aircraft,
    };
  }

  private normalizePricingOptions(
    raw: JsonValue | null,
    fallbackProvider?: string,
  ): DealPricingOptionView[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const option = entry as Partial<FlightPricingOption> & { type?: string };
        if (!option.type) {
          return null;
        }

        return {
          type: option.type as FlightPricingOptionType,
          cashAmount: typeof option.cashAmount === 'number' ? option.cashAmount : undefined,
          cashCurrency: typeof option.cashCurrency === 'string' ? option.cashCurrency : undefined,
          miles: typeof option.miles === 'number' ? option.miles : undefined,
          pointsCurrency: typeof option.pointsCurrency === 'string' ? option.pointsCurrency : undefined,
          provider: typeof option.provider === 'string' ? option.provider : fallbackProvider,
          bookingUrl: typeof option.bookingUrl === 'string' ? option.bookingUrl : undefined,
          description: typeof option.description === 'string' ? option.description : undefined,
          isEstimated: typeof option.isEstimated === 'boolean' ? option.isEstimated : undefined,
        } satisfies DealPricingOptionView;
      })
      .filter(Boolean) as DealPricingOptionView[];
  }

  private normalizeRecord(value: JsonValue | null): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }

  async debugSeatsAero() {
    const initialDiagnostics = this.seatsAeroPartnerService.getDiagnostics();
    const params = { take: 20 };

    try {
      const result = await this.seatsAeroPartnerService.search(params);
      const finalDiagnostics = this.seatsAeroPartnerService.getDiagnostics();

      return {
        success: true,
        message: 'SeatsAero service working',
        deals: result.deals,
        total: result.total,
        diagnostics: {
          before: initialDiagnostics,
          after: finalDiagnostics,
        },
        programs: {
          requested: result.meta.requestedPrograms,
          successful: result.meta.successfulPrograms,
          failed: result.meta.failedPrograms,
        },
        summaries: {
          aggregated: {
            counts: result.meta.aggregatedProgramCounts,
            summary: result.meta.aggregatedProgramSummary,
          },
          deduped: {
            counts: result.meta.dedupedProgramCounts,
            summary: result.meta.dedupedProgramSummary,
          },
          limited: {
            counts: result.meta.limitedProgramCounts,
            summary: result.meta.limitedProgramSummary,
          },
        },
      };
    } catch (error) {
      const underlying =
        error instanceof Error && 'cause' in error && (error as Error & { cause?: unknown }).cause
          ? (error as Error & { cause?: unknown }).cause
          : error;
      const finalDiagnostics = this.seatsAeroPartnerService.getDiagnostics();

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        diagnostics: {
          before: initialDiagnostics,
          after: finalDiagnostics,
        },
        attemptedParams: params,
        error: this.seatsAeroPartnerService.describeError(underlying),
      };
    }
  }
}
