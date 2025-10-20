import { Inject, Injectable, Logger, NotFoundException, forwardRef } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SeatsAeroCollectorService } from '../data-collection/seats-aero-collector.service';

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

type SeatsAeroProgramStat = { program: string; _count: { id: number } };

interface CachedSeatsAeroDeal {
  id: string;
  externalId: string;
  airline: string | null;
  program: string | null;
  origin: string | null;
  destination: string | null;
  departureDate: Date | null;
  cabin: string | null;
  miles: number | null;
  cashPrice: unknown;
  bookingUrl: string | null;
  rawData: unknown;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

const BOOKING_HOST_ALLOWLIST = [
  'seats.aero',
  'united.com',
  'mileageplus.united.com',
  'aa.com',
  'americanairlines.com',
  'delta.com',
  'aircanada.com',
  'aeroplan.com',
  'lufthansa.com',
  'singaporeair.com',
  'singaporeairlines.com',
  'cathaypacific.com',
  'emirates.com',
  'qatarairways.com',
  'virginatlantic.com',
  'virgin-atlantic.com',
  'klm.com',
  'airfrance.com',
  'alaskaair.com',
  'southwest.com',
  'qantas.com',
  'britishairways.com',
  'ba.com',
  'ana.co.jp',
  'jal.co.jp',
  'etihad.com',
  'turkishairlines.com',
  'finnair.com',
  'ethiopianairlines.com',
  'saudia.com',
  'flysas.com',
  'virginaustralia.com',
  'jetblue.com',
  'latam.com',
  'azul.com.br',
];

const PROGRAM_HOST_OVERRIDES: Record<string, string[]> = {
  american: ['aa.com', 'americanairlines.com'],
  united: ['united.com', 'mileageplus.united.com'],
  delta: ['delta.com'],
  aeroplan: ['aeroplan.com', 'aircanada.com'],
  aircanada: ['aircanada.com', 'aeroplan.com'],
  lufthansa: ['lufthansa.com'],
  singapore: ['singaporeair.com', 'singaporeairlines.com'],
  singaporeair: ['singaporeair.com', 'singaporeairlines.com'],
  cathaypacific: ['cathaypacific.com'],
  emirates: ['emirates.com'],
  qatar: ['qatarairways.com'],
  qatarairways: ['qatarairways.com'],
  virginatlantic: ['virginatlantic.com', 'virgin-atlantic.com'],
  klm: ['klm.com'],
  airfrance: ['airfrance.com'],
  alaska: ['alaskaair.com'],
  alaskaair: ['alaskaair.com'],
  southwest: ['southwest.com'],
  qantas: ['qantas.com'],
  british: ['britishairways.com', 'ba.com'],
  britishairways: ['britishairways.com', 'ba.com'],
  turkish: ['turkishairlines.com'],
  turkishairlines: ['turkishairlines.com'],
  finnair: ['finnair.com'],
  ethiopian: ['ethiopianairlines.com'],
  saudia: ['saudia.com'],
  velocity: ['virginaustralia.com'],
  virginaustralia: ['virginaustralia.com'],
  flyingblue: ['airfrance.com', 'klm.com'],
  jetblue: ['jetblue.com'],
  azul: ['azul.com.br'],
  latam: ['latam.com'],
  virginatlanticuk: ['virginatlantic.com', 'virgin-atlantic.com'],
};

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
    programs?: string[];
    dataSource?: string;
  };
}

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => SeatsAeroCollectorService))
    private readonly seatsAeroCollectorService: SeatsAeroCollectorService,
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
    const normalizedPrograms =
      Array.isArray(programs) && programs.length > 0 ? programs : undefined;

    const programLog = normalizedPrograms ? normalizedPrograms.join(', ') : 'all';
    this.logger.debug(
      `Querying cached SeatsAero deals: take=${take}, programs=${programLog}`,
    );

    const now = new Date();
    const cachedDeals = (await this.prisma.seatsAeroDeal.findMany({
      where: {
        ...(normalizedPrograms ? { program: { in: normalizedPrograms } } : {}),
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      take,
      orderBy: { createdAt: 'desc' },
    })) as CachedSeatsAeroDeal[];

    const mappedDeals = cachedDeals.map((deal) =>
      this.mapCachedDealToDealView(deal),
    );
    const watcherCount =
      mappedDeals.length > 0
        ? new Set(mappedDeals.map((deal: DealView) => deal.watcherId)).size
        : 0;

    return {
      deals: mappedDeals,
      meta: {
        total: mappedDeals.length,
        userId: userId ?? 'seats-aero-cached',
        watcherCount,
        programs: normalizedPrograms ?? ['all'],
        dataSource: 'cached',
      },
    };
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

  async refreshSeatsAeroData(): Promise<void> {
    await this.seatsAeroCollectorService.collectAllAirlinesData();
  }

  async getSeatsAeroStats(): Promise<{ totalDeals: number; byProgram: { program: string; count: number }[] }> {
    const now = new Date();
    const stats: SeatsAeroProgramStat[] = await this.prisma.seatsAeroDeal.groupBy({
      by: ['program'],
      _count: { id: true },
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    const totalDeals = stats.reduce((sum, stat) => sum + stat._count.id, 0);
    const byProgram = stats.map((stat) => ({
      program: stat.program,
      count: stat._count.id,
    }));

    return { totalDeals, byProgram };
  }

  private mapCachedDealToDealView(deal: CachedSeatsAeroDeal): DealView {
    const program = deal.program ?? 'seats-aero';
    const providerLabel = `Seats.aero · ${program}`;
    const miles = typeof deal.miles === 'number' ? deal.miles : null;
    const cashPrice = this.toNumber(deal.cashPrice);
    const cpp = this.computeCpp(miles, cashPrice);
    const availability = 1;
    const score = this.computeScore(cpp, availability);
    const departure = deal.departureDate ? deal.departureDate.toISOString() : null;
    const createdAt = deal.createdAt.toISOString();
    const updatedAt = deal.updatedAt.toISOString();
    const expiresAt = deal.expiresAt ? deal.expiresAt.toISOString() : null;
    const sanitizedBookingUrl = this.sanitizeBookingUrl(deal.bookingUrl, {
      airline: deal.airline,
      program,
    });

    return {
      id: deal.id,
      watcherId: `seats-aero-${program}`,
      watcherName: program,
      provider: providerLabel,
      airline: deal.airline ?? null,
      cabin: deal.cabin ?? null,
      route: {
        origin: deal.origin ?? null,
        destination: deal.destination ?? null,
        departure,
        arrival: null,
        durationMinutes: null,
        stops: null,
        aircraft: null,
      },
      availability,
      score,
      cpp,
      value: null,
      taxes: cashPrice,
      pricing: {
        primaryType: 'award',
        price: cashPrice ?? 0,
        currency: 'USD',
        milesRequired: miles,
        cashPrice,
        cashCurrency: 'USD',
        pointsCashPrice: null,
        pointsCashCurrency: null,
        pointsCashMiles: null,
        options: [
          {
            type: 'award',
            miles: miles ?? undefined,
            cashAmount: cashPrice ?? undefined,
            cashCurrency: 'USD',
            provider: providerLabel,
            bookingUrl: sanitizedBookingUrl ?? undefined,
            description: `Book via ${program}`,
          },
        ],
      },
      bookingUrl: sanitizedBookingUrl,
      status: 'active',
      createdAt,
      updatedAt,
      expiresAt,
      scoreBreakdown: {
        cpp,
        availability,
        score,
      },
    };
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (value && typeof value === 'object' && 'toString' in value) {
      const coerced = Number((value as { toString(): string }).toString());
      return Number.isFinite(coerced) ? coerced : null;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
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

  toDealView(deal: DealWithWatcher): DealView {
    const raw = this.parseRawFlight(deal.rawData);
    const providerProgram = this.extractProgramFromProvider(
      deal.provider ?? raw?.provider ?? null,
    );
    const options = this.normalizePricingOptions(
      deal.pricingOptions,
      deal.provider ?? raw?.provider ?? undefined,
      {
        airline: deal.airline ?? raw?.airline ?? null,
        program: providerProgram,
      },
    );
    const route = this.buildRoute(deal, raw);

    const bookingUrl =
      this.sanitizeBookingUrl(deal.bookingUrl, {
        airline: deal.airline ?? raw?.airline ?? null,
        program: providerProgram,
      }) ?? options.find((option) => option.bookingUrl)?.bookingUrl ?? null;

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
    context?: { airline?: string | null; program?: string | null },
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
          bookingUrl: this.sanitizeBookingUrl(option.bookingUrl, {
            airline: context?.airline,
            program: context?.program,
          }) ?? undefined,
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

  private sanitizeBookingUrl(
    url: unknown,
    context?: { airline?: string | null; program?: string | null },
  ): string | null {
    if (typeof url !== 'string') {
      return null;
    }

    const trimmed = url.trim();
    if (!trimmed) {
      return null;
    }

    const normalized = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;

    let parsed: URL;
    try {
      parsed = new URL(normalized);
    } catch {
      return null;
    }

    if (parsed.protocol !== 'https:') {
      return null;
    }

    const host = parsed.hostname.toLowerCase();
    if (!this.isAllowedBookingHost(host, context)) {
      return null;
    }

    return parsed.toString();
  }

  private isAllowedBookingHost(
    host: string,
    context?: { airline?: string | null; program?: string | null },
  ): boolean {
    const normalizedHost = host.toLowerCase();

    if (BOOKING_HOST_ALLOWLIST.some((fragment) => normalizedHost.includes(fragment))) {
      return true;
    }

    const slugHost = normalizedHost.replace(/[^a-z0-9]/g, '');
    const slugs = new Set<string>();
    if (context?.airline) {
      slugs.add(this.slugify(context.airline));
    }
    if (context?.program) {
      slugs.add(this.slugify(context.program));
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

  private slugify(value: string | null | undefined): string {
    return value ? value.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  }

  private extractProgramFromProvider(provider: string | null): string | null {
    if (!provider) {
      return null;
    }

    const trimmed = provider.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.includes('·')) {
      const parts = trimmed
        .split('·')
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
      }
    }

    return trimmed.toLowerCase();
  }
}
