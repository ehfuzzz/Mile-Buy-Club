import { z } from 'zod';
export declare const locationKindSchema: z.ZodEnum<["AIRPORT", "CITY", "REGION"]>;
export declare const locationSchema: z.ZodObject<{
    kind: z.ZodEnum<["AIRPORT", "CITY", "REGION"]>;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    kind: "AIRPORT" | "CITY" | "REGION";
    name: string;
    code?: string | null | undefined;
}, {
    kind: "AIRPORT" | "CITY" | "REGION";
    name: string;
    code?: string | null | undefined;
}>;
export declare const onboardingExtractionSchema: z.ZodObject<{
    home_bases: z.ZodDefault<z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<["AIRPORT", "CITY", "REGION"]>;
        code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "AIRPORT" | "CITY" | "REGION";
        name: string;
        code?: string | null | undefined;
    }, {
        kind: "AIRPORT" | "CITY" | "REGION";
        name: string;
        code?: string | null | undefined;
    }>, "many">>;
    open_jaw_ok: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    mixed_airlines_ok: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    travel_window: z.ZodDefault<z.ZodObject<{
        flex_days: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        typical_trip_len_days: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodNumber, "many">>>;
    }, "strip", z.ZodTypeAny, {
        flex_days?: number | null | undefined;
        typical_trip_len_days?: number[] | null | undefined;
    }, {
        flex_days?: number | null | undefined;
        typical_trip_len_days?: number[] | null | undefined;
    }>>;
    destinations: z.ZodDefault<z.ZodObject<{
        wish: z.ZodDefault<z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<["AIRPORT", "CITY", "REGION"]>;
            code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }, {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }>, "many">>;
        avoid: z.ZodDefault<z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<["AIRPORT", "CITY", "REGION"]>;
            code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }, {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        avoid: {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }[];
        wish: {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }[];
    }, {
        avoid?: {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }[] | undefined;
        wish?: {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }[] | undefined;
    }>>;
    styles: z.ZodDefault<z.ZodArray<z.ZodEnum<["BEACH", "CITY", "NATURE", "NIGHTLIFE", "KID_FRIENDLY", "PACE_CHILL", "PACE_PACKED"]>, "many">>;
    interests: z.ZodDefault<z.ZodArray<z.ZodObject<{
        tag: z.ZodEnum<["FOOD_TOURS", "MUSEUMS", "HIKES", "SPORTS", "SHOWS", "OTHER"]>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tag: "FOOD_TOURS" | "MUSEUMS" | "HIKES" | "SPORTS" | "SHOWS" | "OTHER";
        notes?: string | undefined;
    }, {
        tag: "FOOD_TOURS" | "MUSEUMS" | "HIKES" | "SPORTS" | "SHOWS" | "OTHER";
        notes?: string | undefined;
    }>, "many">>;
    dietary: z.ZodDefault<z.ZodArray<z.ZodObject<{
        tag: z.ZodEnum<["VEGETARIAN", "VEGAN", "HALAL", "KOSHER", "NUT_ALLERGY", "GLUTEN_FREE", "OTHER"]>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tag: "OTHER" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "NUT_ALLERGY" | "GLUTEN_FREE";
        notes?: string | undefined;
    }, {
        tag: "OTHER" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "NUT_ALLERGY" | "GLUTEN_FREE";
        notes?: string | undefined;
    }>, "many">>;
    accessibility: z.ZodDefault<z.ZodArray<z.ZodObject<{
        tag: z.ZodEnum<["STROLLER_OK", "WHEELCHAIR", "HEARING", "SIGHT", "OTHER"]>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tag: "OTHER" | "STROLLER_OK" | "WHEELCHAIR" | "HEARING" | "SIGHT";
        notes?: string | undefined;
    }, {
        tag: "OTHER" | "STROLLER_OK" | "WHEELCHAIR" | "HEARING" | "SIGHT";
        notes?: string | undefined;
    }>, "many">>;
    seating: z.ZodDefault<z.ZodObject<{
        cabin: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        companions: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        cabin?: string | null | undefined;
        companions?: number | null | undefined;
    }, {
        cabin?: string | null | undefined;
        companions?: number | null | undefined;
    }>>;
    budget: z.ZodDefault<z.ZodObject<{
        max_points: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_cash_usd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        min_cpp_cents: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        max_points?: number | null | undefined;
        max_cash_usd?: number | null | undefined;
        min_cpp_cents?: number | null | undefined;
    }, {
        max_points?: number | null | undefined;
        max_cash_usd?: number | null | undefined;
        min_cpp_cents?: number | null | undefined;
    }>>;
    airlines: z.ZodDefault<z.ZodObject<{
        prefer: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        avoid: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        prefer: string[];
        avoid: string[];
    }, {
        prefer?: string[] | undefined;
        avoid?: string[] | undefined;
    }>>;
    alliances: z.ZodDefault<z.ZodObject<{
        prefer: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        avoid: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        prefer: string[];
        avoid: string[];
    }, {
        prefer?: string[] | undefined;
        avoid?: string[] | undefined;
    }>>;
    hotel_programs: z.ZodDefault<z.ZodObject<{
        prefer: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        avoid: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        prefer: string[];
        avoid: string[];
    }, {
        prefer?: string[] | undefined;
        avoid?: string[] | undefined;
    }>>;
    loyalty_balances: z.ZodDefault<z.ZodArray<z.ZodObject<{
        program_id: z.ZodString;
        approx_points: z.ZodNumber;
        as_of: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        program_id: string;
        approx_points: number;
        as_of?: string | undefined;
    }, {
        program_id: string;
        approx_points: number;
        as_of?: string | undefined;
    }>, "many">>;
    cards: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    notifications: z.ZodDefault<z.ZodObject<{
        mode: z.ZodOptional<z.ZodNullable<z.ZodEnum<["HIGH_QUALITY", "DIGEST"]>>>;
        timezone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        mode?: "HIGH_QUALITY" | "DIGEST" | null | undefined;
        timezone?: string | null | undefined;
    }, {
        mode?: "HIGH_QUALITY" | "DIGEST" | null | undefined;
        timezone?: string | null | undefined;
    }>>;
    raw_free_text: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    home_bases: {
        kind: "AIRPORT" | "CITY" | "REGION";
        name: string;
        code?: string | null | undefined;
    }[];
    travel_window: {
        flex_days?: number | null | undefined;
        typical_trip_len_days?: number[] | null | undefined;
    };
    destinations: {
        avoid: {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }[];
        wish: {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }[];
    };
    styles: ("CITY" | "BEACH" | "NATURE" | "NIGHTLIFE" | "KID_FRIENDLY" | "PACE_CHILL" | "PACE_PACKED")[];
    interests: {
        tag: "FOOD_TOURS" | "MUSEUMS" | "HIKES" | "SPORTS" | "SHOWS" | "OTHER";
        notes?: string | undefined;
    }[];
    dietary: {
        tag: "OTHER" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "NUT_ALLERGY" | "GLUTEN_FREE";
        notes?: string | undefined;
    }[];
    accessibility: {
        tag: "OTHER" | "STROLLER_OK" | "WHEELCHAIR" | "HEARING" | "SIGHT";
        notes?: string | undefined;
    }[];
    seating: {
        cabin?: string | null | undefined;
        companions?: number | null | undefined;
    };
    budget: {
        max_points?: number | null | undefined;
        max_cash_usd?: number | null | undefined;
        min_cpp_cents?: number | null | undefined;
    };
    airlines: {
        prefer: string[];
        avoid: string[];
    };
    alliances: {
        prefer: string[];
        avoid: string[];
    };
    hotel_programs: {
        prefer: string[];
        avoid: string[];
    };
    loyalty_balances: {
        program_id: string;
        approx_points: number;
        as_of?: string | undefined;
    }[];
    cards: string[];
    notifications: {
        mode?: "HIGH_QUALITY" | "DIGEST" | null | undefined;
        timezone?: string | null | undefined;
    };
    raw_free_text: string;
    open_jaw_ok?: boolean | null | undefined;
    mixed_airlines_ok?: boolean | null | undefined;
}, {
    home_bases?: {
        kind: "AIRPORT" | "CITY" | "REGION";
        name: string;
        code?: string | null | undefined;
    }[] | undefined;
    open_jaw_ok?: boolean | null | undefined;
    mixed_airlines_ok?: boolean | null | undefined;
    travel_window?: {
        flex_days?: number | null | undefined;
        typical_trip_len_days?: number[] | null | undefined;
    } | undefined;
    destinations?: {
        avoid?: {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }[] | undefined;
        wish?: {
            kind: "AIRPORT" | "CITY" | "REGION";
            name: string;
            code?: string | null | undefined;
        }[] | undefined;
    } | undefined;
    styles?: ("CITY" | "BEACH" | "NATURE" | "NIGHTLIFE" | "KID_FRIENDLY" | "PACE_CHILL" | "PACE_PACKED")[] | undefined;
    interests?: {
        tag: "FOOD_TOURS" | "MUSEUMS" | "HIKES" | "SPORTS" | "SHOWS" | "OTHER";
        notes?: string | undefined;
    }[] | undefined;
    dietary?: {
        tag: "OTHER" | "VEGETARIAN" | "VEGAN" | "HALAL" | "KOSHER" | "NUT_ALLERGY" | "GLUTEN_FREE";
        notes?: string | undefined;
    }[] | undefined;
    accessibility?: {
        tag: "OTHER" | "STROLLER_OK" | "WHEELCHAIR" | "HEARING" | "SIGHT";
        notes?: string | undefined;
    }[] | undefined;
    seating?: {
        cabin?: string | null | undefined;
        companions?: number | null | undefined;
    } | undefined;
    budget?: {
        max_points?: number | null | undefined;
        max_cash_usd?: number | null | undefined;
        min_cpp_cents?: number | null | undefined;
    } | undefined;
    airlines?: {
        prefer?: string[] | undefined;
        avoid?: string[] | undefined;
    } | undefined;
    alliances?: {
        prefer?: string[] | undefined;
        avoid?: string[] | undefined;
    } | undefined;
    hotel_programs?: {
        prefer?: string[] | undefined;
        avoid?: string[] | undefined;
    } | undefined;
    loyalty_balances?: {
        program_id: string;
        approx_points: number;
        as_of?: string | undefined;
    }[] | undefined;
    cards?: string[] | undefined;
    notifications?: {
        mode?: "HIGH_QUALITY" | "DIGEST" | null | undefined;
        timezone?: string | null | undefined;
    } | undefined;
    raw_free_text?: string | undefined;
}>;
export type OnboardingExtraction = z.infer<typeof onboardingExtractionSchema>;
export declare const onboardingExtractionJsonSchema: {
    name: string;
    schema: {
        type: string;
        additionalProperties: boolean;
        properties: {
            home_bases: {
                type: string;
                items: {
                    type: string;
                    additionalProperties: boolean;
                    properties: {
                        kind: {
                            enum: string[];
                        };
                        code: {
                            type: string[];
                        };
                        name: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                default: never[];
            };
            open_jaw_ok: {
                type: string[];
            };
            mixed_airlines_ok: {
                type: string[];
            };
            travel_window: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    flex_days: {
                        type: string[];
                    };
                    typical_trip_len_days: {
                        type: string[];
                        items: {
                            type: string;
                        };
                        minItems: number;
                        maxItems: number;
                    };
                };
                default: {};
            };
            destinations: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    wish: {
                        type: string;
                        items: {
                            type: string;
                            additionalProperties: boolean;
                            properties: {
                                kind: {
                                    enum: string[];
                                };
                                code: {
                                    type: string[];
                                };
                                name: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                        default: never[];
                    };
                    avoid: {
                        type: string;
                        items: {
                            type: string;
                            additionalProperties: boolean;
                            properties: {
                                kind: {
                                    enum: string[];
                                };
                                code: {
                                    type: string[];
                                };
                                name: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                        default: never[];
                    };
                };
                default: {
                    wish: never[];
                    avoid: never[];
                };
            };
            styles: {
                type: string;
                items: {
                    enum: string[];
                };
                default: never[];
            };
            interests: {
                type: string;
                items: {
                    type: string;
                    additionalProperties: boolean;
                    properties: {
                        tag: {
                            enum: string[];
                        };
                        notes: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                default: never[];
            };
            dietary: {
                type: string;
                items: {
                    type: string;
                    additionalProperties: boolean;
                    properties: {
                        tag: {
                            enum: string[];
                        };
                        notes: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                default: never[];
            };
            accessibility: {
                type: string;
                items: {
                    type: string;
                    additionalProperties: boolean;
                    properties: {
                        tag: {
                            enum: string[];
                        };
                        notes: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                default: never[];
            };
            seating: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    cabin: {
                        type: string[];
                    };
                    companions: {
                        type: string[];
                    };
                };
                default: {};
            };
            budget: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    max_points: {
                        type: string[];
                    };
                    max_cash_usd: {
                        type: string[];
                    };
                    min_cpp_cents: {
                        type: string[];
                    };
                };
                default: {};
            };
            airlines: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    prefer: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: never[];
                    };
                    avoid: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: never[];
                    };
                };
                default: {
                    prefer: never[];
                    avoid: never[];
                };
            };
            alliances: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    prefer: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: never[];
                    };
                    avoid: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: never[];
                    };
                };
                default: {
                    prefer: never[];
                    avoid: never[];
                };
            };
            hotel_programs: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    prefer: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: never[];
                    };
                    avoid: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: never[];
                    };
                };
                default: {
                    prefer: never[];
                    avoid: never[];
                };
            };
            loyalty_balances: {
                type: string;
                items: {
                    type: string;
                    additionalProperties: boolean;
                    properties: {
                        program_id: {
                            type: string;
                        };
                        approx_points: {
                            type: string;
                        };
                        as_of: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                default: never[];
            };
            cards: {
                type: string;
                items: {
                    type: string;
                };
                default: never[];
            };
            notifications: {
                type: string;
                additionalProperties: boolean;
                properties: {
                    mode: {
                        enum: (string | null)[];
                    };
                    timezone: {
                        type: string[];
                    };
                };
                default: {};
            };
            raw_free_text: {
                type: string;
                default: string;
            };
        };
        required: never[];
    };
};
//# sourceMappingURL=onboarding.d.ts.map