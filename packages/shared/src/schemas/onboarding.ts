import { z } from 'zod';

export const locationKindSchema = z.enum(['AIRPORT', 'CITY', 'REGION']);

export const locationSchema = z.object({
  kind: locationKindSchema,
  code: z
    .string()
    .min(2)
    .max(6)
    .nullable()
    .optional(),
  name: z.string(),
});

const preferenceListSchema = z.object({
  prefer: z.array(z.string()).default([]),
  avoid: z.array(z.string()).default([]),
});

export const onboardingExtractionSchema = z.object({
  home_bases: z.array(locationSchema).default([]),
  open_jaw_ok: z.boolean().nullable().optional(),
  mixed_airlines_ok: z.boolean().nullable().optional(),
  travel_window: z
    .object({
      flex_days: z.number().int().nullable().optional(),
      typical_trip_len_days: z
        .array(z.number().int())
        .min(2)
        .max(2)
        .nullable()
        .optional(),
    })
    .default({}),
  destinations: z
    .object({
      wish: z.array(locationSchema).default([]),
      avoid: z.array(locationSchema).default([]),
    })
    .default({ wish: [], avoid: [] }),
  styles: z.array(z.enum(['BEACH', 'CITY', 'NATURE', 'NIGHTLIFE', 'KID_FRIENDLY', 'PACE_CHILL', 'PACE_PACKED'])).default([]),
  interests: z
    .array(
      z.object({
        tag: z.enum(['FOOD_TOURS', 'MUSEUMS', 'HIKES', 'SPORTS', 'SHOWS', 'OTHER']),
        notes: z.string().optional(),
      }),
    )
    .default([]),
  dietary: z
    .array(
      z.object({
        tag: z.enum(['VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'NUT_ALLERGY', 'GLUTEN_FREE', 'OTHER']),
        notes: z.string().optional(),
      }),
    )
    .default([]),
  accessibility: z
    .array(
      z.object({
        tag: z.enum(['STROLLER_OK', 'WHEELCHAIR', 'HEARING', 'SIGHT', 'OTHER']),
        notes: z.string().optional(),
      }),
    )
    .default([]),
  seating: z
    .object({
      cabin: z.string().nullable().optional(),
      companions: z.number().int().nullable().optional(),
    })
    .default({}),
  budget: z
    .object({
      max_points: z.number().int().nullable().optional(),
      max_cash_usd: z.number().int().nullable().optional(),
      min_cpp_cents: z.number().nullable().optional(),
    })
    .default({}),
  airlines: preferenceListSchema.default({ prefer: [], avoid: [] }),
  alliances: preferenceListSchema.default({ prefer: [], avoid: [] }),
  hotel_programs: preferenceListSchema.default({ prefer: [], avoid: [] }),
  loyalty_balances: z
    .array(
      z.object({
        program_id: z.string(),
        approx_points: z.number().int(),
        as_of: z.string().optional(),
      }),
    )
    .default([]),
  cards: z.array(z.string()).default([]),
  notifications: z
    .object({
      mode: z.enum(['HIGH_QUALITY', 'DIGEST']).nullable().optional(),
      timezone: z.string().nullable().optional(),
    })
    .default({}),
  raw_free_text: z.string().optional().default(''),
});

export type OnboardingExtraction = z.infer<typeof onboardingExtractionSchema>;

export const onboardingExtractionJsonSchema = {
  name: 'OnboardingExtraction',
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      home_bases: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: { enum: ['AIRPORT', 'CITY', 'REGION'] },
            code: { type: ['string', 'null'] },
            name: { type: 'string' },
          },
          required: ['kind', 'name'],
        },
        default: [],
      },
      open_jaw_ok: { type: ['boolean', 'null'] },
      mixed_airlines_ok: { type: ['boolean', 'null'] },
      travel_window: {
        type: 'object',
        additionalProperties: false,
        properties: {
          flex_days: { type: ['integer', 'null'] },
          typical_trip_len_days: {
            type: ['array', 'null'],
            items: { type: 'integer' },
            minItems: 2,
            maxItems: 2,
          },
        },
        default: {},
      },
      destinations: {
        type: 'object',
        additionalProperties: false,
        properties: {
          wish: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                kind: { enum: ['AIRPORT', 'CITY', 'REGION'] },
                code: { type: ['string', 'null'] },
                name: { type: 'string' },
              },
              required: ['kind', 'name'],
            },
            default: [],
          },
          avoid: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                kind: { enum: ['AIRPORT', 'CITY', 'REGION'] },
                code: { type: ['string', 'null'] },
                name: { type: 'string' },
              },
              required: ['kind', 'name'],
            },
            default: [],
          },
        },
        default: { wish: [], avoid: [] },
      },
      styles: {
        type: 'array',
        items: { enum: ['BEACH', 'CITY', 'NATURE', 'NIGHTLIFE', 'KID_FRIENDLY', 'PACE_CHILL', 'PACE_PACKED'] },
        default: [],
      },
      interests: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            tag: { enum: ['FOOD_TOURS', 'MUSEUMS', 'HIKES', 'SPORTS', 'SHOWS', 'OTHER'] },
            notes: { type: 'string' },
          },
          required: ['tag'],
        },
        default: [],
      },
      dietary: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            tag: { enum: ['VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'NUT_ALLERGY', 'GLUTEN_FREE', 'OTHER'] },
            notes: { type: 'string' },
          },
          required: ['tag'],
        },
        default: [],
      },
      accessibility: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            tag: { enum: ['STROLLER_OK', 'WHEELCHAIR', 'HEARING', 'SIGHT', 'OTHER'] },
            notes: { type: 'string' },
          },
          required: ['tag'],
        },
        default: [],
      },
      seating: {
        type: 'object',
        additionalProperties: false,
        properties: {
          cabin: { type: ['string', 'null'] },
          companions: { type: ['integer', 'null'] },
        },
        default: {},
      },
      budget: {
        type: 'object',
        additionalProperties: false,
        properties: {
          max_points: { type: ['integer', 'null'] },
          max_cash_usd: { type: ['integer', 'null'] },
          min_cpp_cents: { type: ['number', 'null'] },
        },
        default: {},
      },
      airlines: {
        type: 'object',
        additionalProperties: false,
        properties: {
          prefer: { type: 'array', items: { type: 'string' }, default: [] },
          avoid: { type: 'array', items: { type: 'string' }, default: [] },
        },
        default: { prefer: [], avoid: [] },
      },
      alliances: {
        type: 'object',
        additionalProperties: false,
        properties: {
          prefer: { type: 'array', items: { type: 'string' }, default: [] },
          avoid: { type: 'array', items: { type: 'string' }, default: [] },
        },
        default: { prefer: [], avoid: [] },
      },
      hotel_programs: {
        type: 'object',
        additionalProperties: false,
        properties: {
          prefer: { type: 'array', items: { type: 'string' }, default: [] },
          avoid: { type: 'array', items: { type: 'string' }, default: [] },
        },
        default: { prefer: [], avoid: [] },
      },
      loyalty_balances: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            program_id: { type: 'string' },
            approx_points: { type: 'integer' },
            as_of: { type: 'string' },
          },
          required: ['program_id', 'approx_points'],
        },
        default: [],
      },
      cards: { type: 'array', items: { type: 'string' }, default: [] },
      notifications: {
        type: 'object',
        additionalProperties: false,
        properties: {
          mode: { enum: ['HIGH_QUALITY', 'DIGEST', null] },
          timezone: { type: ['string', 'null'] },
        },
        default: {},
      },
      raw_free_text: { type: 'string', default: '' },
    },
    required: [],
  },
};
