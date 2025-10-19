import { Injectable } from '@nestjs/common';
import { Deal, Prisma, Watcher } from '@prisma/client';
import { DealsService, DealView } from '../deals/deals.service';
import { PrismaService } from '../common/prisma/prisma.service';

export type WatcherStatus = 'active' | 'paused' | 'error';

export interface WatcherSummary {
  id: string;
  name: string;
  description: string | null;
  status: WatcherStatus;
  frequency: string;
  minScore: number;
  route: {
    origin: string | null;
    destination: string | null;
    departureDate: string | null;
    returnDate: string | null;
    isRoundTrip: boolean;
  };
  passengers: number;
  cabin: string | null;
  notifications: {
    email: boolean;
    push: boolean;
  };
  metrics: {
    dealsFound: number;
    lastRunAt: string | null;
    bestScore: number | null;
    availability: number | null;
  };
  airlines: string[];
  topDeals: DealView[];
  searchParams: Record<string, unknown>;
}

export interface WatcherListResponse {
  watchers: WatcherSummary[];
  stats: {
    total: number;
    active: number;
    paused: number;
    error: number;
    totalDeals: number;
  };
  userId: string;
  lastUpdated: string;
}

@Injectable()
export class WatchersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dealsService: DealsService,
  ) {}

  async listWatchers(userId?: string): Promise<WatcherListResponse> {
    const resolvedUserId = await this.dealsService.resolveUserId(userId);
    const records = await this.prisma.watcher.findMany({
      where: { userId: resolvedUserId },
      orderBy: { createdAt: 'asc' },
      include: {
        deals: {
          where: { status: 'active' },
          orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
          take: 10,
        },
      },
    });

    const watchers = records.map((record) => this.mapWatcher(record));

    const stats = watchers.reduce(
      (acc, watcher) => {
        acc.total += 1;
        acc.totalDeals += watcher.metrics.dealsFound;
        acc[watcher.status] += 1;
        return acc;
      },
      { total: 0, active: 0, paused: 0, error: 0, totalDeals: 0 },
    );

    return {
      watchers,
      stats,
      userId: resolvedUserId,
      lastUpdated: new Date().toISOString(),
    };
  }

  private mapWatcher(record: Watcher & { deals: Deal[] }): WatcherSummary {
    const searchParams = this.normalizeSearchParams(record.searchParams);
    const passengers = this.countPassengers(searchParams);
    const lastRunAt = record.lastRunAt ?? record.updatedAt ?? record.createdAt;
    const status = this.resolveStatus(record, lastRunAt, record.deals.length);
    const topDeals = record.deals
      .slice(0, 5)
      .map((deal) => this.dealsService.toDealView({ ...deal, watcher: { id: record.id, name: record.name } }));

    const airlines = Array.from(
      new Set(
        record.deals
          .map((deal) => deal.airline)
          .filter((airline): airline is string => Boolean(airline)),
      ),
    ).sort();

    const availability = record.deals.reduce((max, deal) => {
      if (typeof deal.availability === 'number') {
        return Math.max(max, deal.availability);
      }
      return max;
    }, 0);

    const departureDate = this.resolveDateString(
      (searchParams.departDate as string | undefined) ?? (searchParams.departureDate as string | undefined),
      record.deals[0]?.departDate ?? null,
    );
    const returnDate = this.resolveDateString(
      (searchParams.returnDate as string | undefined) ?? (searchParams.arrivalDate as string | undefined),
      record.deals[0]?.returnDate ?? null,
    );

    return {
      id: record.id,
      name: record.name,
      description: record.description ?? null,
      status,
      frequency: record.frequency,
      minScore: record.minScore,
      route: {
        origin: this.resolveString(searchParams.origin) ?? record.deals[0]?.origin ?? null,
        destination: this.resolveString(searchParams.destination) ?? record.deals[0]?.destination ?? null,
        departureDate,
        returnDate,
        isRoundTrip: Boolean(returnDate),
      },
      passengers,
      cabin: this.resolveString(searchParams.cabin) ?? record.deals[0]?.cabin ?? null,
      notifications: {
        email: record.notifyEmail,
        push: record.notifyPush,
      },
      metrics: {
        dealsFound: record.deals.length,
        lastRunAt: lastRunAt ? lastRunAt.toISOString() : null,
        bestScore: record.deals[0]?.score ?? null,
        availability: availability > 0 ? availability : 0,
      },
      airlines,
      topDeals,
      searchParams,
    };
  }

  private normalizeSearchParams(value: Prisma.JsonValue | null): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }
    return value as Record<string, unknown>;
  }

  private countPassengers(searchParams: Record<string, unknown>): number {
    const passengers = searchParams.passengers as
      | { adults?: number; children?: number; infants?: number }
      | undefined;
    if (!passengers) {
      return 1;
    }
    const adults = typeof passengers.adults === 'number' ? passengers.adults : 1;
    const children = typeof passengers.children === 'number' ? passengers.children : 0;
    const infants = typeof passengers.infants === 'number' ? passengers.infants : 0;
    return Math.max(1, adults + children + infants);
  }

  private resolveString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private resolveDateString(preferred: string | undefined, fallback: Date | null): string | null {
    if (preferred) {
      return preferred;
    }
    return fallback ? fallback.toISOString() : null;
  }

  private resolveStatus(record: Watcher, lastRunAt: Date | null, dealCount: number): WatcherStatus {
    if (!record.isActive) {
      return 'paused';
    }

    if (!lastRunAt) {
      return 'active';
    }

    const hoursSinceRun = (Date.now() - lastRunAt.getTime()) / (1000 * 60 * 60);
    if (dealCount === 0 && hoursSinceRun > 24) {
      return 'error';
    }

    return 'active';
  }
}
