import { CreditCard } from './types';
export declare class Explainer {
    /**
     * Generate human-readable reasons for recommending a card
     */
    static generateReasons(card: CreditCard, gaps: any[], balance: any): string[];
    /**
     * Generate "why this card" explanation
     */
    static generateExplanation(recommendation: any): string;
}
//# sourceMappingURL=explainer.d.ts.map