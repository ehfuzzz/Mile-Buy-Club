"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GapAnalyzer = void 0;
const card_database_data_json_1 = __importDefault(require("./card-database.data.json"));
class GapAnalyzer {
    /**
     * Identify missing loyalty programs in user's portfolio
     */
    static identifyGaps(userProfile) {
        const userPrograms = new Set(userProfile.programs);
        const gaps = [];
        const majorAirlines = [
            'United MileagePlus',
            'American Airlines AAdvantage',
            'Delta SkyMiles',
            'Southwest Rapid Rewards',
            'Air Canada Aeroplan',
        ];
        majorAirlines.forEach((program) => {
            if (!userPrograms.has(program)) {
                gaps.push({
                    program,
                    importance: 'high',
                    reason: `Major airline program with broad route network`,
                });
            }
        });
        const majorHotels = [
            'Marriott Bonvoy',
            'Hilton Honors',
            'World of Hyatt',
            'IHG Rewards',
            'Choice Privileges',
        ];
        majorHotels.forEach((program) => {
            if (!userPrograms.has(program)) {
                gaps.push({
                    program,
                    importance: 'medium',
                    reason: `Major hotel chain with global presence`,
                });
            }
        });
        const flexiblePrograms = [
            'Chase Ultimate Rewards',
            'Membership Rewards',
            'ThankYou Points',
            'Capital One Miles',
            'Bilt Rewards',
        ];
        flexiblePrograms.forEach((program) => {
            if (!userPrograms.has(program)) {
                gaps.push({
                    program,
                    importance: 'high',
                    reason: `Flexible points transferable to multiple partners`,
                });
            }
        });
        return gaps;
    }
    /**
     * Find cards that fill specific gaps
     */
    static findCardsForGaps(gaps) {
        const cards = [];
        const gapPrograms = new Set(gaps.map((g) => g.program));
        card_database_data_json_1.default.cards.forEach((card) => {
            const coverage = new Set([card.rewardsProgram, ...(card.programs ?? []), ...card.transferPartners]);
            const fillsGaps = Array.from(coverage).some((program) => gapPrograms.has(program));
            if (fillsGaps) {
                cards.push(card);
            }
        });
        return cards;
    }
    /**
     * Analyze card portfolio balance
     */
    static analyzeBalance(userProfile) {
        const userCards = userProfile.cards
            .filter((uc) => !uc.closed)
            .map((uc) => {
            return card_database_data_json_1.default.cards.find((c) => (c.cardId ?? c.id) === uc.cardId);
        })
            .filter((c) => c !== undefined);
        const hasFlexiblePoints = userCards.some((card) => ['Chase Ultimate Rewards', 'Membership Rewards', 'ThankYou Points', 'Capital One Miles', 'Bilt Rewards'].some((p) => card.programs.includes(p)));
        const hasAirlineCard = userCards.some((card) => card.bestFor.some((tag) => tag.includes('airline') || tag.includes('flight')));
        const hasHotelCard = userCards.some((card) => card.bestFor.some((tag) => tag.includes('hotel')));
        const hasNoFeeCard = userCards.some((card) => card.annualFee === 0);
        const needsImprovement = [];
        if (!hasFlexiblePoints)
            needsImprovement.push('Add a flexible points card');
        if (!hasAirlineCard)
            needsImprovement.push('Consider an airline-friendly travel card');
        if (!hasHotelCard)
            needsImprovement.push('Add a hotel-focused card for status/benefits');
        if (!hasNoFeeCard)
            needsImprovement.push('Add a no-fee card for everyday spend');
        return {
            hasFlexiblePoints,
            hasAirlineCard,
            hasHotelCard,
            hasNoFeeCard,
            needsImprovement,
        };
    }
}
exports.GapAnalyzer = GapAnalyzer;
//# sourceMappingURL=gap-analyzer.js.map