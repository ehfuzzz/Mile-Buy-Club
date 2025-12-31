import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { USER_STATE_SCHEMA } from '@mile/shared';
import { OnboardingModule } from '../onboarding.module';
import { PrismaService } from '../../common/prisma/prisma.service';

class InMemoryPrismaService {
  users = new Map<string, { id: string }>();
  sessions = new Map<string, any>();
  states = new Map<string, { userId: string; state: any; version: number }>();
  failOnSessionCreate = false;
  sessionCounter = 0;

  addUser(userId: string) {
    this.users.set(userId, { id: userId });
  }

  user = {
    findUnique: async ({ where }: any) => {
      if (where?.id && this.users.has(where.id)) {
        return this.users.get(where.id);
      }
      return null;
    },
  };

  onboardingSession = {
    findUnique: async ({ where }: any) => {
      if (where?.id && this.sessions.has(where.id)) {
        return this.sessions.get(where.id);
      }
      return null;
    },
    findFirst: async ({ where }: any) => {
      const matches = Array.from(this.sessions.values()).filter((session) =>
        where?.userId ? session.userId === where.userId : true,
      );
      if (!matches.length) {
        return null;
      }
      return matches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    },
    create: async ({ data }: any) => {
      if (this.failOnSessionCreate) {
        this.failOnSessionCreate = false;
        throw new Error('session create failure');
      }
      const session = {
        id: `session-${++this.sessionCounter}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.sessions.set(session.id, session);
      return session;
    },
  };

  onboardingUserState = {
    findUnique: async ({ where }: any) => {
      if (!where?.userId) {
        return null;
      }
      const record = this.states.get(where.userId);
      return record ? { ...record } : null;
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = this.states.get(where.userId);
      if (existing) {
        const next = {
          ...existing,
          ...update,
          state: update.state ?? existing.state,
          version: update.version ?? existing.version,
        };
        this.states.set(where.userId, next);
        return { ...next };
      }
      const next = { ...create };
      this.states.set(create.userId, next);
      return { ...next };
    },
    create: async ({ data }: any) => {
      const next = { ...data };
      this.states.set(data.userId, next);
      return { ...next };
    },
  };

  onboardingMessage = {
    create: async ({ data }: any) => ({ id: `msg-${Date.now()}`, ...data }),
  };

  $transaction = async (handler: any) => handler(this);
}

describe('Onboarding API (integration)', () => {
  const USER_ID = 'user-1';
  let app: INestApplication;
  let prisma: InMemoryPrismaService;

  beforeEach(async () => {
    prisma = new InMemoryPrismaService();
    prisma.addUser(USER_ID);

    const moduleRef = await Test.createTestingModule({
      imports: [OnboardingModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const startSession = async () => {
    const response = await request(app.getHttpServer())
      .post('/onboarding/session')
      .send({ userId: USER_ID })
      .expect(200);

    const cookie = response.headers['set-cookie']?.[0];
    return { response, cookie };
  };

  it('creates onboarding session with validated default state', async () => {
    const { response, cookie } = await startSession();

    expect(response.body.sessionId).toBeDefined();
    expect(response.body.created).toBe(true);
    expect(response.body.onboardingStatus).toBe('new');
    expect(() => USER_STATE_SCHEMA.parse(response.body.userState)).not.toThrow();
    expect(cookie).toBeDefined();
  });

  it('resumes session idempotently when cookie is present', async () => {
    const { response, cookie } = await startSession();

    const resume = await request(app.getHttpServer())
      .post('/onboarding/session')
      .set('Cookie', cookie)
      .send({ userId: USER_ID })
      .expect(200);

    expect(resume.body.sessionId).toBe(response.body.sessionId);
    expect(resume.body.created).toBe(false);
  });

  it('returns onboarding state for an active session', async () => {
    const { response, cookie } = await startSession();

    const state = await request(app.getHttpServer())
      .get('/onboarding/state')
      .set('Cookie', cookie)
      .expect(200);

    expect(state.body.sessionId).toBe(response.body.sessionId);
    expect(state.body.userStateVersion).toBe(response.body.userStateVersion);
    expect(() => USER_STATE_SCHEMA.parse(state.body.userState)).not.toThrow();
  });

  it('applies deterministic patches and increments version', async () => {
    const { response, cookie } = await startSession();

    const patchPayload = {
      baseVersion: response.body.userStateVersion,
      ops: [{ op: 'set', path: '/travelPrefs/homeAirports', value: ['JFK'] }],
    };

    const patched = await request(app.getHttpServer())
      .post('/onboarding/state/patch')
      .set('Cookie', cookie)
      .send(patchPayload)
      .expect(200);

    expect(patched.body.userStateVersion).toBe(response.body.userStateVersion + 1);
    expect(patched.body.userState.travelPrefs.homeAirports).toEqual(['JFK']);
  });

  it('returns version conflict when baseVersion is stale', async () => {
    const { response, cookie } = await startSession();

    const patchPayload = {
      baseVersion: response.body.userStateVersion,
      ops: [{ op: 'set', path: '/travelPrefs/homeAirports', value: ['JFK'] }],
    };

    await request(app.getHttpServer())
      .post('/onboarding/state/patch')
      .set('Cookie', cookie)
      .send(patchPayload)
      .expect(200);

    const conflict = await request(app.getHttpServer())
      .post('/onboarding/state/patch')
      .set('Cookie', cookie)
      .send(patchPayload)
      .expect(409);

    expect(conflict.body.errorCode).toBe('STATE_VERSION_CONFLICT');
  });

  it('surfaces structured errors on persistence failures', async () => {
    prisma.failOnSessionCreate = true;

    const failure = await request(app.getHttpServer())
      .post('/onboarding/session')
      .send({ userId: USER_ID })
      .expect(500);

    expect(failure.body.errorCode).toBe('ONBOARDING_SESSION_CREATE_FAILED');
    expect(failure.body.requestId).toBeDefined();
  });
});
