import { CreditCard, UserProfile, ProgramGap } from './types';
export declare class GapAnalyzer {
    /**
     * Identify missing loyalty programs in user's portfolio
     */
    static identifyGaps(userProfile: UserProfile): ProgramGap[];
    /**
     * Find cards that fill specific gaps
     */
    static findCardsForGaps(gaps: ProgramGap[]): CreditCard[];
    /**
     * Analyze card portfolio balance
     */
    static analyzeBalance(userProfile: UserProfile): {
        hasFlexiblePoints: boolean;
        hasAirlineCard: boolean;
        hasHotelCard: boolean;
        hasNoFeeCard: boolean;
        needsImprovement: string[];
    };
}
//# sourceMappingURL=gap-analyzer.d.ts.map