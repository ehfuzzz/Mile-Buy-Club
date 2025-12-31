import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PlannerController, PlannerShareController } from '../planner.controller';
import { PlanService } from '../plan.service';
import { FlightCacheRepository } from '../flight-cache.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { createDefaultUserState, TripQuery } from '@mile/shared';
import { SavedPlansService } from '../saved-plans.service';

jest.mock('../../deals/seats-aero-partner.service', () => {
  throw new Error('Third-party SeatsAero client must not be imported in planner');
});

class InMemoryPrismaService {
  seatsAeroDeals: any[] = [];
  savedPlans: any[] = [];
  onboardingSessions: any[] = [];

  seatsAeroDeal = {
    findMany: async ({ where, orderBy, take }: any) => {
      const filtered = this.seatsAeroDeals.filter((deal) => {
        if (where.origin?.in && !where.origin.in.includes(deal.origin)) return false;
        if (where.destination?.in && !where.destination.in.includes(deal.destination)) return false;
        if (where.program?.in && !where.program.in.includes(deal.program)) return false;
        if (where.miles?.lte && typeof deal.miles === 'number' && deal.miles > where.miles.lte) return false;
        if (where.cabin && deal.cabin !== where.cabin) return false;
        if (where.departureDate?.gte && deal.departureDate && deal.departureDate < where.departureDate.gte) return false;
        if (where.departureDate?.lte && deal.departureDate && deal.departureDate > where.departureDate.lte) return false;
        if (where.OR) {
          const valid = where.OR.some((clause: any) => {
            if (clause.expiresAt === null) return deal.expiresAt === null || deal.expiresAt === undefined;
            if (clause.expiresAt?.gt && deal.expiresAt) return deal.expiresAt > clause.expiresAt.gt;
            return false;
          });
          if (!valid) return false;
        }
        return true;
      });

      const sorted = [...filtered].sort((a, b) => {
        for (const rule of orderBy ?? []) {
          const [key, dir] = Object.entries(rule)[0] as [string, 'asc' | 'desc'];
          const av = a[key];
          const bv = b[key];
          if (av instanceof Date && bv instanceof Date) {
            if (av.getTime() === bv.getTime()) continue;
            return dir === 'desc' ? bv.getTime() - av.getTime() : av.getTime() - bv.getTime();
          }
          if (av === bv) continue;
          return dir === 'desc' ? (bv ?? 0) - (av ?? 0) : (av ?? 0) - (bv ?? 0);
        }
        return 0;
      });

      const limit = take ?? sorted.length;
      return sorted.slice(0, limit);
    },
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
    findMany: async ({ where, orderBy }: any) => {
      const results = this.savedPlans.filter((plan) => !where?.sessionId || plan.sessionId === where.sessionId);
      if (orderBy?.createdAt === 'desc') {
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return results;
    },
    findFirst: async ({ where }: any) =>
      this.savedPlans.find((plan) => {
        if (where.id && plan.id !== where.id) return false;
        if (where.sessionId && plan.sessionId !== where.sessionId) return false;
        if (where.shareToken && plan.shareToken !== where.shareToken) return false;
        if (where.visibility && plan.visibility !== where.visibility) return false;
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

  onboardingSession = {
    findUnique: async ({ where: { id } }: any) => this.onboardingSessions.find((s) => s.id === id) ?? null,
  };
}

describe('Saved Plans API (integration)', () => {
  let app: INestApplication;
  let prisma: InMemoryPrismaService;
  const onboardingMock = {
    getStateForSession: jest.fn().mockImplementation(async () => ({
      sessionId: 'sess-1',
      userStateVersion: 1,
      created: false,
      onboardingStatus: 'complete',
      userState: createDefaultUserState(),
      requestId: 'req',
    })),
  };

  const buildQuery = (overrides: Partial<TripQuery> = {}): TripQuery => ({
    origins: ['JFK'],
    destinations: ['LHR'],
    dateWindow: { start: '2024-01-01', end: '2024-01-10' },
    cabin: 'business',
    passengers: 1,
    allowStaleCache: false,
    ...overrides,
  });

  const seedDeal = (overrides: Partial<any> = {}) => {
    const now = new Date();
    prisma.seatsAeroDeals.push({
      id: `deal-${prisma.seatsAeroDeals.length + 1}`,
      externalId: 'ext-1',
      airline: 'AA',
      program: 'aa',
      origin: 'JFK',
      destination: 'LHR',
      departureDate: new Date('2024-01-05T10:00:00Z'),
      cabin: 'business',
      miles: 50000,
      cashPrice: 5,
      bookingUrl: null,
      rawData: { segments: [], availability: 4 },
      createdAt: now,
      updatedAt: now,
      expiresAt: null,
      ...overrides,
    });
  };

  beforeEach(async () => {
    prisma = new InMemoryPrismaService();
    prisma.onboardingSessions.push({ id: 'sess-1', userId: 'user-1', createdAt: new Date(), updatedAt: new Date() });

    const moduleRef = await Test.createTestingModule({
      controllers: [PlannerController, PlannerShareController],
      providers: [
        PlanService,
        SavedPlansService,
        FlightCacheRepository,
        { provide: PrismaService, useValue: prisma },
        { provide: OnboardingService, useValue: onboardingMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('saves, lists, fetches, shares, and revokes plans without external calls', async () => {
    seedDeal();
    const query = buildQuery();

    const planResponse = await request(app.getHttpServer())
      .post('/planner/plan')
      .set('x-onboarding-session', 'sess-1')
      .send(query);

    expect(planResponse.status).toBe(200);
    expect(planResponse.body.type).toBe('ok');

    const selected = planResponse.body.options[0];

    const saveResponse = await request(app.getHttpServer())
      .post('/planner/plans')
      .set('x-onboarding-session', 'sess-1')
      .send({ query, selectedOption: selected, makePublic: true, title: 'Test Plan' });

    expect(saveResponse.status).toBe(201);
    const planId = saveResponse.body.id;
    const shareToken = saveResponse.body.savedPlan.shareToken;
    expect(shareToken).toBeDefined();

    const listResponse = await request(app.getHttpServer())
      .get('/planner/plans')
      .set('x-onboarding-session', 'sess-1');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.plans).toHaveLength(1);
    expect(listResponse.body.plans[0].id).toBe(planId);

    const getResponse = await request(app.getHttpServer())
      .get(`/planner/plans/${planId}`)
      .set('x-onboarding-session', 'sess-1');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.plan.id).toBe(planId);
    expect(getResponse.body.currentCacheStatus).toBeDefined();

    const publicResponse = await request(app.getHttpServer()).get(`/share/plans/${shareToken}`);
    expect(publicResponse.status).toBe(200);
    expect(publicResponse.body.plan.sessionId).not.toBe('sess-1');

    const revokeResponse = await request(app.getHttpServer())
      .post(`/planner/plans/${planId}/revoke`)
      .set('x-onboarding-session', 'sess-1');

    expect(revokeResponse.status).toBe(200);
    expect(revokeResponse.body.visibility).toBe('private');
    expect(revokeResponse.body.shareToken).toBeUndefined();

    const revokedAccess = await request(app.getHttpServer()).get(`/share/plans/${shareToken}`);
    expect(revokedAccess.status).toBe(404);
  });
});
