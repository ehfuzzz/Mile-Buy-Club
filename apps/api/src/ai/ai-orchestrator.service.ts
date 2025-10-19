import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Prisma, TripPlan } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { PlanTripDto } from './dto/plan-trip.dto';
import { ChatDto } from './dto/chat.dto';
import { AnalyzeMediaDto } from './dto/analyze-media.dto';

interface StructuredTripPlan {
  title: string;
  summary: string;
  vibe?: string;
  highlights?: string[];
  loyaltyStrategy?: string;
  awardOpportunities?: Array<{
    provider: string;
    route: string;
    cabin?: string;
    price?: number;
    currency?: string;
    miles?: number;
    bookingUrl?: string;
    notes?: string;
  }>;
  cashOpportunities?: Array<{
    provider: string;
    description: string;
    price?: number;
    currency?: string;
    bookingUrl?: string;
  }>;
  dayPlans: Array<{
    day: number;
    date?: string;
    summary: string;
    focus?: string;
    experiences: Array<{
      title: string;
      category: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      priceEstimate?: number;
      currency?: string;
      bookingUrl?: string;
      description?: string;
    }>;
    meals?: Array<{
      type: string;
      name: string;
      notes?: string;
      reservationNeeded?: boolean;
    }>;
  }>;
  followUpQuestions?: string[];
}

