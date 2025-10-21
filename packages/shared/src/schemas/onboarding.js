"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingExtractionJsonSchema = exports.onboardingExtractionSchema = exports.locationSchema = exports.locationKindSchema = void 0;
const zod_1 = require("zod");
exports.locationKindSchema = zod_1.z.enum(['AIRPORT', 'CITY', 'REGION']);
exports.locationSchema = zod_1.z.object({
    kind: exports.locationKindSchema,
    code: zod_1.z
        .string()
        .min(2)
        .max(6)
        .nullable()
        .optional(),
    name: zod_1.z.string(),
});
const preferenceListSchema = zod_1.z.object({
    prefer: zod_1.z.array(zod_1.z.string()).default([]),
    avoid: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.onboardingExtractionSchema = zod_1.z.object({
    home_bases: zod_1.z.array(exports.locationSchema).default([]),
    open_jaw_ok: zod_1.z.boolean().nullable().optional(),
    mixed_airlines_ok: zod_1.z.boolean().nullable().optional(),
    travel_window: zod_1.z
        .object({
        flex_days: zod_1.z.number().int().nullable().optional(),
        typical_trip_len_days: zod_1.z
            .array(zod_1.z.number().int())
            .min(2)
            .max(2)
            .nullable()
            .optional(),
    })
        .default({}),
    destinations: zod_1.z
        .object({
        wish: zod_1.z.array(exports.locationSchema).default([]),
        avoid: zod_1.z.array(exports.locationSchema).default([]),
    })
        .default({ wish: [], avoid: [] }),
    styles: zod_1.z.array(zod_1.z.enum(['BEACH', 'CITY', 'NATURE', 'NIGHTLIFE', 'KID_FRIENDLY', 'PACE_CHILL', 'PACE_PACKED'])).default([]),
    interests: zod_1.z
        .array(zod_1.z.object({
        tag: zod_1.z.enum(['FOOD_TOURS', 'MUSEUMS', 'HIKES', 'SPORTS', 'SHOWS', 'OTHER']),
        notes: zod_1.z.string().optional(),
    }))
        .default([]),
    dietary: zod_1.z
        .array(zod_1.z.object({
        tag: zod_1.z.enum(['VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER', 'NUT_ALLERGY', 'GLUTEN_FREE', 'OTHER']),
        notes: zod_1.z.string().optional(),
    }))
        .default([]),
    accessibility: zod_1.z
        .array(zod_1.z.object({
        tag: zod_1.z.enum(['STROLLER_OK', 'WHEELCHAIR', 'HEARING', 'SIGHT', 'OTHER']),
        notes: zod_1.z.string().optional(),
    }))
        .default([]),
    seating: zod_1.z
        .object({
        cabin: zod_1.z.string().nullable().optional(),
        companions: zod_1.z.number().int().nullable().optional(),
    })
        .default({}),
    budget: zod_1.z
        .object({
        max_points: zod_1.z.number().int().nullable().optional(),
        max_cash_usd: zod_1.z.number().int().nullable().optional(),
        min_cpp_cents: zod_1.z.number().nullable().optional(),
    })
        .default({}),
    airlines: preferenceListSchema.default({ prefer: [], avoid: [] }),
    alliances: preferenceListSchema.default({ prefer: [], avoid: [] }),
    hotel_programs: preferenceListSchema.default({ prefer: [], avoid: [] }),
    loyalty_balances: zod_1.z
        .array(zod_1.z.object({
        program_id: zod_1.z.string(),
        approx_points: zod_1.z.number().int(),
        as_of: zod_1.z.string().optional(),
    }))
        .default([]),
    cards: zod_1.z.array(zod_1.z.string()).default([]),
    notifications: zod_1.z
        .object({
        mode: zod_1.z.enum(['HIGH_QUALITY', 'DIGEST']).nullable().optional(),
        timezone: zod_1.z.string().nullable().optional(),
    })
        .default({}),
    raw_free_text: zod_1.z.string().optional().default(''),
});
exports.onboardingExtractionJsonSchema = {
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
//# sourceMappingURL=onboarding.js.map