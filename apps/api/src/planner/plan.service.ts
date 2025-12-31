import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TripQuery, PlanResponse, ConstraintViolation, UserState } from '@mile/shared';
import { FlightCacheRepository } from './flight-cache.repository';
import { applyConstraints } from './constraints';
import { rankOptions } from './ranker';
import { CACHE_MAX_AGE_MINUTES, isCacheStale, PLANNER_DATA_SOURCE } from './constants';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  constructor(private readonly flightCache: FlightCacheRepository) {}

  async plan(input: { query: TripQuery; userState: UserState; requestId?: string }): Promise<PlanResponse> {
    const requestId = input.requestId ?? randomUUID();
    this.logger.log('planner.plan.start', {
      requestId,
      sessionId: this.safeSessionId(input.userState),
      dataSource: PLANNER_DATA_SOURCE,
      querySummary: {
        origins: input.query.origins?.length ?? 0,
        destinations: Array.isArray(input.query.destinations)
          ? input.query.destinations.length
          : 'anywhere',
        cabin: input.query.cabin,
      },
    });

    const missing: { path: string; reason: string }[] = [];
    if (!input.query.origins?.length) {
      missing.push({ path: 'origins', reason: 'At least one origin is required' });
    }
    if (!input.query.dateWindow?.start || !input.query.dateWindow?.end) {
      missing.push({ path: 'dateWindow', reason: 'dateWindow.start and dateWindow.end required' });
    }
    if (!input.query.cabin) {
      missing.push({ path: 'cabin', reason: 'cabin is required' });
    }
    if (missing.length) {
      return { type: 'needs_input', requestId, missing } as PlanResponse;
    }

    const cacheStart = Date.now();
    const { candidates, freshestAt, consideredCount } = await this.flightCache.findCachedCandidates(
      input.query,
    );
    const cacheMs = Date.now() - cacheStart;
    this.logger.log('planner.plan.cache.query_ms', { requestId, duration: cacheMs, consideredCount });

    if (consideredCount === 0) {
      const reasons: ConstraintViolation[] = [
        {
          code: 'CACHE_EMPTY',
          message: 'No cached flights available for query',
          meta: {
            origins: input.query.origins,
            destinations: input.query.destinations,
            dateWindow: input.query.dateWindow,
            cabin: input.query.cabin,
          },
        },
      ];
      this.logger.warn('planner.plan.cache.empty', { requestId });
      return {
        type: 'no_feasible_plan',
        requestId,
        reasons,
        cacheStatus: { freshestAt, stale: true, consideredCount },
      } as PlanResponse;
    }

    const stale = isCacheStale(freshestAt, CACHE_MAX_AGE_MINUTES);
    if (stale && !input.query.allowStaleCache) {
      const reasons: ConstraintViolation[] = [
        {
          code: 'CACHE_STALE',
          message: `Cache older than ${CACHE_MAX_AGE_MINUTES} minutes`,
          meta: { freshestAt },
        },
      ];
      this.logger.warn('planner.plan.cache.stale_rejected', { requestId, freshestAt });
      return {
        type: 'no_feasible_plan',
        requestId,
        reasons,
        cacheStatus: { freshestAt, stale: true, consideredCount },
      } as PlanResponse;
    }

    const { accepted, rejected } = applyConstraints(candidates, input.query);
    this.logger.log('planner.plan.constraints.filtered', {
      requestId,
      accepted: accepted.length,
      rejected: rejected.length,
    });

    if (accepted.length === 0) {
      return {
        type: 'no_feasible_plan',
        requestId,
        reasons: rejected,
        cacheStatus: { freshestAt, stale, consideredCount },
      } as PlanResponse;
    }

    const ranked = rankOptions(accepted, {
      preferredPrograms: input.userState.points?.programs?.map((p) => p.programId),
    });

    const options = ranked.map((option) => ({
      ...option,
      verified: !stale,
    }));

    this.logger.log('planner.plan.rank.returned', {
      requestId,
      count: options.length,
    });

    return {
      type: 'ok',
      requestId,
      query: input.query,
      options,
      cacheStatus: { freshestAt, stale, consideredCount },
    } as PlanResponse;
  }

  private isStale(freshestAt: string | undefined, maxMinutes: number): boolean {
    return isCacheStale(freshestAt, maxMinutes);
  }

  private safeSessionId(userState: UserState): string | undefined {
    return userState?.onboarding?.startedAt;
  }
}
