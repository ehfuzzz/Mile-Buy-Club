import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { randomUUID } from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import { LocationsService, ResolveLocationInput } from './locations.service';
import {
  OnboardingSessionResponse,
  onboardingExtractionSchema,
  OnboardingExtraction,
  normalizeCabin,
  normalizeAlertMode,
  normalizeAlliance,
  resolveAirlineCode,
  STATE_PATCH_SCHEMA,
  USER_STATE_SCHEMA,
  UserState,
  createDefaultUserState,
  createLogger,
} from '@mile/shared';
import { getOpenAIClient } from '../lib/openai';
import { OnboardingMessageDto } from './dto/message.dto';
import { ExtractProfileDto } from './dto/extract.dto';
import { UpdateProfileDto, LocationInputDto } from './dto/update-profile.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { applyStatePatch, validationErrorsFromIssues } from './state-machine';

const SYSTEM_PROMPT = `You are an expert travel intake assistant. Convert chatty answers into a strict JSON profile for flight + hotel planning. 
- Map airports/cities/regions into {kind, code, name}. Use IATA codes when clear; otherwise keep name and leave code null.
- Constrain enums: Cabin=Y|W|J|F; AlertMode=HIGH_QUALITY|DIGEST; Alliances=STAR|ONEWORLD|SKYTEAM.
- Keep any unknowns as free text in raw_free_text; never invent data.
- Prefer city codes like NYC over individual airports if user says "NYC area".
- Preserve numbers as numbers (not strings).
Output STRICT JSON only.`;

