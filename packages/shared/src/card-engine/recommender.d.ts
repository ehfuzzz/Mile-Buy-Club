import { UserProfile, CardRecommendation } from './types';
export declare class CardRecommender {
    /**
     * Generate card recommendations for a user
     */
    static recommend(userProfile: UserProfile, maxRecommendations?: number): CardRecommendation[];
    private static scoreCard;
    private static identifyFilledGaps;
    private static estimateAnnualValue;
    private static calculateEffectiveFee;
}
//# sourceMappingURL=recommender.d.ts.map