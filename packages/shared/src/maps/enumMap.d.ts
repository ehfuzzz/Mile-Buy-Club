export type CabinCode = 'Y' | 'W' | 'J' | 'F';
export type AlertModeCode = 'HIGH_QUALITY' | 'DIGEST';
export type AllianceCode = 'STAR' | 'ONEWORLD' | 'SKYTEAM' | 'NONE';
export type PrefModeCode = 'PREFER' | 'AVOID';
export declare function normalizeCabin(value?: string | null): CabinCode | null;
export declare function normalizeAlertMode(value?: string | null): AlertModeCode | null;
export declare function normalizeAlliance(value?: string | null): AllianceCode | null;
export declare function normalizePrefMode(value?: string | null): PrefModeCode | null;
//# sourceMappingURL=enumMap.d.ts.map