/**
 * Value Calculator
 * Core engine for calculating award value and cents-per-point
 */
import { AwardPricing, CashPricing, ValueCalculation, ValueRating, FlightItinerary, ValueComparisonOptions } from './types';
/**
 * Calculate cents per point (cpp) value
 */
export declare function calculateCPP(awardPricing: AwardPricing, cashPricing: CashPricing): number;
/**
 * Determine value rating based on cpp
 */
export declare function getValueRating(cpp: number): ValueRating;
/**
 * Calculate full value comparison
 */
export declare function calculateValue(awardPricing: AwardPricing, cashPricing: CashPricing, itinerary: FlightItinerary, options?: ValueComparisonOptions): ValueCalculation;
/**
 * Calculate value with transfer scenarios
 * Useful for showing "what if you had X card" scenarios
 */
export declare function calculateValueWithTransfers(baseProgram: string, pointsCost: number, surcharges: number, taxes: number, fees: number, cashPricing: CashPricing, itinerary: FlightItinerary): Map<string, ValueCalculation>;
/**
 * Compare multiple award options for the same itinerary
 */
export declare function compareDealOptions(options: Array<{
    program: string;
    pointsCost: number;
    surcharges: number;
    taxes: number;
    fees: number;
}>, cashPricing: CashPricing, itinerary: FlightItinerary): ValueCalculation[];
/**
 * Determine if booking via points makes sense
 */
export declare function shouldBookWithPoints(valueCalc: ValueCalculation, userPrograms: string[]): {
    recommendation: 'book' | 'maybe' | 'skip';
    reason: string;
};
/**
 * Format currency in cents to display string
 */
export declare function formatCurrency(cents: number): string;
/**
 * Format points with commas
 */
export declare function formatPoints(points: number): string;
//# sourceMappingURL=calculator.d.ts.map