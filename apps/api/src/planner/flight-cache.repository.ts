import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { TripQuery, CachedAwardCandidate } from '@mile/shared';

interface CacheQueryResult {
  candidates: CachedAwardCandidate[];
  freshestAt?: string;
  consideredCount: number;
}

const ANYWHERE_RESULT_LIMIT = 100;

@Injectable()
export class FlightCacheRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCachedCandidates(query: TripQuery): Promise<CacheQueryResult> {
    const now = new Date();
    const destinationsFilter = Array.isArray(query.destinations)
      ? { destination: { in: query.destinations } }
      : {};

    const take = Array.isArray(query.destinations)
      ? 300
      : Math.min(ANYWHERE_RESULT_LIMIT, 300);

    const records = await this.prisma.seatsAeroDeal.findMany({
      where: {
        origin: { in: query.origins },
        ...destinationsFilter,
        ...(query.programs?.length ? { program: { in: query.programs } } : {}),
        ...(query.maxPoints ? { miles: { lte: query.maxPoints } } : {}),
        ...(query.cabin ? { cabin: query.cabin } : {}),
        ...(query.dateWindow?.start && query.dateWindow?.end
          ? {
              departureDate: {
                gte: new Date(query.dateWindow.start),
                lte: new Date(query.dateWindow.end),
              },
            }
          : {}),
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [
        { updatedAt: 'desc' },
        { miles: 'asc' },
        { createdAt: 'desc' },
      ],
      take,
    });

    const candidates: CachedAwardCandidate[] = records.map((record) => {
      const raw = (record.rawData as any) ?? {};
      const segments = Array.isArray(raw?.segments) ? raw.segments : [];
      const stops = segments.length > 0 ? segments.length - 1 : raw?.stops ?? null;
      const departAt: string | null = raw?.departure
        ? new Date(raw.departure).toISOString()
        : record.departureDate
        ? record.departureDate.toISOString()
        : null;
      const arriveAt: string | null = raw?.arrival
        ? new Date(raw.arrival).toISOString()
        : raw?.arrivalTime
        ? new Date(raw.arrivalTime).toISOString()
        : null;
      const availability = typeof raw?.availability === 'number' ? raw.availability : null;

      return {
        id: record.id,
        provider: 'seats_aero_cache',
        airline: record.airline ?? null,
        program: record.program ?? null,
        cabin: record.cabin ?? null,
        origin: record.origin ?? null,
        destination: record.destination ?? null,
        departAt,
        arriveAt,
        stops,
        pointsCost: record.miles ?? null,
        taxesFeesUsd: record.cashPrice ? Number(record.cashPrice) : null,
        bookingUrl: record.bookingUrl ?? null,
        bookingLinkStatus: record.bookingUrl ? 'cached' : 'unavailable_in_cache',
        cacheUpdatedAt: record.updatedAt.toISOString(),
        fetchedAt: record.createdAt.toISOString(),
        rawRef: record.externalId,
        availability,
      } satisfies CachedAwardCandidate;
    });

    const freshest = candidates.reduce<string | undefined>((acc, current) => {
      if (!current.cacheUpdatedAt) return acc;
      if (!acc) return current.cacheUpdatedAt;
      return new Date(current.cacheUpdatedAt) > new Date(acc)
        ? current.cacheUpdatedAt
        : acc;
    }, undefined);

    return {
      candidates,
      freshestAt: freshest,
      consideredCount: candidates.length,
    };
  }
}
