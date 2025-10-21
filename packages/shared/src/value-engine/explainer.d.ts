/**
 * Booking Instructions Explainer
 * Generates step-by-step instructions for booking award flights
 */
import { BookingInstructions, AwardPricing } from './types';
/**
 * Generate booking instructions for an award flight
 */
export declare function generateBookingInstructions(program: string, awardPricing: AwardPricing, origin: string, destination: string, date: Date): BookingInstructions;
/**
 * Generate simplified "Quick Steps" for experienced users
 */
export declare function generateQuickSteps(program: string, transferRequired: boolean, transferFrom?: string): string[];
/**
 * Get booking difficulty explanation
 */
export declare function getDifficultyExplanation(difficulty: 'easy' | 'moderate' | 'difficult'): string;
/**
 * Generate tips for first-time award bookers
 */
export declare function getFirstTimerTips(): string[];
/**
 * Generate program-specific insider tips
 */
export declare function getInsiderTips(program: string): string[];
//# sourceMappingURL=explainer.d.ts.map