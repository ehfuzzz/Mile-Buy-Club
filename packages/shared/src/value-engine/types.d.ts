/**
 * Value Engine Type Definitions
 * Core types for award value calculation system
 */
export interface FlightItinerary {
    origin: string;
    destination: string;
    departDate: Date;
    returnDate?: Date;
    cabin: CabinClass;
    passengers: number;
    segments: FlightSegment[];
}
export interface FlightSegment {
    origin: string;
    destination: string;
    date: Date;
    airline: string;
    flightNumber: string;
    duration: number;
    cabin: CabinClass;
    aircraft?: string;
}
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export interface AwardPricing {
    program: string;
    pointsCost: number;
    surcharges: number;
    taxes: number;
    fees: number;
    totalCash: number;
    transferRequired: boolean;
    transferFrom?: string;
    transferRatio?: number;
    transferTime?: string;
}
export interface CashPricing {
    totalCost: number;
    baseFare: number;
    taxes: number;
    fees: number;
    source: string;
}
export interface ValueCalculation {
    cpp: number;
    totalValue: number;
    valueRating: ValueRating;
    awardPricing: AwardPricing;
    cashPricing: CashPricing;
    savings: number;
    savingsPercent: number;
    isGoodDeal: boolean;
    dealQuality: 'excellent' | 'good' | 'fair' | 'poor';
    reasons: string[];
}
export type ValueRating = 'exceptional' | 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
export interface TransferPartner {
    from: string;
    to: string;
    ratio: number;
    transferTime: string;
    bonuses?: TransferBonus[];
}
export interface TransferBonus {
    multiplier: number;
    minTransfer?: number;
    expiresAt?: Date;
    description: string;
}
export interface BookingInstructions {
    steps: BookingStep[];
    estimatedTime: number;
    difficulty: 'easy' | 'moderate' | 'difficult';
    tips: string[];
    phoneNumber?: string;
    typicalWaitTime?: string;
}
export interface BookingStep {
    order: number;
    action: string;
    details?: string;
    url?: string;
    screenshot?: string;
}
export interface ValueComparisonOptions {
    includeTransferBonuses?: boolean;
    transferBonusScenarios?: number[];
    alternativeCabins?: CabinClass[];
    flexDays?: number;
}
//# sourceMappingURL=types.d.ts.map