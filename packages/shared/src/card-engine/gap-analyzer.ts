import { CreditCard, UserProfile, ProgramGap } from './types';
import cardDatabase from './card-database.data.json';

export class GapAnalyzer {
  /**
   * Identify missing loyalty programs in user's portfolio
   */
  static identifyGaps(userProfile: UserProfile): ProgramGap[] {
    const userPrograms = new Set(userProfile.programs);
    const gaps: ProgramGap[] = [];

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
  static findCardsForGaps(gaps: ProgramGap[]): CreditCard[] {
    const cards: CreditCard[] = [];
    const gapPrograms = new Set(gaps.map((g) => g.program));

    (cardDatabase.cards as CreditCard[]).forEach((card: any) => {
      const coverage = new Set<string>([card.rewardsProgram, ...(card.programs ?? []), ...card.transferPartners]);
      const fillsGaps = Array.from(coverage).some((program) => gapPrograms.has(program));

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
        return (cardDatabase.cards as CreditCard[]).find((c: any) =>
          (c.cardId ?? c.id) === uc.cardId
        );
      })
      .filter((c): c is CreditCard => c !== undefined);

    const hasFlexiblePoints = userCards.some((card) =>
      ['Chase Ultimate Rewards', 'Membership Rewards', 'ThankYou Points', 'Capital One Miles', 'Bilt Rewards'].some((p) =>
        card.programs.includes(p)
      )
    );

    const hasAirlineCard = userCards.some((card) =>
      card.bestFor.some((tag) => tag.includes('airline') || tag.includes('flight'))
    );

    const hasHotelCard = userCards.some((card) =>
      card.bestFor.some((tag) => tag.includes('hotel'))
    );

    const hasNoFeeCard = userCards.some((card) => card.annualFee === 0);

    const needsImprovement: string[] = [];
    if (!hasFlexiblePoints) needsImprovement.push('Add a flexible points card');
    if (!hasAirlineCard) needsImprovement.push('Consider an airline-friendly travel card');
    if (!hasHotelCard) needsImprovement.push('Add a hotel-focused card for status/benefits');
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
