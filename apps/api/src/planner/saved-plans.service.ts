import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  GET_SAVED_PLAN_RESPONSE_SCHEMA,
  LIST_SAVED_PLANS_RESPONSE_SCHEMA,
  SAVE_PLAN_REQUEST_SCHEMA,
  SAVE_PLAN_RESPONSE_SCHEMA,
  SAVED_PLAN_PROVENANCE_SCHEMA,
  SavedPlan,
  SavePlanRequest,
} from './saved-plans.schemas';
import { FlightCacheRepository } from './flight-cache.repository';
import { PLANNER_DATA_SOURCE, PLANNER_VERSION, isCacheStale } from './constants';
import { RANKED_OPTION_SCHEMA, TRIP_QUERY_SCHEMA } from '@mile/shared';

const SHARE_TOKEN_BYTES = 32;

@Injectable()
export class SavedPlansService {
  private readonly logger = new Logger(SavedPlansService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly flightCache: FlightCacheRepository,
  ) {}

  async savePlan(sessionId: string, body: unknown, requestId?: string) {
    await this.ensureSessionExists(sessionId, requestId);
    const parsed = SAVE_PLAN_REQUEST_SCHEMA.safeParse(body);
    if (!parsed.success) {
      throw new HttpException(
        {
          errorCode: 'SAVE_PLAN_VALIDATION_FAILED',
          errors: parsed.error.issues,
          requestId,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = parsed.data satisfies SavePlanRequest;

    const shareToken = payload.makePublic ? this.generateShareToken() : undefined;
    const cacheMeta = await this.flightCache.findCachedCandidates(payload.query);

    const provenance = {
      plannerVersion: PLANNER_VERSION,
      cacheFreshestAt: cacheMeta.freshestAt ?? payload.selectedOption.candidate.cacheUpdatedAt,
      cacheStale: payload.selectedOption.verified === false || isCacheStale(cacheMeta.freshestAt),
      consideredCount: cacheMeta.consideredCount,
      dataSource: PLANNER_DATA_SOURCE,
      validatedAt: new Date().toISOString(),
    } as const;

    const saved = await this.prisma.savedPlan.create({
      data: {
        sessionId,
        title: payload.title,
        visibility: payload.makePublic ? 'public' : 'private',
        shareToken,
        queryJson: payload.query as any,
        selectedJson: payload.selectedOption as any,
        provenance: provenance as any,
      },
    });

    const parsedSaved = this.parseSavedPlan(saved);

    this.logger.log('planner.plan.save.success', {
      requestId,
      sessionId,
      planId: saved.id,
      visibility: parsedSaved.visibility,
      verified: parsedSaved.selected.verified,
    });

    const shareUrl = shareToken ? this.buildShareUrl(shareToken) : undefined;

    return SAVE_PLAN_RESPONSE_SCHEMA.parse({
      id: parsedSaved.id,
      shareUrl,
      savedPlan: parsedSaved,
    });
  }

  async listPlans(sessionId: string, requestId?: string) {
    try {
      const plans = await this.prisma.savedPlan.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
      });

      const parsedPlans = plans.map((plan) => this.parseSavedPlan(plan));

      this.logger.log('planner.plan.list.success', { requestId, sessionId, count: parsedPlans.length });

      return LIST_SAVED_PLANS_RESPONSE_SCHEMA.parse({
        plans: parsedPlans.map((plan) => ({
          id: plan.id,
          createdAt: plan.createdAt,
          title: plan.title,
          visibility: plan.visibility,
          shareToken: plan.shareToken,
          query: plan.query,
          provenance: plan.provenance,
        })),
      });
    } catch (error) {
      this.logger.error('planner.plan.list.failure', { requestId, sessionId, error });
      throw new HttpException(
        { errorCode: 'LIST_SAVED_PLANS_FAILED', requestId },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPlan(sessionId: string, id: string, requestId?: string) {
    const ownedPlan = await this.ensurePlanOwned(sessionId, id, requestId);
    const parsed = this.parseSavedPlan(ownedPlan);

    const cacheStatus = await this.computeCurrentCacheStatus(parsed.query);

    this.logger.log('planner.plan.get.success', { requestId, sessionId, planId: id });

    return GET_SAVED_PLAN_RESPONSE_SCHEMA.parse({
      plan: parsed,
      currentCacheStatus: cacheStatus,
    });
  }

  async getPlanByShareToken(token: string, requestId?: string) {
    const plan = await this.prisma.savedPlan.findFirst({ where: { shareToken: token, visibility: 'public' } });
    if (!plan) {
      throw new HttpException(
        { errorCode: 'SAVED_PLAN_NOT_FOUND', message: 'Saved plan not found', requestId },
        HttpStatus.NOT_FOUND,
      );
    }

    const parsed = this.parseSavedPlan(plan);

    this.logger.log('planner.plan.share.get.success', { requestId, planId: parsed.id });

    return GET_SAVED_PLAN_RESPONSE_SCHEMA.parse({ plan: { ...parsed, sessionId: 'redacted' } as SavedPlan });
  }

  async makePublic(sessionId: string, id: string, requestId?: string) {
    const plan = await this.ensurePlanOwned(sessionId, id, requestId);
    const shareToken = this.generateShareToken();
    const updated = await this.prisma.savedPlan.update({
      where: { id: plan.id },
      data: { visibility: 'public', shareToken },
    });

    const parsed = this.parseSavedPlan(updated);
    this.logger.log('planner.plan.share.enabled', { requestId, sessionId, planId: id });

    return {
      plan: parsed,
      shareUrl: this.buildShareUrl(shareToken),
    };
  }

  async revokeShare(sessionId: string, id: string, requestId?: string) {
    const plan = await this.ensurePlanOwned(sessionId, id, requestId);
    const updated = await this.prisma.savedPlan.update({
      where: { id: plan.id },
      data: { visibility: 'private', shareToken: null },
    });

    const parsed = this.parseSavedPlan(updated);
    this.logger.log('planner.plan.share.revoked', { requestId, sessionId, planId: id });
    return parsed;
  }

  private parseSavedPlan(raw: any): SavedPlan {
    const merged = {
      id: raw.id,
      sessionId: raw.sessionId,
      createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
      updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : raw.updatedAt,
      title: raw.title ?? undefined,
      visibility: raw.visibility,
      shareToken: raw.shareToken ?? undefined,
      query: raw.queryJson,
      selected: raw.selectedJson,
      provenance: raw.provenance,
    } satisfies SavedPlan;

    const queryParse = TRIP_QUERY_SCHEMA.safeParse(merged.query);
    const selectedParse = RANKED_OPTION_SCHEMA.safeParse(merged.selected);
    const provenanceParse = SAVED_PLAN_PROVENANCE_SCHEMA.safeParse(merged.provenance);

    if (!queryParse.success || !selectedParse.success || !provenanceParse.success) {
      this.logger.error('planner.plan.data_integrity_error', {
        planId: raw.id,
        queryValid: queryParse.success,
        selectedValid: selectedParse.success,
        provenanceValid: provenanceParse.success,
      });
      throw new HttpException(
        { errorCode: 'DATA_INTEGRITY_ERROR', message: 'Saved plan data is invalid' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      ...merged,
      query: queryParse.data,
      selected: selectedParse.data,
      provenance: provenanceParse.data,
    } satisfies SavedPlan;
  }

  private generateShareToken(): string {
    return randomBytes(SHARE_TOKEN_BYTES).toString('base64url');
  }

  private buildShareUrl(token: string): string | undefined {
    const base = process.env.WEB_BASE_URL;
    if (!base) return undefined;
    return `${base.replace(/\/$/, '')}/share/plans/${token}`;
  }

  private async computeCurrentCacheStatus(query: any) {
    const { freshestAt } = await this.flightCache.findCachedCandidates(query);
    return { freshestAt, stale: isCacheStale(freshestAt) };
  }

  private async ensureSessionExists(sessionId: string, requestId?: string) {
    const session = await this.prisma.onboardingSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new HttpException(
        { errorCode: 'UNAUTHORIZED', message: 'Invalid onboarding session', requestId },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async ensurePlanOwned(sessionId: string, id: string, requestId?: string) {
    const plan = await this.prisma.savedPlan.findFirst({ where: { id, sessionId } });
    if (!plan) {
      throw new HttpException(
        { errorCode: 'SAVED_PLAN_NOT_FOUND', message: 'Saved plan not found', requestId },
        HttpStatus.NOT_FOUND,
      );
    }
    return plan;
  }
}
