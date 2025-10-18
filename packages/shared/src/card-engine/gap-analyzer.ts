import { CreditCard, UserProfile, ProgramGap } from './types';
import cardDatabase from './card-database.data.json';

export class GapAnalyzer {
  /**
   * Identify missing loyalty programs in user's portfolio
   */
  static identifyGaps(userProfile: UserProfile): ProgramGap[] {
    const userPrograms = new Set(userProfile.programs);
    const gaps: ProgramGap[] = [];

    // Major airline programs
    const majorAirlines = [
      'United MileagePlus',
      'American Airlines AAdvantage',
      'Delta SkyMiles',
      'Southwest Rapid Rewards',
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

    // Major hotel programs
    const majorHotels = [
      'Marriott Bonvoy',
      'Hilton Honors',
      'World of Hyatt',
      'IHG Rewards',
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

    // Flexible points programs
    const flexiblePrograms = [
      'Chase Ultimate Rewards',
      'Amex Membership Rewards',
      'Citi ThankYou Points',
      'Capital One Miles',
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
  static findCardsForGaps(gaps: ProgramGap[]): CreditCard[] {
    const cards: CreditCard[] = [];
    const gapPrograms = new Set(gaps.map((g) => g.program));

    cardDatabase.cards.forEach((card: any) => {
      // Check if card fills any gaps
      const fillsGaps = card.programs.some((program: string) =>
        gapPrograms.has(program)
      );

      if (fillsGaps) {
        cards.push(card as CreditCard);
      }
    });

    return cards;
  }

  /**
   * Analyze card portfolio balance
   */
  static analyzeBalance(userProfile: UserProfile): {
    hasFlexiblePoints: boolean;
    hasAirlineCard: boolean;
    hasHotelCard: boolean;
    hasNoFeeCard: boolean;
    needsImprovement: string[];
  } {
    const userCards = userProfile.cards
      .filter((uc) => !uc.closed)
      .map((uc) => {
        return cardDatabase.cards.find((c: any) => c.id === uc.cardId);
      })
      .filter((c) => c !== undefined);

    const hasFlexiblePoints = userCards.some((card: any) =>
      ['Chase Ultimate Rewards', 'Amex Membership Rewards', 'Citi ThankYou Points'].some((p) =>
        card.programs.includes(p)
      )
    );

    const hasAirlineCard = userCards.some((card: any) =>
      card.bestFor.includes('airline-elite')
    );

    const hasHotelCard = userCards.some((card: any) =>
      card.bestFor.some((b: string) => b.includes('hotel'))
    );

    const hasNoFeeCard = userCards.some((card: any) => card.annualFee === 0);

    const needsImprovement = [];
    if (!hasFlexiblePoints) needsImprovement.push('Add a flexible points card');
    if (!hasAirlineCard) needsImprovement.push('Consider an airline-specific card');
    if (!hasHotelCard) needsImprovement.push('Add a hotel card for status/benefits');
    if (!hasNoFeeCard) needsImprovement.push('Add a no-fee card for everyday spend');

    return {
      hasFlexiblePoints,
      hasAirlineCard,
      hasHotelCard,
      hasNoFeeCard,
      needsImprovement,
    };
  }
}