interface ConversationTurn {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MediaInsightPayload {
  guesses: Array<{
    location: string;
    confidence: number;
    coordinates?: { lat: number; lng: number };
    rationale?: string;
  }>;
  vibe?: string;
  weather?: string;
  nearbyAttractions?: string[];
  recommendations?: string[];
}

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);
  private readonly defaultModel: string;
  private readonly visionModel: string;
  private readonly plannerTemperature: number;
  private readonly visionTemperature: number;
  private readonly openai: OpenAI | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.defaultModel = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4.1';
    this.visionModel = this.configService.get<string>('OPENAI_VISION_MODEL') ?? 'gpt-4.1-mini';
    this.plannerTemperature = this.parseNumber(
      this.configService.get<string>('OPENAI_PLANNER_TEMPERATURE'),
      0.4,
    );
    this.visionTemperature = this.parseNumber(
      this.configService.get<string>('OPENAI_VISION_TEMPERATURE'),
      0.1,
    );

    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY missing - AI trip planning is disabled until configured.');
      this.openai = null;
    } else {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async planTrip(dto: PlanTripDto) {
    const client = this.ensureClient();

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: {
        preference: true,
        loyaltyPrograms: { include: { program: true } },
        creditCards: { include: { card: true } },
        watchers: {
          where: { isActive: true },
          include: {
            deals: {
              where: { status: 'active' },
              orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
              take: 10,
            },
          },
          take: 5,
        },
        deals: {
          where: { status: 'active' },
          orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
          take: 12,
        },
        trips: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!user) {
      throw new BadRequestException(`User ${dto.userId} not found`);
    }

    const context = await this.buildPlannerContext(user.id, dto);

    const requestPayload = {
      travelerProfile: {
        name: user.name,
        timezone: user.timezone,
        preference: user.preference,
        loyaltyPrograms: user.loyaltyPrograms?.map((entry) => ({
          name: entry.program?.name ?? entry.programId,
          airline: entry.program?.airline,
          tier: entry.tier,
          balance: entry.program?.description,
        })),
        creditCards: user.creditCards?.map((entry) => ({
          name: entry.card.name,
          issuer: entry.card.issuer,
          network: entry.card.network,
          category: entry.card.category,
          signupBonus: entry.card.signupBonus,
        })),
        pastTrips: user.trips?.map((trip) => ({
          name: trip.name,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          status: trip.status,
        })),
      },
      planRequest: {
        title: dto.title,
        origin: dto.origin,
        destination: dto.destination,
        startDate: dto.startDate,
        endDate: dto.endDate,
        travelers: dto.travelers,
        budget: dto.budget,
        styleTags: dto.styleTags,
        interests: dto.interests,
        loyaltyPrograms: dto.loyaltyPrograms,
        preferredAirlines: dto.preferredAirlines,
        includeCashDeals: dto.includeCashDeals ?? true,
        includePointsDeals: dto.includePointsDeals ?? true,
        includeBlendDeals: dto.includeBlendDeals ?? true,
        tone: dto.tone,
        accessibilityNeeds: dto.accessibilityNeeds,
        customInstructions: dto.customInstructions,
      },
      inventorySnapshot: context.inventory,
      watcherFocus: dto.watcherFocus,
      mediaHints: context.mediaHints,
      competitiveDifferentiators: context.differentiators,
      watchers: user.watchers?.map((watcher) => ({
        id: watcher.id,
        name: watcher.name,
        type: watcher.type,
        minScore: watcher.minScore,
        frequency: watcher.frequency,
        lastRunAt: watcher.lastRunAt,
        searchParams: watcher.searchParams,
        recentDeals: watcher.deals?.slice(0, 5).map((deal) => ({
          id: deal.id,
          title: deal.title,
          provider: deal.provider,
          score: deal.score,
          price: deal.price,
          currency: deal.currency,
          primaryPricingType: deal.primaryPricingType,
          availability: deal.availability,
          bookingUrl: deal.bookingUrl,
        })),
      })),
    };

    const planSchema = this.buildTripPlanSchema();

    const response = await client.responses.create({
      model: this.defaultModel,
      temperature: this.plannerTemperature,
      reasoning: { effort: 'medium' },
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: this.buildPlannerSystemPrompt(),
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(requestPayload),
            },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: planSchema,
      },
    });

    const structured = this.parseResponseJson<StructuredTripPlan>(response);
    if (!structured) {
      throw new BadRequestException('AI planner returned an empty response');
    }

    const persistedPlan = await this.persistTripPlan(dto, structured);

    const session = await this.ensureSession(dto, persistedPlan.id, requestPayload, structured);

    return {
      tripPlanId: persistedPlan.id,
      sessionId: session.id,
      plan: structured,
      savedPlan: persistedPlan,
    };
  }

  async continueConversation(dto: ChatDto) {
    const client = this.ensureClient();

    let session = dto.sessionId
      ? await this.prisma.aiSession.findUnique({
          where: { id: dto.sessionId },
          include: { messages: { orderBy: { createdAt: 'asc' }, take: 30 } },
        })
      : null;

    if (!session) {
      session = await this.prisma.aiSession.create({
        data: {
          userId: dto.userId,
          tripPlanId: dto.tripPlanId,
          model: this.defaultModel,
          persona: dto.tone,
          mode: 'assistant',
        },
        include: { messages: true },
      });
    }

    if (session.userId !== dto.userId) {
      throw new BadRequestException('Cannot access another user\'s conversation');
    }

    const history = await this.buildConversationHistory(session.id);

    const messages: ConversationTurn[] = [
      {
        role: 'system',
        content: this.buildChatSystemPrompt(dto.tone),
      },
      ...history,
      {
        role: 'user',
        content: dto.message,
      },
    ];

    const response = await client.responses.create({
      model: this.defaultModel,
      temperature: this.plannerTemperature,
      input: messages.map((entry) => ({
        role: entry.role,
        content: [
          {
            type: 'input_text',
            text: entry.content,
          },
        ],
      })),
    });

    const assistantMessage = this.extractText(response);

    await this.prisma.$transaction([
      this.prisma.aiMessage.create({
        data: {
          sessionId: session!.id,
          role: 'user',
          content: { text: dto.message, followUpPrompts: dto.followUpPrompts },
        },
      }),
      this.prisma.aiMessage.create({
        data: {
          sessionId: session!.id,
          role: 'assistant',
          content: { text: assistantMessage },
        },
      }),
    ]);

    return {
      sessionId: session.id,
      response: assistantMessage,
    };
  }

  async analyzeMedia(dto: AnalyzeMediaDto) {
    const client = this.ensureClient();

    if (!dto.imageUrls?.length && !dto.videoFrames?.length) {
      throw new BadRequestException('Provide at least one image or video frame to analyze');
    }

    const schema = this.buildMediaSchema();

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new BadRequestException(`User ${dto.userId} not found`);
    }

    const input = [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: this.buildVisionSystemPrompt(),
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text:
              dto.prompt ??
              'Identify the most likely location and travel context from these visuals. Provide confidence scores and suggestions.',
          },
          ...((dto.imageUrls ?? []).map((url) => ({
            type: 'input_image' as const,
            image_url: url,
          }))),
          ...((dto.videoFrames ?? []).map((frame) => ({
            type: 'input_image' as const,
            image_url: frame.url,
            metadata: frame.timestampSeconds
              ? { timestampSeconds: frame.timestampSeconds }
              : undefined,
          }))),
        ],
      },
    ];

    const response = await client.responses.create({
      model: this.visionModel,
      temperature: this.visionTemperature,
      input,
      response_format: { type: 'json_schema', json_schema: schema },
    });

    const result = this.parseResponseJson<MediaInsightPayload>(response);
    if (!result) {
      throw new BadRequestException('Vision model returned no insights');
    }

    const mediaInsight = await this.prisma.mediaInsight.create({
      data: {
        userId: dto.userId,
        tripPlanId: dto.tripPlanId,
        mediaType: dto.videoFrames?.length ? 'video' : 'image',
        source: dto.imageUrls?.[0] ?? dto.videoFrames?.[0]?.url,
        prompt: dto.prompt,
        inference: result as unknown as Prisma.JsonObject,
        confidence: result.guesses?.[0]?.confidence,
      },
    });

    return {
      insightId: mediaInsight.id,
      result,
    };
  }

  private ensureClient(): OpenAI {
    if (!this.openai) {
      throw new BadRequestException('AI features are disabled until OPENAI_API_KEY is configured');
    }

    return this.openai;
  }

  private parseNumber(value: string | undefined | null, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private buildPlannerSystemPrompt(): string {
    return [
      'You are Mile Buy Club Copilot, an elite travel concierge that blends award travel mastery with cash fare arbitrage.',
      'You have access to the traveler profile, loyalty balances, cards, current deals, and optional media hints.',
      'Design an itinerary that surfaces award, cash, and hybrid opportunities. Respect accessibility requests and pacing.',
      'Surface loyalty optimization tips, positioning flights when relevant, and premium experiences that align with preferences.',
      'Respond in structured JSON that matches the provided schema. Avoid markdown. Use USD for price estimates unless another currency is specified.',
    ].join(' ');
  }

  private buildChatSystemPrompt(tone: ChatDto['tone']): string {
    const toneDescriptor =
      tone === 'concierge'
        ? 'Warm luxury concierge with proactive suggestions.'
        : tone === 'executive'
        ? 'Succinct executive assistant who prioritizes efficiency.'
        : tone === 'friendly'
        ? 'Upbeat friend that loves sharing insider hacks.'
        : tone === 'expert'
        ? 'Seasoned award travel analyst with data-backed recommendations.'
        : 'Balanced strategist who mixes enthusiasm with pragmatism.';

    return [
      'You are the Mile Buy Club conversational copilot. Maintain memory, cite deals by provider when known, and keep replies actionable.',
      `Tone: ${toneDescriptor}`,
      'Always offer optional next steps and highlight whether suggestions require miles, cash, or blended payments.',
    ].join(' ');
  }

  private buildVisionSystemPrompt(): string {
    return [
      'You are a multimodal travel scout that recognises landmarks, hotel brands, beaches, mountain ranges, skylines, and cultural cues.',
      'Infer the most likely location(s) with confidence scores. Mention the vibe, season clues, and travel tips that match the visuals.',
      'Link your guesses back to loyalty programs or known partner properties when relevant. Output JSON as per schema.',
    ].join(' ');
  }

  private buildTripPlanSchema() {
    return {
      name: 'TripPlanResponse',
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          summary: { type: 'string' },
          vibe: { type: 'string' },
          highlights: {
            type: 'array',
            items: { type: 'string' },
          },
          loyaltyStrategy: { type: 'string' },
          awardOpportunities: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                provider: { type: 'string' },
                route: { type: 'string' },
                cabin: { type: 'string' },
                price: { type: 'number' },
                currency: { type: 'string' },
                miles: { type: 'number' },
                bookingUrl: { type: 'string' },
                notes: { type: 'string' },
              },
            },
          },
          cashOpportunities: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                provider: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                currency: { type: 'string' },
                bookingUrl: { type: 'string' },
              },
            },
          },
          dayPlans: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['day', 'summary', 'experiences'],
              properties: {
                day: { type: 'integer' },
                date: { type: 'string' },
                summary: { type: 'string' },
                focus: { type: 'string' },
                experiences: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['title', 'category'],
                    properties: {
                      title: { type: 'string' },
                      category: { type: 'string' },
                      startTime: { type: 'string' },
                      endTime: { type: 'string' },
                      location: { type: 'string' },
                      latitude: { type: 'number' },
                      longitude: { type: 'number' },
                      priceEstimate: { type: 'number' },
                      currency: { type: 'string' },
                      bookingUrl: { type: 'string' },
                      description: { type: 'string' },
                    },
                  },
                },
                meals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      type: { type: 'string' },
                      name: { type: 'string' },
                      notes: { type: 'string' },
                      reservationNeeded: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
          followUpQuestions: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['title', 'summary', 'dayPlans'],
      },
    };
  }

  private buildMediaSchema() {
    return {
      name: 'MediaInsight',
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          guesses: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['location', 'confidence'],
              properties: {
                location: { type: 'string' },
                confidence: { type: 'number' },
                coordinates: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' },
                  },
                },
                rationale: { type: 'string' },
              },
            },
          },
          vibe: { type: 'string' },
          weather: { type: 'string' },
          nearbyAttractions: {
            type: 'array',
            items: { type: 'string' },
          },
          recommendations: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['guesses'],
      },
    };
  }

  private async buildConversationHistory(sessionId: string): Promise<ConversationTurn[]> {
    const messages = await this.prisma.aiMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 12,
    });

    return messages.map((message) => ({
      role: message.role as ConversationTurn['role'],
      content: typeof message.content === 'object' && message.content
        ? JSON.stringify(message.content)
        : String(message.content ?? ''),
    }));
  }

  private parseResponseJson<T>(response: OpenAI.Responses.Response): T | null {
    try {
      const jsonText = this.extractText(response);
      if (!jsonText) {
        return null;
      }
      return JSON.parse(jsonText) as T;
    } catch (error) {
      this.logger.error('Failed to parse JSON from AI response', error as Error);
      return null;
    }
  }

  private extractText(response: OpenAI.Responses.Response): string {
    const output = (response as unknown as { output?: Array<{ content?: Array<any> }> })?.output ?? [];
    const segments: string[] = [];

    for (const chunk of output) {
      for (const piece of chunk.content ?? []) {
        if (piece?.type === 'output_text' && typeof piece.text === 'string') {
          segments.push(piece.text.trim());
        }
        if (piece?.type === 'text' && typeof piece.text === 'string') {
          segments.push(piece.text.trim());
        }
      }
    }

    return segments.length > 0 ? segments.join('\n') : '';
  }

  private async persistTripPlan(dto: PlanTripDto, structured: StructuredTripPlan): Promise<TripPlan> {
    let existingPlan: TripPlan | null = null;
    if (dto.existingTripPlanId) {
      existingPlan = await this.prisma.tripPlan.findUnique({ where: { id: dto.existingTripPlanId } });
      if (!existingPlan || existingPlan.userId !== dto.userId) {
        throw new BadRequestException('Trip plan not found for this user');
      }
    }

    const styleTags = Array.from(
      new Set([
        ...(structured.vibe ? [structured.vibe] : []),
        ...((structured.highlights ?? []).filter((entry) => entry.trim().length > 0)),
      ]),
    );

    const baseData: Prisma.TripPlanUncheckedCreateInput = {
      userId: dto.userId,
      title: structured.title,
      summary: structured.summary,
      origin: dto.origin,
      destination: dto.destination,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      travelers: dto.travelers,
      budget: dto.budget,
      styleTags,
      llmModel: this.defaultModel,
      plannerVersion: 'v1',
      preferences: structured.loyaltyStrategy
        ? ({ loyaltyStrategy: structured.loyaltyStrategy } as Prisma.JsonObject)
        : undefined,
      plan: structured as unknown as Prisma.JsonObject,
      insights: {
        awardOpportunities: structured.awardOpportunities ?? [],
        cashOpportunities: structured.cashOpportunities ?? [],
        followUps: structured.followUpQuestions ?? [],
      } as Prisma.JsonObject,
    };

    const tripPlan = existingPlan
      ? await this.prisma.tripPlan.update({
          where: { id: existingPlan.id },
          data: baseData,
        })
      : await this.prisma.tripPlan.create({
          data: baseData,
        });

    await this.prisma.tripPlanDay.deleteMany({ where: { tripPlanId: tripPlan.id } });

    for (const day of structured.dayPlans ?? []) {
      const dayRecord = await this.prisma.tripPlanDay.create({
        data: {
          tripPlanId: tripPlan.id,
          dayNumber: day.day,
          date: this.toOptionalDate(day.date),
          summary: day.summary,
          highlights: day.focus ? ({ focus: day.focus } as Prisma.JsonObject) : undefined,
          meals: day.meals ? (day.meals as unknown as Prisma.JsonValue) : undefined,
        },
      });

      if (day.experiences?.length) {
        await this.prisma.tripPlanExperience.createMany({
          data: day.experiences.map((experience) => ({
            tripPlanDayId: dayRecord.id,
            title: experience.title,
            category: experience.category,
            startTime: experience.startTime,
            endTime: experience.endTime,
            location: experience.location,
            latitude: experience.latitude,
            longitude: experience.longitude,
            price: experience.priceEstimate,
            currency: experience.currency,
            bookingUrl: experience.bookingUrl,
            notes: experience.description,
            metadata: experience as unknown as Prisma.JsonObject,
          })),
        });
      }
    }

    return tripPlan;
  }

  private toOptionalDate(value?: string): Date | undefined {
    if (!value) return undefined;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? new Date(parsed) : undefined;
  }

  private async ensureSession(
    dto: PlanTripDto,
    tripPlanId: string,
    requestPayload: unknown,
    structured: StructuredTripPlan,
  ) {
    if (dto.existingSessionId) {
      const existingSession = await this.prisma.aiSession.findUnique({
        where: { id: dto.existingSessionId },
      });

      if (existingSession && existingSession.userId !== dto.userId) {
        throw new BadRequestException('Cannot reuse a session that belongs to a different user');
      }
    }

    const session = dto.existingSessionId
      ? await this.prisma.aiSession.upsert({
          where: { id: dto.existingSessionId },
          update: {
            tripPlanId,
            model: this.defaultModel,
            persona: dto.tone,
            mode: 'assistant',
          },
          create: {
            userId: dto.userId,
            tripPlanId,
            model: this.defaultModel,
            persona: dto.tone,
            mode: 'assistant',
          },
        })
      : await this.prisma.aiSession.create({
          data: {
            userId: dto.userId,
            tripPlanId,
            model: this.defaultModel,
            persona: dto.tone,
            mode: 'assistant',
          },
        });

    await this.prisma.aiMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: 'system',
          content: requestPayload as Prisma.JsonValue,
        },
        {
          sessionId: session.id,
          role: 'assistant',
          content: structured as unknown as Prisma.JsonValue,
        },
      ],
    });

    return session;
  }

  private async buildPlannerContext(userId: string, dto: PlanTripDto) {
    const deals = await this.prisma.deal.findMany({
      where: {
        userId,
        status: 'active',
        ...(dto.destination ? { destination: dto.destination } : {}),
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      take: 15,
    });

    const inventory = deals.map((deal) => ({
      id: deal.id,
      provider: deal.provider,
      title: deal.title,
      score: deal.score,
      price: deal.price,
      currency: deal.currency,
      milesRequired: deal.milesRequired,
      cashPrice: deal.cashPrice,
      cashCurrency: deal.cashCurrency,
      pointsCashPrice: deal.pointsCashPrice,
      pointsCashCurrency: deal.pointsCashCurrency,
      availability: deal.availability,
      cabin: deal.cabin,
      origin: deal.origin,
      destination: deal.destination,
      departDate: deal.departDate,
      bookingUrl: deal.bookingUrl,
      primaryPricingType: deal.primaryPricingType,
    }));

    const providerNames = Array.from(
      new Set(
        inventory
          .map((deal) => deal.provider)
          .filter((provider): provider is string => Boolean(provider)),
      ),
    );

    return {
      inventory,
      mediaHints: dto.mediaUrls,
      differentiators: {
        coverage: providerNames,
        autopilot: 'Auto-refreshes deals every 5 minutes with seat availability checks.',
        personalization: 'Blends loyalty balances, cards, and visual cues into planning.',
      },
    };
  }
}
