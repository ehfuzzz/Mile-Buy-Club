import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PlannerController } from '../planner.controller';
import { PlanService } from '../plan.service';
import { FlightCacheRepository } from '../flight-cache.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OnboardingService } from '../../onboarding/onboarding.service';
import { SavedPlansService } from '../saved-plans.service';
import { TripQuery, createDefaultUserState } from '@mile/shared';

jest.mock('../../deals/seats-aero-partner.service', () => {
  throw new Error('Third-party SeatsAero client must not be imported in planner');
});

class InMemoryPrismaService {
  seatsAeroDeals: any[] = [];

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
}

describe('Planner API (integration)', () => {
  let app: INestApplication;
  let prisma: InMemoryPrismaService;
  const onboardingMock = {
    getStateForSession: jest.fn().mockImplementation(async () => ({
      sessionId: 'sess',
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

  beforeEach(async () => {
    prisma = new InMemoryPrismaService();

    const moduleRef = await Test.createTestingModule({
      controllers: [PlannerController],
      providers: [
        PlanService,
        FlightCacheRepository,
        SavedPlansService,
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

  it('returns ranked options from cache without external calls', async () => {
    seedDeal();
    const response = await request(app.getHttpServer())
      .post('/planner/plan')
      .set('x-onboarding-session', 'sess-1')
      .send(buildQuery());

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('ok');
    expect(response.body.options).toHaveLength(1);
    expect(response.body.options[0].candidate.id).toBeDefined();
    expect(onboardingMock.getStateForSession).toHaveBeenCalled();
  });

  it('fails closed when cache is stale', async () => {
    const staleDate = new Date(Date.now() - 1000 * 60 * 120);
    seedDeal({ updatedAt: staleDate, createdAt: staleDate });
    const response = await request(app.getHttpServer())
      .post('/planner/plan')
      .set('x-onboarding-session', 'sess-1')
      .send(buildQuery());

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('no_feasible_plan');
    expect(response.body.reasons[0].code).toBe('CACHE_STALE');
  });

  it('returns cache empty when no records exist', async () => {
    const response = await request(app.getHttpServer())
      .post('/planner/plan')
      .set('x-onboarding-session', 'sess-1')
      .send(buildQuery());

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('no_feasible_plan');
    expect(response.body.reasons[0].code).toBe('CACHE_EMPTY');
  });

  it('allows stale cache when explicitly permitted but marks unverified', async () => {
    const staleDate = new Date(Date.now() - 1000 * 60 * 120);
    seedDeal({ updatedAt: staleDate, createdAt: staleDate });
    const response = await request(app.getHttpServer())
      .post('/planner/plan')
      .set('x-onboarding-session', 'sess-1')
      .send(buildQuery({ allowStaleCache: true }));

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('ok');
    expect(response.body.options[0].verified).toBe(false);
  });
});
