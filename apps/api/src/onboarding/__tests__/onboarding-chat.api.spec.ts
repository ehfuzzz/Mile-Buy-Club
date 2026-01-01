import { INestApplication, HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OnboardingModule } from '../onboarding.module';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OnboardingChatService } from '../onboarding-chat.service';
import { LlamaClientService } from '../llama-client.service';

class InMemoryPrismaService {
  sessions = new Map<string, any>();
  counter = 0;

  onboardingChatSession = {
    findUnique: async ({ where }: any) => {
      return this.sessions.get(where.id) ?? null;
    },
    create: async ({ data }: any) => {
      const session = { id: `s-${++this.counter}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      this.sessions.set(session.id, session);
      return session;
    },
    update: async ({ where, data }: any) => {
      const existing = this.sessions.get(where.id);
      const next = { ...existing, ...data, updatedAt: new Date() };
      this.sessions.set(where.id, next);
      return next;
    },
  };
}

describe('Onboarding chat API', () => {
  let app: INestApplication;
  let prisma: InMemoryPrismaService;
  let llama: jest.Mocked<LlamaClientService>;

  beforeEach(async () => {
    prisma = new InMemoryPrismaService();
    llama = {
      chat: jest.fn().mockResolvedValue({
        assistant_message: 'updated',
        state_patch: { set: { homeAirports: ['JFK'], passengers: 2 } },
        missing_fields: [],
        questions: [],
      }),
    } as any;

    const moduleRef = await Test.createTestingModule({
      imports: [OnboardingModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(LlamaClientService)
      .useValue(llama)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates session', async () => {
    const response = await request(app.getHttpServer()).post('/onboarding/chat/session').send({}).expect(201);
    expect(response.body.sessionId).toBeDefined();
    expect(response.body.state).toEqual({});
  });

  it('applies state patch and returns rules', async () => {
    const { body } = await request(app.getHttpServer()).post('/onboarding/chat/session').send({}).expect(201);
    const message = await request(app.getHttpServer())
      .post('/onboarding/chat/message')
      .send({ sessionId: body.sessionId, message: 'hi' })
      .expect(201);

    expect(llama.chat).toHaveBeenCalled();
    expect(message.body.state.homeAirports).toEqual(['JFK']);
    expect(message.body.rules.find((r: any) => r.id === 'rule_homeAirports')).toBeDefined();
  });

  it('handles invalid JSON without mutating state', async () => {
    llama.chat.mockResolvedValueOnce('not-json' as any);
    const { body } = await request(app.getHttpServer()).post('/onboarding/chat/session').send({}).expect(201);
    const message = await request(app.getHttpServer())
      .post('/onboarding/chat/message')
      .send({ sessionId: body.sessionId, message: 'hi' })
      .expect(201);

    expect(message.body.state).toEqual({});
    expect(message.body.assistantMessage).toBeDefined();
  });

  it('surfaces llama unreachable as 503', async () => {
    llama.chat.mockRejectedValueOnce(new HttpException({ code: 'LLM_UNREACHABLE' }, 503));
    const { body } = await request(app.getHttpServer()).post('/onboarding/chat/session').send({}).expect(201);

    await request(app.getHttpServer())
      .post('/onboarding/chat/message')
      .send({ sessionId: body.sessionId, message: 'hi' })
      .expect(503);
  });
});
