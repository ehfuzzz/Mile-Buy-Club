import { z } from 'zod';

export const TRIP_QUERY_SCHEMA = z.object({
  origins: z.array(z.string().min(3).max(5)).min(1, 'At least one origin is required'),
  destinations: z.union([
    z.array(z.string().min(3).max(5)).min(1, 'At least one destination is required'),
    z.object({ mode: z.literal('anywhere') }),
  ]),
  dateWindow: z.object({
    start: z.string().min(4),
    end: z.string().min(4),
  }),
  cabin: z.enum(['economy', 'premium_economy', 'business', 'first']),
  passengers: z.number().int().min(1).default(1),
  maxStops: z.number().int().min(0).optional(),
  noRedeyes: z.boolean().optional(),
  programs: z.array(z.string()).optional(),
  maxPoints: z.number().int().positive().optional(),
  allowStaleCache: z.boolean().default(false),
});

export type TripQuery = z.infer<typeof TRIP_QUERY_SCHEMA>;

export const CACHED_AWARD_CANDIDATE_SCHEMA = z.object({
  id: z.string(),
  provider: z.string(),
  airline: z.string().nullable().optional(),
  program: z.string().nullable().optional(),
  cabin: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  departAt: z.string().nullable().optional(),
  arriveAt: z.string().nullable().optional(),
  stops: z.number().int().nullable().optional(),
  pointsCost: z.number().int().nullable().optional(),
  taxesFeesUsd: z.number().nullable().optional(),
  bookingUrl: z.string().nullable().optional(),
  bookingLinkStatus: z.enum(['cached', 'unavailable_in_cache']).optional(),
  cacheUpdatedAt: z.string(),
  fetchedAt: z.string().optional(),
  rawRef: z.string().optional(),
  availability: z.number().int().nullable().optional(),
});

export type CachedAwardCandidate = z.infer<typeof CACHED_AWARD_CANDIDATE_SCHEMA>;

export const CONSTRAINT_VIOLATION_SCHEMA = z.object({
  code: z.string(),
  message: z.string(),
  path: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
});

export type ConstraintViolation = z.infer<typeof CONSTRAINT_VIOLATION_SCHEMA>;

export const RANKED_OPTION_SCHEMA = z.object({
  candidateId: z.string(),
  candidate: CACHED_AWARD_CANDIDATE_SCHEMA,
  verified: z.boolean(),
  score: z.number(),
  scoreBreakdown: z.array(z.object({
    key: z.string(),
    value: z.number(),
    reason: z.string(),
  })),
  passedConstraints: z.array(z.string()),
  failedConstraints: z.array(CONSTRAINT_VIOLATION_SCHEMA),
});

export type RankedOption = z.infer<typeof RANKED_OPTION_SCHEMA>;

const CACHE_STATUS_SCHEMA = z.object({
  freshestAt: z.string().optional(),
  stale: z.boolean(),
  consideredCount: z.number().int().nonnegative(),
});

export const PLAN_RESPONSE_SCHEMA = z.union([
  z.object({
    type: z.literal('ok'),
    requestId: z.string(),
    query: TRIP_QUERY_SCHEMA,
    options: z.array(RANKED_OPTION_SCHEMA),
    cacheStatus: CACHE_STATUS_SCHEMA,
  }),
  z.object({
    type: z.literal('needs_input'),
    requestId: z.string(),
    missing: z.array(z.object({ path: z.string(), reason: z.string() })),
    cacheStatus: CACHE_STATUS_SCHEMA.optional(),
  }),
  z.object({
    type: z.literal('no_feasible_plan'),
    requestId: z.string(),
    reasons: z.array(CONSTRAINT_VIOLATION_SCHEMA),
    cacheStatus: CACHE_STATUS_SCHEMA,
  }),
]);

export type PlanResponse = z.infer<typeof PLAN_RESPONSE_SCHEMA>;

export const SAVED_PLAN_VISIBILITY_SCHEMA = z.enum(['private', 'public']);
export type SavedPlanVisibility = z.infer<typeof SAVED_PLAN_VISIBILITY_SCHEMA>;

export const SAVED_PLAN_PROVENANCE_SCHEMA = z.object({
  plannerVersion: z.string(),
  cacheFreshestAt: z.string().optional(),
  cacheStale: z.boolean(),
  consideredCount: z.number().int().nonnegative(),
  dataSource: z.literal('db_cache_only'),
  validatedAt: z.string(),
});

export const SAVED_PLAN_SCHEMA = z.object({
  id: z.string(),
  sessionId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  title: z.string().optional(),
  visibility: SAVED_PLAN_VISIBILITY_SCHEMA,
  shareToken: z.string().optional(),
  query: TRIP_QUERY_SCHEMA,
  selected: RANKED_OPTION_SCHEMA,
  provenance: SAVED_PLAN_PROVENANCE_SCHEMA,
});

export const SAVE_PLAN_REQUEST_SCHEMA = z.object({
  query: TRIP_QUERY_SCHEMA,
  selectedOption: RANKED_OPTION_SCHEMA,
  title: z.string().optional(),
  makePublic: z.boolean().optional().default(false),
});
export type SavePlanRequest = z.infer<typeof SAVE_PLAN_REQUEST_SCHEMA>;

export const SAVE_PLAN_RESPONSE_SCHEMA = z.object({
  id: z.string(),
  shareUrl: z.string().optional(),
  savedPlan: SAVED_PLAN_SCHEMA,
});

export const LIST_SAVED_PLANS_RESPONSE_SCHEMA = z.object({
  plans: z.array(
    SAVED_PLAN_SCHEMA.pick({
      id: true,
      createdAt: true,
      title: true,
      visibility: true,
      shareToken: true,
      query: true,
      provenance: true,
    }),
  ),
});

export const GET_SAVED_PLAN_RESPONSE_SCHEMA = z.object({
  plan: SAVED_PLAN_SCHEMA,
  currentCacheStatus: z
    .object({ freshestAt: z.string().optional(), stale: z.boolean() })
    .optional(),
});
