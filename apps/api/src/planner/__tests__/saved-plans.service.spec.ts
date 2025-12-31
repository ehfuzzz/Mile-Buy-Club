import { HttpException } from '@nestjs/common';
import { SavedPlansService } from '../saved-plans.service';
import { FlightCacheRepository } from '../flight-cache.repository';
import { TripQuery, RankedOption } from '@mile/shared';

class StubPrismaService {
  savedPlans: any[] = [];
  onboardingSessions: any[] = [];

  onboardingSession = {
    findUnique: async ({ where: { id } }: any) => this.onboardingSessions.find((s) => s.id === id) ?? null,
  };

  savedPlan = {
    create: async ({ data }: any) => {
      const record = {
        id: data.id ?? `plan-${this.savedPlans.length + 1}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.savedPlans.push(record);
      return record;
    },
    findMany: async ({ where }: any) => this.savedPlans.filter((p) => !where?.sessionId || p.sessionId === where.sessionId),
    findFirst: async ({ where }: any) =>
      this.savedPlans.find((p) => {
        if (where.id && p.id !== where.id) return false;
        if (where.sessionId && p.sessionId !== where.sessionId) return false;
        if (where.shareToken && p.shareToken !== where.shareToken) return false;
        if (where.visibility && p.visibility !== where.visibility) return false;
        return true;
      }) ?? null,
    update: async ({ where, data }: any) => {
      const idx = this.savedPlans.findIndex((p) => p.id === where.id);
      if (idx === -1) throw new Error('not found');
      const updated = { ...this.savedPlans[idx], ...data, updatedAt: new Date() };
      this.savedPlans[idx] = updated;
      return updated;
    },
  };
}

class StubFlightCacheRepository {
  async findCachedCandidates(query: TripQuery) {
    return {
      candidates: [],
      freshestAt: '2024-01-01T00:00:00.000Z',
      consideredCount: 1,
    };
  }
}

const buildQuery = (): TripQuery => ({
  origins: ['JFK'],
  destinations: ['LHR'],
  dateWindow: { start: '2024-01-01', end: '2024-01-05' },
  cabin: 'business',
  passengers: 1,
  allowStaleCache: false,
});

const buildOption = (): RankedOption => ({
  candidateId: 'cand-1',
  candidate: {
    id: 'cand-1',
    provider: 'seats_aero_cache',
    cacheUpdatedAt: '2024-01-01T00:00:00.000Z',
    fetchedAt: '2024-01-01T00:00:00.000Z',
    bookingLinkStatus: 'cached',
    airline: null,
    program: null,
    cabin: null,
    origin: null,
    destination: null,
    departAt: null,
    arriveAt: null,
    stops: null,
    pointsCost: null,
    taxesFeesUsd: null,
  },
  verified: true,
  score: 1,
  scoreBreakdown: [{ key: 'base', value: 1, reason: 'test' }],
  passedConstraints: [],
  failedConstraints: [],
});

describe('SavedPlansService', () => {
  let prisma: StubPrismaService;
  let service: SavedPlansService;

  beforeEach(() => {
    prisma = new StubPrismaService();
    prisma.onboardingSessions.push({ id: 'sess-1', userId: 'user-1' });
    service = new SavedPlansService(prisma as any, new StubFlightCacheRepository() as unknown as FlightCacheRepository);
  });

  it('generates cryptographically strong share tokens when saving public plans', async () => {
    const response = await service.savePlan('sess-1', { query: buildQuery(), selectedOption: buildOption(), makePublic: true });
    const second = await service.savePlan('sess-1', { query: buildQuery(), selectedOption: buildOption(), makePublic: true });
    expect(response.savedPlan.shareToken).toBeDefined();
    expect(response.savedPlan.shareToken!.length).toBeGreaterThan(30);
    expect(response.savedPlan.shareToken).not.toEqual(second.savedPlan.shareToken);
  });

  it('fails closed when stored data is invalid', async () => {
    prisma.savedPlans.push({
      id: 'bad',
      sessionId: 'sess-1',
      title: 'bad',
      visibility: 'private',
      shareToken: null,
      queryJson: { invalid: true },
      selectedJson: {},
      provenance: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(service.getPlan('sess-1', 'bad')).rejects.toBeInstanceOf(HttpException);
  });

  it('does not expose private plans via share tokens', async () => {
    prisma.savedPlans.push({
      id: 'plan-1',
      sessionId: 'sess-1',
      title: 'private',
      visibility: 'private',
      shareToken: 'token123',
      queryJson: buildQuery(),
      selectedJson: buildOption(),
      provenance: {
        plannerVersion: 'cache_only_v1',
        cacheFreshestAt: '2024-01-01T00:00:00.000Z',
        cacheStale: false,
        consideredCount: 1,
        dataSource: 'db_cache_only',
        validatedAt: '2024-01-01T00:00:00.000Z',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(service.getPlanByShareToken('token123')).rejects.toBeInstanceOf(HttpException);
  });
});
