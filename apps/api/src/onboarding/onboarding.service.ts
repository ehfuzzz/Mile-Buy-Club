import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  AlertMode,
  Alliance,
  Cabin,
  PrefMode,
  Prisma,
  TripStyle,
  InterestTag,
  DietaryTag,
  AccessibilityTag,
  DestMode,
  LoyaltyKind,
} from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { LocationsService, ResolveLocationInput } from './locations.service';
import {
  onboardingExtractionSchema,
  OnboardingExtraction,
  normalizeCabin,
  normalizeAlertMode,
  normalizeAlliance,
  resolveAirlineCode,
} from '@mile/shared';
import { getOpenAIClient } from '../lib/openai';
import { OnboardingMessageDto } from './dto/message.dto';
import { ExtractProfileDto } from './dto/extract.dto';
import { UpdateProfileDto, LocationInputDto } from './dto/update-profile.dto';
import { CreateSessionDto } from './dto/create-session.dto';

const SYSTEM_PROMPT = `You are an expert travel intake assistant. Convert chatty answers into a strict JSON profile for flight + hotel planning. 
- Map airports/cities/regions into {kind, code, name}. Use IATA codes when clear; otherwise keep name and leave code null.
- Constrain enums: Cabin=Y|W|J|F; AlertMode=HIGH_QUALITY|DIGEST; Alliances=STAR|ONEWORLD|SKYTEAM.
- Keep any unknowns as free text in raw_free_text; never invent data.
- Prefer city codes like NYC over individual airports if user says "NYC area".
- Preserve numbers as numbers (not strings).
Output STRICT JSON only.`;

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly locations: LocationsService,
  ) {}

  async createSession(dto: CreateSessionDto) {
    await this.ensureUserExists(dto.userId);

    try {
      const session = await this.prisma.onboardingSession.create({
        data: {
          userId: dto.userId,
        },
      });

      this.logger.log(`Created onboarding session ${session.id} for user ${dto.userId}`);
      return session;
    } catch (error) {
      this.handlePrismaError('createSession', error, dto.userId);
    }
  }

  async appendMessage(dto: OnboardingMessageDto) {
    const session = await this.prisma.onboardingSession.findUnique({
      where: { id: dto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Onboarding session not found');
    }

    return this.prisma.onboardingMessage.create({
      data: {
        sessionId: dto.sessionId,
        role: dto.role,
        content: dto.content,
      },
    });
  }

  async extractProfile(dto: ExtractProfileDto) {
    const session = await this.prisma.onboardingSession.findUnique({
      where: { id: dto.sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Onboarding session not found');
    }

    const transcript = session.messages
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join('\n');

    const extraction = await this.runExtraction(transcript);
    await this.persistProfile(dto.userId, extraction, session.id);

    return this.getProfile(dto.userId);
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        homeBases: { include: { location: true } },
        destinations: { include: { location: true } },
        styles: true,
        interests: true,
        dietary: true,
        accessibility: true,
        airlinesPref: { include: { airline: true } },
        alliancesPref: true,
        hotelProgramsPref: { include: { hotelProgram: true } },
        loyaltyBalances: { include: { loyaltyProgram: true } },
        cards: { include: { card: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.prisma.$transaction(async (tx) => {
      await tx.userProfile.upsert({
        where: { userId },
        update: {
          preferredCabin: dto.preferredCabin ?? undefined,
          companions: dto.companions ?? undefined,
          openJawOk: dto.openJawOk ?? undefined,
          mixedAirlinesOk: dto.mixedAirlinesOk ?? undefined,
          dateFlexDays: dto.dateFlexDays ?? undefined,
          typicalTripLenMin: dto.typicalTripLenMin ?? undefined,
          typicalTripLenMax: dto.typicalTripLenMax ?? undefined,
          maxCashUsd: dto.budget?.maxCashUsd ?? undefined,
          maxPoints: dto.budget?.maxPoints ?? undefined,
          minCppCents: dto.budget?.minCppCents ?? undefined,
          alertMode: dto.alertMode ?? undefined,
          timezone: dto.timezone ?? undefined,
        },
        create: {
          userId,
          preferredCabin: dto.preferredCabin ?? null,
          companions: dto.companions ?? null,
          openJawOk: dto.openJawOk ?? null,
          mixedAirlinesOk: dto.mixedAirlinesOk ?? null,
          dateFlexDays: dto.dateFlexDays ?? null,
          typicalTripLenMin: dto.typicalTripLenMin ?? null,
          typicalTripLenMax: dto.typicalTripLenMax ?? null,
          maxCashUsd: dto.budget?.maxCashUsd ?? null,
          maxPoints: dto.budget?.maxPoints ?? null,
          minCppCents: dto.budget?.minCppCents ?? null,
          alertMode: dto.alertMode ?? null,
          timezone: dto.timezone ?? null,
        },
      });

      if (dto.homeBases !== undefined) {
        await this.replaceHomeBases(tx, userId, dto.homeBases, (locationId) => ({
          userId,
          locationId,
          source: 'MANUAL_EDIT',
        }));
      }

      if (dto.destinationsWish !== undefined) {
        await this.replaceDestinationPrefs(tx, userId, dto.destinationsWish, DestMode.WISH);
      }

      if (dto.destinationsAvoid !== undefined) {
        await this.replaceDestinationPrefs(tx, userId, dto.destinationsAvoid, DestMode.AVOID);
      }

      if (dto.airlines) {
        await this.applyAirlinePreferences(tx, userId, dto.airlines);
      }

      if (dto.alliances) {
        await this.applyAlliancePreferences(tx, userId, dto.alliances);
      }

      if (dto.hotelPrograms) {
        await this.applyHotelPreferences(tx, userId, dto.hotelPrograms);
      }
    });

    return this.getProfile(userId);
  }

  protected async runExtraction(transcript: string): Promise<OnboardingExtraction> {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: transcript },
      ],
      temperature: 0,
      max_output_tokens: 2000,
    });

    const outputText = response.output_text;
    if (!outputText) {
      throw new Error('LLM returned an empty response');
    }

    const parsed = JSON.parse(outputText);
    return onboardingExtractionSchema.parse(parsed);
  }

  private async persistProfile(userId: string, extraction: OnboardingExtraction, sessionId: string) {
    await this.prisma.$transaction(async (tx) => {
      const cabin = extraction.seating?.cabin ? normalizeCabin(extraction.seating.cabin) : null;
      const alertMode = extraction.notifications?.mode
        ? normalizeAlertMode(extraction.notifications.mode)
        : null;

      const [tripMin, tripMax] = extraction.travel_window?.typical_trip_len_days ?? [null, null];

      const profile = await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          preferredCabin: cabin ? (cabin as Cabin) : null,
          companions: extraction.seating?.companions ?? null,
          openJawOk: extraction.open_jaw_ok ?? null,
          mixedAirlinesOk: extraction.mixed_airlines_ok ?? null,
          dateFlexDays: extraction.travel_window?.flex_days ?? null,
          typicalTripLenMin: tripMin ?? null,
          typicalTripLenMax: tripMax ?? null,
          minCppCents: extraction.budget?.min_cpp_cents ?? null,
          maxCashUsd: extraction.budget?.max_cash_usd ?? null,
          maxPoints: extraction.budget?.max_points ?? null,
          alertMode: alertMode ? (alertMode as AlertMode) : null,
          timezone: extraction.notifications?.timezone ?? null,
          rawOnboardingJson: extraction as unknown as Prisma.JsonObject,
          rawNotes: extraction.raw_free_text ?? null,
        },
        update: {
          preferredCabin: cabin ? (cabin as Cabin) : null,
          companions: extraction.seating?.companions ?? null,
          openJawOk: extraction.open_jaw_ok ?? null,
          mixedAirlinesOk: extraction.mixed_airlines_ok ?? null,
          dateFlexDays: extraction.travel_window?.flex_days ?? null,
          typicalTripLenMin: tripMin ?? null,
          typicalTripLenMax: tripMax ?? null,
          minCppCents: extraction.budget?.min_cpp_cents ?? null,
          maxCashUsd: extraction.budget?.max_cash_usd ?? null,
          maxPoints: extraction.budget?.max_points ?? null,
          alertMode: alertMode ? (alertMode as AlertMode) : null,
          timezone: extraction.notifications?.timezone ?? null,
          rawOnboardingJson: extraction as unknown as Prisma.JsonObject,
          rawNotes: extraction.raw_free_text ?? null,
        },
      });

      await this.replaceHomeBases(tx, userId, extraction.home_bases, (locationId) => ({
        userId,
        locationId,
        source: 'LLM_EXTRACT',
      }));

      await this.replaceDestinationPrefs(tx, userId, extraction.destinations?.wish, DestMode.WISH);
      await this.replaceDestinationPrefs(tx, userId, extraction.destinations?.avoid, DestMode.AVOID);

      await tx.userTripStyle.deleteMany({ where: { userId } });
      if (extraction.styles?.length) {
        await tx.userTripStyle.createMany({
          data: extraction.styles.map((style) => ({ userId, style: style as TripStyle })),
        });
      }

      await tx.userInterest.deleteMany({ where: { userId } });
      if (extraction.interests?.length) {
        await tx.userInterest.createMany({
          data: extraction.interests.map((interest) => ({
            userId,
            tag: interest.tag as InterestTag,
            notes: interest.notes ?? null,
          })),
        });
      }

      await tx.userDietary.deleteMany({ where: { userId } });
      if (extraction.dietary?.length) {
        await tx.userDietary.createMany({
          data: extraction.dietary.map((item) => ({
            userId,
            tag: item.tag as DietaryTag,
            notes: item.notes ?? null,
          })),
        });
      }

      await tx.userAccessibility.deleteMany({ where: { userId } });
      if (extraction.accessibility?.length) {
        await tx.userAccessibility.createMany({
          data: extraction.accessibility.map((item) => ({
            userId,
            tag: item.tag as AccessibilityTag,
            notes: item.notes ?? null,
          })),
        });
      }

      await this.applyAirlinePreferences(tx, userId, extraction.airlines);
      await this.applyAlliancePreferences(tx, userId, extraction.alliances);
      await this.applyHotelPreferences(tx, userId, extraction.hotel_programs);
      await this.applyLoyaltyBalances(tx, profile.userId, extraction.loyalty_balances ?? []);
      await this.applyCards(tx, profile.userId, extraction.cards ?? []);

      await tx.onboardingMessage.create({
        data: {
          sessionId,
          role: 'system',
          content: 'Profile extraction completed',
        },
      });
    });
  }

  private async replaceHomeBases(
    tx: Prisma.TransactionClient,
    userId: string,
    locations: LocationInputDto[] | ResolveLocationInput[] | null | undefined,
    buildData: (locationId: string) => Prisma.UserHomeBaseCreateManyInput,
  ) {
    await tx.userHomeBase.deleteMany({ where: { userId } });

    if (!locations || !locations.length) {
      return;
    }

    const records = [] as Prisma.UserHomeBaseCreateManyInput[];
    for (const location of locations) {
      const resolved = await this.locations.resolveLocation(
        {
          kind: location.kind,
          code: 'code' in location ? (location as any).code ?? null : null,
          name: location.name,
        },
        tx,
      );
      records.push(buildData(resolved.id));
    }

    if (records.length) {
      await tx.userHomeBase.createMany({ data: records });
    }
  }

  private async replaceDestinationPrefs(
    tx: Prisma.TransactionClient,
    userId: string,
    locations: LocationInputDto[] | ResolveLocationInput[] | null | undefined,
    mode: DestMode,
  ) {
    await tx.userDestinationPref.deleteMany({ where: { userId, mode } });

    if (!locations || !locations.length) {
      return;
    }

    const data: Prisma.UserDestinationPrefCreateManyInput[] = [];
    for (const location of locations) {
      const resolved = await this.locations.resolveLocation(
        {
          kind: location.kind,
          code: 'code' in location ? (location as any).code ?? null : null,
          name: location.name,
        },
        tx,
      );
      data.push({
        userId,
        locationId: resolved.id,
        mode,
        notes: 'notes' in location ? (location as any).notes ?? null : null,
      });
    }

    if (data.length) {
      await tx.userDestinationPref.createMany({ data });
    }
  }

  private async applyAirlinePreferences(
    tx: Prisma.TransactionClient,
    userId: string,
    preferences?: { prefer?: string[]; avoid?: string[] } | null,
  ) {
    await tx.userAirlinePref.deleteMany({ where: { userId } });
    if (!preferences) {
      return;
    }

    const labelMap = new Map<string, string>();
    const preferSet = new Set<string>();
    for (const value of preferences.prefer ?? []) {
      const code = resolveAirlineCode(value);
      if (!code) continue;
      preferSet.add(code);
      if (!labelMap.has(code)) {
        labelMap.set(code, value);
      }
    }

    const avoidSet = new Set<string>();
    for (const value of preferences.avoid ?? []) {
      const code = resolveAirlineCode(value);
      if (!code || preferSet.has(code)) continue;
      avoidSet.add(code);
      if (!labelMap.has(code)) {
        labelMap.set(code, value);
      }
    }

    const entries: Prisma.UserAirlinePrefCreateManyInput[] = [];

    for (const code of preferSet) {
      const label = labelMap.get(code) ?? code;
      await tx.airline.upsert({
        where: { code2: code },
        create: { code2: code, name: label, alliance: Alliance.NONE },
        update: {},
      });
      entries.push({ userId, code2: code, mode: PrefMode.PREFER });
    }

    for (const code of avoidSet) {
      const label = labelMap.get(code) ?? code;
      await tx.airline.upsert({
        where: { code2: code },
        create: { code2: code, name: label, alliance: Alliance.NONE },
        update: {},
      });
      entries.push({ userId, code2: code, mode: PrefMode.AVOID });
    }

    if (entries.length) {
      await tx.userAirlinePref.createMany({ data: entries });
    }
  }

  private async applyAlliancePreferences(
    tx: Prisma.TransactionClient,
    userId: string,
    preferences?: { prefer?: string[]; avoid?: string[] } | null,
  ) {
    await tx.userAlliancePref.deleteMany({ where: { userId } });
    if (!preferences) {
      return;
    }

    const data: Prisma.UserAlliancePrefCreateManyInput[] = [];
    for (const allianceValue of preferences.prefer ?? []) {
      const normalized = normalizeAlliance(allianceValue);
      if (!normalized || normalized === 'NONE') continue;
      data.push({ userId, alliance: normalized as Alliance, mode: PrefMode.PREFER });
    }
    for (const allianceValue of preferences.avoid ?? []) {
      const normalized = normalizeAlliance(allianceValue);
      if (!normalized || normalized === 'NONE') continue;
      data.push({ userId, alliance: normalized as Alliance, mode: PrefMode.AVOID });
    }

    if (data.length) {
      await tx.userAlliancePref.createMany({ data });
    }
  }

  private async applyHotelPreferences(
    tx: Prisma.TransactionClient,
    userId: string,
    preferences?: { prefer?: string[]; avoid?: string[] } | null,
  ) {
    await tx.userHotelProgramPref.deleteMany({ where: { userId } });
    if (!preferences) {
      return;
    }

    const data: Prisma.UserHotelProgramPrefCreateManyInput[] = [];
    const preferSet = new Set(preferences.prefer ?? []);
    const avoidSet = new Set(preferences.avoid ?? []);

    for (const programId of preferSet) {
      await tx.hotelProgram.upsert({
        where: { id: programId },
        create: { id: programId, name: programId },
        update: {},
      });
      data.push({ userId, programId, mode: PrefMode.PREFER });
      avoidSet.delete(programId);
    }

    for (const programId of avoidSet) {
      await tx.hotelProgram.upsert({
        where: { id: programId },
        create: { id: programId, name: programId },
        update: {},
      });
      data.push({ userId, programId, mode: PrefMode.AVOID });
    }

    if (data.length) {
      await tx.userHotelProgramPref.createMany({ data });
    }
  }

  private async applyLoyaltyBalances(
    tx: Prisma.TransactionClient,
    userId: string,
    balances: Array<{ program_id: string; approx_points: number; as_of?: string }>,
  ) {
    await tx.userLoyaltyBalance.deleteMany({ where: { userId } });

    if (!balances.length) {
      return;
    }

    const uniqueBalances = new Map<string, typeof balances[number]>();
    for (const balance of balances) {
      if (!uniqueBalances.has(balance.program_id)) {
        uniqueBalances.set(balance.program_id, balance);
      }
    }

    for (const balance of uniqueBalances.values()) {
      await tx.loyaltyProgram.upsert({
        where: { id: balance.program_id },
        create: { id: balance.program_id, kind: LoyaltyKind.AIR, name: balance.program_id },
        update: {},
      });
    }

    await tx.userLoyaltyBalance.createMany({
      data: Array.from(uniqueBalances.values()).map((balance) => ({
        userId,
        programId: balance.program_id,
        approxPoints: balance.approx_points,
        asOf: balance.as_of ? new Date(balance.as_of) : null,
      })),
    });
  }

  private async applyCards(
    tx: Prisma.TransactionClient,
    userId: string,
    cards: string[],
  ) {
    await tx.userCard.deleteMany({ where: { userId } });
    if (!cards.length) {
      return;
    }

    const uniqueCards = new Set(cards);

    for (const cardId of uniqueCards) {
      await tx.cardCatalog.upsert({
        where: { cardId },
        create: {
          cardId,
          issuer: 'Unknown',
          productName: cardId,
        },
        update: {},
      });
    }

    await tx.userCard.createMany({
      data: Array.from(uniqueCards).map((cardId) => ({
        userId,
        cardId,
      })),
    });
  }

  private async ensureUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      this.logger.warn(`Attempted to start onboarding for missing user ${userId}`);
      throw new NotFoundException('User not found');
    }
  }

  private handlePrismaError(context: string, error: unknown, userId: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      this.logger.warn(`Referential integrity error during ${context} for user ${userId}: ${error.message}`);
      throw new NotFoundException('User not found');
    }

    if (error instanceof Error) {
      this.logger.error(`Failed to ${context} for user ${userId}: ${error.message}`, error.stack);
    } else {
      this.logger.error(`Failed to ${context} for user ${userId}: ${String(error)}`);
    }

    throw error;
  }
}
