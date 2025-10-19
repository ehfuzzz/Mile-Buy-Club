import { Injectable, NotFoundException } from '@nestjs/common';
import { Deal, Prisma, Watcher } from '@prisma/client';
import {
  type Flight,
  type FlightPricingOption,
  type FlightPricingOptionType,
  type FlightSegment,
} from '@mile/providers';
import { PrismaService } from '../common/prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

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

  async listDeals(userId?: string, limit = 100): Promise<DealsListResponse> {
    const resolvedUserId = await this.resolveUserId(userId);
    const records = await this.prisma.deal.findMany({
      where: { userId: resolvedUserId, status: 'active' },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        watcher: {
          select: { id: true, name: true },
        },
      },
    });

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

  async listDealsForWatcher(
    watcherId: string,
    userId?: string,
    limit = 100,
  ): Promise<DealsListResponse> {
    const resolvedUserId = await this.resolveUserId(userId);
    const records = await this.prisma.deal.findMany({
      where: { watcherId, userId: resolvedUserId, status: 'active' },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        watcher: {
          select: { id: true, name: true },
        },
      },
    });

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

  toDealView(
    deal: Deal & { watcher?: Pick<Watcher, 'id' | 'name'> | null },
  ): DealView {
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
      availability: deal.availability ?? raw?.availability ?? null,
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

  private parseRawFlight(raw: Prisma.JsonValue | null): Flight | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    return raw as unknown as Flight;
  }

  private buildRoute(deal: Deal, raw: Flight | null): DealRouteView {
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
    raw: Prisma.JsonValue | null,
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

  private normalizeRecord(value: Prisma.JsonValue | null): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }
}
