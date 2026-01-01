import { z } from 'zod';

export const IATA_CODE_REGEX = /^[A-Z]{3}$/;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const iataCodeSchema = z.string().regex(IATA_CODE_REGEX, 'Invalid IATA code');
const isoDateSchema = z.string().regex(isoDateRegex, 'Invalid date format, expected YYYY-MM-DD');

export const onboardingStateSchema = z
  .object({
    cabin: z.enum(['economy', 'premium', 'business', 'first']).optional(),
    homeAirports: z.array(iataCodeSchema).optional(),
    destinationAirports: z.array(iataCodeSchema).optional(),
    destinationRegions: z.array(z.string()).optional(),
    dateRange: z
      .object({
        start: isoDateSchema.optional(),
        end: isoDateSchema.optional(),
        flexibleDays: z.number().int().min(0).optional(),
      })
      .optional(),
    tripLengthDays: z
      .object({
        min: z.number().int().min(0).optional(),
        max: z.number().int().min(0).optional(),
      })
      .refine((value) => {
        if (!value) return true;
        if (value.min === undefined || value.max === undefined) return true;
        return value.min <= value.max;
      }, 'tripLengthDays.min cannot be greater than tripLengthDays.max')
      .optional(),
    passengers: z.number().int().min(1).optional(),
    maxPoints: z.number().int().min(0).optional(),
    programsAllowed: z.array(z.string()).optional(),
    airlinesPreferred: z.array(z.string()).optional(),
    maxStops: z.number().int().min(0).max(2).optional(),
    avoidRedEye: z.boolean().optional(),
    maxDurationHours: z.number().min(0).optional(),
    notes: z.string().optional(),
  })
  .strict();

export type OnboardingState = z.infer<typeof onboardingStateSchema>;

const onboardingKeys = onboardingStateSchema.keyof().Values;

export const statePatchSchema = z.object({
  set: onboardingStateSchema.partial().optional(),
  addToSet: z.record(z.enum(onboardingKeys), z.array(z.string())).optional(),
  unset: z.array(z.enum(onboardingKeys)).optional(),
});

export type StatePatch = z.infer<typeof statePatchSchema>;

export const ruleOpSchema = z.enum(['eq', 'lte', 'gte', 'in', 'not_in', 'between', 'bool']);
export type RuleOp = z.infer<typeof ruleOpSchema>;

export const ruleFieldSchema = z.enum([
  'homeAirport',
  'destination',
  'dateRange',
  'tripLengthDays',
  'cabin',
  'passengers',
  'maxPoints',
  'program',
  'airline',
  'maxStops',
  'avoidRedEye',
  'maxDurationHours',
]);
export type RuleField = z.infer<typeof ruleFieldSchema>;

export const ruleSchema = z.object({
  id: z.string(),
  field: ruleFieldSchema,
  op: ruleOpSchema,
  value: z.unknown(),
  required: z.boolean(),
  source: z.literal('user'),
});

export type Rule = z.infer<typeof ruleSchema>;

export const onboardingLLMResultSchema = z.object({
  assistant_message: z.string(),
  state_patch: statePatchSchema.nullable(),
  missing_fields: z.array(z.string()),
  questions: z.array(z.string()),
  confidence: z.record(z.number()).optional(),
  done: z.boolean().optional(),
});

export type OnboardingLLMResult = z.infer<typeof onboardingLLMResultSchema>;