const DestModeEnum = (DestMode as any) ?? { WISH: 'WISH', AVOID: 'AVOID' } as const;
const TripStyleEnum = (TripStyle as any) ?? {
  BEACH: 'BEACH',
  CITY: 'CITY',
  NATURE: 'NATURE',
  NIGHTLIFE: 'NIGHTLIFE',
  KID_FRIENDLY: 'KID_FRIENDLY',
  PACE_CHILL: 'PACE_CHILL',
  PACE_PACKED: 'PACE_PACKED',
} as const;
const AllianceEnum = (Alliance as any) ?? { NONE: 'NONE', STAR: 'STAR', ONEWORLD: 'ONEWORLD', SKYTEAM: 'SKYTEAM' } as const;
const PrefModeEnum = (PrefMode as any) ?? { PREFER: 'PREFER', AVOID: 'AVOID' } as const;
const LoyaltyKindEnum = (LoyaltyKind as any) ?? { AIR: 'AIR', HOTEL: 'HOTEL' } as const;

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);
  private readonly structuredLogger = createLogger('OnboardingService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly locations: LocationsService,
  ) {}

  async createSession(
    dto: CreateSessionDto,
    context: { requestId?: string; sessionId?: string } = {},
  ): Promise<OnboardingSessionResponse> {
    const requestId = context.requestId ?? randomUUID();
    const sessionIdFromRequest = context.sessionId;

    await this.ensureUserExists(dto.userId, requestId);

    try {
      if (sessionIdFromRequest) {
        const existingById = await this.prisma.onboardingSession.findUnique({
          where: { id: sessionIdFromRequest },
        });

        if (existingById?.userId === dto.userId) {
          const state = await this.loadOrCreateUserState(dto.userId, requestId);
          this.structuredLogger.info('Resuming onboarding session by provided session id', {
            requestId,
            sessionId: existingById.id,
            userId: dto.userId,
            created: false,
          });
          return this.buildSessionResponse(existingById.id, false, state, requestId);
        }

        if (existingById && existingById.userId !== dto.userId) {
          this.structuredLogger.warn('Session user mismatch', {
            requestId,
            sessionId: existingById.id,
            userId: dto.userId,
          });
        }
      }

      const existing = await this.prisma.onboardingSession.findFirst({
        where: { userId: dto.userId },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        const state = await this.loadOrCreateUserState(dto.userId, requestId);
        this.structuredLogger.info('Resuming onboarding session by user id', {
          requestId,
          sessionId: existing.id,
          userId: dto.userId,
          created: false,
        });
        return this.buildSessionResponse(existing.id, false, state, requestId);
      }

      const { session, state } = await this.prisma.$transaction(async (tx) => {
        const createdSession = await tx.onboardingSession.create({
          data: {
            userId: dto.userId,
          },
        });

        const defaultState = createDefaultUserState();
        const storedState = await tx.onboardingUserState.upsert({
          where: { userId: dto.userId },
          update: {},
          create: {
            userId: dto.userId,
            state: defaultState as Prisma.InputJsonValue,
            version: defaultState.version,
          },
        });

        return {
          session: createdSession,
          state: this.parseUserState(storedState.state, storedState.version, requestId),
        };
      });

      this.structuredLogger.info('Created onboarding session', {
        requestId,
        sessionId: session.id,
        userId: dto.userId,
        created: true,
      });
      return this.buildSessionResponse(session.id, true, state, requestId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.structuredLogger.error('Failed to create onboarding session', {
        requestId,
        userId: dto.userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new HttpException(
        {
          errorCode: 'ONBOARDING_SESSION_CREATE_FAILED',
          message: 'Unable to create onboarding session',
          requestId,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStateForSession(sessionId: string, requestId?: string): Promise<OnboardingSessionResponse> {
    const resolvedRequestId = requestId ?? randomUUID();
    try {
      const session = await this.prisma.onboardingSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new HttpException(
          {
            errorCode: 'UNAUTHORIZED',
            message: 'Invalid onboarding session',
            requestId: resolvedRequestId,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const state = await this.loadOrCreateUserState(session.userId, resolvedRequestId);

      this.structuredLogger.info('Fetched onboarding state', {
        requestId: resolvedRequestId,
        sessionId,
        userId: session.userId,
        version: state.version,
      });

      return this.buildSessionResponse(session.id, false, state, resolvedRequestId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      return this.handleUnexpectedError(
        resolvedRequestId,
        'ONBOARDING_STATE_FETCH_FAILED',
        'Unable to fetch onboarding state',
        error,
      );
    }
  }

  async patchState(
    sessionId: string,
    patchPayload: unknown,
    requestId?: string,
  ): Promise<Omit<OnboardingSessionResponse, 'created'>> {
    const resolvedRequestId = requestId ?? randomUUID();
    try {
      const session = await this.prisma.onboardingSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new HttpException(
          {
            errorCode: 'UNAUTHORIZED',
            message: 'Invalid onboarding session',
            requestId: resolvedRequestId,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const parsedPatch = STATE_PATCH_SCHEMA.safeParse(patchPayload);
      if (!parsedPatch.success) {
        throw new HttpException(
          {
            errorCode: 'STATE_VALIDATION_FAILED',
            errors: validationErrorsFromIssues(parsedPatch.error.issues),
            requestId: resolvedRequestId,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const storedState = await this.prisma.onboardingUserState.findUnique({
        where: { userId: session.userId },
      });

      const currentState =
        storedState !== null
          ? this.parseUserState(storedState.state, storedState.version, resolvedRequestId)
          : createDefaultUserState();

      const expectedVersion = storedState?.version ?? currentState.version;
      if (parsedPatch.data.baseVersion !== expectedVersion) {
        throw new HttpException(
          {
            errorCode: 'STATE_VERSION_CONFLICT',
            message: 'Onboarding state version conflict',
            requestId: resolvedRequestId,
            expectedVersion,
          },
          HttpStatus.CONFLICT,
        );
      }

      const patched = applyStatePatch(currentState, parsedPatch.data);
      if (!patched.ok) {
        throw new HttpException(
          {
            errorCode: 'STATE_VALIDATION_FAILED',
            errors: patched.errors,
            requestId: resolvedRequestId,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const nextVersion = expectedVersion + 1;
      const nextState: UserState = {
        ...patched.userState,
        version: nextVersion,
      };

      const updated = await this.prisma.onboardingUserState.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          state: nextState as Prisma.InputJsonValue,
          version: nextVersion,
        },
        update: {
          state: nextState as Prisma.InputJsonValue,
          version: nextVersion,
        },
      });

      this.structuredLogger.info('Patched onboarding state', {
        requestId: resolvedRequestId,
        sessionId,
        userId: session.userId,
        version: updated.version,
      });

      return {
        sessionId,
        userStateVersion: updated.version,
        userState: nextState,
        onboardingStatus: nextState.onboarding.status,
        requestId: resolvedRequestId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      return this.handleUnexpectedError(
        resolvedRequestId,
        'ONBOARDING_STATE_PATCH_FAILED',
        'Unable to apply onboarding state patch',
        error,
      );
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

  private buildSessionResponse(
    sessionId: string,
    created: boolean,
    state: UserState,
    requestId: string,
  ): OnboardingSessionResponse {
    return {
      id: sessionId,
      sessionId,
      created,
      userStateVersion: state.version,
      userState: state,
      onboardingStatus: state.onboarding.status,
      requestId,
    };
  }

  private parseUserState(rawState: unknown, version: number, requestId: string): UserState {
    const parsed = USER_STATE_SCHEMA.safeParse(rawState);
    if (!parsed.success) {
      this.structuredLogger.error('Stored onboarding state failed validation', {
        requestId,
        version,
        errors: parsed.error.issues,
      });
      throw new HttpException(
        {
          errorCode: 'STATE_VALIDATION_FAILED',
          errors: validationErrorsFromIssues(parsed.error.issues),
          requestId,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (parsed.data.version !== version) {
      this.structuredLogger.error('Version mismatch between stored record and payload', {
        requestId,
        version,
        payloadVersion: parsed.data.version,
      });
      throw new HttpException(
        {
          errorCode: 'STATE_VERSION_MISMATCH',
          message: 'Stored onboarding state version does not match record',
          requestId,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return parsed.data;
  }

  private async loadOrCreateUserState(userId: string, requestId: string): Promise<UserState> {
    const existing = await this.prisma.onboardingUserState.findUnique({
      where: { userId },
    });

    if (existing) {
      return this.parseUserState(existing.state, existing.version, requestId);
    }

    const defaultState = createDefaultUserState();
    const created = await this.prisma.onboardingUserState.create({
      data: {
        userId,
        state: defaultState as Prisma.InputJsonValue,
        version: defaultState.version,
      },
    });

    return this.parseUserState(created.state, created.version, requestId);
  }

  private handleUnexpectedError(requestId: string, errorCode: string, message: string, error: unknown): never {
    this.structuredLogger.error(message, {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new HttpException(
      {
        errorCode,
        message,
        requestId,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
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

      await this.replaceDestinationPrefs(tx, userId, extraction.destinations?.wish, DestModeEnum.WISH);
      await this.replaceDestinationPrefs(tx, userId, extraction.destinations?.avoid, DestModeEnum.AVOID);

      await tx.userTripStyle.deleteMany({ where: { userId } });
      if (extraction.styles?.length) {
        await tx.userTripStyle.createMany({
          data: extraction.styles.map((style) => ({ userId, style: (TripStyleEnum as any)[style] ?? (style as TripStyle) })),
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
        create: { code2: code, name: label, alliance: AllianceEnum.NONE },
        update: {},
      });
      entries.push({ userId, code2: code, mode: PrefModeEnum.PREFER });
    }

    for (const code of avoidSet) {
      const label = labelMap.get(code) ?? code;
      await tx.airline.upsert({
        where: { code2: code },
        create: { code2: code, name: label, alliance: AllianceEnum.NONE },
        update: {},
      });
      entries.push({ userId, code2: code, mode: PrefModeEnum.AVOID });
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
      data.push({ userId, alliance: normalized as Alliance, mode: PrefModeEnum.PREFER });
    }
    for (const allianceValue of preferences.avoid ?? []) {
      const normalized = normalizeAlliance(allianceValue);
      if (!normalized || normalized === 'NONE') continue;
      data.push({ userId, alliance: normalized as Alliance, mode: PrefModeEnum.AVOID });
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
      data.push({ userId, programId, mode: PrefModeEnum.PREFER });
      avoidSet.delete(programId);
    }

    for (const programId of avoidSet) {
      await tx.hotelProgram.upsert({
        where: { id: programId },
        create: { id: programId, name: programId },
        update: {},
      });
      data.push({ userId, programId, mode: PrefModeEnum.AVOID });
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
        create: { id: balance.program_id, kind: LoyaltyKindEnum.AIR, name: balance.program_id },
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

  private async ensureUserExists(userId: string, requestId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      const resolvedRequestId = requestId ?? randomUUID();
      this.logger.warn(`Attempted to start onboarding for missing user ${userId}`);
      this.structuredLogger.warn('User not found for onboarding', {
        requestId: resolvedRequestId,
        userId,
      });
      throw new HttpException(
        {
          errorCode: 'USER_NOT_FOUND',
          message: 'User not found',
          requestId: resolvedRequestId,
        },
        HttpStatus.NOT_FOUND,
      );
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
