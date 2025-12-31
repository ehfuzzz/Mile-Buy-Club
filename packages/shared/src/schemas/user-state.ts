import { z } from 'zod';

export const USER_STATE_SCHEMA = z.object({
  version: z.number().int().min(1),
  onboarding: z
    .object({
      status: z.enum(['new', 'in_progress', 'complete']),
      startedAt: z.string(),
      completedAt: z.string().optional(),
    })
    .default({
      status: 'new',
      startedAt: new Date(0).toISOString(),
    }),
  profile: z
    .object({
      locale: z.string().optional(),
      timezone: z.string().optional(),
    })
    .default({}),
  travelPrefs: z
    .object({
      homeAirports: z.array(z.string()).default([]),
      cabinPreference: z.enum(['economy', 'premium_economy', 'business', 'first']).optional(),
      maxStops: z.number().int().min(0).optional(),
      noRedeyes: z.boolean().optional(),
    })
    .default({
      homeAirports: [],
    }),
  points: z
    .object({
      programs: z
        .array(
          z.object({
            programId: z.string(),
            balance: z.number().int().min(0).optional(),
          }),
        )
        .default([]),
      transferPreferences: z.array(z.string()).default([]),
    })
    .default({
      programs: [],
      transferPreferences: [],
    }),
  hotelPrefs: z
    .object({
      chains: z.array(z.string()).default([]),
      maxNightlyUsd: z.number().int().min(0).optional(),
    })
    .default({
      chains: [],
    }),
  constraints: z
    .object({
      maxTripDurationMinutes: z.number().int().min(0).optional(),
      maxDoorToDoorMinutes: z.number().int().min(0).optional(),
    })
    .default({}),
});

export const CONSTRAINT_VIOLATION_SCHEMA = z.object({
  code: z.string(),
  message: z.string(),
  path: z.string().optional(),
});

const patchPathSchema = z
  .string()
  .regex(/^\//, { message: 'Path must start with "/"' })
  .min(2);

export const PATCH_OP_SCHEMA = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('set'),
    path: patchPathSchema,
    value: z.unknown(),
  }),
  z.object({
    op: z.literal('add'),
    path: patchPathSchema,
    value: z.unknown(),
  }),
  z.object({
    op: z.literal('remove'),
    path: patchPathSchema,
  }),
]);

export const STATE_PATCH_SCHEMA = z.object({
  baseVersion: z.number().int().min(1),
  ops: z.array(PATCH_OP_SCHEMA).min(1),
});

export type UserState = z.infer<typeof USER_STATE_SCHEMA>;
export type ConstraintViolation = z.infer<typeof CONSTRAINT_VIOLATION_SCHEMA>;
export type PatchOp = z.infer<typeof PATCH_OP_SCHEMA>;
export type StatePatch = z.infer<typeof STATE_PATCH_SCHEMA>;

export type PatchResult =
  | { ok: true; userState: UserState }
  | { ok: false; errors: ConstraintViolation[] };

export interface OnboardingSessionResponse {
  id?: string;
  sessionId: string;
  created: boolean;
  userStateVersion: number;
  userState: UserState;
  onboardingStatus: UserState['onboarding']['status'];
  requestId: string;
}

export const createDefaultUserState = (): UserState => {
  const now = new Date().toISOString();

  return USER_STATE_SCHEMA.parse({
    version: 1,
    onboarding: {
      status: 'new',
      startedAt: now,
    },
    profile: {},
    travelPrefs: {
      homeAirports: [],
    },
    points: {
      programs: [],
      transferPreferences: [],
    },
    hotelPrefs: {
      chains: [],
    },
    constraints: {},
  });
};
